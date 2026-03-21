export interface ReportFilterDto {
  startDate: string; // ISO date
  endDate:   string; // ISO date
}

export interface BehaviorStatsDto {
  behaviorType: number; // enum BehaviorCategory
  count:        number;
  totalDuration: number; // in seconds
}

export interface DailyTrendDto {
  date:          string; // ISO date
  focusTimeSecs: number;
  tasksDone:     number;
}

export interface TimeDistributionDto {
  label:        string;
  durationSecs: number;
}

export interface ComprehensiveReportDto {
  timeDistribution: TimeDistributionDto[];
  behaviorStats:    BehaviorStatsDto[];
  dailyTrends:      DailyTrendDto[];
  totalFocusSecs:   number;
  totalTasksDone:   number;
}
