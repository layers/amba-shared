/**
 * Reserved-collection-name policy. Customer-defined collection names cannot
 * collide with amba's own tenant tables, with Postgres internals, or with
 * the reserved namespace amba uses to mark its own collections
 * (`coll_amba_*`). Treat the list as append-only at runtime — every
 * existing customer collection assumes it does not match any prefix, so
 * removing entries here could cause naming overlap with newly-shipped
 * tenant tables. Adding entries is fine.
 */

/**
 * Wildcard-prefix reservations. A name is reserved if it starts with any
 * entry here. Wildcards capture entire table families that share a prefix
 * (`events_log`, `events_idempotency`, etc.).
 */
const RESERVED_PREFIXES = [
  // amba-internal namespace.
  '_amba_',
  // Postgres internals — `pg_*` is reserved for the system catalog;
  // creating a customer table that collides would shadow system objects.
  'pg_',
  // amba's own collections namespace — when amba ships a collection-shaped
  // table internally, it sits under coll_amba_* and stays out of the
  // customer name space.
  'coll_amba_',
  // Existing tenant table families.
  'events_',
  'media_',
  'streak_',
  'xp_',
  'achievement_',
  'challenge_',
  'currency_',
  'feed_',
  'friend_',
  'group_',
  'inventory_',
  'leaderboard_',
  'league_',
  'messaging_',
  'moderation_',
  'onboarding_',
  'referral_',
  'review_',
  'role_',
  'session_',
  'store_',
] as const;

/**
 * Exact-match reservations. Single tenant tables that don't share a family
 * prefix — listing them as wildcards would over-reserve (e.g. `app_*` would
 * lock up `app_settings`, `app_metadata`, etc., which a customer might
 * legitimately want).
 */
const RESERVED_EXACT_NAMES = [
  'app_users',
  'magic_link_tokens',
  'remote_config',
  'remote_configs',
  'engagement_events',
  'schema_migrations',
  'segment_memberships',
  'segments',
  'config_versions',
  'push_tokens',
  'push_campaigns',
  'push_deliveries',
  'user_streaks',
  'streak_definitions',
  'streak_events',
  'user_entitlements',
  'app_user_sessions',
  'content_items',
  'content_libraries',
  'content_schedules',
] as const;

/**
 * Customer collection names must be plain lowercase identifiers. The
 * pattern matches Postgres's unquoted identifier conventions and rejects
 * anything that would force us to quote, escape, or risk SQL-injection
 * through a malicious name.
 */
const VALID_COLLECTION_NAME_RE = /^[a-z][a-z0-9_]*$/;

/** Maximum length. Postgres identifiers cap at 63 bytes; we cap shorter
 *  so the `coll_<name>` prefix + any future suffix still fits. */
const MAX_COLLECTION_NAME_LENGTH = 50;

/**
 * Return the reason a collection name is reserved (or invalid), or `null`
 * when the name is acceptable. Use this for surfacing actionable errors —
 * `isReservedCollectionName` is the boolean shorthand for code paths that
 * only need to allow / reject.
 */
export function getReservationReason(name: string): string | null {
  // Structural checks first — empty / wrong type / too long. These are
  // independent of the reserved-prefix rule and produce the clearest
  // actionable message ("name is required" / "too long").
  if (typeof name !== 'string' || name.length === 0) {
    return 'Collection name must be a non-empty string';
  }
  if (name.length > MAX_COLLECTION_NAME_LENGTH) {
    return `Collection name must be at most ${MAX_COLLECTION_NAME_LENGTH} characters`;
  }

  // Reserved-prefix and exact-name checks BEFORE the identifier-shape
  // regex. A name like `_amba_internal` would also fail the regex
  // (leading underscore), but the more useful error tells the customer
  // WHY they can't have it ("starts with reserved prefix `_amba_`")
  // rather than "must match regex".
  for (const prefix of RESERVED_PREFIXES) {
    if (name.startsWith(prefix)) {
      return `Collection name starts with reserved prefix "${prefix}"`;
    }
  }

  for (const exact of RESERVED_EXACT_NAMES) {
    if (name === exact) {
      return `Collection name "${exact}" is reserved by an existing amba tenant table`;
    }
  }

  // Final identifier-shape check.
  if (!VALID_COLLECTION_NAME_RE.test(name)) {
    return 'Collection name must match /^[a-z][a-z0-9_]*$/ (lowercase ASCII, digits, underscore; must start with a letter)';
  }

  return null;
}

/**
 * True if the supplied name cannot be used for a customer collection
 * (either reserved or invalid shape). Convenience boolean for code paths
 * that don't need the reason — call sites that surface validation errors
 * should use {@link getReservationReason} so they can pass the message
 * through.
 */
export function isReservedCollectionName(name: string): boolean {
  return getReservationReason(name) !== null;
}

/**
 * Exposed for tests + tooling that wants to enumerate the reserved space
 * (e.g. CLI auto-completion that filters its suggestions).
 */
export const RESERVED_COLLECTION_PREFIXES: readonly string[] = RESERVED_PREFIXES;
export const RESERVED_COLLECTION_EXACT_NAMES: readonly string[] = RESERVED_EXACT_NAMES;
export { VALID_COLLECTION_NAME_RE, MAX_COLLECTION_NAME_LENGTH };
