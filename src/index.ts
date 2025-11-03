import { scrypt, scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

// node's built-in scrypt uses callback style; this converts it to a promise version
const scryptAsync = promisify(scrypt);

// derive a key from a plaintext (sync)
function deriveKeySync(
  plaintext: string,
  salt: Buffer,
  keyLen: number
): Buffer {
  return scryptSync(plaintext, salt, keyLen);
}

// derive a key from a plaintext (async)
async function deriveKey(
  plaintext: string,
  salt: Buffer,
  keyLen: number
): Promise<Buffer> {
  return (await scryptAsync(plaintext, salt, keyLen)) as Buffer;
}

// join salt and key into a single string to store in DB
function serialize(salt: Buffer, key: Buffer): string {
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

// split the stored hash back into buffers
function deserialize(hash: string): { salt: Buffer; key: Buffer } | null {
  const [saltHex, keyHex] = hash.split(':');
  if (!saltHex || !keyHex) return null;
  return { salt: Buffer.from(saltHex, 'hex'), key: Buffer.from(keyHex, 'hex') };
}

// ---------- public api ----------

/**
 * Hash a plaintext asynchronously.
 * Generates a random 16-byte salt and derives a 64-byte key using scrypt.
 * Returns a string in the format "salt:key".
 */
export async function hash(plaintext: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(plaintext, salt, 64);
  return serialize(salt, key);
}

/**
 * Hash a plaintext synchronously.
 * Same as `hash` but blocking, for CLI or build-time use.
 */
export function hashSync(plaintext: string): string {
  const salt = randomBytes(16);
  const key = deriveKeySync(plaintext, salt, 64);
  return serialize(salt, key);
}

/**
 * Verify a plaintext asynchronously.
 * Re-derives the key from the given plaintext and stored salt, then performs
 * a constant-time comparison to avoid timing attacks.
 */
export async function verify({
  hash,
  plaintext,
}: {
  hash: string;
  plaintext: string;
}): Promise<boolean> {
  const parsed = deserialize(hash);
  if (!parsed) return false;
  const derived = await deriveKey(plaintext, parsed.salt, parsed.key.length);
  return timingSafeEqual(parsed.key, derived);
}

/**
 * Verify a plaintext synchronously.
 * Same as `verify` but blocking.
 */
export function verifySync({
  hash,
  plaintext,
}: {
  hash: string;
  plaintext: string;
}): boolean {
  const parsed = deserialize(hash);
  if (!parsed) return false;
  const derived = deriveKeySync(plaintext, parsed.salt, parsed.key.length);
  return timingSafeEqual(parsed.key, derived);
}
