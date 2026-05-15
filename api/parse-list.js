// Vercel serverless function — splits a voice-dictated list into items,
// using Claude so phrases like "fish and chips" stay as one item and the
// rest get split sensibly.
//
// POST /api/parse-list   body: { text }
//   → 200 { items: ["a", "b", ...] }
//   → 500 { error } (client should fall back to local regex parsing)

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "server missing ANTHROPIC_API_KEY" });

  const text = (req.body?.text || "").toString().trim();
  if (!text) return res.status(200).json({ items: [] });

  const prompt = `You are helping parse a voice-dictated list. The user spoke items aloud and you must split the text into individual entries.

Rules:
- Each distinct item becomes its own array entry.
- Compound names that are a single thing must stay as one item. Examples: "fish and chips", "peanut butter and jelly", "Mary and John" (when used as one referent — usually as recipients of one note or co-named couple), "salt and pepper".
- Filler words like "uh", "um", "okay", "and then" between distinct items should be stripped.
- If the user just said one thing, return a single-item array.
- Preserve the user's original casing and wording inside each item. Don't add or remove information.
- Output strict JSON: a JSON array of strings, nothing else. No prose, no code fences.

Examples:
- "milk, eggs, bread" → ["milk", "eggs", "bread"]
- "cherries bacon and cucumbers" → ["cherries", "bacon", "cucumbers"]
- "fish and chips and a salad" → ["fish and chips", "a salad"]
- "peanut butter and jelly bread and apples" → ["peanut butter and jelly", "bread", "apples"]
- "call Mary and pick up dry cleaning" → ["call Mary", "pick up dry cleaning"]
- "salt and pepper" → ["salt and pepper"]
- "apples" → ["apples"]

Now parse this:
"${text.replace(/"/g, '\\"')}"`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(500).json({ error: data.error?.message || `Claude HTTP ${r.status}` });
    }
    const raw = (data.content?.[0]?.text || "").trim();
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
    let items;
    try {
      items = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: "non-JSON from model", raw: cleaned.slice(0, 200) });
    }
    if (!Array.isArray(items)) return res.status(500).json({ error: "model did not return an array" });
    const cleanItems = items
      .map(x => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean)
      .slice(0, 50);
    return res.status(200).json({ items: cleanItems });
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
