import { BehaviorCategory } from '../../../shared/models/enums';

export type TimelineEventType = 'task' | 'session';

export interface BaseTimelineEvent {
  id:           string;
  type:         TimelineEventType;
  title:        string;
  time:         Date; // Start time for sessions, completion time for tasks
  behaviorType: BehaviorCategory;
  color:        string;
}

export interface TaskTimelineEvent extends BaseTimelineEvent {
  type: 'task';
  folderName?: string;
}

export interface SessionTimelineEvent extends BaseTimelineEvent {
  type: 'session';
  durationSecs: number;
  coinsEarned:  number;
}

export type TimelineEvent = TaskTimelineEvent | SessionTimelineEvent;

export interface TimelineGap {
  startTime: Date;
  endTime:   Date;
  durationSecs: number;
}
