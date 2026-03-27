import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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
import { SbIconCoinComponent } from '@shared/ui/icons/coin-icon.component';
import { ToastService } from '@shared/ui/toast/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'sb-dashboard',
  standalone: true,
  imports: [
    SbCardComponent, SbButtonComponent, SbSpinnerComponent,
    SbBehaviorBadgeComponent, DurationPipe, CoinsPipe, DecimalPipe, PageTransitionDirective,
    SbIconCoinComponent,
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
  private readonly toast    = inject(ToastService);
  private readonly router   = inject(Router);

  readonly dailySummary = signal<DailySummaryDto | null>(null);
  readonly streak       = signal(0);
  readonly loading      = signal(true);
  private timerInterval: any;

  protected readonly behaviorMeta = BEHAVIOR_META;

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  readonly recentTasks = computed(() => {
    const sessions = this.timer.sessions() ?? [];
    const allTasks = this.tasks.activeTasks() ?? [];
    
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

  async ngOnInit(): Promise<void> {
    try {
      this.timer.initialize();
      this.startTicker();
      
      // Sequential loading to avoid DB concurrency issues
      await this.timer.loadPaged(1, 10);
      await this.tasks.load();
      await this.loadDailyData();
      
    } catch (e) {
      this.loading.set(false);
    }
  }

  private startTicker(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.timer.updateTicker(), 1000);
  }

  private async loadDailyData(): Promise<void> {
    try {
      const summary = await firstValueFrom(this.dailyApi.getTodaySummary());
      this.dailySummary.set(summary);
      
      const streakData = await firstValueFrom<any>(this.dailyApi.getStreak());
      const value = typeof streakData === 'number' ? streakData : (streakData?.streak ?? 0);
      this.streak.set(value);
      
      this.loading.set(false);
    } catch (e) {
      this.loading.set(false);
    }
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  protected startTask(taskId: string): void {
    const task = this.tasks.activeTasks().find(t => t.id === taskId);
    if (!task) return;

    this.timer.start(taskId);
    this.toast.success(`Tracking session for: ${task.title} ⏱️`);
    this.router.navigate(['/timer']);
  }
}
