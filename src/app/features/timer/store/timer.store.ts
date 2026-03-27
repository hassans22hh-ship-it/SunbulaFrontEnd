import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { TimeSessionApiService } from '../services/time-session.api.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { TimeSessionDto, StartSessionDto } from '@shared/models/timer.models';
import { TasksStore } from '../../tasks/store/tasks.store';
import { PagedResult } from '@shared/models/enums';
import { firstValueFrom } from 'rxjs';

interface TimerState {
  activeSession:  TimeSessionDto | null;
  sessions:       TimeSessionDto[];
  pagedResult:    PagedResult<TimeSessionDto> | null;
  isLoading:      boolean;
  error:          string | null;
  ticker:         number; // For reactive computed updates
}

const initialState: TimerState = {
  activeSession:  null,
  sessions:       [],
  pagedResult:    null,
  isLoading:      false,
  error:          null,
  ticker:         0,
};

export const TimerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ activeSession, ticker }) => ({
    isRunning: computed(() => activeSession() !== null),
    isPaused:  computed(() => activeSession()?.isPaused ?? false),
    /** Drift-safe elapsed calculation from server startTime */
    elapsedSeconds: computed(() => {
      const session = activeSession();
      const _tick = ticker(); // Access ticker to force re-computation
      if (!session?.startTime) return 0;
      
      const start = new Date(session.startTime).getTime();
      const now = Date.now();
      return Math.floor((now - start) / 1000);
    }),
  })),
  withMethods((
    store,
    api   = inject(TimeSessionApiService),
    tasksStore = inject(TasksStore),
    auth  = inject(AuthService),
    toast = inject(ToastService),
  ) => ({
    /** On app init: check for active session from server */
    async initialize(): Promise<void> {
      try {
        const active = await firstValueFrom(api.getActive());
        patchState(store, { activeSession: active });
      } catch {
        // No active session or error — ignore
      }
    },

    /** Start a timer for a task */
    async start(taskId: string): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const session = await firstValueFrom(api.start({ taskId } as StartSessionDto));
        patchState(store, { activeSession: session, isLoading: false });
        toast.success(`Timer started for ${session.taskTitle}`);
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        const err = e as { status?: number; message?: string };
        if (err.status === 409) {
          toast.warning('Another session is running. Stopping it first...');
          await this.switchTask(taskId);
        } else {
          toast.error(err.message ?? 'Failed to start timer');
        }
      }
    },

    /** Stop the current active session */
    async stop(): Promise<void> {
      const session = store.activeSession();
      if (!session) return;

      patchState(store, { isLoading: true });
      try {
        const stopped = await firstValueFrom(api.stop(session.id));
        patchState(store, { activeSession: null, isLoading: false });
        toast.success(`Timer stopped — earned ${stopped.coinsEarned?.toFixed(1) ?? 0} 🪙`);
        // Refresh user profile to get updated coinBalance
        await auth.refreshUserProfile();
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message ?? 'Failed to stop timer');
      }
    },

    /** Pause the current session */
    async pauseTimer(): Promise<void> {
      const session = store.activeSession();
      if (!session) return;

      patchState(store, { isLoading: true });
      try {
        const paused = await firstValueFrom(api.pause(session.id));
        patchState(store, { activeSession: paused, isLoading: false });
        toast.success(`Timer paused`);
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message ?? 'Failed to pause timer');
      }
    },

    /** Resume the current session */
    async resumeTimer(): Promise<void> {
      const session = store.activeSession();
      if (!session) return;

      patchState(store, { isLoading: true });
      try {
        const resumed = await firstValueFrom(api.resume(session.id));
        patchState(store, { activeSession: resumed, isLoading: false });
        toast.success(`Timer resumed`);
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message ?? 'Failed to resume timer');
      }
    },

    async updateSession(id: string, dto: any): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const updated = await firstValueFrom(api.update(id, dto));
        const enriched = this.enrichSessions([updated])[0];
        patchState(store, { 
          sessions: store.sessions().map(s => s.id === id ? enriched : s),
          isLoading: false 
        });
        toast.success('Session updated');
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message ?? 'Failed to update session');
      }
    },

    async deleteSession(id: string): Promise<void> {
      if (!confirm('Are you sure you want to delete this session?')) return;
      patchState(store, { isLoading: true });
      try {
        await firstValueFrom(api.delete(id));
        patchState(store, { 
          sessions: store.sessions().filter(s => s.id !== id),
          isLoading: false 
        });
        toast.success('Session deleted');
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message ?? 'Failed to delete session');
      }
    },

    /** Switch tasks: stop active → start new */
    async switchTask(taskId: string): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        await firstValueFrom(api.stopActive());
        const session = await firstValueFrom(api.start({ taskId } as StartSessionDto));
        patchState(store, { activeSession: session, isLoading: false });
        toast.success(`Switched to ${session.taskTitle}`);
        await auth.refreshUserProfile();
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message ?? 'Failed to switch task');
      }
    },

    /** Load all sessions history */
    async loadAll(): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const response: any = await firstValueFrom(api.getHistory());
        const rawSessions = Array.isArray(response) ? response : (response.data ?? response.items ?? []);
        const sessions = this.enrichSessions(rawSessions);
        patchState(store, { sessions, isLoading: false });
      } catch (e: unknown) {
        patchState(store, { isLoading: false, error: (e as { message: string }).message });
      }
    },

    /** Load paged session history */
    async loadPaged(page = 1, pageSize = 20): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const response: any = await firstValueFrom(api.getPaged(page, pageSize));
        const raw = response.data ?? response.items ?? response;
        const rawSessions = Array.isArray(raw) ? raw : (raw.items ?? []);
        const sessions = this.enrichSessions(rawSessions);
        patchState(store, { pagedResult: response, sessions, isLoading: false });
      } catch (e: unknown) {
        // Fallback to non-paged history if paged fails
        try {
          const history = await firstValueFrom(api.getHistory());
          patchState(store, { sessions: this.enrichSessions(history), isLoading: false });
        } catch {
          patchState(store, { isLoading: false, error: (e as { message: string }).message });
        }
      }
    },

    enrichSessions(sessions: any[]): TimeSessionDto[] {
      const allTasks = tasksStore.tasks();
      return sessions.map(s => {
        const task = (allTasks as any[]).find(t => t.id === s.taskId);
        return {
          ...s,
          taskTitle: task?.title || s.taskTitle || s.taskName || s.title || 'Focus Session',
          taskColor: task?.color || s.taskColor || '#52B788',
          taskBehavior: task?.behaviorType ?? s.taskBehavior ?? s.behaviorType,
          durationSeconds: s.durationSeconds ?? s.duration ?? s.totalSeconds ?? (s.durationMinutes ? s.durationMinutes * 60 : 0),
        };
      });
    },

    updateTicker(): void {
      patchState(store, { ticker: store.ticker() + 1 });
    },
  })),
);
