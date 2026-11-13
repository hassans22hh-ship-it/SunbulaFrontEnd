import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { TimeSessionApiService } from '../services/time-session.api.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { TimeSessionDto, PagedResult } from '@shared/models/timer.models';
import { getSessionBehavior, getSessionCoins, getSessionDuration, normaliseTimestamp } from '@shared/utils/session.util';
import { TasksStore } from '../../tasks/store/tasks.store';
import { firstValueFrom } from 'rxjs';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface TimerState {
  rawActiveSessions: TimeSessionDto[];
  rawSessions:       TimeSessionDto[];
  pagedResult:    PagedResult<TimeSessionDto> | null;
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

    const enrichSession = (session: TimeSessionDto): TimeSessionDto => {
      const allTasks = tasksStore.tasks();
      const task = allTasks.find(t => t.id === session.taskId);
      
      const behavior = getSessionBehavior(session) ?? (task?.behaviorType as any) ?? 1;

      const enriched: TimeSessionDto = {
        ...session,
        startTime: normaliseTimestamp(session.startTime) as string,
        endTime: normaliseTimestamp(session.endTime),
        taskTitle: task?.title || session.taskTitle || session.title || 'Focus Session',
        taskColor: task?.color || session.taskColor || '#52B788',
        taskBehavior: behavior,
        taskEmoji: task?.emoji || session.taskEmoji || '',
        durationSeconds: getSessionDuration(session),
      };

      return {
        ...enriched,
        coinsEarned: getSessionCoins(enriched),
      };
    };

    return {
      activeSessions: computed((): TimeSessionDto[] => {
        const _tick = state.ticker(); 
        const now = new Date().getTime();

        return state.rawActiveSessions().map(s => {
          const e = enrichSession(s);
          const isPaused = e.isPaused === true;
          const pausedSecs = e.totalPausedDurationSeconds || 0;
          
          let elapsed = 0;
          const start = new Date(e.startTime).getTime();

          if (isPaused && e.pausedAt) {
             const pausedTime = new Date(e.pausedAt).getTime();
             elapsed = Math.max(0, Math.floor((pausedTime - start) / 1000) - pausedSecs);
          } else if (!isPaused && e.startTime) {
             elapsed = Math.max(0, Math.floor((now - start) / 1000) - pausedSecs);
          } else {
             elapsed = getSessionDuration(e);
          }

          return { ...e, isPaused, durationSeconds: elapsed };
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

    // Date navigation
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
          rawActiveSessions: store.rawActiveSessions().map(s => s.id === sessionId ? { ...resumed, isPaused: false } : s),
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
        if (!auth.isAuthenticated()) return;
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

        // Look up the task's behaviorType so it's sent to the backend correctly
        const task = tasksStore.tasks().find(t => t.id === taskId);
        const behaviorType = task?.behaviorType ?? 1; // Default to Positive (1) if not found

        patchState(store, { isLoading: true });
        try {
          const res: any = await firstValueFrom(api.start({ taskId, behaviorType }));
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
          
          // Small delay ensures backend has finished processing coin transaction
          setTimeout(() => auth.refreshUserProfile(), 600);
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
            rawActiveSessions: store.rawActiveSessions().map(s => s.id === sessionId ? { ...paused, isPaused: true } : s),
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
          setTimeout(() => auth.refreshUserProfile(), 600);
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
          setTimeout(() => auth.refreshUserProfile(), 600);
        } catch (e: unknown) {
          patchState(store, { isLoading: false });
          toast.error((e as { message: string }).message ?? 'Failed to update session');
        }
      },

      async deleteSession(id: string): Promise<void> {
        patchState(store, { isLoading: true });
        try {
          await firstValueFrom(api.delete(id));
          patchState(store, {
            rawSessions: store.rawSessions().filter(s => s.id !== id),
            isLoading: false
          });
          toast.success('Session deleted');
          setTimeout(() => auth.refreshUserProfile(), 600);
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

