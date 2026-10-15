// Creates personal voting codes, loads their hashes into the database and writes codes.csv for HR.
//
// Usage (from the project folder, with the variables from .env set in your terminal):
//   node scripts/generate-codes.mjs 100            add 100 new codes
//   node scripts/generate-codes.mjs 100 --reset    wipe all codes and votes first (before launch only)
//
// codes.csv contains the plain codes. Keep it private, hand it to HR to pair each code with a name,
// and delete it once codes are distributed. The database only ever holds the hashes.

import { writeFileSync } from "node:fs";
import { randomInt } from "node:crypto";
import { CONFIG } from "../lib/config.js";
import { redis, KEYS, hashCode } from "../lib/store.js";

const count = Number(process.argv[2]) || CONFIG.headcount || 100;
const reset = process.argv.includes("--reset");
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I/L, to avoid misreading

if (reset) {
  const keys = [KEYS.codes, KEYS.voted, ...CONFIG.awards.flatMap((a) => [KEYS.used(a.id), KEYS.votes(a.id)])];
  await redis.del(...keys);
  console.log("All codes and votes cleared.");
}

const codes = new Set();
while (codes.size < count) {
  let c = "GRA-";
  for (let i = 0; i < 6; i++) c += ALPHABET[randomInt(ALPHABET.length)];
  codes.add(c);
}

const list = [...codes];
for (let i = 0; i < list.length; i += 50) {
  await redis.sadd(KEYS.codes, ...list.slice(i, i + 50).map(hashCode));
}

const file = `codes-${new Date().toISOString().slice(0, 10)}.csv`;
writeFileSync(file, "Code,Staff name (filled by HR),Department\n" + list.map((c) => `${c},,`).join("\n") + "\n");
console.log(`${list.length} codes loaded into the database and written to ${file}.`);
console.log(`Total valid codes now: ${await redis.scard(KEYS.codes)}`);
