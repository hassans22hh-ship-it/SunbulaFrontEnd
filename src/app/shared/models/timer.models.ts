// src/app/shared/models/timer.models.ts
import { BehaviorCategory } from './enums';  // ← relative path, NOT @shared

export interface TimeSessionDto {
  id:              string;
  taskId:          string;
  taskTitle:       string;
  taskColor:       string;
  taskBehavior:    BehaviorCategory;
  startTime:       string;
  endTime:         string | null;
  durationSeconds: number | null;
  coinsEarned:     number | null;
  isActive:        boolean;
  isPaused?:       boolean;
  taskEmoji?:      string;
  // Fallbacks for backend variations
  title?:          string;
  duration?:       number;
  totalSeconds?:   number;
  durationMinutes?: number;
  coins?:          number;
  task?: { 
    title: string; 
    color: string; 
    behaviorType?: number;
  };
}

export interface StartSessionDto {
  taskId: string;
}

export interface CreateManualSessionDto {
  taskId:       string;
  startTime:    string;
  endTime:      string;
  behaviorType: BehaviorCategory;
  notes?:       string;
}

export interface DailySummaryDto {
  date:                string;
  totalTrackedSeconds: number;
  sessionCount:        number;
  coinsEarned:         number;
  topTask:             string | null;
  behaviorBreakdown:   BehaviorBreakdownItem[];
  // Fallbacks for Prompt 5
  totalMinutes?:       number;
  totalCoins?:         number;
  qualifiesForStreak?: boolean;
  currentStreak?:      number;
  untrackedMinutes?:   number;
  sessions?:           TimeSessionDto[];
  formattedTotalTime?: string;
}

export interface BehaviorBreakdownItem {
  behaviorType: BehaviorCategory;
  totalSeconds: number;
  percentage:   number;
}

export interface PagedResult<T> {
  data:       T[];
  page:       number;
  pageSize:   number;
  totalCount: number;
  totalPages: number;
}
