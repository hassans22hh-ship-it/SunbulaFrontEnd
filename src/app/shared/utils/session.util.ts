import { TimeSessionDto } from '@shared/models/timer.models';
import { BehaviorCategory, BEHAVIOR_COIN_RATES } from '@shared/models/enums';

/**
 * Extracts the duration in seconds from a session DTO,
 * handling all known backend response variations.
 */
export function getSessionDuration(s: TimeSessionDto): number {
  const fromFields =
    s.durationSeconds ??
    s.duration ??
    s.totalSeconds ??
    (s.durationMinutes ? s.durationMinutes * 60 : 0);
  if (fromFields) return fromFields;

  // Fallback: calculate from timestamps
  if (s.startTime && s.endTime) {
    const start = new Date(s.startTime).getTime();
    const end   = new Date(s.endTime).getTime();
    if (!isNaN(start) && !isNaN(end) && end > start) {
      return Math.floor((end - start) / 1000);
    }
  }
  return 0;
}

/**
 * Extracts the coins earned from a session DTO,
 * with fallback calculation if the backend didn't populate it.
 */
export function getSessionCoins(s: TimeSessionDto): number {
  const coins = s.coinsEarned ?? s.coins ?? 0;
  
  const dur = getSessionDuration(s);
  if (dur <= 0) return 0;

  // If the backend provided a non-zero value, use it. 
  // Otherwise, we calculate based on behavior.
  if (coins !== 0) return coins;

  const behavior = s.taskBehavior ?? s.task?.behaviorType ?? (s as any).behaviorType;
  if (behavior === undefined || behavior === null) return 0;

  const rate = BEHAVIOR_COIN_RATES[behavior as BehaviorCategory] ?? 0;
  return (dur / 3600) * rate;
}

/**
 * Extracts the behavior category from a session DTO,
 * handling all backend response variations.
 * Priority: taskBehavior (store-enriched) → behaviorType (raw backend) → task.behaviorType
 */
export function getSessionBehavior(s: TimeSessionDto): BehaviorCategory | undefined {
  const behavior = s.taskBehavior ??
                   s.behaviorType ??
                   s.task?.behaviorType ??
                   (s as any).behavior;
  return behavior !== undefined && behavior !== null ? (behavior as BehaviorCategory) : undefined;
}

/**
 * Normalises a timestamp string to always include a timezone suffix.
 */
export function normaliseTimestamp(ts: string | null | undefined): string | null {
  if (!ts) return null;
  if (typeof ts === 'string' && !ts.endsWith('Z') && !ts.includes('+')) {
    return ts + 'Z';
  }
  return ts;
}
