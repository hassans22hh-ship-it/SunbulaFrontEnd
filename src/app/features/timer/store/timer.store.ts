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
  rawActiveSession:  any | null;
  rawSessions:       any[];
  pagedResult:    PagedResult<any> | null;
  isLoading:      boolean;
  error:          string | null;
  ticker:         number;
  selectedDate:   string; // YYYY-MM-DD
}

const initialState: TimerState = {
  rawActiveSession:  null,
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

      // --- Timezone Bug: The backend appears to send local time strings ---
      // Adding 'Z' was causing a drift. Let's keep it as-is so the browser
      // treats it as local if no offset is present.
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
      activeSession: computed((): TimeSessionDto | null => {
        const s = state.rawActiveSession();
        if (!s) return null;
        return enrichSession(s);
      }),
      sessions: computed((): TimeSessionDto[] => {
        return state.rawSessions().map(enrichSession);
      }),
    };
  }),
  withComputed(({ activeSession, sessions, rawActiveSession, rawSessions, ticker, selectedDate }) => ({
    isRunning: computed(() => rawActiveSession() !== null),
    isPaused:  computed(() => rawActiveSession()?.isPaused ?? false),

    /** Drift-safe elapsed calculation from server startTime */
    elapsedSeconds: computed(() => {
      const session = activeSession();
      const _tick = ticker(); // Access ticker to force re-computation
      if (!session?.startTime) return 0;

      // session.startTime is already normalized in enrichSession/activeSession computed.
      const start = new Date(session.startTime).getTime();
      const now = Date.now();
      return Math.floor((now - start) / 1000);
    }),

    dailyTotalSeconds: computed(() => {
      const today = new Date().toDateString();
      return sessions()
        .filter((s: TimeSessionDto) => s.startTime && new Date(s.startTime).toDateString() === today)
        .reduce((acc: number, s: TimeSessionDto) => acc + (s.durationSeconds ?? 0), 0);
    }),

    // BUG-07: Expose task info from active session
    taskName: computed(() => {
      const s = activeSession();
      return s?.taskTitle ?? s?.title ?? 'Focus Session';
    }),
    taskEmoji: computed(() => {
      const s = activeSession();
      return (s as any)?.taskEmoji ?? (s as any)?.emoji ?? '';
    }),
    behaviorType: computed(() => {
      const s = activeSession();
      return s?.taskBehavior ?? (s as any)?.behaviorType ?? null;
    }),
    activeTaskId: computed(() => activeSession()?.taskId ?? null),

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

    // Define local functions first to allow recursion and clean calling
    const startTicker = () => {
      if (_tickerInterval) return;
      _tickerInterval = setInterval(() => {
        if (store.activeSession()) {
          patchState(store, { ticker: store.ticker() + 1 });
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

    const resumeTimer = async (): Promise<void> => {
      const session = store.activeSession();
      if (!session) return;

      patchState(store, { isLoading: true });
      try {
        const res: any = await firstValueFrom(api.resume(session.id));
        const resumed = res?.data ?? res;
        patchState(store, { rawActiveSession: resumed, isLoading: false });
        startTicker();
        toast.success(`Timer resumed`);
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message ?? 'Failed to resume timer');
      }
    };

    const switchTask = async (taskId: string): Promise<void> => {
      patchState(store, { isLoading: true });
      try {
        stopTicker();
        await firstValueFrom(api.stopActive());
        const res: any = await firstValueFrom(api.start({ taskId } as StartSessionDto));
        const session = res?.data ?? res;
        patchState(store, { rawActiveSession: session, isLoading: false });
        startTicker();
        const enriched = store.activeSession()!;
        toast.success(`Switched to ${enriched.taskTitle}`);
        await auth.refreshUserProfile();
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message ?? 'Failed to switch task');
      }
    };

    return {
      startTicker,
      stopTicker,
      getById,
      loadByDate,
      resumeTimer,
      switchTask,

      async initialize(): Promise<void> {
        try {
          const active: any = await firstValueFrom(api.getActive());
          const session = active?.data ?? active;
          if (session && !session.taskId) {
             await firstValueFrom(api.stopActive());
             patchState(store, { rawActiveSession: null });
          } else if (session) {
             patchState(store, { rawActiveSession: session });
             startTicker();
          }
        } catch {
          // No active session or error — ignore
        }
      },

      async start(taskId: string): Promise<void> {
        const current = store.activeSession();
        if (current && current.taskId === taskId) {
          if (!current.isPaused) {
            toast.info('This task is already being tracked');
            return;
          }
          await resumeTimer();
          return;
        }

        if (current) {
          await switchTask(taskId);
          return;
        }

        patchState(store, { isLoading: true });
        try {
          const res: any = await firstValueFrom(api.start({ taskId } as StartSessionDto));
          const session = res?.data ?? res;
          patchState(store, { rawActiveSession: session, isLoading: false });
          startTicker();
          const enriched = store.activeSession()!;
          toast.success(`Timer started for ${enriched.taskTitle}`);
        } catch (e: unknown) {
          patchState(store, { isLoading: false });
          const err = e as { status?: number; message?: string };
          if (err.status === 409 || (err.message && err.message.toLowerCase().includes('active session'))) {
            toast.warning('Another session is running. Stopping it first...');
            await switchTask(taskId);
          } else {
            toast.error(err.message ?? 'Failed to start timer');
          }
        }
      },

      async stop(): Promise<void> {
        const session = store.activeSession();
        if (!session) return;

        patchState(store, { isLoading: true });
        try {
          const res: any = await firstValueFrom(api.stop(session.id));
          const stopped = res?.data ?? res;
          stopTicker();
          patchState(store, { rawActiveSession: null, isLoading: false });
          toast.success(`Timer stopped — earned ${stopped.coinsEarned?.toFixed(1) ?? 0} 🪙`);
          await auth.refreshUserProfile();
          await loadByDate(store.selectedDate());
        } catch (e: unknown) {
          patchState(store, { isLoading: false });
          toast.error((e as { message: string }).message ?? 'Failed to stop timer');
        }
      },

      async pauseTimer(): Promise<void> {
        const session = store.activeSession();
        if (!session) return;

        patchState(store, { isLoading: true });
        try {
          const res: any = await firstValueFrom(api.pause(session.id));
          const paused = res?.data ?? res;
          stopTicker();
          patchState(store, { rawActiveSession: paused, isLoading: false });
          toast.success(`Timer paused`);
        } catch (e: unknown) {
          patchState(store, { isLoading: false });
          toast.error((e as { message: string }).message ?? 'Failed to pause timer');
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

      async loadAll(): Promise<void> {
        patchState(store, { isLoading: true });
        try {
          const response: any = await firstValueFrom(api.getHistory());
          const rawSessions = Array.isArray(response) ? response : (response.data ?? response.items ?? []);
          patchState(store, { rawSessions, isLoading: false });
        } catch (e: unknown) {
          patchState(store, { isLoading: false, error: (e as { message: string }).message });
        }
      },

      async loadPaged(page = 1, pageSize = 20): Promise<void> {
        patchState(store, { isLoading: true });
        try {
          const response: any = await firstValueFrom(api.getPaged(page, pageSize));
          const raw = response.data ?? response.items ?? response;
          const rawSessions = Array.isArray(raw) ? raw : (raw.items ?? []);
          patchState(store, { pagedResult: response, rawSessions, isLoading: false });
        } catch (e: unknown) {
          try {
            const history: any = await firstValueFrom(api.getHistory());
            patchState(store, { rawSessions: history, isLoading: false });
          } catch {
            patchState(store, { isLoading: false, error: (e as { message: string }).message });
          }
        }
      },

      updateTicker(): void {
        patchState(store, { ticker: store.ticker() + 1 });
      },
    };
  }),
);
