import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, delay } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { TaskDto, TaskQueryParams } from '../models/task.models';
import { TasksApiService } from '../services/tasks.api.service';
import { TaskStatus } from '@shared/models/enums';

interface TasksState {
  tasks:      TaskDto[];
  isLoading:  boolean;
  error:      string | null;
  filters:    TaskQueryParams;
}

const initialState: TasksState = {
  tasks:      [],
  isLoading:  false,
  error:      null,
  filters:    { archived: false },
};

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ tasks, filters }) => ({
    allTasks:       computed(() => tasks()),
    todoTasks:      computed(() => tasks().filter(t => t.status === TaskStatus.Todo)),
    inProgressTasks: computed(() => tasks().filter(t => t.status === TaskStatus.InProgress)),
    doneTasks:      computed(() => tasks().filter(t => t.status === TaskStatus.Done)),
    activeFilters:  computed(() => filters()),
  })),
  withMethods((store, api = inject(TasksApiService)) => ({
    loadAll: rxMethod<TaskQueryParams | void>(
      pipe(
        tap((params) => {
          if (params) patchState(store, { filters: { ...store.filters(), ...params } });
          patchState(store, { isLoading: true, error: null });
        }),
        // slight delay to prevent flicker on rapid filter changes
        delay(150),
        switchMap(() =>
          api.getAll(store.filters()).pipe(
            tapResponse({
              next:  (tasks) => patchState(store, { tasks, isLoading: false }),
              error: (err: any) => patchState(store, { error: err.message, isLoading: false }),
            }),
          ),
        ),
      ),
    ),
    setFilters: (filters: TaskQueryParams) => {
      patchState(store, { filters: { ...store.filters(), ...filters } });
    },
    addTask: (task: TaskDto) => {
      patchState(store, (state) => ({ tasks: [...state.tasks, task] }));
    },
    updateTask: (updated: TaskDto) => {
      patchState(store, (state) => ({
        tasks: state.tasks.map(t => t.id === updated.id ? updated : t)
      }));
    },
    removeTask: (id: string) => {
      patchState(store, (state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      }));
    },
    optimisticStatusChange: (id: string, status: number) => {
       patchState(store, (state) => ({
         tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
       }));
    }
  }))
);
