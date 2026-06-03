#!/usr/bin/env bash
# Verifies ANTHROPIC_API_KEY in .env.local authenticates with Anthropic.
# Prints ONLY the HTTP status + error type. Never echoes the key, its prefix, or length.
set -euo pipefail
cd "$(dirname "$0")/.."

KEY=$(grep '^ANTHROPIC_API_KEY=' .env.local | sed -E 's/^ANTHROPIC_API_KEY=//; s/^"//; s/"$//')
if [ -z "${KEY:-}" ]; then echo "No ANTHROPIC_API_KEY found in .env.local"; exit 1; fi

CODE=$(curl -s -o /tmp/anthropic_verify.json -w "%{http_code}" https://api.anthropic.com/v1/messages \
  -H "x-api-key: $KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-haiku-4-5-20251001","max_tokens":8,"messages":[{"role":"user","content":"ping"}]}')

if [ "$CODE" = "200" ]; then
  echo "✓ HTTP 200 — key is valid. Safe to deploy."
else
  echo "✗ HTTP $CODE — key rejected. Type: $(grep -oE '\"type\":\"[a-z_]+\"' /tmp/anthropic_verify.json | tail -1)"
fi
rm -f /tmp/anthropic_verify.json
unset KEY
