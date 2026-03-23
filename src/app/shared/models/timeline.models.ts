// src/app/shared/models/timeline.models.ts
import { BehaviorCategory } from './enums';  // ← CORRECT relative path

export type TimelineEventType = 'session' | 'gap';

export interface BaseTimelineEvent {
  type:            TimelineEventType;
  startTime:       string;
  endTime:         string;
  durationSeconds: number;
  offsetPercent:   number;
  heightPercent:   number;
}

export interface SessionTimelineEvent extends BaseTimelineEvent {
  type:         'session';
  sessionId:    string;
  taskId:       string;
  taskTitle:    string;
  taskColor:    string;
  behaviorType: BehaviorCategory;
  coinsEarned:  number | null;
}

export interface GapTimelineEvent extends BaseTimelineEvent {
  type: 'gap';
}

export type TaskTimelineEvent = SessionTimelineEvent | GapTimelineEvent;

export interface DayTimelineData {
  date:                string;
  events:              TaskTimelineEvent[];
  totalTrackedSeconds: number;
  totalGapSeconds:     number;
  sessionCount:        number;
}

export function toTimelinePercent(isoDateTime: string): number {
  const d = new Date(isoDateTime);
  const secs = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  return (secs / 86400) * 100;
}

export function toDurationPercent(durationSeconds: number): number {
  return (durationSeconds / 86400) * 100;
}
