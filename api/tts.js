// Vercel serverless function — proxies briefing text to OpenAI's TTS endpoint
// and streams back MP3 audio. The client plays it via an <audio> element.
//
// Body shape: { text: string, voice?: "nova"|"alloy"|"echo"|"fable"|"onyx"|"shimmer" }
//
// Requires OPENAI_API_KEY in Vercel env vars.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server missing OPENAI_API_KEY. Add it in Vercel project settings." });
  }

  const body = req.body || {};
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const voice = ["nova","alloy","echo","fable","onyx","shimmer"].includes(body.voice) ? body.voice : "nova";
  if (!text) return res.status(400).json({ error: "text required" });

  try {
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        voice,
        input: text.slice(0, 4000), // OpenAI hard-caps at 4096 chars
        response_format: "mp3",
      }),
    });
    if (!r.ok) {
      const detail = await r.text();
      return res.status(r.status).json({ error: `OpenAI TTS: ${detail.slice(0, 300)}` });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.send(buf);
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
