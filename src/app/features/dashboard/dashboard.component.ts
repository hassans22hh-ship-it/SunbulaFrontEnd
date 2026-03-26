import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { TaskDto } from '@shared/models/task.models';

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

  readonly recentTasks = computed(() => {
    const sessions = this.timer.sessions();
    const allTasks = this.tasks.activeTasks();
    
    // Extract unique taskIds from sessions in order (most recent first)
    const recentIds = [...new Set(sessions.map(s => s.taskId))];
    
    // Map IDs to actual tasks, filtering out anything not in activeTasks
    const recent = recentIds
      .map(id => allTasks.find(t => t.id === id))
      .filter((t): t is TaskDto => !!t);
      
    // If we have sessions, return them (up to 6)
    if (recent.length > 0) {
      return recent.slice(0, 6);
    }
    
    // Fallback: show first 6 active tasks
    return allTasks.slice(0, 6);
  });

  ngOnInit(): void {
    this.timer.initialize();
    this.timer.loadPaged(1, 10); // Load last 10 sessions for "Recently Used"
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
