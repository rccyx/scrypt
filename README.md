
# scrypt

## A Minimal, Reliable Password Hashing Library Built on Node.js Core

This package uses **Node.js's native `crypto.scrypt`**. It features **zero dependencies**, **no native bindings**, and **no runtime issues**. scrypt has been part of Node.js core since 2018 and is a proven, memory-hard key derivation function designed for secure password storage. This just adds types & DX on top of it, just works.


## Why This Exists

Password hashing should be simple and fail-proof. Existing libraries often introduce unnecessary complexity:

  * **Confusing APIs and Inconsistent Types:** They require convoluted configuration when simple defaults are sufficient for literlaly most apps.
  * **Runtime Instability:** Libraries for modern algorithms like **Argon2** often rely on native C/C++ binaries. These binaries **fail to compile or crash in serverless and Edge runtimes** (e.g., AWS Lambda, Vercel Edge) due to missing dependencies.

This library eliminates those problems. It is **fully typed**, **dependency-free**, and works anywhere Node.js runs. There are no build steps, broken binaries, or platform-specific configuration traps. It is a small, predictable API that just works.

## Installation

```bash
pnpm add @rccyx/scrypt
```

## API

The functions prioritize simplicity, offering both asynchronous and synchronous options.

### Hashing Functions

| Function | Description | Signature |
| :--- | :--- | :--- |
| **`hash`** | Asynchronously hashes a password. | `hash({ plaintext: string, keyLength?: KeyLength }): Promise<string>` |
| **`hashSync`** | Synchronous version of `hash`. | `hashSync({ plaintext: string, keyLength?: KeyLength }): string` |

### Verification Functions

| Function | Description | Signature |
| :--- | :--- | :--- |
| **`verify`** | Asynchronously verifies a password against a stored hash using timing-safe comparison. | `verify({ hash: string, plaintext: string }): Promise<boolean>` |
| **`verifySync`** | Synchronous verification. | `verifySync({ hash: string, plaintext: string }): boolean` |

**`KeyLength`** is one of: **$64 | 128 | 256 | 512 | 1024$** (bytes). The default is **64** bytes.


## Features

  * **Zero Dependencies:** Uses only Node.js `crypto`.
  * **Fully Typed:** Clean, predictable **TypeScript** API.
  * **Works Everywhere:** No native compilation, no build steps.
  * **Serverless Safe:** Reliable on AWS Lambda, Vercel Edge, and other restricted runtimes.
  * **Timing-Safe:** Protects against timing attacks.
  * **Async and Sync Support:** Use the function that fits your application's flow.


## Hash Format

Each hash is stored as a hexadecimal string in the format: **`salt:key`**

| Part | Size | Description |
| :--- | :--- | :--- |
| **Salt** | 16 bytes (32 hex characters) | Randomly generated for each password. |
| **Key** | Default 64 bytes (128 hex characters) | Derived from the password and salt. |

**Example:** `"a1b2c3d4e5f6g7h8...:i9j0k1l2m3n4o5p6..."`


## Requirements

  * Node.js $12.0.0$ or newer

## License

MIT
