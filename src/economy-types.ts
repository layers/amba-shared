// ─── Currency Definitions ────────────────────────────────────────────

export interface CurrencyDefinition {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_premium: boolean;
  initial_balance: number;
  max_balance: number | null;
  auto_recharge_amount: number | null;
  auto_recharge_interval_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCurrencyInput {
  code: string;
  name: string;
  description?: string;
  is_premium?: boolean;
  initial_balance?: number;
  max_balance?: number;
  auto_recharge_amount?: number;
  auto_recharge_interval_hours?: number;
}

// ─── User Balances ───────────────────────────────────────────────────

export interface UserBalance {
  id: string;
  app_user_id: string;
  currency_code: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  last_recharged_at: string | null;
  updated_at: string;
}

// ─── Currency Transactions ───────────────────────────────────────────

export type TransactionType = 'earn' | 'spend' | 'grant' | 'purchase' | 'refund' | 'recharge';
export type TransactionSource =
  | 'event'
  | 'admin'
  | 'store_purchase'
  | 'xp_reward'
  | 'referral'
  | 'system';

export interface CurrencyTransaction {
  id: string;
  app_user_id: string;
  currency_code: string;
  amount: number;
  balance_after: number;
  transaction_type: TransactionType;
  source: TransactionSource;
  reference_id: string | null;
  created_at: string;
}

export interface GrantCurrencyInput {
  app_user_id: string;
  currency_code: string;
  amount: number;
  reason?: string;
}

// ─── Catalog Items ───────────────────────────────────────────────────

export type ItemType = 'durable' | 'consumable' | 'bundle';

export interface CatalogItem {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  category: string | null;
  tags: string[];
  item_type: ItemType;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCatalogItemInput {
  key: string;
  name: string;
  description?: string;
  icon_url?: string;
  category?: string;
  tags?: string[];
  item_type?: ItemType;
  metadata?: Record<string, unknown>;
}

export interface CatalogItemPrice {
  id: string;
  catalog_item_id: string;
  currency_code: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface SetItemPriceInput {
  currency_code: string;
  price: number;
}

export interface BundleContent {
  id: string;
  bundle_item_id: string;
  content_item_id: string;
  quantity: number;
}

export interface AddBundleContentInput {
  content_item_id: string;
  quantity?: number;
}

// ─── Stores ──────────────────────────────────────────────────────────

export interface Store {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  segment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStoreInput {
  name: string;
  description?: string;
  segment_id?: string;
}

export interface StoreListing {
  id: string;
  store_id: string;
  catalog_item_id: string;
  override_prices: Record<string, number> | null;
  sort_order: number;
  available_from: string | null;
  available_until: string | null;
  max_purchases_per_user: number | null;
  created_at: string;
  updated_at: string;
}

export interface AddStoreListingInput {
  catalog_item_id: string;
  override_prices?: Record<string, number>;
  sort_order?: number;
  available_from?: string;
  available_until?: string;
  max_purchases_per_user?: number;
}

// ─── User Inventory ──────────────────────────────────────────────────

export type AcquisitionSource =
  | 'store_purchase'
  | 'grant'
  | 'achievement_reward'
  | 'bundle'
  | 'referral';

export interface UserInventoryItem {
  id: string;
  app_user_id: string;
  catalog_item_id: string;
  quantity: number;
  instance_data: Record<string, unknown>;
  acquired_at: string;
  acquired_via: AcquisitionSource;
}

export interface GrantItemInput {
  app_user_id: string;
  catalog_item_id: string;
  quantity?: number;
}

export interface PurchaseItemInput {
  catalog_item_id: string;
  currency_code: string;
  store_id?: string;
}

// ─── Referrals ───────────────────────────────────────────────────────

export interface ReferralCode {
  id: string;
  app_user_id: string | null;
  code: string;
  reward_referrer: Record<string, unknown>;
  reward_referee: Record<string, unknown>;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReferralProgramInput {
  code?: string;
  reward_referrer?: Record<string, unknown>;
  reward_referee?: Record<string, unknown>;
  max_uses?: number;
}

export interface ReferralClaim {
  id: string;
  referral_code_id: string;
  referrer_id: string | null;
  referee_id: string;
  claimed_at: string;
}

export interface ReferralStats {
  referral_code: ReferralCode;
  total_claims: number;
  claims: ReferralClaim[];
}
