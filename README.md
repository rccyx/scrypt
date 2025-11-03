# @rccyx/scrypt

**A simple, reliable password hashing library that just works.**

This library uses Node.js's built-in `crypto.scrypt` directly - no bullshit, no weird dependencies, no broken types. Scrypt has been integrated into Node.js since June 19, 2018 and it's battle-tested. Unlike other password hashing libraries (like bcrypt) that sometimes blow up in AWS Lambda functions or have compatibility issues, this one just works.

## Why This Exists

Most password hashing libraries suck at TypeScript types. They have weird-ass arguments, bad types, and don't make logical sense. Some libraries like bcrypt have issues:
- They sometimes explode in Node.js Lambda functions
- They don't work consistently on AWS
- They have unnecessary dependencies
- Their APIs are confusing

This library exists for developers who don't want to think about all this shit. You just want something that fucking works automatically, and this does. Fully typed, zero dependencies (except Node's built-in crypto), and it just works.

## Installation

```bash
npm install @rccyx/scrypt
```

```bash
pnpm add @rccyx/scrypt
```

```bash
yarn add @rccyx/scrypt
```

## Usage

### Hash a Password (Async)

```typescript
import { hash, verify } from '@rccyx/scrypt';

const passwordHash = await hash('mySecurePassword123');
// Store this in your database
```

### Hash a Password (Sync)

```typescript
import { hashSync, verifySync } from '@rccyx/scrypt';

const passwordHash = hashSync('mySecurePassword123');
// Store this in your database
```

### Verify a Password (Async)

```typescript
import { verify } from '@rccyx/scrypt';

const isValid = await verify({
  hash: storedHashFromDatabase,
  plaintext: userInputPassword
});

if (isValid) {
  console.log('Password is correct');
}
```

### Verify a Password (Sync)

```typescript
import { verifySync } from '@rccyx/scrypt';

const isValid = verifySync({
  hash: storedHashFromDatabase,
  plaintext: userInputPassword
});

if (isValid) {
  console.log('Password is correct');
}
```

### Complete Example

```typescript
import { hash, verify } from '@rccyx/scrypt';

// When user registers
async function registerUser(email: string, password: string) {
  const passwordHash = await hash(password);
  // Save email and passwordHash to database
  await db.users.create({ email, passwordHash });
}

// When user logs in
async function loginUser(email: string, password: string) {
  const user = await db.users.findByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await verify({
    hash: user.passwordHash,
    plaintext: password
  });

  if (!isValid) {
    throw new Error('Invalid password');
  }

  // User authenticated
  return user;
}
```

## API

### `hash(plaintext: string): Promise<string>`

Asynchronously hashes a plaintext password using scrypt.

- **Parameters:**
  - `plaintext` (string): The password to hash
- **Returns:** Promise that resolves to a hash string in the format `"salt:key"` (both hex-encoded)

### `hashSync(plaintext: string): string`

Synchronously hashes a plaintext password using scrypt.

- **Parameters:**
  - `plaintext` (string): The password to hash
- **Returns:** A hash string in the format `"salt:key"` (both hex-encoded)

### `verify({ hash, plaintext }): Promise<boolean>`

Asynchronously verifies a plaintext password against a stored hash. Uses timing-safe comparison to prevent timing attacks.

- **Parameters:**
  - `hash` (string): The stored hash string to compare against
  - `plaintext` (string): The password to verify
- **Returns:** Promise that resolves to `true` if the password matches, `false` otherwise

### `verifySync({ hash, plaintext }): boolean`

Synchronously verifies a plaintext password against a stored hash. Uses timing-safe comparison to prevent timing attacks.

- **Parameters:**
  - `hash` (string): The stored hash string to compare against
  - `plaintext` (string): The password to verify
- **Returns:** `true` if the password matches, `false` otherwise

## Features

- ✅ **Zero dependencies** - Uses only Node.js built-in `crypto` module
- ✅ **Fully typed** - Proper TypeScript types with no weird arguments
- ✅ **Works everywhere** - No issues with AWS Lambda, serverless, or any Node.js environment
- ✅ **Timing-safe verification** - Prevents timing attacks
- ✅ **Simple API** - Just hash and verify, that's it
- ✅ **Async & Sync** - Use whichever fits your needs
- ✅ **Battle-tested** - Scrypt has been in Node.js since 2010

## Hash Format

The hash is stored as a hexadecimal string in the format `"salt:key"`:

- **Salt**: 16 bytes (32 hex characters) - randomly generated for each password
- **Key**: 64 bytes (128 hex characters) - derived from the password and salt

Example: `"a1b2c3d4e5f6g7h8...:i9j0k1l2m3n4o5p6..."`

Each password gets a unique salt, so the same password will produce different hashes every time (which is what you want for security).

## Requirements

- Node.js 12.0.0 or higher

## License

MIT
