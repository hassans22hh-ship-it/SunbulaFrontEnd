import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DailyTransactionApiService } from '../timer/services/daily-transaction.api.service';
import { TimeSessionApiService } from '../timer/services/time-session.api.service';
import { ReportsApiService } from './services/reports.api.service';
import { DailySummaryDto, TimeSessionDto } from '@shared/models/timer.models';
import { TimeReportDto, DailyTrendDto, TaskReportDto } from '@shared/models/reports.models';
import { BEHAVIOR_META, BehaviorCategory } from '@shared/models/enums';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { AuthService } from '@core/auth/auth.service';
import { TasksStore } from '../tasks/store/tasks.store';
import { getSessionBehavior, getSessionCoins, getSessionDuration } from '@shared/utils/session.util';

import { SbHeatmapComponent } from '@shared/ui/heatmap/sb-heatmap.component';
import { SbBehaviorDonutComponent } from '../timer/components/behavior-donut/behavior-donut.component';

@Component({
  selector: 'sb-reports',
  standalone: true,
  imports: [SbCardComponent, SbSpinnerComponent, DurationPipe, CoinsPipe, DecimalPipe, DatePipe, PageTransitionDirective, SbHeatmapComponent, SbBehaviorDonutComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent implements OnInit {
  private readonly dailyApi   = inject(DailyTransactionApiService);
  private readonly sessionApi = inject(TimeSessionApiService);
  private readonly reportsApi = inject(ReportsApiService);
  private readonly auth       = inject(AuthService);
  private readonly tasksStore = inject(TasksStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading  = signal(true);
  readonly summary  = signal<DailySummaryDto | null>(null);
  readonly taskSummary = signal<TaskReportDto | null>(null);
  readonly report   = signal<TimeReportDto | null>(null);
  readonly sessions = signal<TimeSessionDto[]>([]);
  readonly streak   = signal(0);
  readonly range    = signal<'today' | '7d' | '30d'>('today');
  
  readonly selectedYear = signal<number>(new Date().getFullYear());
  readonly isYearlyLoading = signal(false);

  protected readonly behaviorMeta = BEHAVIOR_META;

  readonly yearlyTrend = computed<DailyTrendDto[]>(() => {
    const year = this.selectedYear();
    const map = new Map<string, DailyTrendDto>();
    
    for (const session of this.sessions()) {
       if (!session.startTime) continue;
       const d = new Date(session.startTime);
       if (d.getFullYear() !== year) continue;
       
       const dateStr = d.toISOString().split('T')[0];
       
       let t = map.get(dateStr);
       if (!t) {
         t = { date: dateStr, totalSeconds: 0, positiveSeconds: 0, negativeSeconds: 0, neutralSeconds: 0, restSeconds: 0, coinsEarned: 0 };
         map.set(dateStr, t);
       }
       const dur = getSessionDuration(session);
       t.totalSeconds += dur;
       t.coinsEarned += getSessionCoins(session);
       
       const b = getSessionBehavior(session);
       if (b === BehaviorCategory.Positive) t.positiveSeconds += dur;
       else if (b === BehaviorCategory.Negative) t.negativeSeconds += dur;
       else if (b === BehaviorCategory.Neutral) t.neutralSeconds += dur;
       else if (b === BehaviorCategory.Rest) t.restSeconds += dur;
    }
    return Array.from(map.values()).sort((a,b) => a.date.localeCompare(b.date));
  });

   ngOnInit(): void {
     // Ensure tasks are loaded for name mapping
     if (this.tasksStore.tasks().length === 0) {
       this.tasksStore.load();
     }

     this.dailyApi.getStreak().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (s: any) => {
         if (typeof s === 'number') {
             this.streak.set(s);
         } else if (s) {
             this.streak.set(s.streak ?? s.currentStreak ?? s.value ?? s.count ?? s.days ?? 0);
         } else {
             this.streak.set(0);
         }
     }});
     this.sessionApi.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ 
        next: s => {
           this.sessions.set(s);
        } 
     });
     this.reportsApi.getSummaryReport().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: s => this.taskSummary.set(s),
        error: err => console.error('Failed to load summary stats', err)
     });
     this.loadRange('today');
   }

  changeYear(year: number): void {
    this.selectedYear.set(year);
  }

  loadRange(range: 'today' | '7d' | '30d'): void {
    this.range.set(range);
    this.loading.set(true);

    if (range === 'today') {
      this.dailyApi.getTodaySummary().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: s => {
          this.summary.set(s);
          this.report.set(null); // Use summary for today
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.generateRangeReport();
    }
  }

  readonly rangeReport = computed<TimeReportDto | null>(() => {
    const range = this.range();
    if (range === 'today') return null;

    const days = range === '7d' ? 7 : 30;
    const fromDate = new Date();
    fromDate.setHours(0,0,0,0);
    fromDate.setDate(fromDate.getDate() - days);

    let totalSeconds = 0;
    const behaviorMap = new Map<BehaviorCategory, number>();
    const taskMap = new Map<string, any>();
    const allTasks = this.tasksStore.tasks();

    for (const s of this.sessions()) {
       if (!s.startTime) continue;
       const d = new Date(s.startTime);
       if (d >= fromDate) {
          const dur = getSessionDuration(s);
          totalSeconds += dur;

          const b = getSessionBehavior(s);
          if (b !== undefined && b !== null) {
             behaviorMap.set(b, (behaviorMap.get(b) || 0) + dur);
          }
          
          if (s.taskId) {
             const task = allTasks.find(t => t.id === s.taskId);
             const title = task?.title || s.taskTitle || s.title || 'Focus Session';
             const color = task?.color || s.taskColor || '#3b82f6';
             const emoji = task?.emoji || s.taskEmoji || '';
             const t = taskMap.get(s.taskId) || { taskId: s.taskId, taskTitle: title, taskColor: color, taskEmoji: emoji, totalSeconds: 0 };
             t.totalSeconds += dur;
             taskMap.set(s.taskId, t);
          }
       }
    }

    const behaviorBreakdown = Array.from(behaviorMap.entries()).map(([k, v]) => ({
       behaviorType: k as BehaviorCategory,
       totalSeconds: v,
       percentage: totalSeconds > 0 ? (v / totalSeconds) * 100 : 0,
       sessionCount: 0
    }));

    const topTasks = Array.from(taskMap.values())
       .map(t => ({ ...t, percentage: totalSeconds > 0 ? (t.totalSeconds / totalSeconds) * 100 : 0 }))
       .sort((a,b) => b.totalSeconds - a.totalSeconds)
       .slice(0, 5);

    return {
       filter: {},
       totalSeconds,
       taskBreakdown: [],
       behaviorBreakdown,
       dailyTrend: [],
       topTasks
    } as TimeReportDto;
  });

  private generateRangeReport(): void {
    // Legacy method — now we use rangeReport computed signal
    this.loading.set(false);
  }

  readonly totalTrackedAllTime = computed<number>(() => {
    return this.sessions().reduce((sum, s) => sum + getSessionDuration(s), 0);
  });

  readonly totalCoinsAllTime = computed<number>(() => {
    return this.sessions().reduce((sum, s) => sum + getSessionCoins(s), 0);
  });

  readonly behaviorDistribution = computed<any[]>(() => {
    const total = this.totalTrackedAllTime() || 1;
    const map = new Map<BehaviorCategory, number>();
    for (const s of this.sessions()) {
      const b = getSessionBehavior(s);
      if (b !== undefined && b !== null) {
         map.set(b, (map.get(b) ?? 0) + getSessionDuration(s));
      }
    }
    return Array.from(map.entries()).map(([behaviorType, totalSeconds]) => ({
      behaviorType, totalSeconds, percentage: (totalSeconds / total) * 100,
    }));
  });

  readonly peakDay = computed<string | null>(() => {
    const trend = this.yearlyTrend();
    if (!trend.length) return null;
    return trend.reduce((prev, current) => (prev.totalSeconds > current.totalSeconds) ? prev : current).date;
  });
}
