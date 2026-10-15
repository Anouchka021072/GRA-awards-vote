import { randomUUID } from "node:crypto";
import { CONFIG } from "../lib/config.js";
import { redis, KEYS, hashCode, tooManyFailures, recordFailure, onlyMethod } from "../lib/store.js";

const clean = (s, max) => String(s || "").trim().replace(/\s+/g, " ").slice(0, max);

// POST { code, award, name, dept, answers: [..], merit: true }
export default async function handler(req, res) {
  if (!onlyMethod(req, res, "POST")) return;

  if (Date.now() > new Date(CONFIG.closing).getTime()) {
    return res.status(403).json({ error: "Voting is now closed." });
  }

  const guard = await tooManyFailures(req);
  if (guard.blocked) return res.status(429).json({ error: "Too many attempts. Please try again in an hour." });

  const b = req.body || {};
  const award = CONFIG.awards.find((a) => a.id === b.award);
  if (!award) return res.status(400).json({ error: "Unknown award." });

  const name = clean(b.name, 80);
  const dept = clean(b.dept, 60);
  const answers = Array.isArray(b.answers) ? b.answers.slice(0, award.prompts.length).map((a) => String(a || "").trim().slice(0, 1500)) : [];
  const words = answers.join(" ").split(/\s+/).filter(Boolean).length;

  if (name.split(" ").length < 2) return res.status(400).json({ error: "Please write the person's first name and surname." });
  if (!CONFIG.departments.includes(dept)) return res.status(400).json({ error: "Please select a department." });
  if (answers.length !== award.prompts.length || words < 15) return res.status(400).json({ error: "Please tell us a little more about why." });
  if (b.merit !== true) return res.status(400).json({ error: "Please confirm the merit statement." });

  const h = hashCode(b.code);
  if (!(await redis.sismember(KEYS.codes, h))) {
    await recordFailure(guard.key);
    return res.status(401).json({ error: "That code is not recognised." });
  }

  // The lock: SADD returns 1 only the first time this code votes for this award, even if two requests race.
  const first = await redis.sadd(KEYS.used(award.id), h);
  if (first !== 1) return res.status(409).json({ error: "This code has already voted for this award." });

  try {
    // The vote record carries no code, no time and no device detail, so it cannot be traced to a voter.
    const record = JSON.stringify({ id: randomUUID(), name, dept, answers });
    await redis.sadd(KEYS.votes(award.id), record);
    await redis.sadd(KEYS.voted, h);
  } catch (e) {
    await redis.srem(KEYS.used(award.id), h); // release the lock so the voter can try again
    return res.status(500).json({ error: "Your vote could not be saved. Please try again." });
  }

  const checks = await Promise.all(CONFIG.awards.map((a) => redis.sismember(KEYS.used(a.id), h)));
  res.status(200).json({ ok: true, used: CONFIG.awards.filter((a, i) => checks[i]).map((a) => a.id) });
}
