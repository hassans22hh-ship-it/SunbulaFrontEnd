// src/app/shared/models/reports.models.ts
import { BehaviorCategory } from './enums';  // ← CORRECT relative path

export interface ReportFilterDto {
  from?:         string;
  to?:           string;
  folderId?:     string;
  categoryId?:   string;
  behaviorType?: BehaviorCategory;
}

export interface TimeDistributionDto {
  taskId:       string;
  taskTitle:    string;
  taskColor:    string;
  taskEmoji?:   string;
  behaviorType: BehaviorCategory;
  totalSeconds: number;
  percentage:   number;
}

export interface BehaviorStatsDto {
  behaviorType: BehaviorCategory;
  totalSeconds: number;
  percentage:   number;
  sessionCount: number;
}

export interface DailyTrendDto {
  date:            string;
  totalSeconds:    number;
  positiveSeconds: number;
  negativeSeconds: number;
  neutralSeconds:  number;
  restSeconds:     number;
  coinsEarned:     number;
}

export interface WeeklyReportDto {
  weekStart:           string;
  weekEnd:             string;
  dailyAverageSeconds: number;
  totalSeconds:        number;
  days:                DailyTrendDto[];
  topTasks:            TimeDistributionDto[];
  behaviorBreakdown:   BehaviorStatsDto[];
}

export interface MonthlyReportDto {
  month:           string;
  totalSeconds:    number;
  peakDay:         string;
  days:            DailyTrendDto[];
  folderBreakdown: FolderBreakdownDto[];
}

export interface FolderBreakdownDto {
  folderId:     string | null;
  folderName:   string;
  folderColor:  string;
  totalSeconds: number;
  percentage:   number;
}

export interface TimeReportDto {
  filter:            ReportFilterDto;
  totalSeconds:      number;
  taskBreakdown:     TimeDistributionDto[];
  behaviorBreakdown: BehaviorStatsDto[];
  dailyTrend:        DailyTrendDto[];
  topTasks:          TimeDistributionDto[];
}

export interface TaskReportDto {
  totalTasks:           number;
  completedTasks:       number;
  activeTasks:          number;
  archivedTasks:        number;
  tasksByBehavior:      Record<string, number>;
  tasksByCategory:      Record<string, number>;
  totalTimeSpentMinutes: number;
  totalCoinsEarned:     number;
  last7DaysProgress:    DailyReportDetailDto[];
}

export interface DailyReportDetailDto {
  date:           string;
  tasksCompleted: number;
  minutesSpent:   number;
  coinsEarned:    number;
}
