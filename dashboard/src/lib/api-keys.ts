import { randomBytes, createHash } from "crypto";

const KEY_PREFIX = "ak_live_";

export function generateApiKey(): { plain: string; hash: string; prefix: string } {
  const bytes = randomBytes(16);
  const plain = KEY_PREFIX + bytes.toString("hex");
  const hash = hashKey(plain);
  const prefix = plain.slice(0, 12) + "...";
  return { plain, hash, prefix };
}

export function hashKey(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}
