import { CONFIG } from "../lib/config.js";
import { redis, KEYS, isAdmin, onlyMethod } from "../lib/store.js";

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
};

// GET with header x-admin-key -> tallies and justifications per award (jury only)
export default async function handler(req, res) {
  if (!onlyMethod(req, res, "GET")) return;
  if (!isAdmin(req)) return res.status(401).json({ error: "Jury password required." });

  const [issued, voted] = await Promise.all([redis.scard(KEYS.codes), redis.scard(KEYS.voted)]);
  const awards = await Promise.all(CONFIG.awards.map(async (a) => {
    const raw = await redis.smembers(KEYS.votes(a.id));
    // Records are shuffled so their order says nothing about when anyone voted.
    const votes = shuffle(raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r)));
    return { id: a.id, name: a.name, hue: a.hue, votes };
  }));

  res.status(200).json({ issued, voted, headcount: CONFIG.headcount, closing: CONFIG.closing, awards });
}
