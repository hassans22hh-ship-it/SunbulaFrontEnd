import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DailyTransactionApiService } from '../timer/services/daily-transaction.api.service';
import { TimeSessionApiService } from '../timer/services/time-session.api.service';
import { ReportsApiService } from './services/reports.api.service';
import { DailySummaryDto, TimeSessionDto } from '@shared/models/timer.models';
import { TimeReportDto } from '@shared/models/reports.models';
import { BEHAVIOR_META, BehaviorCategory } from '@shared/models/enums';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { AuthService } from '@core/auth/auth.service';

import { SbHeatmapComponent } from '@shared/ui/heatmap/sb-heatmap.component';
import { DailyTrendDto } from '@shared/models/reports.models';

@Component({
  selector: 'sb-reports',
  standalone: true,
  imports: [SbCardComponent, SbSpinnerComponent, DurationPipe, CoinsPipe, DecimalPipe, DatePipe, PageTransitionDirective, SbHeatmapComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent implements OnInit {
  private readonly dailyApi   = inject(DailyTransactionApiService);
  private readonly sessionApi = inject(TimeSessionApiService);
  private readonly reportsApi = inject(ReportsApiService);
  private readonly auth       = inject(AuthService);

  readonly loading  = signal(true);
  readonly summary  = signal<DailySummaryDto | null>(null);
  readonly report   = signal<TimeReportDto | null>(null);
  readonly sessions = signal<TimeSessionDto[]>([]);
  readonly streak   = signal(0);
  readonly range    = signal<'today' | '7d' | '30d'>('today');
  
  readonly selectedYear = signal<number>(new Date().getFullYear());
  readonly yearlyTrend  = signal<DailyTrendDto[]>([]);
  readonly isYearlyLoading = signal(false);

  protected readonly behaviorMeta = BEHAVIOR_META;

  ngOnInit(): void {
    this.dailyApi.getStreak().subscribe({ next: s => this.streak.set(s) });
    this.sessionApi.getAll().subscribe({ next: s => this.sessions.set(s) });
    this.loadRange('today');
    this.loadYearlyTrend(this.selectedYear());
  }

  loadYearlyTrend(year: number): void {
    this.isYearlyLoading.set(true);
    const from = new Date(year, 0, 1).toISOString();
    const to = new Date(year, 11, 31).toISOString();
    
    this.reportsApi.getReport({ from, to }).subscribe({
      next: r => {
        this.yearlyTrend.set(r.dailyTrend || []);
        this.isYearlyLoading.set(false);
      },
      error: () => this.isYearlyLoading.set(false)
    });
  }

  changeYear(year: number): void {
    this.selectedYear.set(year);
    this.loadYearlyTrend(year);
  }

  loadRange(range: 'today' | '7d' | '30d'): void {
    this.range.set(range);
    this.loading.set(true);

    if (range === 'today') {
      this.dailyApi.getTodaySummary().subscribe({
        next: s => {
          this.summary.set(s);
          this.report.set(null); // Use summary for today
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      const days = range === '7d' ? 7 : 30;
      const from = new Date();
      from.setDate(from.getDate() - days);
      
      this.reportsApi.getReport({ from: from.toISOString(), to: new Date().toISOString() }).subscribe({
        next: r => {
          this.report.set(r);
          this.summary.set(null);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  get totalTrackedAllTime(): number {
    return this.sessions().reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0);
  }

  get totalCoinsAllTime(): number {
    return this.sessions().reduce((sum, s) => sum + (s.coinsEarned ?? 0), 0);
  }

  get behaviorDistribution(): { behavior: BehaviorCategory; seconds: number; pct: number }[] {
    const total = this.totalTrackedAllTime || 1;
    const map = new Map<BehaviorCategory, number>();
    for (const s of this.sessions()) {
      map.set(s.taskBehavior, (map.get(s.taskBehavior) ?? 0) + (s.durationSeconds ?? 0));
    }
    return Array.from(map.entries()).map(([behavior, seconds]) => ({
      behavior, seconds, pct: Math.round((seconds / total) * 100),
    }));
  }

  get peakDay(): string | null {
    const trend = this.yearlyTrend();
    if (!trend.length) return null;
    return trend.reduce((prev, current) => (prev.totalSeconds > current.totalSeconds) ? prev : current).date;
  }
}
