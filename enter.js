import { CONFIG } from "../lib/config.js";
import { redis, KEYS, hashCode, tooManyFailures, recordFailure, onlyMethod } from "../lib/store.js";

// POST { code } -> { used: ["compass", ...] }  Tells the voter which awards their code has already voted for.
export default async function handler(req, res) {
  if (!onlyMethod(req, res, "POST")) return;

  const guard = await tooManyFailures(req);
  if (guard.blocked) return res.status(429).json({ error: "Too many attempts. Please try again in an hour." });

  const code = req.body && req.body.code;
  if (!code) return res.status(400).json({ error: "Please enter your code." });

  const h = hashCode(code);
  const valid = await redis.sismember(KEYS.codes, h);
  if (!valid) {
    await recordFailure(guard.key);
    return res.status(401).json({ error: "That code is not recognised. Check the code HR sent you." });
  }

  const checks = await Promise.all(CONFIG.awards.map((a) => redis.sismember(KEYS.used(a.id), h)));
  const used = CONFIG.awards.filter((a, i) => checks[i]).map((a) => a.id);

  if (used.length === CONFIG.awards.length) {
    return res.status(409).json({ error: "This code has already been used for all three awards.", used });
  }
  res.status(200).json({ used });
}
