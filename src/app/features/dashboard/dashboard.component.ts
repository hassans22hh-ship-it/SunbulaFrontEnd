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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
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
