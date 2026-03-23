import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { TimerStore } from '../timer/store/timer.store';
import { TasksStore } from '../tasks/store/tasks.store';
import { DailyTransactionApiService } from '../timer/services/daily-transaction.api.service';
import { DailySummaryDto } from '@shared/models/timer.models';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbBehaviorBadgeComponent } from '@shared/ui/behavior-badge/sb-behavior-badge.component';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { BEHAVIOR_META, BehaviorCategory } from '@shared/models/enums';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'sb-dashboard',
  standalone: true,
  imports: [
    SbCardComponent, SbButtonComponent, SbSpinnerComponent,
    SbBehaviorBadgeComponent, DurationPipe, CoinsPipe, DecimalPipe, PageTransitionDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  protected readonly auth  = inject(AuthService);
  protected readonly timer = inject(TimerStore);
  protected readonly tasks = inject(TasksStore);
  private readonly dailyApi = inject(DailyTransactionApiService);

  readonly dailySummary = signal<DailySummaryDto | null>(null);
  readonly streak       = signal(0);
  readonly loading      = signal(true);

  protected readonly behaviorMeta = BEHAVIOR_META;

  ngOnInit(): void {
    this.timer.initialize();
    this.tasks.load();
    this.loadDailyData();
  }

  private loadDailyData(): void {
    this.dailyApi.getTodaySummary().subscribe({
      next: s => { this.dailySummary.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.dailyApi.getStreak().subscribe({
      next: s => this.streak.set(s),
    });
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
