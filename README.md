# scrypt

This package is built directly on Node’s native `crypto.scrypt`, dependency-free, timing-safe, stable, and fully typed. It’s made for real-world apps that need secure defaults and clean DX out of the box, without pointless config or [runtime issues](https://github.com/ranisalt/node-argon2/issues/421). Simple API, predictable behavior, works everywhere Node runs.


## install

```bash
pnpm add @rccyx/scrypt
```

## usage

```ts
import { hash, verify, hashSync, verifySync } from "@rccyx/scrypt";

const hashed = hashSync("password123");
const isValid = verifySync({ hash: hashed, plaintext: "password123" });
```

Each hash is stored as `salt:key` in hex, with a random 16-byte salt and a default 64-byte derived key. You can set custom lengths if needed (64 | 128 | 256 | 512 | 1024).



## license

[MIT](/LICENSE)