import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { TimeSessionApiService } from '../services/time-session.api.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { TimeSessionDto, StartSessionDto } from '@shared/models/timer.models';
import { TasksStore } from '../../tasks/store/tasks.store';
import { PagedResult } from '@shared/models/enums';
import { firstValueFrom } from 'rxjs';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface TimerState {
  rawActiveSessions: any[];
  rawSessions:       any[];
  pagedResult:    PagedResult<any> | null;
  isLoading:      boolean;
  error:          string | null;
  ticker:         number;
  selectedDate:   string; // YYYY-MM-DD
}

const initialState: TimerState = {
  rawActiveSessions: [],
  rawSessions:       [],
  pagedResult:    null,
  isLoading:      false,
  error:          null,
  ticker:         0,
  selectedDate:   todayStr(),
};

let _tickerInterval: ReturnType<typeof setInterval> | null = null;

export const TimerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => {
    const tasksStore = inject(TasksStore);

    const enrichSession = (session: any): TimeSessionDto => {
      const allTasks = tasksStore.tasks();
      const task = (allTasks as any[]).find((t: any) => t.id === session.taskId);

      let startTime = session.startTime;
      let endTime = session.endTime;

      return {
        ...session,
        startTime,
        endTime,
        taskTitle: task?.title || session.taskTitle || session.taskName || session.title || 'Focus Session',
        taskColor: task?.color || session.taskColor || '#52B788',
        taskBehavior: task?.behaviorType ?? session.taskBehavior ?? session.behaviorType,
        taskEmoji: task?.emoji || (session as any).taskEmoji || '',
        durationSeconds: session.durationSeconds ?? session.duration ?? session.totalSeconds ?? (session.durationMinutes ? session.durationMinutes * 60 : 0),
      };
    };

    return {
      activeSessions: computed((): TimeSessionDto[] => {
        const _ = state.ticker();
        return state.rawActiveSessions().map(s => {
          const e = enrichSession(s);
          let elapsed = e.durationSeconds || 0;
          if (!e.isPaused && e.startTime) {
            const start = new Date(e.startTime).getTime();
            const now = new Date().getTime();
            elapsed = Math.floor((now - start) / 1000) + (e.durationSeconds || 0);
          }
          e.durationSeconds = elapsed;
          return e;
        });
      }),
      sessions: computed((): TimeSessionDto[] => {
        return state.rawSessions().map(enrichSession);
      }),
    };
  }),
  withComputed(({ activeSessions, sessions, rawActiveSessions, rawSessions, ticker, selectedDate }) => ({
    isRunning: computed(() => rawActiveSessions().length > 0),

    dailyTotalSeconds: computed(() => {
      const today = new Date().toDateString();
      return sessions()
        .filter((s: TimeSessionDto) => s.startTime && new Date(s.startTime).toDateString() === today)
        .reduce((acc: number, s: TimeSessionDto) => acc + (s.durationSeconds ?? 0), 0);
    }),

    // BUG-04: Date navigation
    canGoNext: computed(() => selectedDate() < todayStr()),
    dateLabel: computed(() => {
      const sel = selectedDate();
      const today = todayStr();
      if (sel === today) return 'Today';

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      if (sel === yStr) return 'Yesterday';

      const d = new Date(sel + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }),
  })),
  withMethods((store) => {
    const api = inject(TimeSessionApiService);
    const tasksStore = inject(TasksStore);
    const auth = inject(AuthService);
    const toast = inject(ToastService);

    const startTicker = () => {
      if (_tickerInterval) return;
      _tickerInterval = setInterval(() => {
        if (store.rawActiveSessions().length > 0) {
          patchState(store, { ticker: store.ticker() + 1 });
        } else {
          stopTicker();
        }
      }, 1000);
    };

    const stopTicker = () => {
      if (_tickerInterval) {
        clearInterval(_tickerInterval);
        _tickerInterval = null;
      }
    };

    const getById = async (id: string): Promise<TimeSessionDto> => {
      return firstValueFrom(api.getById(id));
    };

    const loadByDate = async (date?: string): Promise<void> => {
      const targetDate = date ?? store.selectedDate();
      patchState(store, { isLoading: true, selectedDate: targetDate });
      try {
        const response: any = await firstValueFrom(api.getByDate(targetDate));
        const rawSessions = Array.isArray(response) ? response : (response.data ?? response.items ?? []);
        patchState(store, { rawSessions, isLoading: false });
      } catch (e: unknown) {
        patchState(store, { isLoading: false, error: (e as { message: string }).message });
      }
    };

    const resumeTimer = async (sessionId: string): Promise<void> => {
      patchState(store, { isLoading: true });
      try {
        const res: any = await firstValueFrom(api.resume(sessionId));
        const resumed = res?.data ?? res;
        patchState(store, { 
          rawActiveSessions: store.rawActiveSessions().map(s => s.id === sessionId ? resumed : s),
          isLoading: false 
        });
        startTicker();
        toast.success(`Timer resumed`);
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message ?? 'Failed to resume timer');
      }
    };

    return {
      startTicker,
      stopTicker,
      getById,
      loadByDate,
      resumeTimer,

      async initialize(): Promise<void> {
        try {
          const active: any = await firstValueFrom(api.getActive());
          let activeList = Array.isArray(active) ? active : active?.data ?? active;
          if (!Array.isArray(activeList)) {
            activeList = activeList ? [activeList] : [];
          }
          activeList = activeList.filter((s: any) => s && s.taskId);
          
          patchState(store, { rawActiveSessions: activeList });
          if (activeList.length > 0) startTicker();
        } catch {
          // No active session or error — ignore
        }
      },

      async start(taskId: string): Promise<void> {
        const currentRunning = store.activeSessions().find(s => s.taskId === taskId);
        if (currentRunning) {
          if (!currentRunning.isPaused) {
            toast.info('This task is already being tracked');
            return;
          }
          await resumeTimer(currentRunning.id);
          return;
        }

        patchState(store, { isLoading: true });
        try {
          const res: any = await firstValueFrom(api.start({ taskId } as StartSessionDto));
          const session = res?.data ?? res;
          patchState(store, { 
            rawActiveSessions: [...store.rawActiveSessions(), session],
            isLoading: false 
          });
          startTicker();
          const enriched = store.activeSessions().find(s => s.id === session.id);
          if (enriched) {
             toast.success(`Timer started for ${enriched.taskTitle}`);
          }
        } catch (e: unknown) {
          patchState(store, { isLoading: false });
          toast.error((e as { message: string }).message ?? 'Failed to start timer');
        }
      },

      async stop(sessionId: string): Promise<void> {
        patchState(store, { isLoading: true });
        try {
          const res: any = await firstValueFrom(api.stop(sessionId));
          const stopped = res?.data ?? res;
          patchState(store, { 
            rawActiveSessions: store.rawActiveSessions().filter(s => s.id !== sessionId),
            isLoading: false 
          });
          if (store.rawActiveSessions().length === 0) stopTicker();
          toast.success(`Timer stopped — earned ${stopped.coinsEarned?.toFixed(1) ?? 0} 🪙`);
          await auth.refreshUserProfile();
          await loadByDate(store.selectedDate());
        } catch (e: unknown) {
           patchState(store, { isLoading: false });
           toast.error((e as { message: string }).message ?? 'Failed to stop timer');
        }
      },

      async stopAll(): Promise<void> {
        patchState(store, { isLoading: true });
        try {
          await firstValueFrom(api.stopActive());
          patchState(store, { rawActiveSessions: [], isLoading: false });
          stopTicker();
          toast.success(`All timers stopped`);
          await auth.refreshUserProfile();
          await loadByDate(store.selectedDate());
        } catch (e: unknown) {
          patchState(store, { isLoading: false });
          toast.error((e as { message: string }).message ?? 'Failed to stop all timers');
        }
      },

      async pauseTimer(sessionId: string): Promise<void> {
        patchState(store, { isLoading: true });
        try {
          const res: any = await firstValueFrom(api.pause(sessionId));
          const paused = res?.data ?? res;
          patchState(store, { 
            rawActiveSessions: store.rawActiveSessions().map(s => s.id === sessionId ? paused : s),
            isLoading: false 
          });
          toast.success(`Timer paused`);
        } catch (e: unknown) {
          patchState(store, { isLoading: false });
          toast.error((e as { message: string }).message ?? 'Failed to pause timer');
        }
      },

      async addManualSession(dto: any): Promise<void> {
        patchState(store, { isLoading: true });
        try {
          await firstValueFrom(api.manual(dto));
          toast.success('Manual session added');
          await loadByDate(store.selectedDate());
          await auth.refreshUserProfile();
        } catch (e: unknown) {
          patchState(store, { isLoading: false });
          toast.error((e as { message: string }).message ?? 'Failed to add manual session');
        }
      },

      async updateSession(id: string, dto: any): Promise<void> {
        patchState(store, { isLoading: true });
        try {
          const res: any = await firstValueFrom(api.update(id, dto));
          const updated = res?.data ?? res;
          patchState(store, {
            rawSessions: store.rawSessions().map(s => s.id === id ? updated : s),
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
            rawSessions: store.rawSessions().filter(s => s.id !== id),
            isLoading: false
          });
          toast.success('Session deleted');
        } catch (e: unknown) {
          patchState(store, { isLoading: false });
          toast.error((e as { message: string }).message ?? 'Failed to delete session');
        }
      },

      prevDay(): void {
        const d = new Date(store.selectedDate() + 'T00:00:00');
        d.setDate(d.getDate() - 1);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        loadByDate(dateStr);
      },

      nextDay(): void {
        if (!store.canGoNext()) return;
        const d = new Date(store.selectedDate() + 'T00:00:00');
        d.setDate(d.getDate() + 1);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        loadByDate(dateStr);
      },

      updateTicker(): void {
        patchState(store, { ticker: store.ticker() + 1 });
      },
    };
  }),
);

