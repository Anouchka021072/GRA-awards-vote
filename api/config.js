import { CONFIG } from "../lib/config.js";
import { redis, KEYS } from "../lib/store.js";

// Public: what the voting page needs to draw itself, plus the participation figure.
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  let voted = 0;
  try { voted = await redis.scard(KEYS.voted); } catch { /* page still works without the figure */ }
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    ...CONFIG,
    participation: CONFIG.headcount ? Math.round((voted / CONFIG.headcount) * 100) : 0,
    closed: Date.now() > new Date(CONFIG.closing).getTime()
  });
}
