import { DecimalPipe, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TimerStore } from './store/timer.store';
import { TasksStore } from '../tasks/store/tasks.store';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbBehaviorBadgeComponent } from '@shared/ui/behavior-badge/sb-behavior-badge.component';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { RelativeDatePipe } from '@shared/pipes/relative-date.pipe';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { TimerControlsComponent } from './components/timer-controls/timer-controls.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbIconCoinComponent } from '@shared/ui/icons/coin-icon.component';
import { SbStreakCalendarComponent } from './components/streak-calendar/streak-calendar.component';
import { SbBehaviorDonutComponent } from './components/behavior-donut/behavior-donut.component';
import { DailyTransactionApiService } from './services/daily-transaction.api.service';
import { AuthService } from '@core/auth/auth.service';
@Component({
  selector: 'sb-timer',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe,
    SbCardComponent, SbEmptyStateComponent, SbSpinnerComponent, SbModalComponent, SbButtonComponent,
    SbBehaviorBadgeComponent, DurationPipe, DecimalPipe, RelativeDatePipe, PageTransitionDirective,
    TimerControlsComponent, SbIconCoinComponent
  ],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerComponent implements OnInit {
  protected readonly timer = inject(TimerStore);
  protected readonly tasks = inject(TasksStore);
  private readonly statsApi = inject(DailyTransactionApiService);

  readonly history7Days = signal<any[]>([]);
  readonly currentStreak = signal<number>(0);

  readonly isEditModalOpen = signal(false);
  readonly sessionToEdit = signal<any>(null);
  
  // Add Manual Session Modal State
  readonly isAddModalOpen = signal(false);
  readonly addTaskId = signal('');
  readonly addStartTime = signal(this.toLocalISO(new Date()));
  readonly addEndTime = signal(this.toLocalISO(new Date()));
  readonly addBehaviorType = signal<number>(1);
  readonly addNotes = signal('');

  // Edit Modal Form State
  readonly editStartTime = signal('');
  readonly editEndTime = signal('');
  readonly editTaskId = signal('');

  readonly editDuration = computed(() => {
    const start = this.editStartTime();
    const end = this.editEndTime();
    if (!start || !end) return 0;
    try {
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      return Math.max(0, Math.floor((e - s) / 1000));
    } catch {
      return 0;
    }
  });

  readonly addDuration = computed(() => {
    const start = this.addStartTime();
    const end = this.addEndTime();
    if (!start || !end) return 0;
    try {
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      return Math.max(0, Math.floor((e - s) / 1000));
    } catch {
      return 0;
    }
  });

  readonly addCoinPreview = computed(() => {
    const durationHours = this.addDuration() / 3600;
    const rate = this.getBehaviorCoinRate(this.addBehaviorType());
    return durationHours * rate;
  });

  private getBehaviorCoinRate(type: number): number {
    switch (Number(type)) {
      case 0: return 2; // Positive
      case 1: return 1; // Neutral
      case 2: return -1; // Negative
      case 3: return 1; // Rest
      default: return 0;
    }
  }

  // Formatting for <input type="datetime-local">
  toLocalISO(d: string | Date | null | undefined): string {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    // Timer.initialize() already called by APP_INITIALIZER (BUG-02)
    this.tasks.load();
    // BUG-04: Load sessions for today by default
    this.timer['loadByDate']();
    this.loadStats();
  }

  async loadStats(): Promise<void> {
    try {
      const hist = await firstValueFrom(this.statsApi.getLastNDays(7));
      const streak = await firstValueFrom(this.statsApi.getStreak());
      this.history7Days.set((hist as any)?.data ?? hist ?? []);
      this.currentStreak.set((streak as any)?.data ?? streak ?? 0);
    } catch (e) {
      console.error('Failed to load timer stats:', e);
    }
  }

  deleteSession(id: string): void {
    this.timer['deleteSession'](id);
  }

  async editSession(session: any): Promise<void> {
    try {
      // BUG-FIX: Always fetch fresh data before editing as requested
      const s: any = await this.timer['getById'](session.id);
      
      // Enrich with task info for display
      const t = this.tasks.tasks().find(task => task.id === s.taskId);
      s.taskTitle = t?.title || s.taskTitle || 'Focus Session';
      s.taskEmoji = t?.emoji || '';
      
      this.sessionToEdit.set(s);
      
      // Formatting for <input type="datetime-local">
      // Need to adjust for local timezone to show correct values in the input

      this.editStartTime.set(this.toLocalISO(s.startTime));
      this.editEndTime.set(s.endTime ? this.toLocalISO(s.endTime) : '');
      this.editTaskId.set(s.taskId);
      this.isEditModalOpen.set(true);
    } catch (err) {
      console.error('Failed to load session for editing', err);
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.sessionToEdit.set(null);
  }

  async saveEdit(): Promise<void> {
    const session = this.sessionToEdit();
    if (!session) return;

    if (this.editDuration() <= 0 && this.editEndTime()) {
       // Optional: Add a toast warning here if end < start
    }

    const payload = {
      startTime: new Date(this.editStartTime()).toISOString(),
      endTime: this.editEndTime() ? new Date(this.editEndTime()).toISOString() : null,
      behaviorType: session.behaviorType,
      coinsEarned: session.coinsEarned || 0,
      notes: session.notes ?? ''
    };

    await this.timer['updateSession'](session.id, payload);
    this.closeEditModal();
  }

  startTimer(taskId: string): void {
    this.timer['start'](taskId);
  }

  stopTimer(sessionId: string): void {
    this.timer['stop'](sessionId);
  }

  stopAllTimers(): void {
    this.timer['stopAll']();
  }

  pauseTimer(sessionId: string): void {
    this.timer['pauseTimer'](sessionId);
  }

  resumeTimer(sessionId: string): void {
    this.timer['resumeTimer'](sessionId);
  }

  openAddModal(): void {
    this.addTaskId.set(this.tasks.activeTasks()[0]?.id || '');
    this.addStartTime.set(this.toLocalISO(new Date()));
    this.addEndTime.set(this.toLocalISO(new Date()));
    this.addNotes.set('');
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  async saveManualSession(): Promise<void> {
    if (!this.addTaskId()) return;
    
    const payload = {
      taskId: this.addTaskId(),
      startTime: new Date(this.addStartTime()).toISOString(),
      endTime: new Date(this.addEndTime()).toISOString(),
      behaviorType: Number(this.addBehaviorType()),
      notes: this.addNotes()
    };

    await this.timer['addManualSession'](payload);
    this.closeAddModal();
  }

  getElapsed(session: any): number {
    if (!session?.startTime) return 0;
    const start = new Date(session.startTime).getTime();
    const now = Date.now();
    // Use store ticker to trigger recomputations
    const tick = this.timer.ticker();
    return Math.max(0, Math.floor((now - start) / 1000));
  }

  calculateOffset(seconds: number): number {
    const circumference = 565.48;
    const progress = (seconds % 3600) / 3600;
    return circumference * (1 - progress);
  }

  formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
