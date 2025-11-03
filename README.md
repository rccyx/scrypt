<div align="center">

# envyx

A lightweight TypeScript utility for managing and validating environment variables with [`zod`](https://github.com/colinhacks/zod).

[![CI](https://github.com/rccyx/envyx/actions/workflows/ci.yml/badge.svg)](https://github.com/rccyx/envyx/actions/workflows/ci.yml)
[![@latest](https://img.shields.io/npm/v/envyx.svg)](https://www.npmjs.com/package/envyx)
[![npm downloads](https://img.shields.io/npm/dm/envyx.svg)](https://www.npmjs.com/package/envyx)
<hr/>
</div>

## What It Does


- **Schema Validation**: Validate environment variables with a `zod` schema.

- **Prefix Handling**: Support prefixes like `NEXT_PUBLIC_` for variables.

- **Flexible Prefix Control**: Exclude prefixes for specific variables as needed.

- **Type Safety**: Access environment variables with full type safety.

- **Optional Validation**: Skip validation when required.

- **Custom Runtime Environment**: Explicitly define environment variables for client-side code in monorepos.


## Why Not Use Other Options?


- **t3-oss/t3-env**: overcomplicated and rigid. It forces you to split envs into `server`, `client`, and `shared` sections and manually manage prefixes. You either hardcode `NEXT_PUBLIC_` yourself or fight its schema merging. In `envyx`, you set a single `prefix: 'NEXT_PUBLIC'`, and it automatically appends it to the right vars you choose. It’s inferred, consistent, and impossible to misconfigure.

- **envalid**: it doesn't use  `zod`, which means additional overhead for importing and learning a new schema validation lib. You already know zod, so might as well use it.

- **envsafe**: too many options, can lead to mental overhead, and I don't like mental overhead, you probably don't too, plus, last commit was like 2 years ago.
- **your own in app library:** There's a 87.68% chance it sucks.

## Installation

```bash
npm install envyx zod
```

or with `pnpm`:

```bash
pnpm add envyx zod
```

## Usage

### Basic Example

```typescript
import { z } from 'zod';
import { createEnv } from 'envyx';

const env = createEnv({
  vars: {
    API_URL: z.string().url(),
    PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
  },
});

console.log(env.API_URL); // e.g., "https://example.com"
console.log(env.PORT);    // e.g., "3000"
```

### With Prefixes

If your environment variables have a common prefix, you can specify it:

```typescript
import { z } from 'zod';
import { createEnv } from 'envyx';

const env = createEnv({
  vars: {
    API_URL: z.string().url(),
    PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
  },
  prefix: 'NEXT_PUBLIC',
});

console.log(env.NEXT_PUBLIC_API_URL); // e.g., "https://example.com"
console.log(env.NEXT_PUBLIC_PORT);    // e.g., "3000"
```

### Disabling Prefix for Specific Variables

Disable the prefix for specific variables using the `disablePrefix` option:

```typescript
import { z } from 'zod';
import { createEnv } from 'envyx';

const env = createEnv({
  vars: {
    API_URL: z.string().url(),
    NODE_ENV: z.string().min(1),
    PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
  },
  prefix: 'NEXT_PUBLIC',
  disablePrefix: ['NODE_ENV'],
});

console.log(env.NEXT_PUBLIC_API_URL); // e.g., "https://example.com"
console.log(env.NEXT_PUBLIC_PORT);    // e.g., "3000"
console.log(env.NODE_ENV);            // e.g., "development"
```

### Skipping Validation

To skip validation, set `skipValidation` to `true`:

```typescript
import { z } from 'zod';
import { createEnv } from 'envyx';

const env = createEnv({
  vars: {
    API_URL: z.string(),
    PORT: z.string(),
  },
  skipValidation: true,
});

console.log(env.API_URL);
console.log(env.PORT);
```

### Custom Runtime Environment

For cases where you need to explicitly define environment variables (especially in client-side code), use the `runtimeEnv` option:

```typescript
import { z } from 'zod';
import { createEnv } from 'envyx';

const isBrowser = typeof window !== 'undefined';

const env = createEnv({
  vars: {
    API_URL: z.string().url(),
    API_KEY: z.string().min(1),
  },
  prefix: 'NEXT_PUBLIC',
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
  },
  skipValidation: isBrowser,
});
```

## API

### `createEnv`

#### Parameters

- `vars`: A record of variable names and their `zod` schemas.
- `prefix` (optional): A prefix to apply to variables (e.g., `'NEXT_PUBLIC'`).
- `disablePrefix` (optional): An array of variable names to exclude from the prefix.
- `skipValidation` (optional): If `true`, skips validation.
- `runtimeEnv` (optional): Explicitly define environment variables, useful for client-side code.

#### Returns

A type-safe object containing your environment variables.

## Error Handling

When validation fails, `createEnv` throws an error with details:

```bash
❌ Invalid environment variables: {
  NEXT_PUBLIC_WWW_URL: [ 'Invalid url' ],
  NEXT_PUBLIC_WWW_GOOGLE_ANALYTICS_ID: [
    'String must contain at least 7 character(s)',
    'Invalid input: must start with "G-"'
  ],
  NEXT_PUBLIC_BLOG_GOOGLE_ANALYTICS_ID: [
    'String must contain at least 7 character(s)',
    'Invalid input: must start with "G-"'
  ],
  NEXT_PUBLIC_BLOG_URL: [ 'Invalid url' ]
}
```

## Presets

To simplify the management of environment variables for specific platforms, you can use presets provided by the library. For example, if you're deploying on Vercel, you can easily include all the relevant environment variables by importing and using the dedicated Vercel preset.

### Example with Vercel Preset

![image](https://github.com/user-attachments/assets/d8a660e8-08a0-4531-b31a-a504d79998db)
#### Supported presets
- Vercel
- Netlify
- Fly
- Railway

### Loading Environment Files

Edge runtimes can’t use Node’s `path`/`fs`. The clean way is to load your `.env` in the shell before running your app (e.g. [check this shell function](https://github.com/rccyx/zshfuncs/blob/main/env.zsh)).

If you still want file-based loading in Node/CI, here’s how:

```ts
import path from "path";
import { config } from "dotenv";
import { createEnv } from "envyx";
import { z } from "zod";

if (process.env.CI !== "true") {
  config({ path: path.resolve(process.cwd(), ".env") });
}

const env = createEnv({
  vars: {
    API_URL: z.string().url(),
    API_KEY: z.string().min(1),
  },
  // ... other confs
});
```

## NextJS Monorepos

When working with NextJS in a monorepo setup, you may encounter issues with environment variables, especially in client components. This is because:

1. In a monorepo, your environment configuration might be in a shared package (e.g., `@packages/env`)
2. NextJS has special handling for environment variables, particularly those with the `NEXT_PUBLIC_` prefix
3. Client components can't access server-side environment variables directly


In a standard NextJS app, environment variables work seamlessly between server and client components when defined in `.env` files at the app root. So the configs you see above will work just fine. However, in monorepos:

- Environment variables defined in shared packages may not be properly injected into client components
- Even with transpilation of packages, NextJS might not correctly process environment variables from shared packages


So to solve this issue, use the `runtimeEnv` option to explicitly define your environment variables:

```typescript
import { z } from 'zod';
import { createEnv } from 'envyx';

const isBrowser = typeof window !== 'undefined';

export const env = createEnv({
  vars: {
    NODE_ENV: z.enum(["production", "development", "preview"]),
    WWW_URL: z.string().url(),
    BLOG_URL: z.string().url(),
    WWW_GOOGLE_ANALYTICS_ID: z.string().min(7).startsWith("G-"),
    BLOG_GOOGLE_ANALYTICS_ID: z.string().min(7).startsWith("G-"),
  },
  disablePrefix: ["NODE_ENV"],
  prefix: "NEXT_PUBLIC",
  // Explicitly define environment variables
  runtimeEnv: {
    NEXT_PUBLIC_WWW_GOOGLE_ANALYTICS_ID:
      process.env.NEXT_PUBLIC_WWW_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_BLOG_GOOGLE_ANALYTICS_ID:
      process.env.NEXT_PUBLIC_BLOG_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_WWW_URL: process.env.NEXT_PUBLIC_WWW_URL,
    NEXT_PUBLIC_BLOG_URL: process.env.NEXT_PUBLIC_BLOG_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: isBrowser, // Skip validation in the browser since variables are injected at build time
});
```
> `runtimeEnv` is typesafe too so you won't have to worry about missing any variables

Here's how you might configure it in a [monorepo](https://github.com/rccyx/x/blob/main/packages/env/index.ts).
### Additional Configuration for Turborepo

If you're using Turborepo, remember to add your environment variables to `turbo.json`:

```json
{
  "pipeline": {
    "build": {
      "env": [
        "NODE_ENV",
        "NEXT_PUBLIC_WWW_URL",
        "NEXT_PUBLIC_BLOG_URL",
        "NEXT_PUBLIC_WWW_GOOGLE_ANALYTICS_ID",
        "NEXT_PUBLIC_BLOG_GOOGLE_ANALYTICS_ID"
      ]
    }
  }
}
```

This ensures Turborepo correctly passes these environment variables to your build processes.

## License

[MIT](./LICENSE)

