import { Component, ChangeDetectionStrategy, computed, inject, Input, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TasksStore } from '../store/tasks.store';
import { TimeSessionApiService } from '../../timer/services/time-session.api.service';
import { TimeSessionDto } from '@shared/models/timer.models';
import { SbBehaviorBadgeComponent } from '@shared/ui/behavior-badge/sb-behavior-badge.component';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { SbIconCoinComponent } from '@shared/ui/icons/coin-icon.component';

@Component({
  selector: 'sb-task-detail',
  standalone: true,
  imports: [
    DatePipe, SbBehaviorBadgeComponent, 
    DurationPipe, CoinsPipe, SbSpinnerComponent, 
    SbEmptyStateComponent, PageTransitionDirective,
    SbIconCoinComponent
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailComponent implements OnInit {
  protected readonly tasksStore = inject(TasksStore);
  protected readonly timerApi = inject(TimeSessionApiService);
  protected readonly router = inject(Router);

  // Input bound from route parameter
  @Input() set id(value: string) {
    this.taskId.set(value);
    this.loadSessions(value);
  }

  readonly taskId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly sessions = signal<TimeSessionDto[]>([]);

  readonly task = computed(() => {
    const id = this.taskId();
    if (!id) return null;
    return this.tasksStore.tasks().find(t => t.id === id) || null;
  });

  readonly totalTrackedSeconds = computed(() => {
    return this.sessions().reduce((acc, s) => acc + (s.durationSeconds ?? s.duration ?? 0), 0);
  });

  readonly totalCoinsEarned = computed(() => {
    return this.sessions().reduce((acc, s) => acc + (s.coinsEarned ?? 0), 0);
  });

  ngOnInit() {
    if (this.tasksStore.tasks().length === 0) {
      this.tasksStore.load();
    }
  }

  private loadSessions(taskId: string) {
    this.isLoading.set(true);
    // Fetch all history and filter by id, as backend doesn't take taskId query param directly in swagger
    this.timerApi.getHistory().subscribe({
      next: (res: any) => {
        const rawSessions: TimeSessionDto[] = Array.isArray(res) ? res : (res.data ?? res.items ?? []);
        const filtered = rawSessions.filter(s => s.taskId === taskId).map(s => {
           let startTime = s.startTime;
           if (typeof startTime === 'string' && !startTime.endsWith('Z') && !startTime.includes('+')) {
             startTime += 'Z';
           }
           let endTime = s.endTime;
           if (typeof endTime === 'string' && !endTime.endsWith('Z') && !endTime.includes('+')) {
             endTime += 'Z';
           }
           return { ...s, startTime, endTime };
        }).sort((a, b) => {
           return new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime();
        });
        this.sessions.set(filtered);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }
}
