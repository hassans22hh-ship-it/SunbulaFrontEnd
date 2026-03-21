import { computed, effect, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { TimerSessionDto, ActiveTimerState, CreateTimerSessionDto } from '../models/timer.models';
import { TimerApiService } from '../services/timer.api.service';
import { BehaviorCategory } from '@shared/models/enums';
import { calculateCoins } from '@shared/utils/coins.util';
import { AuthService } from '@core/auth/auth.service';

interface TimerStoreState {
  sessions:     TimerSessionDto[];
  activeTimer:  ActiveTimerState;
  isLoading:    boolean;
  error:        string | null;
}

const STORAGE_KEY = 'sb_active_timer';

function loadInitialActiveTimer(): ActiveTimerState {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Validate structure roughly
      if (typeof parsed.isRunning === 'boolean') {
        return parsed as ActiveTimerState;
      }
    } catch {}
  }
  return {
    isRunning: false,
    startTime: null,
    elapsedSecs: 0,
    behaviorType: BehaviorCategory.Good, // Default to studying/focusing
  };
}

const initialState: TimerStoreState = {
  sessions:     [],
  activeTimer:  loadInitialActiveTimer(),
  isLoading:    false,
  error:        null,
};

export const TimerStore = signalStore(
  { providedIn: 'root' }, // Important: Root scope so timer runs in background
  withState(initialState),
  withComputed(({ sessions, activeTimer }) => ({
    allSessions: computed(() => sessions()),
    currentTimer: computed(() => activeTimer()),
    todaysSessions: computed(() => {
      const today = new Date().toDateString();
      return sessions().filter(s => new Date(s.startTime).toDateString() === today);
    }),
    todaysTotalSecs: computed(() => {
      const today = new Date().toDateString();
      return sessions()
        .filter(s => new Date(s.startTime).toDateString() === today)
        .reduce((sum, s) => sum + s.duration, 0);
    }),
  })),
  withMethods((store, api = inject(TimerApiService), auth = inject(AuthService)) => {
    
    // Auto-save active timer to sessionStorage whenever it changes
    effect(() => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store.activeTimer()));
    });

    return {
      loadAll: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            api.getAll().pipe(
              tapResponse({
                next: (sessions) => patchState(store, { sessions, isLoading: false }),
                error: (err: any) => patchState(store, { error: err.message, isLoading: false }),
              }),
            ),
          ),
        ),
      ),

      setBehavior: (behaviorType: number) => {
        patchState(store, (state) => ({
          activeTimer: { ...state.activeTimer, behaviorType }
        }));
      },

      startTimer: () => {
        const state = store.activeTimer();
        if (state.isRunning) return;

        patchState(store, {
          activeTimer: {
            ...state,
            isRunning: true,
            startTime: state.startTime || new Date().toISOString(),
          }
        });
      },

      pauseTimer: () => {
        patchState(store, (state) => ({
          activeTimer: { ...state.activeTimer, isRunning: false }
        }));
      },

      tick: () => {
        const state = store.activeTimer();
        if (!state.isRunning) return;
        
        patchState(store, {
          activeTimer: { ...state, elapsedSecs: state.elapsedSecs + 1 }
        });
      },

      stopAndSave: rxMethod<void>(
        pipe(
          switchMap(() => {
            const state = store.activeTimer();
             // Prevent saving if less than 1 minute, as it's trivial
            if (state.elapsedSecs < 60) {
               patchState(store, {
                 activeTimer: { isRunning: false, startTime: null, elapsedSecs: 0, behaviorType: BehaviorCategory.Good }
               });
               // Return empty observable to short circuit
               return [];
            }

            const endTime = new Date().toISOString();
            const coinsEarned = calculateCoins(state.elapsedSecs, state.behaviorType);
            
            const dto: CreateTimerSessionDto = {
              startTime: state.startTime!,
              endTime,
              duration: state.elapsedSecs,
              behaviorType: state.behaviorType,
              coinsEarned
            };

            // Reset UI immediately
            patchState(store, {
               activeTimer: { isRunning: false, startTime: null, elapsedSecs: 0, behaviorType: BehaviorCategory.Good }
            });

            // Optimistically update wallet if needed (simplified here, auth store handles global balance)
            const newBalance = auth.coinBalance() + coinsEarned;
            auth.updateCoinBalance(newBalance);

            // Persist to backend
            return api.create(dto).pipe(
              tapResponse({
                next: (session) => patchState(store, (s) => ({ sessions: [session, ...s.sessions] })),
                error: () => { /* Handle rollback if necessary */ }
              })
            );
          })
        )
      ),

      discardTimer: () => {
        patchState(store, {
          activeTimer: { isRunning: false, startTime: null, elapsedSecs: 0, behaviorType: BehaviorCategory.Good }
        });
      },

      removeSession: (id: string) => {
        patchState(store, (state) => ({
          sessions: state.sessions.filter(s => s.id !== id)
        }));
        api.delete(id).subscribe();
      }
    };
  })
);
