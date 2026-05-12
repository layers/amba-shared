/**
 * Public API version segment. SDK callers pass an unversioned `apiUrl`
 * (e.g. `https://api.amba.dev`) and the HttpClient appends `/${API_VERSION}`
 * so a single SDK constant decides which API generation we target.
 */
export const API_VERSION = 'v1';
export const DEFAULT_API_URL = 'https://api.amba.dev';
/**
 * Console URL used by the CLI browser-login flow.
 */
export const CONSOLE_URL = 'https://app.amba.dev';
/**
 * @deprecated Renamed to `CONSOLE_URL`. Kept as an alias pointing at the
 * same value so out-of-tree consumers don't break mid-rename. New code
 * should import `CONSOLE_URL`.
 */
export const AUTH_URL = CONSOLE_URL;

/**
 * Canonical list of third-party integration providers supported by the
 * platform. Consumers (MCP tool schemas, admin routes, documentation
 * generators) should import this instead of re-declaring the literal
 * string list.
 */
export const INTEGRATION_PROVIDERS = ['revenuecat', 'superwall', 'apns', 'fcm'] as const;
export type IntegrationProviderConst = (typeof INTEGRATION_PROVIDERS)[number];

export const KEY_PREFIX = {
  CLIENT_DEV: 'amb_dev_ck_',
  CLIENT_PROD: 'amb_live_ck_',
  SERVER_DEV: 'amb_dev_sk_',
  SERVER_PROD: 'amb_live_sk_',
} as const;

export const SESSION_TOKEN_EXPIRY_DAYS = 30;
export const REFRESH_TOKEN_EXPIRY_DAYS = 90;
export const CONFIG_CACHE_TTL_SECONDS = 300;

/**
 * XP required per level. Used by both the server (level computation at
 * write time) and any client-side progress UI. If the product ever wants
 * a non-linear curve, replace this with a function and update both sides.
 */
export const XP_PER_LEVEL = 1000;

export const SYSTEM_SEGMENTS = [
  { name: 'all', description: 'All users', rules: { operator: 'AND' as const, conditions: [] } },
  {
    name: 'active_7d',
    description: 'Active in last 7 days',
    rules: {
      operator: 'AND' as const,
      conditions: [{ field: 'last_seen_at', op: 'within' as const, value: '7d' }],
    },
  },
  {
    name: 'churning',
    description: 'Not seen in 14+ days',
    rules: {
      operator: 'AND' as const,
      conditions: [{ field: 'last_seen_at', op: 'not_within' as const, value: '14d' }],
    },
  },
  {
    name: 'premium',
    description: 'Active paid subscription',
    rules: {
      operator: 'AND' as const,
      conditions: [{ field: 'entitlements.is_active', op: 'eq' as const, value: true }],
    },
  },
  {
    name: 'free',
    description: 'No active subscription',
    rules: {
      operator: 'AND' as const,
      conditions: [{ field: 'entitlements.is_active', op: 'neq' as const, value: true }],
    },
  },
  {
    name: 'new_users',
    description: 'First seen in last 7 days',
    rules: {
      operator: 'AND' as const,
      conditions: [{ field: 'first_seen_at', op: 'within' as const, value: '7d' }],
    },
  },
] as const;
