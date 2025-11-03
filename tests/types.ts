import { createEnv } from '../src/createEnv';
import { z } from 'zod';
import { check, is, describe, it, isNot, and } from 'testyx';
import { tuple } from '../src/utils';

const vars = {
  STR: z.string(),
  NUM: z.number(),
  MAYBE_STR: z.string().optional().nullable(),
  MAYBE_UNDEFINED_STR: z.string().optional(),
  NULLABLE_STR: z.string().nullable(),
  BOOL: z.boolean(),
  DATE: z.date(),
};

const tupleVars = tuple(vars);

export const env = createEnv({
  vars: {
    ...vars,
    ARRAY: z.array(z.string()),
    OBJECT: z.object({
      name: z.string(),
      age: z.number(),
    }),
    ENUM: z.enum(['a', 'b', 'c']),
    NULL: z.null(),
    UNDEFINED: z.undefined(),
    NEVER: z.never(),
    UNKNOWN: z.unknown(),
    ANY: z.any(),
  },
  disablePrefix: tupleVars,
  prefix: 'NEXT_PUBLIC',
  skipValidation: true,
});

describe('types', () => {
  it('vars are turuned into a tuple', () => {
    check(
      and(
        isNot<
          typeof tupleVars,
          [
            'STR',
            'MAYBE_STR', // we flipped
            'NUM', //  these two
            'MAYBE_UNDEFINED_STR',
            'NULLABLE_STR',
            'BOOL',
            'DATE',
          ]
        >().describe('and alos cannot be unordered, in this case'),
        and(
          is<
            typeof tupleVars,
            [
              'STR',
              'NUM',
              'MAYBE_STR',
              'MAYBE_UNDEFINED_STR',
              'NULLABLE_STR',
              'BOOL',
              'DATE',
            ]
          >().describe('is exactly as is, exactly ordered'),
          isNot<
            typeof tupleVars,
            [
              'STR',
              'MAYBE_STR',
              'MAYBE_UNDEFINED_STR',
              'NULLABLE_STR',
              'BOOL',
              'DATE',
            ]
          >().describe('doesnt miss a single var')
        )
      )
    );
  });

  it('infers STR as string', () => {
    check(is<string, typeof env.STR>());
  });

  it('doe s not infer STR as number', () => {
    check(isNot<number, typeof env.STR>());
  });

  it('infers MAYBE_STR as string | null | undefined', () => {
    check(
      is<string | null | undefined, typeof env.MAYBE_STR>().describe(
        'we disabled the prefix so this should be the same as the original var'
      )
    );
  });

  it('does not infer MAYBE_STR as number', () => {
    check(isNot<number, typeof env.MAYBE_STR>());
  });

  it('infers NULLABLE_STR as string | null', () => {
    check(is<string | null, typeof env.NULLABLE_STR>());
  });

  it('infers MAYBE_UNDEFINED_STR as string | undefined', () => {
    check(
      is<string | undefined, typeof env.MAYBE_UNDEFINED_STR>().describe(
        'we enabled the prefix so this should be the prefixed var'
      )
    );
  });

  it('infers NUM as number', () => {
    check(is<number, typeof env.NUM>());
  });

  it('does not infer NUM as string literal', () => {
    check(isNot<'number', typeof env.NUM>());
  });

  it('infers BOOL as boolean', () => {
    check(is<boolean, typeof env.BOOL>());
  });

  it('does not infer BOOL as number', () => {
    check(isNot<number, typeof env.BOOL>());
  });

  it('infers DATE as Date', () => {
    check(is<Date, typeof env.DATE>());
  });

  it('does not infer DATE as string', () => {
    check(isNot<string, typeof env.DATE>());
  });

  it('infers ARRAY as string[]', () => {
    check(is<string[], typeof env.NEXT_PUBLIC_ARRAY>());
  });

  it('does not infer ARRAY as number[]', () => {
    check(isNot<number[], typeof env.NEXT_PUBLIC_ARRAY>());
  });

  it('infers OBJECT shape exactly', () => {
    check(is<{ name: string; age: number }, typeof env.NEXT_PUBLIC_OBJECT>());
  });

  it('does not widen OBJECT to extra props', () => {
    check(
      isNot<
        { name: string; age: number; other: string },
        typeof env.NEXT_PUBLIC_OBJECT
      >()
    );
  });

  it('infers ENUM as "a" | "b" | "c"', () => {
    check(is<'a' | 'b' | 'c', typeof env.NEXT_PUBLIC_ENUM>());
  });

  it('does not infer ENUM as single literal', () => {
    check(isNot<'a', typeof env.NEXT_PUBLIC_ENUM>());
  });

  it('infers NULL as null', () => {
    check(is<null, typeof env.NEXT_PUBLIC_NULL>());
  });

  it('NULL is not undefined', () => {
    check(isNot<undefined, typeof env.NEXT_PUBLIC_NULL>());
  });

  it('infers UNDEFINED as undefined', () => {
    check(is<undefined, typeof env.NEXT_PUBLIC_UNDEFINED>());
  });

  it('UNDEFINED is not null', () => {
    check(isNot<null, typeof env.NEXT_PUBLIC_UNDEFINED>());
  });

  it('infers NEVER as never', () => {
    check(is<never, typeof env.NEXT_PUBLIC_NEVER>());
  });

  it('NEVER is not unknown', () => {
    check(isNot<unknown, typeof env.NEXT_PUBLIC_NEVER>());
  });

  it('infers UNKNOWN as unknown', () => {
    check(is<unknown, typeof env.NEXT_PUBLIC_UNKNOWN>());
  });

  it('UNKNOWN is not string', () => {
    check(isNot<string, typeof env.NEXT_PUBLIC_UNKNOWN>());
  });

  it('infers ANY as any', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    check(is<any, typeof env.NEXT_PUBLIC_ANY>());
  });

  it('ANY is not narrowed to string', () => {
    check(isNot<'hello', typeof env.NEXT_PUBLIC_ANY>());
  });
});
