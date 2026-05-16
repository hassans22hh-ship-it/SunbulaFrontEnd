import { BehaviorCategory, BEHAVIOR_COIN_RATES } from '@shared/models/enums';

/**
 * Rounds a number to the nearest integer using "away from zero" midpoint rounding.
 * Matches C# Math.Round(value, MidpointRounding.AwayFromZero).
 *
 * JavaScript's Math.round rounds -0.5 to 0, but C# AwayFromZero rounds -0.5 to -1.
 * This distinction matters for Negative behavior sessions.
 */
export const roundAwayFromZero = (n: number): number =>
  Math.sign(n) * Math.round(Math.abs(n));

/**
 * Calculate coins earned for a session.
 * Mirrors backend Duration.CalculateCoins exactly:
 *   coins = (totalMinutes / 60.0) * coinFactor
 *   return (int)Math.Round(coins, MidpointRounding.AwayFromZero)
 *
 * @param seconds - duration of session in seconds
 * @param behavior - behavior category
 * @returns integer coin value (negative for Negative behavior)
 */
export const calculateCoins = (seconds: number, behavior: BehaviorCategory): number => {
  const hours = seconds / 3600;
  const rate  = BEHAVIOR_COIN_RATES[behavior];
  return roundAwayFromZero(hours * rate);
};

/**
 * Format coin delta with sign prefix
 */
export const formatCoinDelta = (delta: number): string =>
  `${delta >= 0 ? '+' : ''}${delta.toFixed(0)}`;

/**
 * Format a coin balance with thousands separator
 */
export const formatBalance = (n: number): string =>
  new Intl.NumberFormat('en-US').format(n);

/**
 * Check if user can afford a plant
 */
export const canAffordPlant = (balance: number, price: number): boolean => balance >= price;

/**
 * How many more coins a user needs
 */
export const coinsNeeded = (balance: number, price: number): number =>
  Math.max(0, price - balance);

