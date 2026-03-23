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
}

export interface StartSessionDto {
  taskId: string;
}

export interface DailySummaryDto {
  date:                string;
  totalTrackedSeconds: number;
  sessionCount:        number;
  coinsEarned:         number;
  topTask:             string | null;
  behaviorBreakdown:   BehaviorBreakdownItem[];
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
