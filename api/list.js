// Combined shared-list endpoint. One Vercel function instead of five, to
// stay under the Hobby-plan 12-function ceiling.
//
//   GET  /api/list?op=fetch&slug=xxx               → 200 { list } | 404
//   POST /api/list   { op:"publish", title, items } → 200 { slug }
//   POST /api/list   { op:"update",  slug, title, items } → 200 { list } | 404
//   POST /api/list   { op:"delete",  slug }        → 200 { ok:true }
//   POST /api/list   { op:"rotate",  slug }        → 200 { slug }  (new slug)
//
// Storage: Upstash Redis (REST). Reads either the Upstash-prefixed env vars
// (UPSTASH_REDIS_REST_URL/TOKEN) or the KV-prefixed ones (KV_REST_API_URL/TOKEN)
// that Vercel's KV/Upstash Marketplace integration provisions automatically.

import crypto from "crypto";

const SLUG_RX = /^[A-Za-z0-9_-]{8,32}$/;

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

async function redis(cmd) {
  const r = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const d = await r.json();
  if (!r.ok || d.error) throw new Error(d.error || `Redis HTTP ${r.status}`);
  return d.result;
}

function requireRedis(res) {
  if (!REDIS_URL || !REDIS_TOKEN) {
    res.status(500).json({ error: "Redis not configured" });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (!requireRedis(res)) return;

  try {
    if (req.method === "GET") {
      const op = req.query?.op;
      if (op !== "fetch") return res.status(400).json({ error: "unknown op" });
      const slug = req.query?.slug;
      if (!slug || !SLUG_RX.test(slug)) return res.status(400).json({ error: "bad slug" });
      const data = await redis(["GET", `list:${slug}`]);
      if (!data) return res.status(404).json({ error: "not found" });
      return res.status(200).json({ list: JSON.parse(data) });
    }

    if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

    const body = req.body || {};
    const op = body.op;

    if (op === "publish") {
      const { title, items } = body;
      const slug = crypto.randomBytes(12).toString("base64url");
      const now = Date.now();
      const list = {
        slug,
        title: (title || "").toString().slice(0, 200),
        items: Array.isArray(items) ? items.slice(0, 500) : [],
        createdAt: now,
        updatedAt: now,
      };
      await redis(["SET", `list:${slug}`, JSON.stringify(list)]);
      return res.status(200).json({ slug });
    }

    if (op === "update") {
      const { slug, title, items } = body;
      if (!slug || !SLUG_RX.test(slug)) return res.status(400).json({ error: "bad slug" });
      const existing = await redis(["GET", `list:${slug}`]);
      if (!existing) return res.status(404).json({ error: "not found" });
      const list = JSON.parse(existing);
      if (typeof title === "string") list.title = title.slice(0, 200);
      if (Array.isArray(items)) list.items = items.slice(0, 500);
      list.updatedAt = Date.now();
      await redis(["SET", `list:${slug}`, JSON.stringify(list)]);
      return res.status(200).json({ list });
    }

    if (op === "delete") {
      const { slug } = body;
      if (!slug || !SLUG_RX.test(slug)) return res.status(400).json({ error: "bad slug" });
      await redis(["DEL", `list:${slug}`]);
      return res.status(200).json({ ok: true });
    }

    if (op === "rotate") {
      const { slug } = body;
      if (!slug || !SLUG_RX.test(slug)) return res.status(400).json({ error: "bad slug" });
      const existing = await redis(["GET", `list:${slug}`]);
      if (!existing) return res.status(404).json({ error: "not found" });
      const list = JSON.parse(existing);
      const newSlug = crypto.randomBytes(12).toString("base64url");
      list.slug = newSlug;
      list.updatedAt = Date.now();
      await redis(["SET", `list:${newSlug}`, JSON.stringify(list)]);
      await redis(["DEL", `list:${slug}`]);
      return res.status(200).json({ slug: newSlug });
    }

    return res.status(400).json({ error: "unknown op" });
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
