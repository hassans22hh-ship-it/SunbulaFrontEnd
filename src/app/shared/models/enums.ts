// ─── Behavior Category ────────────────────────────────────────────────────────
export enum BehaviorCategory {
  Positive = 0,
  Neutral  = 1,
  Negative = 2,
  Rest     = 3,
  // Aliases for convenience
  Good     = 0,
}

export const BEHAVIOR_COIN_RATES: Record<BehaviorCategory, number> = {
  [BehaviorCategory.Positive]: 2,
  [BehaviorCategory.Neutral]:  1,
  [BehaviorCategory.Negative]: -1,
  [BehaviorCategory.Rest]:     1,
};

export const BEHAVIOR_META: Record<BehaviorCategory, { label: string; emoji: string; color: string }> = {
  [BehaviorCategory.Positive]: { label: 'Positive', emoji: '🟢', color: '#52B788' },
  [BehaviorCategory.Neutral]:  { label: 'Neutral',  emoji: '🔵', color: '#74B3CE' },
  [BehaviorCategory.Negative]: { label: 'Negative', emoji: '🔴', color: '#E63946' },
  [BehaviorCategory.Rest]:     { label: 'Rest',     emoji: '🟡', color: '#F4D35E' },
};

// ─── Task Status ──────────────────────────────────────────────────────────────
export enum TaskStatus {
  Todo       = 0,
  InProgress = 3,
  Done       = 1,
  Archived   = 2,
  Active     = 0,
  Completed  = 1,
}

// ─── Wallet Type ──────────────────────────────────────────────────────────────
export enum WalletType {
  Cash = 0,
  Bank = 1,
  CreditCard = 2,
  EWallet = 3,
}

export const WALLET_META: Record<WalletType, { label: string; emoji: string }> = {
  [WalletType.Cash]:       { label: 'Cash',        emoji: '💵' },
  [WalletType.Bank]:       { label: 'Bank',        emoji: '🏦' },
  [WalletType.CreditCard]: { label: 'Credit Card', emoji: '💳' },
  [WalletType.EWallet]:    { label: 'E-Wallet',    emoji: '📱' },
};

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  [WalletType.Cash]: 'Cash',
  [WalletType.Bank]: 'Bank Account',
  [WalletType.CreditCard]: 'Credit Card',
  [WalletType.EWallet]: 'E-Wallet',
};

export const WALLET_TYPE_ICONS: Record<WalletType, string> = {
  [WalletType.Cash]: '💵',
  [WalletType.Bank]: '🏦',
  [WalletType.CreditCard]: '💳',
  [WalletType.EWallet]: '📱',
};

// ─── Transaction Type ─────────────────────────────────────────────────────────
export enum TransactionType {
  Income   = 0,
  Expense  = 1,
  Transfer = 2,
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.Income]:   'Income',
  [TransactionType.Expense]:  'Expense',
  [TransactionType.Transfer]: 'Transfer',
};

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  [TransactionType.Income]:   '#52B788',
  [TransactionType.Expense]:  '#E63946',
  [TransactionType.Transfer]: '#74B3CE',
};

// ─── Growth Stage ─────────────────────────────────────────────────────────────
export enum GrowthStage {
  Seed     = 0,
  Seedling = 1,
  Small    = 2,
  Large    = 3,
}

export const GROWTH_STAGE_LABELS: Record<GrowthStage, string> = {
  [GrowthStage.Seed]:     'Seed',
  [GrowthStage.Seedling]: 'Seedling',
  [GrowthStage.Small]:    'Small Plant',
  [GrowthStage.Large]:    'Full Grown',
};

export const GROWTH_STAGE_EMOJIS: Record<GrowthStage, string> = {
  [GrowthStage.Seed]:     '🌰',
  [GrowthStage.Seedling]: '🌱',
  [GrowthStage.Small]:    '🌿',
  [GrowthStage.Large]:    '🌳',
};

export const GROWTH_STAGE_META: Record<GrowthStage, { label: string; emoji: string }> = {
  [GrowthStage.Seed]:     { label: 'Seed',        emoji: '🌰' },
  [GrowthStage.Seedling]: { label: 'Seedling',    emoji: '🌱' },
  [GrowthStage.Small]:    { label: 'Small Plant', emoji: '🌿' },
  [GrowthStage.Large]:    { label: 'Full Grown',  emoji: '🌳' },
};

// ─── Plant Level ──────────────────────────────────────────────────────────────
export enum PlantLevel {
  Beginner     = 1,
  Intermediate = 2,
  Advanced     = 3,
  Rare         = 4,
}

export const PLANT_LEVEL_META: Record<PlantLevel, { label: string; priceRange: string; emoji: string; color: string }> = {
  [PlantLevel.Beginner]:     { label: 'Beginner',     priceRange: '20–50',     emoji: '🌱', color: '#52B788' },
  [PlantLevel.Intermediate]: { label: 'Intermediate', priceRange: '50–300',    emoji: '🌿', color: '#4895EF' },
  [PlantLevel.Advanced]:     { label: 'Advanced',     priceRange: '1000–2000', emoji: '🌳', color: '#F72585' },
  [PlantLevel.Rare]:         { label: 'Rare',         priceRange: '5000+',     emoji: '🏆', color: '#7209B7' },
};
