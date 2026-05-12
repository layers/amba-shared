/**
 * Per-function declarative rate-limit config.
 *
 * Duration grammar (`window`): `<positive int><s | m | h>`. Days
 * intentionally not supported — for daily caps use a longer window.
 *
 * Key kinds (`key`):
 *   - `user_id`: resolved end-user id from `ctx.auth.user`. NULL is
 *     bucketed via the `ANONYMOUS_USER_BUCKET` sentinel.
 *   - `ip`: `CF-Connecting-IP`. Bypassable by IP rotation but useful
 *     against sloppy bots.
 */

export type RateLimitKeyKind = 'user_id' | 'ip';

export interface RateLimitConfig {
  window: string;
  max: number;
  key: RateLimitKeyKind;
}

export interface ParsedRateLimitConfig {
  windowMs: number;
  max: number;
  key: RateLimitKeyKind;
}

/** Hard caps — defense against typos. Lax for v1; tighten if abused. */
export const RATE_LIMIT_MAX_CAP = 100_000;
export const RATE_LIMIT_MIN_WINDOW_MS = 1_000; // 1s
export const RATE_LIMIT_MAX_WINDOW_MS = 60 * 60 * 1000; // 1h

const DURATION_RE = /^(\d+)(s|m|h)$/;
const VALID_KEY_KINDS: ReadonlySet<RateLimitKeyKind> = new Set(['user_id', 'ip']);

/** Convert `60s` / `5m` / `1h` → ms. `null` if unparseable. */
export function parseDurationToMs(window: string): number | null {
  const match = DURATION_RE.exec(window);
  if (!match) return null;
  const n = Number.parseInt(match[1] as string, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  switch (match[2]) {
    case 's':
      return n * 1000;
    case 'm':
      return n * 60 * 1000;
    case 'h':
      return n * 60 * 60 * 1000;
  }
  return null;
}

/** Validate shape + values. Returns the typed config OR `{ error }`. */
export function validateRateLimitConfig(input: unknown): RateLimitConfig | { error: string } {
  if (input === null || input === undefined) {
    return { error: 'rate_limit config is null or undefined' };
  }
  if (typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'rate_limit must be a JSON object' };
  }
  const obj = input as Record<string, unknown>;

  if (typeof obj['window'] !== 'string') {
    return { error: 'rate_limit.window must be a duration string (e.g. "60s", "5m", "1h")' };
  }
  const ms = parseDurationToMs(obj['window']);
  if (ms === null) {
    return {
      error: `rate_limit.window "${obj['window']}" is not a valid duration (expected /^\\d+(s|m|h)$/)`,
    };
  }
  if (ms < RATE_LIMIT_MIN_WINDOW_MS) {
    return { error: `rate_limit.window must be at least ${RATE_LIMIT_MIN_WINDOW_MS}ms` };
  }
  if (ms > RATE_LIMIT_MAX_WINDOW_MS) {
    return { error: `rate_limit.window must be at most 1h` };
  }

  if (typeof obj['max'] !== 'number' || !Number.isInteger(obj['max']) || obj['max'] <= 0) {
    return { error: 'rate_limit.max must be a positive integer' };
  }
  if (obj['max'] > RATE_LIMIT_MAX_CAP) {
    return { error: `rate_limit.max must be at most ${RATE_LIMIT_MAX_CAP}` };
  }

  if (typeof obj['key'] !== 'string' || !VALID_KEY_KINDS.has(obj['key'] as RateLimitKeyKind)) {
    return { error: `rate_limit.key must be one of ${[...VALID_KEY_KINDS].join(' | ')}` };
  }

  return {
    window: obj['window'],
    max: obj['max'],
    key: obj['key'] as RateLimitKeyKind,
  };
}

/** Validate + parse to ms. `null` on malformed input (caller falls open). */
export function parseRateLimitConfig(input: unknown): ParsedRateLimitConfig | null {
  const validated = validateRateLimitConfig(input);
  if ('error' in validated) return null;
  const ms = parseDurationToMs(validated.window);
  if (ms === null) return null;
  return { windowMs: ms, max: validated.max, key: validated.key };
}

/** Sentinel for `key: 'user_id'` when the request is anonymous. */
export const ANONYMOUS_USER_BUCKET = '__anon__';
