// Vercel serverless function — proxies chat messages to Anthropic.
// The API key lives in Vercel's environment variables (never in code, never in git).
//
// Setup in Vercel:
//   Project Settings → Environment Variables → Add
//   Name: ANTHROPIC_API_KEY
//   Value: <your Anthropic API key, sk-ant-...>
//   Environment: Production, Preview, Development (check all three)
//
// Then redeploy.

export default async function handler(req, res) {
  // CORS — allow the PWA to call this endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server missing ANTHROPIC_API_KEY. Add it in Vercel project settings."
    });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
