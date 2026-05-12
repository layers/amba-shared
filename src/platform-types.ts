// ─── Sessions ────────────────────────────────────────────────────────────

export interface AppSession {
  id: string;
  app_user_id: string;
  session_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  platform: string | null;
  app_version: string | null;
  device_model: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
}

export interface StartSessionInput {
  session_id: string;
  platform?: string;
  app_version?: string;
  device_model?: string;
  metadata?: Record<string, unknown>;
}

export interface EndSessionInput {
  session_id: string;
}

export interface SessionAnalytics {
  period: string;
  dau: number;
  total_sessions: number;
  avg_duration_seconds: number;
  median_duration_seconds: number;
}

// ─── Onboarding Flows ───────────────────────────────────────────────────

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: string;
  config: Record<string, unknown>;
}

export interface OnboardingFlow {
  id: string;
  name: string;
  steps: OnboardingStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOnboardingFlowInput {
  name: string;
  steps: OnboardingStep[];
  is_active?: boolean;
}

export interface UserOnboarding {
  id: string;
  app_user_id: string;
  flow_id: string;
  current_step: string | null;
  completed_steps: string[];
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed' | 'skipped';
}

export interface OnboardingStats {
  flow_id: string;
  flow_name: string;
  total_started: number;
  total_completed: number;
  total_skipped: number;
  completion_rate: number;
}

// ─── Roles / RBAC ───────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UserRole {
  id: string;
  app_user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string | null;
}

export interface AssignRoleInput {
  app_user_id: string;
  role_id: string;
}

export interface PermissionCheck {
  has_permission: boolean;
  permission: string;
  roles: string[];
}

// ─── Deep Links ──────────────────────────────────────────────────────────

export interface DeepLinkConfig {
  id: string;
  url_scheme: string | null;
  universal_link_domain: string | null;
  android_package_name: string | null;
  ios_bundle_id: string | null;
  fallback_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDeepLinkConfigInput {
  url_scheme?: string;
  universal_link_domain?: string;
  android_package_name?: string;
  ios_bundle_id?: string;
  fallback_url?: string;
}

export interface TrackedLink {
  id: string;
  slug: string;
  destination_url: string;
  metadata: Record<string, unknown>;
  click_count: number;
  created_at: string;
}

export interface CreateTrackedLinkInput {
  slug: string;
  destination_url: string;
  metadata?: Record<string, unknown>;
}

export interface LinkClick {
  id: string;
  tracked_link_id: string;
  app_user_id: string | null;
  platform: string | null;
  ip_address: string | null;
  clicked_at: string;
}

export interface LinkStats {
  tracked_link_id: string;
  slug: string;
  total_clicks: number;
  unique_users: number;
  clicks_by_platform: Record<string, number>;
}

// ─── Media Management ────────────────────────────────────────────────────

export interface MediaAsset {
  id: string;
  folder_id: string | null;
  filename: string;
  mime_type: string;
  size_bytes: number | null;
  storage_url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  metadata: Record<string, unknown>;
  uploaded_by: string | null;
  created_at: string;
}

export interface CreateMediaAssetInput {
  filename: string;
  mime_type: string;
  size_bytes?: number;
  folder_id?: string;
  alt_text?: string;
  metadata?: Record<string, unknown>;
}

export interface MediaFolder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface CreateMediaFolderInput {
  name: string;
  parent_id?: string;
}

// ─── Content Moderation ──────────────────────────────────────────────────

export type ModerationContentType = 'review' | 'message' | 'media' | 'feed_item';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'escalated';
export type ModerationRuleType = 'keyword_filter' | 'regex' | 'auto_approve_trusted';
export type TrustLevel = 'new' | 'trusted' | 'moderator';

export interface ModerationQueueItem {
  id: string;
  content_type: ModerationContentType;
  content_id: string;
  reported_by: string | null;
  reason: string | null;
  status: ModerationStatus;
  moderator_id: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface ReportContentInput {
  content_type: ModerationContentType;
  content_id: string;
  reason?: string;
}

export interface ModerationRule {
  id: string;
  name: string;
  rule_type: ModerationRuleType;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateModerationRuleInput {
  name: string;
  rule_type: ModerationRuleType;
  config: Record<string, unknown>;
  is_active?: boolean;
}

export interface UserTrustLevel {
  id: string;
  app_user_id: string;
  trust_level: TrustLevel;
  auto_approve: boolean;
  updated_at: string;
}

export interface SetTrustLevelInput {
  app_user_id: string;
  trust_level: TrustLevel;
  auto_approve?: boolean;
}

// ─── Offline Sync ────────────────────────────────────────────────────────

export interface SyncCheckpoint {
  id: string;
  app_user_id: string;
  entity_type: string;
  last_synced_at: string;
  checkpoint_token: string;
}

export interface SyncChange {
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  client_timestamp: string;
}

export interface SyncPushInput {
  changes: SyncChange[];
}

export interface SyncPullInput {
  entity_type: string;
  checkpoint_token?: string;
}

export interface SyncPullResponse {
  changes: SyncChange[];
  checkpoint_token: string;
  has_more: boolean;
}

export interface SyncPushResponse {
  applied: number;
  conflicts: SyncConflict[];
  checkpoint_token: string;
}

export interface SyncConflict {
  entity_type: string;
  entity_id: string;
  resolution: 'server_wins' | 'client_wins';
  server_data: Record<string, unknown>;
}
