import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { TimeSessionApiService } from '../services/time-session.api.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { TimeSessionDto, StartSessionDto } from '@shared/models/timer.models';
import { PagedResult } from '@shared/models/enums';
import { firstValueFrom } from 'rxjs';

interface TimerState {
  activeSession:  TimeSessionDto | null;
  sessions:       TimeSessionDto[];
  pagedResult:    PagedResult<TimeSessionDto> | null;
  isLoading:      boolean;
  error:          string | null;
}

const initialState: TimerState = {
  activeSession:  null,
  sessions:       [],
  pagedResult:    null,
  isLoading:      false,
  error:          null,
};

export const TimerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ activeSession }) => ({
    isRunning: computed(() => activeSession() !== null),
    isPaused:  computed(() => activeSession()?.isPaused ?? false),
    /** Drift-safe elapsed calculation from server startTime */
    elapsedSeconds: computed(() => {
      const session = activeSession();
      if (!session?.startTime) return 0;
      return Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
    }),
  })),
  withMethods((
    store,
    api   = inject(TimeSessionApiService),
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
        const result = await firstValueFrom(api.getAll());
        patchState(store, { sessions: result, isLoading: false });
      } catch (e: unknown) {
        patchState(store, { isLoading: false, error: (e as { message: string }).message });
      }
    },

    /** Load paged session history */
    async loadPaged(page = 1, pageSize = 20): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const result = await firstValueFrom(api.getPaged(page, pageSize));
        patchState(store, { pagedResult: result, sessions: result.data, isLoading: false });
      } catch (e: unknown) {
        patchState(store, { isLoading: false, error: (e as { message: string }).message });
      }
    },
  })),
);
