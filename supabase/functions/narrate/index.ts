// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const MINIMAX_API_KEY = Deno.env.get("MINIMAX_API_KEY")!;
const MINIMAX_URL = Deno.env.get("MINIMAX_URL") || "https://api.minimax.chat/v1/generate"; // adjust to your real endpoint
const MODEL = Deno.env.get("MINIMAX_MODEL") || "abab6.5-chat"; // example; set your real model

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const body = await req.json();
    const prompt = buildPrompt(body);

    // Call MiniMax (adjust payload to actual API spec)
    const mmRes = await fetch(MINIMAX_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 600,
      }),
    });

    if (!mmRes.ok) {
      const txt = await mmRes.text();
      return new Response(`MiniMax error: ${mmRes.status} ${txt}`, { status: 500 });
    }

    const data = await mmRes.json();
    const raw = extractText(data);
    const event = safeParseEvent(raw);

    return new Response(JSON.stringify(event), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(`Narrate error: ${e?.message || e}`, { status: 500 });
  }
});

const SYSTEM = `
You generate the NEXT EVENT for a life simulator.

Players can be ANYTHING: free-text identities and multi-role careers (roleTags) evolve over time. Use roleTags as authoritative hints.

Return STRICT JSON only (no prose, no markdown), exactly:

{
  "id": "string",
  "title": "string",
  "description": "string",
  "decisions": [
    {
      "id": "string",
      "text": "string",
      "risk": 0-100,
      "aggression": 0-100,
      "resourceRisk": 0-100,
      "heatSpike": 0-100,
      "goalAlignment": 0-100,
      "tags": ["string", ...]
    }
  ],
  "imagePrompt": "string"
}

Guidelines:
- Tone: grounded, urban, human; avoid explicit gore/sex; no real brands/trademarks.
- Reflect the player's free-text archetype and roleTags (career drift).
- If roleTags suggest nightlife/performing/touring (e.g., "dj", "promoter", "artist", "musician"), occasionally offer a relocation/tour opportunity. Tag such decisions with ["tour","gig","travel","relocate"].
- 2–4 concise decisions; each consequential and concrete.
- Use tags meaningfully so the client can evolve roleTags.
`;

function buildPrompt(input: any) {
  const { character, history, lastEvent, rails } = input || {};
  return JSON.stringify({
    character,
    history,
    lastEvent,
    rails
  });
}

function extractText(mm: any): string {
  // Adjust this depending on MiniMax response shape.
  // Many APIs return { choices: [{ message: { content: "..." } }] }
  const content = mm?.choices?.[0]?.message?.content ?? mm?.output ?? mm?.text ?? "";
  return typeof content === "string" ? content : JSON.stringify(content);
}

function safeParseEvent(text: string) {
  // If model wrapped JSON in backticks or prose, strip to the first {...}
  const m = text.match(/\{[\s\S]*\}/);
  const raw = m ? m[0] : text;
  let obj: any;
  try { obj = JSON.parse(raw); } catch { obj = {}; }

  // Normalize and clamp
  const decisions = Array.isArray(obj.decisions) ? obj.decisions.slice(0, 4).map((d: any, i: number) => ({
    id: String(d?.id || `d${i+1}`),
    text: String(d?.text || `Option ${i+1}`),
    risk: clamp(d?.risk, 0, 100, 50),
    aggression: clamp(d?.aggression, 0, 100, 50),
    resourceRisk: clamp(d?.resourceRisk, 0, 100, 0),
    heatSpike: clamp(d?.heatSpike, 0, 100, 0),
    goalAlignment: clamp(d?.goalAlignment, 0, 100, 50),
    tags: Array.isArray(d?.tags) ? d.tags.map(String).slice(0, 6) : []
  })) : [{ id:'d1', text:'Continue', risk:50, aggression:50, resourceRisk:0, heatSpike:0, goalAlignment:50, tags:[] }];

  return {
    id: String(obj.id || cryptoId()),
    title: String(obj.title || 'Untitled'),
    description: String(obj.description || '…'),
    decisions,
    imagePrompt: typeof obj.imagePrompt === 'string' ? obj.imagePrompt : ''
  };
}

function clamp(v: any, lo: number, hi: number, def: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(lo, Math.min(hi, n));
}

function cryptoId() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10);
}