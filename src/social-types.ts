// ─── Friendships ─────────────────────────────────────────────────────

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface SendFriendRequestInput {
  addressee_id: string;
}

export interface FriendshipStats {
  total_friendships: number;
  pending_requests: number;
  accepted_friendships: number;
  blocked_count: number;
}

// ─── Groups / Guilds ─────────────────────────────────────────────────

export interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  owner_id: string;
  is_public: boolean;
  max_members: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  avatar_url?: string;
  is_public?: boolean;
  max_members?: number;
  metadata?: Record<string, unknown>;
}

export interface GroupMember {
  id: string;
  group_id: string;
  app_user_id: string;
  role: GroupMemberRole;
  joined_at: string;
}

export type GroupMemberRole = 'owner' | 'admin' | 'member';

export interface UpdateGroupMemberRoleInput {
  role: GroupMemberRole;
}

// ─── Activity Feeds ──────────────────────────────────────────────────

export interface FeedItem {
  id: string;
  actor_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface FeedRule {
  id: string;
  source_event: string;
  action: string;
  target_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedRuleInput {
  source_event: string;
  action: string;
  target_type?: string;
}

// ─── In-App Messaging ────────────────────────────────────────────────

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ConversationType = 'direct' | 'group';

export interface CreateConversationInput {
  type?: ConversationType;
  name?: string;
  participant_ids: string[];
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  app_user_id: string;
  joined_at: string;
  last_read_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  message_type: MessageType;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type MessageType = 'text' | 'image' | 'system';

export interface SendMessageInput {
  body: string;
  message_type?: MessageType;
  metadata?: Record<string, unknown>;
}

export interface MessagingStats {
  total_conversations: number;
  total_messages: number;
  active_conversations_24h: number;
}

// ─── Reviews & Ratings ───────────────────────────────────────────────

export interface ReviewableItem {
  id: string;
  item_type: ReviewableItemType;
  item_id: string;
  avg_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export type ReviewableItemType = 'content_item' | 'custom';

export interface Review {
  id: string;
  reviewable_item_id: string;
  app_user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmitReviewInput {
  item_type?: ReviewableItemType;
  item_id: string;
  rating: number;
  title?: string;
  body?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  body?: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  pending_approval: number;
  rating_distribution: Record<string, number>;
}
