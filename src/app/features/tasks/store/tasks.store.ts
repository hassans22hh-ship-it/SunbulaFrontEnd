import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { TasksApiService } from '../services/tasks.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { TaskDto, CreateTaskDto, UpdateTaskDto, TaskQueryParams } from '@shared/models/task.models';
import { TaskStatus } from '@shared/models/enums';
import { firstValueFrom } from 'rxjs';

interface TasksState {
  tasks:     TaskDto[];
  isLoading: boolean;
  error:     string | null;
  filter:    TaskQueryParams;
}

const initialState: TasksState = {
  tasks:     [],
  isLoading: false,
  error:     null,
  filter:    {},
};

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ tasks }) => ({
    activeTasks:    computed(() => tasks().filter(t => t.status === TaskStatus.Active && !t.isArchived)),
    completedTasks: computed(() => tasks().filter(t => t.status === TaskStatus.Completed)),
    archivedTasks:  computed(() => tasks().filter(t => t.isArchived)),
    count:          computed(() => tasks().length),
  })),
  withMethods((store, api = inject(TasksApiService), toast = inject(ToastService)) => ({
    async load(params?: TaskQueryParams): Promise<void> {
      patchState(store, { isLoading: true, error: null, filter: params ?? {} });
      try {
        const tasks = await firstValueFrom(api.getAll(params));
        patchState(store, { tasks, isLoading: false });
      } catch (e: unknown) {
        patchState(store, { isLoading: false, error: (e as { message: string }).message });
      }
    },
    async create(dto: CreateTaskDto): Promise<void> {
      try {
        const task = await firstValueFrom(api.create(dto));
        patchState(store, { tasks: [...store.tasks(), task] });
        toast.success('Task created');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async update(id: string, dto: UpdateTaskDto): Promise<void> {
      try {
        const updated = await firstValueFrom(api.update(id, dto));
        patchState(store, { tasks: store.tasks().map(t => t.id === id ? updated : t) });
        toast.success('Task updated');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async remove(id: string): Promise<void> {
      try {
        await firstValueFrom(api.delete(id));
        patchState(store, { tasks: store.tasks().filter(t => t.id !== id) });
        toast.success('Task deleted');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async complete(id: string): Promise<void> {
      try {
        const updated = await firstValueFrom(api.complete(id));
        patchState(store, { tasks: store.tasks().map(t => t.id === id ? updated : t) });
        toast.success('Task completed ✅');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async archive(id: string): Promise<void> {
      try {
        const updated = await firstValueFrom(api.archive(id));
        patchState(store, { tasks: store.tasks().map(t => t.id === id ? updated : t) });
        toast.success('Task archived');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async restore(id: string): Promise<void> {
      try {
        const updated = await firstValueFrom(api.restore(id));
        patchState(store, { tasks: store.tasks().map(t => t.id === id ? updated : t) });
        toast.success('Task restored');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
  })),
);
