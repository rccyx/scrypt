/**
 * A secure password hashing library using the scrypt key derivation function.
 * Provides both synchronous and asynchronous APIs for hashing and verifying passwords.
 *
 * @packageDocumentation
 */

import { scrypt, scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Valid key lengths for scrypt key derivation in bytes.
 */
export type KeyLength = 64 | 128 | 256 | 512 | 1024;

function isValidKeyLength(length: number): length is KeyLength {
  return (
    length === 64 ||
    length === 128 ||
    length === 256 ||
    length === 512 ||
    length === 1024
  );
}

/**
 * Synchronously derives a key from a plaintext password using scrypt.
 *
 * @param plaintext - The plaintext password to derive a key from
 * @param salt - A random salt value (Buffer) to use in key derivation
 * @param keyLen - The desired length of the derived key in bytes
 * @returns A Buffer containing the derived key
 * @internal
 */
function deriveKeySync(
  plaintext: string,
  salt: Buffer,
  keyLen: KeyLength
): Buffer {
  return scryptSync(plaintext, new Uint8Array(salt), keyLen);
}

/**
 * Asynchronously derives a key from a plaintext password using scrypt.
 *
 * @param plaintext - The plaintext password to derive a key from
 * @param salt - A random salt value (Buffer) to use in key derivation
 * @param keyLen - The desired length of the derived key in bytes
 * @returns A Promise that resolves to a Buffer containing the derived key
 * @internal
 */
async function deriveKey(
  plaintext: string,
  salt: Buffer,
  keyLen: KeyLength
): Promise<Buffer> {
  return (await scryptAsync(plaintext, new Uint8Array(salt), keyLen)) as Buffer;
}

/**
 * Serializes a salt and key pair into a hexadecimal string format.
 *
 * @param salt - The salt buffer to serialize
 * @param key - The key buffer to serialize
 * @returns A string in the format "salt:key" where both are hex-encoded
 * @internal
 */
function serialize(salt: Buffer, key: Buffer): string {
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

/**
 * Deserializes a hash string back into salt and key buffers.
 *
 * @param hash - The hash string in the format "salt:key" (hex-encoded)
 * @returns An object containing salt and key buffers, or null if parsing fails
 * @internal
 */
function deserialize(hash: string): { salt: Buffer; key: Buffer } | null {
  const parts = hash.split(':');
  if (parts.length !== 2) return null;
  const [saltHex, keyHex] = parts;
  if (!saltHex || !keyHex) return null;
  return { salt: Buffer.from(saltHex, 'hex'), key: Buffer.from(keyHex, 'hex') };
}

/**
 * Asynchronously hashes a plaintext password using scrypt.
 *
 * Generates a random 16-byte salt and derives a key from the password.
 * The result is a hexadecimal string containing both the salt and derived key.
 *
 * @param options - Hashing options
 * @param options.plaintext - The plaintext password to hash
 * @param options.keyLength - The length of the derived key in bytes (default: 64)
 * @returns A Promise that resolves to a hash string in the format "salt:key"
 *
 * @example
 * ```typescript
 * const hashString = await hash({ plaintext: 'mySecurePassword' });
 * // Returns: "a1b2c3d4...:e5f6g7h8..."
 *
 * const hashString256 = await hash({ plaintext: 'mySecurePassword', keyLength: 256 });
 * // Uses 256-byte key length
 * ```
 */
export async function hash({
  plaintext,
  keyLength = 64,
}: {
  plaintext: string;
  keyLength?: KeyLength;
}): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(plaintext, salt, keyLength);
  return serialize(salt, key);
}

/**
 * Synchronously hashes a plaintext password using scrypt.
 *
 * Generates a random 16-byte salt and derives a key from the password.
 * The result is a hexadecimal string containing both the salt and derived key.
 *
 * @param options - Hashing options
 * @param options.plaintext - The plaintext password to hash
 * @param options.keyLength - The length of the derived key in bytes (default: 64)
 * @returns A hash string in the format "salt:key"
 *
 * @example
 * ```typescript
 * const hashString = hashSync({ plaintext: 'mySecurePassword' });
 * // Returns: "a1b2c3d4...:e5f6g7h8..."
 *
 * const hashString256 = hashSync({ plaintext: 'mySecurePassword', keyLength: 256 });
 * // Uses 256-byte key length
 * ```
 */
export function hashSync({
  plaintext,
  keyLength = 64,
}: {
  plaintext: string;
  keyLength?: KeyLength;
}): string {
  const salt = randomBytes(16);
  const key = deriveKeySync(plaintext, salt, keyLength);
  return serialize(salt, key);
}

/**
 * Asynchronously verifies a plaintext password against a stored hash.
 *
 * Uses timing-safe comparison to prevent timing attacks during verification.
 *
 * @param options - Verification options
 * @param options.hash - The stored hash string to compare against
 * @param options.plaintext - The plaintext password to verify
 * @returns A Promise that resolves to true if the password matches, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = await verify({
 *   hash: storedHash,
 *   plaintext: userInput
 * });
 * if (isValid) {
 *   console.log('Password is correct');
 * }
 * ```
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
  if (!isValidKeyLength(parsed.key.length)) return false;
  const derived = await deriveKey(plaintext, parsed.salt, parsed.key.length);
  return timingSafeEqual(new Uint8Array(parsed.key), new Uint8Array(derived));
}

/**
 * Synchronously verifies a plaintext password against a stored hash.
 *
 * Uses timing-safe comparison to prevent timing attacks during verification.
 *
 * @param options - Verification options
 * @param options.hash - The stored hash string to compare against
 * @param options.plaintext - The plaintext password to verify
 * @returns true if the password matches, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = verifySync({
 *   hash: storedHash,
 *   plaintext: userInput
 * });
 * if (isValid) {
 *   console.log('Password is correct');
 * }
 * ```
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
  if (!isValidKeyLength(parsed.key.length)) return false;
  const derived = deriveKeySync(plaintext, parsed.salt, parsed.key.length);
  return timingSafeEqual(new Uint8Array(parsed.key), new Uint8Array(derived));
}
