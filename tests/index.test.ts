import { describe, it, expect } from 'vitest';
import { hash, hashSync, verify, verifySync } from '../src/index';

describe('hash', () => {
  it('should hash a plaintext password asynchronously', async () => {
    const plaintext = 'mySecurePassword123';
    const result = await hash({ plaintext });

    expect(result).toBeTypeOf('string');
    expect(result).toContain(':');
    const parts = result.split(':');
    expect(parts.length).toBe(2);
    const [saltHex, keyHex] = parts;
    expect(saltHex).toBeDefined();
    expect(keyHex).toBeDefined();
    if (saltHex && keyHex) {
      expect(saltHex.length).toBe(32); // 16 bytes = 32 hex characters
      expect(keyHex.length).toBe(128); // 64 bytes = 128 hex characters
    }
  });

  it('should produce different hashes for the same password (random salt)', async () => {
    const plaintext = 'samePassword';
    const hash1 = await hash({ plaintext });
    const hash2 = await hash({ plaintext });

    expect(hash1).not.toBe(hash2);
    // Both should verify correctly
    expect(await verify({ hash: hash1, plaintext })).toBe(true);
    expect(await verify({ hash: hash2, plaintext })).toBe(true);
  });

  it('should handle empty strings', async () => {
    const result = await hash({ plaintext: '' });
    expect(result).toBeTypeOf('string');
    expect(result).toContain(':');
  });

  it('should handle special characters and unicode', async () => {
    const plaintext = 'p@ssw0rd! 🔐 中文 日本語';
    const result = await hash({ plaintext });
    expect(result).toBeTypeOf('string');
    const isValid = await verify({ hash: result, plaintext });
    expect(isValid).toBe(true);
  });

  it('should handle very long passwords', async () => {
    const plaintext = 'a'.repeat(1000);
    const result = await hash({ plaintext });
    expect(result).toBeTypeOf('string');
    const isValid = await verify({ hash: result, plaintext });
    expect(isValid).toBe(true);
  });
});

describe('hashSync', () => {
  it('should hash a plaintext password synchronously', () => {
    const plaintext = 'mySecurePassword123';
    const result = hashSync({ plaintext });

    expect(result).toBeTypeOf('string');
    expect(result).toContain(':');
    const parts = result.split(':');
    expect(parts.length).toBe(2);
    const [saltHex, keyHex] = parts;
    expect(saltHex).toBeDefined();
    expect(keyHex).toBeDefined();
    if (saltHex && keyHex) {
      expect(saltHex.length).toBe(32); // 16 bytes = 32 hex characters
      expect(keyHex.length).toBe(128); // 64 bytes = 128 hex characters
    }
  });

  it('should produce different hashes for the same password (random salt)', () => {
    const plaintext = 'samePassword';
    const hash1 = hashSync({ plaintext });
    const hash2 = hashSync({ plaintext });

    expect(hash1).not.toBe(hash2);
    // Both should verify correctly
    expect(verifySync({ hash: hash1, plaintext })).toBe(true);
    expect(verifySync({ hash: hash2, plaintext })).toBe(true);
  });

  it('should handle empty strings', () => {
    const result = hashSync({ plaintext: '' });
    expect(result).toBeTypeOf('string');
    expect(result).toContain(':');
  });

  it('should handle special characters and unicode', () => {
    const plaintext = 'p@ssw0rd! 🔐 中文 日本語';
    const result = hashSync({ plaintext });
    expect(result).toBeTypeOf('string');
    const isValid = verifySync({ hash: result, plaintext });
    expect(isValid).toBe(true);
  });

  it('should handle very long passwords', () => {
    const plaintext = 'a'.repeat(1000);
    const result = hashSync({ plaintext });
    expect(result).toBeTypeOf('string');
    const isValid = verifySync({ hash: result, plaintext });
    expect(isValid).toBe(true);
  });
});

