import { Redis } from "@upstash/redis";
import { createHash, timingSafeEqual } from "node:crypto";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = new Redis({ url, token });

// Codes are never stored in plain text: only a salted hash.
export function hashCode(code) {
  const salt = process.env.CODE_SALT;
  if (!salt) throw new Error("CODE_SALT is not set");
  return createHash("sha256").update(salt + ":" + normaliseCode(code)).digest("hex");
}

export function normaliseCode(code) {
  return String(code || "").trim().toUpperCase().replace(/\s+/g, "");
}

// Redis keys
export const KEYS = {
  codes: "codes",                         // set of valid code hashes
  voted: "voted",                         // set of code hashes that have cast at least one vote
  used: (award) => `used:${award}`,       // set of code hashes that voted for this award
  votes: (award) => `votes:${award}`      // set of vote records, with no code attached
};

// Limits guessing of codes: 15 failed attempts per hour per connection.
export async function tooManyFailures(req) {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const key = "fail:" + createHash("sha256").update(ip).digest("hex").slice(0, 24);
  const n = Number(await redis.get(key)) || 0;
  return { blocked: n >= 15, key };
}

export async function recordFailure(key) {
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 3600);
}

export function isAdmin(req) {
  const given = Buffer.from(String(req.headers["x-admin-key"] || ""));
  const expected = Buffer.from(String(process.env.ADMIN_KEY || ""));
  return expected.length > 0 && given.length === expected.length && timingSafeEqual(given, expected);
}

export function onlyMethod(req, res, method) {
  if (req.method !== method) {
    res.setHeader("Allow", method);
    res.status(405).json({ error: "Method not allowed" });
    return false;
  }
  res.setHeader("Cache-Control", "no-store");
  return true;
}
