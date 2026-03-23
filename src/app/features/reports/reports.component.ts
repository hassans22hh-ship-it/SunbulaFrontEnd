import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DailyTransactionApiService } from '../timer/services/daily-transaction.api.service';
import { TimeSessionApiService } from '../timer/services/time-session.api.service';
import { DailySummaryDto, TimeSessionDto } from '@shared/models/timer.models';
import { BEHAVIOR_META, BehaviorCategory } from '@shared/models/enums';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { DecimalPipe } from '@angular/common';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';

@Component({
  selector: 'sb-reports',
  standalone: true,
  imports: [SbCardComponent, SbSpinnerComponent, DurationPipe, CoinsPipe, DecimalPipe, PageTransitionDirective],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent implements OnInit {
  private readonly dailyApi   = inject(DailyTransactionApiService);
  private readonly sessionApi = inject(TimeSessionApiService);

  readonly loading  = signal(true);
  readonly summary  = signal<DailySummaryDto | null>(null);
  readonly sessions = signal<TimeSessionDto[]>([]);
  readonly streak   = signal(0);

  protected readonly behaviorMeta = BEHAVIOR_META;

  ngOnInit(): void {
    this.dailyApi.getTodaySummary().subscribe({ next: s => this.summary.set(s), error: () => {} });
    this.dailyApi.getStreak().subscribe({ next: s => this.streak.set(s) });
    this.sessionApi.getAll().subscribe({
      next: s => { this.sessions.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
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
}
