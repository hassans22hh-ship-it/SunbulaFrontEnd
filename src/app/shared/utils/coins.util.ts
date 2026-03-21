import { BehaviorCategory, BEHAVIOR_COIN_RATES } from '../models/enums';

/**
 * Calculate coins earned for a session
 * @param seconds - duration of session in seconds
 * @param behavior - behavior category
 */
export const calculateCoins = (seconds: number, behavior: BehaviorCategory): number => {
  const hours = seconds / 3600;
  const rate   = BEHAVIOR_COIN_RATES[behavior];
  return Math.round(hours * rate * 100) / 100;
};

/**
 * Format coin delta with sign prefix and coin emoji
 */
export const formatCoinDelta = (delta: number): string =>
  `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} 🪙`;

/**
 * Format a coin balance with thousands separator and coin emoji
 */
export const formatBalance = (n: number): string =>
  `${new Intl.NumberFormat('en-US').format(n)} 🪙`;

/**
 * Check if user can afford a plant
 */
export const canAfford = (balance: number, price: number): boolean => balance >= price;

/**
 * How many more coins a user needs
 */
export const coinsNeeded = (balance: number, price: number): number =>
  Math.max(0, price - balance);
