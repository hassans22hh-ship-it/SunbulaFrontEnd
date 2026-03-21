import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

import { AuthService } from '@core/auth/auth.service';
import { TasksStore } from '@features/tasks/store/tasks.store';
import { TimerStore } from '@features/timer/store/timer.store';

import { StatsBarComponent } from './components/stats-bar/stats-bar.component';
import { ActiveTimerCardComponent } from './components/active-timer-card/active-timer-card.component';
import { DailySummaryComponent } from './components/daily-summary/daily-summary.component';
import { AnimateDirective } from '@shared/directives/animate.directive';
import { TaskStatus } from '@shared/models/enums';

@Component({
  selector: 'sb-dashboard',
  standalone: true,
  imports: [StatsBarComponent, ActiveTimerCardComponent, DailySummaryComponent, AnimateDirective, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container flex flex-col pt-6 pb-6" sbPage>
      
      <!-- Greeting Header -->
      <div class="mb-8" sbAnimate="slideLeft">
        <h1 class="text-3xl font-display font-bold tracking-tight text-text">
          {{ getGreeting() }}, {{ auth.user()?.firstName || 'Friend' }} 👋
        </h1>
        <p class="text-subtle mt-1 text-sm">
          Today is {{ today | date:'EEEE, MMMM d' }}. Let's make it a great day.
        </p>
      </div>

      <!-- Stats Bar -->
      <div sbAnimate="fadeUp">
        <sb-stats-bar
          [tasksCompleted]="tasksStore.doneTasks().length"
          [focusTimeSecs]="timerStore.todaysTotalSecs()"
          [streakDays]="auth.streakDays()"
          [coinsEarnedToday]="todaysCoinsEarned()"
        />
      </div>

      <!-- Main Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0" sbAnimate="fadeUp" style="animation-delay: 0.1s;">
        
        <!-- Left Column: Active Timer -->
        <div class="lg:col-span-1 h-[300px] lg:h-auto">
          <sb-active-timer-card />
        </div>

        <!-- Right Column: Daily Summary -->
        <div class="lg:col-span-2 h-[400px] lg:h-auto">
          <sb-daily-summary 
            [tasks]="tasksStore.allTasks()"
            [sessions]="timerStore.todaysSessions()"
          />
        </div>

      </div>

    </div>
  `,
  styles: [`
    .font-display { font-family: var(--font-display); }
    .text-text { color: var(--color-text); }
    .text-subtle { color: var(--color-text-muted); }
  `]
})
export class DashboardComponent implements OnInit {
  protected readonly auth       = inject(AuthService);
  protected readonly tasksStore = inject(TasksStore);
  protected readonly timerStore = inject(TimerStore);
  private   readonly titleService = inject(Title);

  readonly today = new Date();

  ngOnInit(): void {
    this.titleService.setTitle('Dashboard | Sunbula');
    
    // Ensure vital data is loaded for the dashboard
    if (this.tasksStore.allTasks().length === 0) {
      this.tasksStore.loadAll();
    }
    if (this.timerStore.allSessions().length === 0) {
      this.timerStore.loadAll();
    }
  }

  getGreeting(): string {
    const hour = this.today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  todaysCoinsEarned(): number {
    // A rough calculation for display: sum of coins from today's sessions
    return this.timerStore.todaysSessions().reduce((sum, s) => sum + s.coinsEarned, 0);
  }
}
