import { createEnv } from '@/createEnv';
import z from 'zod';
import { describe, it, check, is } from 'testyx/';

const vars = {
  DATABASE_URL: z.url(),
  NODE_ENV: z.enum(['development', 'preview', 'production']),
  S3_BUCKET_URL: z.url(),
  KIT_API_KEY: z.string().min(1).max(64),
  RESEND_API_KEY: z.string().min(1).max(64).startsWith('res_'),
  S3_BUCKET_NAME: z.string().min(1).max(64),
  S3_BUCKET_REGION: z.string().min(1).max(64),
  S3_BUCKET_ACCESS_KEY_ID: z.string().min(1).max(64),
  S3_BUCKET_SECRET_KEY: z.string().min(1).max(64),
} as const;

describe('types', () => {
  it('runtimeEnv if mentioned, should handle ALL cases otherwise it will error out', () => {
    createEnv({
      vars,
      // @ts-expect-error - yessir
      runtimeEnv: {},
    });
    //
  });
  it('runtimeEnv if mentioned, should handle ALL cases', () => {
    createEnv({
      vars,
      runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        KIT_API_KEY: process.env.KIT_API_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
        S3_BUCKET_REGION: process.env.S3_BUCKET_REGION,
        S3_BUCKET_ACCESS_KEY_ID: process.env.S3_BUCKET_ACCESS_KEY_ID,
        S3_BUCKET_SECRET_KEY: process.env.S3_BUCKET_SECRET_KEY,
        S3_BUCKET_URL: process.env.S3_BUCKET_URL,
        NODE_ENV: process.env.NODE_ENV,
      },
    });
  });
  it('runtimeEnv if mentioned, should not allow even one missing property', () => {
    createEnv({
      vars,
      // @ts-expect-error - yessir
      runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        KIT_API_KEY: process.env.KIT_API_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
        S3_BUCKET_REGION: process.env.S3_BUCKET_REGION,
        S3_BUCKET_ACCESS_KEY_ID: process.env.S3_BUCKET_ACCESS_KEY_ID,
        S3_BUCKET_SECRET_KEY: process.env.S3_BUCKET_SECRET_KEY,
        NODE_ENV: process.env.NODE_ENV,
      },
    });
  });
  it('runtimeEnv if mentioned, should not allow even one missed property', () => {
    createEnv({
      vars,
      runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        KIT_API_KEY: process.env.KIT_API_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
        S3_BUCKET_REGION: process.env.S3_BUCKET_REGION,
        S3_BUCKET_ACCESS_KEY_ID: process.env.S3_BUCKET_ACCESS_KEY_ID,
        S3_BUCKET_SECRET_KEY: process.env.S3_BUCKET_SECRET_KEY,
        NODE_ENV: process.env.NODE_ENV,
        S3_BUCKET_URL: process.env.S3_BUCKET_URL,
        // @ts-expect-error - yessir
        NOT_EXIST: process.env.S3_BUCKET_URL,
      },
    });
  });

  it('runtimeEnv if mentioned, should not allow even one missed property', () => {
    const env = createEnv({
      vars,
      runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        KIT_API_KEY: process.env.KIT_API_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
        S3_BUCKET_REGION: process.env.S3_BUCKET_REGION,
        S3_BUCKET_ACCESS_KEY_ID: process.env.S3_BUCKET_ACCESS_KEY_ID,
        S3_BUCKET_SECRET_KEY: process.env.S3_BUCKET_SECRET_KEY,
        NODE_ENV: process.env.NODE_ENV,
        S3_BUCKET_URL: process.env.S3_BUCKET_URL,
      },
    });
    check(
      is<typeof env.DATABASE_URL, string>()
        .and()
        .is<typeof env.S3_BUCKET_NAME, string>()
        .and()
        .is<typeof env.S3_BUCKET_REGION, string>()
        .and()
        .is<typeof env.S3_BUCKET_ACCESS_KEY_ID, string>()
        .and()
        .is<typeof env.S3_BUCKET_SECRET_KEY, string>()
        .and()
        .is<typeof env.NODE_ENV, 'development' | 'preview' | 'production'>()
        .and()
        .is<typeof env.S3_BUCKET_URL, string>()
        .and()
        .is<typeof env.RESEND_API_KEY, string>()
    );
  });
});