describe('verify', () => {
  it('should verify a correct password asynchronously', async () => {
    const plaintext = 'mySecurePassword';
    const hashString = await hash({ plaintext });
    const isValid = await verify({ hash: hashString, plaintext });

    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password asynchronously', async () => {
    const plaintext = 'mySecurePassword';
    const wrongPassword = 'wrongPassword';
    const hashString = await hash({ plaintext });
    const isValid = await verify({
      hash: hashString,
      plaintext: wrongPassword,
    });

    expect(isValid).toBe(false);
  });

  it('should reject invalid hash format', async () => {
    const isValid = await verify({
      hash: 'invalid:hash:format',
      plaintext: 'password',
    });

    expect(isValid).toBe(false);
  });

  it('should reject hash with missing parts', async () => {
    const isValid1 = await verify({ hash: 'onlysalt', plaintext: 'password' });
    const isValid2 = await verify({ hash: ':keyonly', plaintext: 'password' });
    const isValid3 = await verify({ hash: 'salt:', plaintext: 'password' });

    expect(isValid1).toBe(false);
    expect(isValid2).toBe(false);
    expect(isValid3).toBe(false);
  });

  it('should handle empty string passwords', async () => {
    const hashString = await hash({ plaintext: '' });
    const isValid = await verify({ hash: hashString, plaintext: '' });
    expect(isValid).toBe(true);

    const wrongIsValid = await verify({
      hash: hashString,
      plaintext: 'not empty',
    });
    expect(wrongIsValid).toBe(false);
  });

  it('should verify the same hash multiple times consistently', async () => {
    const plaintext = 'consistentPassword';
    const hashString = await hash({ plaintext });

    for (let i = 0; i < 10; i++) {
      const isValid = await verify({ hash: hashString, plaintext });
      expect(isValid).toBe(true);
    }
  });
});

describe('verifySync', () => {
  it('should verify a correct password synchronously', () => {
    const plaintext = 'mySecurePassword';
    const hashString = hashSync({ plaintext });
    const isValid = verifySync({ hash: hashString, plaintext });

    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password synchronously', () => {
    const plaintext = 'mySecurePassword';
    const wrongPassword = 'wrongPassword';
    const hashString = hashSync({ plaintext });
    const isValid = verifySync({ hash: hashString, plaintext: wrongPassword });

    expect(isValid).toBe(false);
  });

  it('should reject invalid hash format', () => {
    const isValid = verifySync({
      hash: 'invalid:hash:format',
      plaintext: 'password',
    });

    expect(isValid).toBe(false);
  });

  it('should reject hash with missing parts', () => {
    const isValid1 = verifySync({ hash: 'onlysalt', plaintext: 'password' });
    const isValid2 = verifySync({ hash: ':keyonly', plaintext: 'password' });
    const isValid3 = verifySync({ hash: 'salt:', plaintext: 'password' });

    expect(isValid1).toBe(false);
    expect(isValid2).toBe(false);
    expect(isValid3).toBe(false);
  });

  it('should handle empty string passwords', () => {
    const hashString = hashSync({ plaintext: '' });
    const isValid = verifySync({ hash: hashString, plaintext: '' });
    expect(isValid).toBe(true);

    const wrongIsValid = verifySync({
      hash: hashString,
      plaintext: 'not empty',
    });
    expect(wrongIsValid).toBe(false);
  });

  it('should verify the same hash multiple times consistently', () => {
    const plaintext = 'consistentPassword';
    const hashString = hashSync({ plaintext });

    for (let i = 0; i < 10; i++) {
      const isValid = verifySync({ hash: hashString, plaintext });
      expect(isValid).toBe(true);
    }
  });
});

describe('cross-compatibility', () => {
  it('should verify async hash with sync verify', async () => {
    const plaintext = 'crossTest';
    const hashString = await hash({ plaintext });
    const isValid = verifySync({ hash: hashString, plaintext });

    expect(isValid).toBe(true);
  });

  it('should verify sync hash with async verify', async () => {
    const plaintext = 'crossTest';
    const hashString = hashSync({ plaintext });
    const isValid = await verify({ hash: hashString, plaintext });

    expect(isValid).toBe(true);
  });
});

describe('security properties', () => {
  it('should produce significantly different hashes for similar passwords', async () => {
    const hash1 = await hash({ plaintext: 'password1' });
    const hash2 = await hash({ plaintext: 'password2' });

    expect(hash1).not.toBe(hash2);
    // Even the salt part should be different
    expect(hash1.split(':')[0]).not.toBe(hash2.split(':')[0]);
  });

  it('should verify with case sensitivity', async () => {
    const plaintext = 'CaseSensitive';
    const hashString = await hash({ plaintext });

    expect(await verify({ hash: hashString, plaintext: 'CaseSensitive' })).toBe(
      true
    );
    expect(await verify({ hash: hashString, plaintext: 'casesensitive' })).toBe(
      false
    );
    expect(await verify({ hash: hashString, plaintext: 'CASESENSITIVE' })).toBe(
      false
    );
  });

  it('should handle whitespace sensitivity', async () => {
    const plaintext = ' password ';
    const hashString = await hash({ plaintext });

    expect(await verify({ hash: hashString, plaintext: ' password ' })).toBe(
      true
    );
    expect(await verify({ hash: hashString, plaintext: 'password' })).toBe(
      false
    );
    expect(await verify({ hash: hashString, plaintext: ' password' })).toBe(
      false
    );
    expect(await verify({ hash: hashString, plaintext: 'password ' })).toBe(
      false
    );
  });
});
