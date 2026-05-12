// ─── XP & Levels ─────────────────────────────────────────────────────

export interface XpRule {
  id: string;
  name: string;
  event_name: string;
  xp_amount: number;
  max_per_day: number | null;
  cooldown_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateXpRuleInput {
  name: string;
  event_name: string;
  xp_amount: number;
  max_per_day?: number;
  cooldown_seconds?: number;
}

export interface UserXp {
  id: string;
  app_user_id: string;
  total_xp: number;
  level: number;
  xp_this_period: number;
  last_xp_at: string | null;
  updated_at: string;
}

export interface XpLedgerEntry {
  id: string;
  app_user_id: string;
  xp_rule_id: string | null;
  amount: number;
  reason: string;
  occurred_at: string;
}

// ─── Achievements / Badges ───────────────────────────────────────────

export interface AchievementDefinition {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  xp_reward: number;
  criteria: AchievementCriteria;
  is_hidden: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AchievementCriteria {
  type: 'event_count' | 'streak_length' | 'xp_threshold' | 'property_value';
  event_name?: string;
  streak_definition_id?: string;
  property_key?: string;
  target_value: number;
}

export interface CreateAchievementInput {
  key: string;
  name: string;
  description?: string;
  icon_url?: string;
  xp_reward?: number;
  criteria: AchievementCriteria;
  is_hidden?: boolean;
  sort_order?: number;
}

export interface UserAchievement {
  id: string;
  app_user_id: string;
  achievement_id: string;
  unlocked_at: string | null;
  progress: AchievementProgress;
  created_at: string;
  updated_at: string;
}

export interface AchievementProgress {
  current_value: number;
  target_value: number;
}

// ─── Leaderboards ────────────────────────────────────────────────────

export type LeaderboardMetric = 'xp' | 'streak' | 'custom';
export type LeaderboardPeriod = 'all_time' | 'daily' | 'weekly' | 'monthly';

export interface LeaderboardDefinition {
  id: string;
  name: string;
  metric: LeaderboardMetric;
  period: LeaderboardPeriod;
  max_entries: number;
  custom_event: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLeaderboardInput {
  name: string;
  metric: LeaderboardMetric;
  period?: LeaderboardPeriod;
  max_entries?: number;
  custom_event?: string;
}

export interface LeaderboardEntry {
  id: string;
  leaderboard_id: string;
  app_user_id: string;
  score: number;
  rank: number | null;
  period_start: string | null;
  updated_at: string;
}

export interface LeaderboardEntryWithUser extends LeaderboardEntry {
  app_users?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

// ─── Challenges ──────────────────────────────────────────────────────

export type ChallengeGoalType = 'event_count' | 'xp_earned' | 'streak_maintained';
export type ChallengeStatus = 'active' | 'completed' | 'failed';

export interface ChallengeDefinition {
  id: string;
  name: string;
  description: string | null;
  start_at: string;
  end_at: string;
  goal_type: ChallengeGoalType;
  goal_value: number;
  reward_xp: number;
  reward_achievement_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateChallengeInput {
  name: string;
  description?: string;
  start_at: string;
  end_at: string;
  goal_type: ChallengeGoalType;
  goal_value: number;
  reward_xp?: number;
  reward_achievement_id?: string;
}

export interface UserChallenge {
  id: string;
  app_user_id: string;
  challenge_id: string;
  progress: number;
  status: ChallengeStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserChallengeWithDefinition extends UserChallenge {
  challenge_definitions?: {
    name: string;
    description: string | null;
    goal_type: ChallengeGoalType;
    goal_value: number;
    start_at: string;
    end_at: string;
    reward_xp: number;
  };
}

// ─── Leagues ─────────────────────────────────────────────────────────
//
// Duolingo-style weekly-cohort leagues. A `league` is a tier (Bronze /
// Silver / Gold / …); a `league_cohorts` row is one week's instance of a
// tier sliced into ~`cohort_size` users; `league_memberships` rows are
// the per-user-per-cohort score + final_rank record.
//
// Score input for v1 is XP awarded in the week (sum of `xp_awarded`
// events from `engagement_events` between `week_start` and
// `week_start+7d`). The `score` column is materialised at week boundary;
// during the week the source of truth is `engagement_events`.

export type LeagueCohortStatus = 'active' | 'closed';

export interface League {
  id: string;
  name: string;
  tier_order: number;
  promote_count: number;
  demote_count: number;
  cohort_size: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateLeagueInput {
  name: string;
  tier_order: number;
  promote_count?: number;
  demote_count?: number;
  cohort_size?: number;
}

export interface UpdateLeagueInput {
  name?: string;
  promote_count?: number;
  demote_count?: number;
  cohort_size?: number;
  is_active?: boolean;
}

export interface LeagueCohort {
  id: string;
  league_id: string;
  week_start: string; // ISO date (YYYY-MM-DD)
  status: LeagueCohortStatus;
  created_at: string;
}

export interface LeagueMembership {
  id: string;
  app_user_id: string;
  cohort_id: string;
  score: number;
  final_rank: number | null;
  created_at: string;
}

export interface LeagueMembershipPublic {
  app_user_id: string;
  display_name: string | null;
  score: number;
  rank: number;
}
