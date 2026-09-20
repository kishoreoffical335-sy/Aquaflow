import crypto from "crypto";

/**
 * Hash an API key using SHA-256 for secure database verification.
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey.trim()).digest("hex");
}

/**
 * Generate a cryptographically secure device API key with readable prefix.
 */
export function generateDeviceApiKey(): { apiKey: string; keyHash: string } {
  const randomHex = crypto.randomBytes(24).toString("hex");
  const apiKey = `wq_${randomHex}`;
  const keyHash = hashApiKey(apiKey);
  return { apiKey, keyHash };
}
