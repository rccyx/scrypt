import { scrypt, scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

function deriveKeySync(
  plaintext: string,
  salt: Buffer,
  keyLen: number
): Buffer {
  return scryptSync(plaintext, new Uint8Array(salt), keyLen);
}

async function deriveKey(
  plaintext: string,
  salt: Buffer,
  keyLen: number
): Promise<Buffer> {
  return (await scryptAsync(plaintext, new Uint8Array(salt), keyLen)) as Buffer;
}

function serialize(salt: Buffer, key: Buffer): string {
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

function deserialize(hash: string): { salt: Buffer; key: Buffer } | null {
  const [saltHex, keyHex] = hash.split(':');
  if (!saltHex || !keyHex) return null;
  return { salt: Buffer.from(saltHex, 'hex'), key: Buffer.from(keyHex, 'hex') };
}

export async function hash(plaintext: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(plaintext, salt, 64);
  return serialize(salt, key);
}

export function hashSync(plaintext: string): string {
  const salt = randomBytes(16);
  const key = deriveKeySync(plaintext, salt, 64);
  return serialize(salt, key);
}

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
