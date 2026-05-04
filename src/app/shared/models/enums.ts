// ─── Behavior Category ────────────────────────────────────────────────────────
// Values match backend BehaviorType enum exactly:
// Positive=1, Neutral=2, Rest=3, Negative=4
export enum BehaviorCategory {
  Positive = 1,
  Neutral  = 2,
  Rest     = 3,
  Negative = 4,
}

export const BEHAVIOR_COIN_RATES: Record<BehaviorCategory, number> = {
  [BehaviorCategory.Positive]:  2,
  [BehaviorCategory.Neutral]:   1,
  [BehaviorCategory.Rest]:      1,
  [BehaviorCategory.Negative]: -1,
};

export const BEHAVIOR_META: Record<BehaviorCategory, {
  label: string; icon: string; colorVar: string; cssClass: string;
}> = {
  [BehaviorCategory.Positive]: { label: 'Positive', icon: 'fa-solid fa-circle-check', colorVar: '--color-positive', cssClass: 'behavior-positive' },
  [BehaviorCategory.Neutral]:  { label: 'Neutral',  icon: 'fa-solid fa-circle-minus', colorVar: '--color-neutral',  cssClass: 'behavior-neutral'  },
  [BehaviorCategory.Rest]:     { label: 'Rest',     icon: 'fa-solid fa-mug-hot',      colorVar: '--color-rest',     cssClass: 'behavior-rest'     },
  [BehaviorCategory.Negative]: { label: 'Negative', icon: 'fa-solid fa-circle-xmark', colorVar: '--color-negative', cssClass: 'behavior-negative' },
};

// ─── Task Status ──────────────────────────────────────────────────────────────
export enum TaskStatus {
  Active    = 0,
  Completed = 1,
  Archived  = 2,
}

export const TASK_STATUS_META: Record<TaskStatus, { label: string; icon: string }> = {
  [TaskStatus.Active]:    { label: 'Active',    icon: 'fa-solid fa-clipboard-list' },
  [TaskStatus.Completed]: { label: 'Completed', icon: 'fa-solid fa-circle-check' },
  [TaskStatus.Archived]:  { label: 'Archived',  icon: 'fa-solid fa-box-archive' },
};

// ─── Wallet Type ──────────────────────────────────────────────────────────────
export enum WalletType {
  Cash = 0,
  Bank = 1,
  Card = 2,
}

export const WALLET_TYPE_META: Record<WalletType, { label: string; icon: string }> = {
  [WalletType.Cash]: { label: 'Cash',         icon: 'fa-solid fa-money-bill-wave' },
  [WalletType.Bank]: { label: 'Bank Account', icon: 'fa-solid fa-building-columns' },
  [WalletType.Card]: { label: 'Card',         icon: 'fa-solid fa-credit-card' },
};

// ─── Transaction Type ─────────────────────────────────────────────────────────
export enum TransactionType {
  Income   = 0,
  Expense  = 1,
  Transfer = 2,
}

export const TRANSACTION_TYPE_META: Record<TransactionType, {
  label: string; colorClass: string; sign: string;
}> = {
  [TransactionType.Income]:   { label: 'Income',   colorClass: 'text-success', sign: '+' },
  [TransactionType.Expense]:  { label: 'Expense',  colorClass: 'text-danger',  sign: '-' },
  [TransactionType.Transfer]: { label: 'Transfer', colorClass: 'text-info',    sign: '→' },
};

// ─── Growth Stage ─────────────────────────────────────────────────────────────
export enum GrowthStage {
  Seed     = 0,
  Seedling = 1,
  Small    = 2,
  Large    = 3,
}

export const GROWTH_STAGE_LABELS: Record<GrowthStage, string> = {
  [GrowthStage.Seed]:     '🌱 Seed',
  [GrowthStage.Seedling]: '🌿 Seedling',
  [GrowthStage.Small]:    '🪴 Small Plant',
  [GrowthStage.Large]:    '🌳 Full Grown',
};

export const GROWTH_STAGE_META: Record<GrowthStage, { label: string; emoji: string; variant: 'default' | 'success' | 'warning' | 'info' }> = {
  [GrowthStage.Seed]:     { label: 'Seed',        emoji: '🌱', variant: 'default' },
  [GrowthStage.Seedling]: { label: 'Seedling',    emoji: '🌿', variant: 'info'    },
  [GrowthStage.Small]:    { label: 'Small Plant', emoji: '🪴', variant: 'warning' },
  [GrowthStage.Large]:    { label: 'Full Grown',  emoji: '🌳', variant: 'success' },
};

// ─── Plant Level ──────────────────────────────────────────────────────────────
export enum PlantLevel {
  Beginner     = 1,
  Intermediate = 2,
  Advanced     = 3,
  Rare         = 4,
}

export const PLANT_LEVEL_META: Record<PlantLevel, {
  label: string; emoji: string; priceRange: string; variant: 'default' | 'success' | 'warning' | 'info' | 'danger';
}> = {
  [PlantLevel.Beginner]:     { label: 'Beginner',     emoji: '🌱', priceRange: '20–50',     variant: 'default' },
  [PlantLevel.Intermediate]: { label: 'Intermediate', emoji: '🌿', priceRange: '50–300',    variant: 'info'    },
  [PlantLevel.Advanced]:     { label: 'Advanced',     emoji: '🌳', priceRange: '1000–2000', variant: 'warning' },
  [PlantLevel.Rare]:         { label: 'Rare',         emoji: '🏆', priceRange: '5000+',     variant: 'danger' },
};

// ─── Debt Type ────────────────────────────────────────────────────────────────
export enum DebtType {
  Owed  = 0,
  Owing = 1,
}

export const DEBT_TYPE_META: Record<DebtType, { label: string; variant: 'danger' | 'success' }> = {
  [DebtType.Owed]:  { label: 'I Owe',      variant: 'danger'  },
  [DebtType.Owing]: { label: 'Owed To Me', variant: 'success' },
};

// ─── Debt Status ──────────────────────────────────────────────────────────────
export enum DebtStatus {
  Active  = 0,
  Settled = 1,
}

// ─── Streak Milestones ────────────────────────────────────────────────────────
export const STREAK_MILESTONES = [
  { days:  3, bonus:  50 },
  { days:  7, bonus: 150 },
  { days: 30, bonus: 700 },
];

// PagedResult is defined in timer.models.ts — do not duplicate here
