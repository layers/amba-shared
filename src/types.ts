import type { IntegrationProviderConst } from './constants.js';

// ─── Project ──────────────────────────────────────────────────────────

export interface Project {
  id: string;
  developer_id: string;
  name: string;
  bundle_id: string | null;
  platform: 'ios' | 'android' | 'all';
  environment: 'development' | 'production';
  /**
   * OAuth 2.0 client ID configured for Google Sign-In. Required when
   * verifying Google identity tokens so the `aud` claim can be matched
   * against the app's own client ID. Missing → Google sign-in is refused
   * with a CONFIG_ERROR to prevent silently accepting tokens issued for
   * unrelated apps.
   */
  google_oauth_client_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  bundle_id?: string;
  platform?: 'ios' | 'android' | 'all';
  /**
   * Project environment. Defaults to `'production'` when omitted.
   */
  environment?: 'development' | 'production';
}

export interface ApiKey {
  id: string;
  project_id: string;
  key_prefix: string;
  key_type: 'client' | 'server';
  environment: 'development' | 'production';
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export interface ApiKeyWithSecret extends ApiKey {
  /** Full key — only returned at creation time */
  key: string;
}

export interface ProjectIntegration {
  id: string;
  project_id: string;
  provider: IntegrationProvider;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type IntegrationProvider = IntegrationProviderConst;

export interface UsageAggregate {
  id: string;
  project_id: string;
  metric_name: string;
  period_start: string;
  period_end: string;
  value: number;
  recorded_at: string;
}

// ─── App Users ────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  external_id: string | null;
  anonymous_id: string | null;
  email: string | null;
  phone: string | null;
  display_name: string | null;
  avatar_url: string | null;
  auth_providers: AuthProviderLink[];
  properties: Record<string, unknown>;
  /**
   * IANA timezone name (e.g. 'America/New_York'). Set by the client via
   * PATCH /client/users/me, or auto-detected from `Time-Zone` /
   * `X-Amba-Timezone` request headers when still NULL. Used by the
   * timezone-aware push delivery mode (`delivery_mode='local_time'`).
   * NULL means unknown — the push workflow falls back to UTC.
   */
  timezone: string | null;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface AuthProviderLink {
  provider: 'apple' | 'google' | 'email';
  provider_id: string;
}

export interface AuthResult {
  session_token: string;
  refresh_token: string;
  user: AppUser;
  expires_at: string;
}

// ─── Push Notifications ───────────────────────────────────────────────

export interface PushToken {
  id: string;
  app_user_id: string;
  token: string;
  platform: 'ios' | 'android';
  provider: 'apns' | 'fcm';
  is_active: boolean;
  created_at: string;
}

export interface PushCampaign {
  id: string;
  name: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  segment_id: string | null;
  status: PushCampaignStatus;
  /**
   * `absolute`: `scheduled_at` is a UTC instant that fires once for every
   * recipient at the same wall-clock moment.
   * `local_time`: `local_date` + `local_time` are interpreted in each
   * recipient's IANA timezone (per `app_users.timezone`, fallback UTC),
   * and the campaign fans out one fire per timezone bucket so 09:00 in
   * New York is genuinely 09:00 in New York.
   */
  delivery_mode: PushDeliveryMode;
  scheduled_at: string | null;
  /** YYYY-MM-DD when delivery_mode='local_time'. */
  local_date: string | null;
  /** HH:MM[:SS] when delivery_mode='local_time'. */
  local_time: string | null;
  sent_at: string | null;
  stats: PushCampaignStats;
  created_at: string;
  updated_at: string;
}

export type PushDeliveryMode = 'absolute' | 'local_time';

export type PushCampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'cancelled'
  | 'failed';

export interface PushCampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  failed: number;
}

export interface CreatePushCampaignInput {
  name?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  segment_id?: string;
  /**
   * Defaults to `absolute` (back-compat). When `local_time`, supply
   * `local_date` + `local_time` instead of `scheduled_at`.
   */
  delivery_mode?: PushDeliveryMode;
  /** Absolute UTC instant. Only valid when delivery_mode is unset or `absolute`. */
  scheduled_at?: string;
  /** YYYY-MM-DD. Required when delivery_mode='local_time'. */
  local_date?: string;
  /** HH:MM or HH:MM:SS. Required when delivery_mode='local_time'. */
  local_time?: string;
}

export interface PushDelivery {
  id: string;
  campaign_id: string | null;
  app_user_id: string;
  token_id: string;
  status: 'sent' | 'delivered' | 'opened' | 'failed';
  error_message: string | null;
  provider_message_id: string | null;
  sent_at: string;
  delivered_at: string | null;
  opened_at: string | null;
}

// ─── Segments ─────────────────────────────────────────────────────────

export interface Segment {
  id: string;
  name: string;
  description: string | null;
  rules: SegmentRules;
  is_system: boolean;
  user_count: number;
  last_evaluated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SegmentRules {
  operator: 'AND' | 'OR';
  conditions: SegmentCondition[];
}

export interface SegmentCondition {
  field: string;
  op: SegmentOperator;
  value: unknown;
}

export type SegmentOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'not_contains'
  | 'exists'
  | 'not_exists'
  | 'within'
  | 'not_within';

export interface CreateSegmentInput {
  name: string;
  description?: string;
  rules: SegmentRules;
}

// ─── Remote Config ────────────────────────────────────────────────────

export interface RemoteConfig {
  id: string;
  key: string;
  value: unknown;
  value_type: 'string' | 'number' | 'boolean' | 'json';
  description: string | null;
  conditions: ConfigCondition[];
  default_value: unknown;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ConfigCondition {
  segment_id?: string;
  percentage?: number;
  value: unknown;
}

export interface SetConfigInput {
  key: string;
  value: unknown;
  value_type?: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  conditions?: ConfigCondition[];
}

// ─── Content ──────────────────────────────────────────────────────────

export interface ContentLibrary {
  id: string;
  name: string;
  description: string | null;
  content_schema: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ContentItem {
  id: string;
  library_id: string;
  title: string | null;
  body: string;
  media_url: string | null;
  category: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  sort_order: number;
  is_premium: boolean;
  is_active: boolean;
  /**
   * Stable user-facing key. Items sharing the same `(library_id, content_key)`
   * are versions of each other. NULL on legacy items created before
   * versioning landed — those rows behave as standalone content with no
   * version dimension.
   */
  content_key: string | null;
  /**
   * Version number within a `(library_id, content_key)` group. Defaults to 1
   * for newly-created keys.
   */
  version: number;
  /**
   * Rollout percentage [0..100] for this version. The server hashes
   * `(user_id, item_id)` into a [0..99] bucket and serves this row only if
   * `bucket < rollout_percent`. The highest-version row with a matching
   * bucket wins; if none match, the highest-version row at 100% serves as
   * the stable baseline. Defaults to 100 so non-versioned items continue
   * to serve unchanged.
   */
  rollout_percent: number;
  created_at: string;
  updated_at: string;
}

export interface CreateContentItemInput {
  title?: string;
  body: string;
  media_url?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  is_premium?: boolean;
}

export interface ContentSchedule {
  id: string;
  library_id: string;
  name: string;
  schedule_type: ContentScheduleType;
  config: Record<string, unknown>;
  is_active: boolean;
  last_delivered_at: string | null;
  next_delivery_at: string | null;
  /**
   * Stable remote-config key that the content-delivery process writes to.
   * Populated at INSERT time from the row's UUID. Not derived at read
   * time — renaming the schedule must never change which key the process
   * writes to.
   */
  config_key: string;
  /**
   * Optional segment scoping. NULL means broadcast to all users. When set,
   * the content-delivery process writes its rotated value to
   * `remote_configs.conditions` tagged with this segment_id, and the SDK's
   * existing condition evaluator routes per-user via segment memberships.
   * Two schedules can share the same `config_key` but target different
   * segments — the SDK resolves the right copy at read time based on the
   * requesting user's memberships.
   */
  segment_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentScheduleType = 'daily_rotation' | 'weekly' | 'random' | 'sequential';

export interface CreateContentScheduleInput {
  library_id: string;
  name: string;
  schedule_type: ContentScheduleType;
  config?: Record<string, unknown>;
  /**
   * Optional segment id. When set, the schedule is scoped to members of
   * that segment via `remote_configs.conditions`. Omit (or pass null) to
   * broadcast to all users.
   */
  segment_id?: string | null;
}

// ─── Streaks ──────────────────────────────────────────────────────────

export interface StreakDefinition {
  id: string;
  name: string;
  description: string | null;
  qualifying_event: string;
  period: 'daily' | 'weekly';
  grace_period_hours: number;
  freeze_enabled: boolean;
  max_freezes: number;
  /**
   * Auto-grant rule for freezes (a.k.a. "shields"). When set, every N
   * qualifying-event increments grants 1 freeze, capped at `max_freezes`.
   * NULL disables auto-grant.
   */
  freezes_per_n_events: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStreakInput {
  name: string;
  description?: string;
  qualifying_event: string;
  period?: 'daily' | 'weekly';
  grace_period_hours?: number;
  freeze_enabled?: boolean;
  max_freezes?: number;
  /** See StreakDefinition.freezes_per_n_events. */
  freezes_per_n_events?: number | null;
}

export interface UserStreak {
  id: string;
  app_user_id: string;
  streak_definition_id: string;
  current_count: number;
  longest_count: number;
  last_qualified_at: string | null;
  current_period_start: string | null;
  freezes_remaining: number;
  status: 'active' | 'broken' | 'frozen';
  updated_at: string;
}

// ─── Entitlements ─────────────────────────────────────────────────────

export interface UserEntitlement {
  id: string;
  app_user_id: string;
  revenuecat_customer_id: string | null;
  product_id: string | null;
  entitlement_id: string;
  is_active: boolean;
  store: 'app_store' | 'play_store' | 'stripe' | null;
  purchase_date: string | null;
  expiration_date: string | null;
  period_type: 'trial' | 'intro' | 'normal' | null;
  updated_at: string;
}

// ─── Events ───────────────────────────────────────────────────────────

export interface EngagementEvent {
  id: string;
  app_user_id: string;
  event_name: string;
  properties: Record<string, unknown>;
  occurred_at: string;
}

export interface TrackEventInput {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

// ─── Analytics ────────────────────────────────────────────────────────

export interface AnalyticsOverview {
  period: string;
  dau: number;
  mau: number;
  new_users: number;
  retention_d1: number | null;
  retention_d7: number | null;
  total_events: number;
  active_streaks: number;
  push_sent: number;
  push_open_rate: number | null;
  premium_users: number;
  free_users: number;
}

// ─── API Responses ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
