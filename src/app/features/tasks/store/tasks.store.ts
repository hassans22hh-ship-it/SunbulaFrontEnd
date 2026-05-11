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

  // Pagination
  totalCount:      number;
  pageNumber:      number;
  pageSize:        number;
  totalPages:      number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;

  // Archived (dedicated)
  archivedItems:       TaskDto[];
  archivedLoading:     boolean;
  archivedPageNumber:  number;
  archivedPageSize:    number;
  archivedTotalCount:  number;
  archivedTotalPages:  number;
  archivedHasNext:     boolean;
  archivedHasPrevious: boolean;
}

const initialState: TasksState = {
  tasks:     [],
  isLoading: false,
  error:     null,
  filter:    {},

  totalCount:      0,
  pageNumber:      1,
  pageSize:        100,
  totalPages:      0,
  hasNextPage:     false,
  hasPreviousPage: false,

  archivedItems:       [],
  archivedLoading:     false,
  archivedPageNumber:  1,
  archivedPageSize:    100,
  archivedTotalCount:  0,
  archivedTotalPages:  0,
  archivedHasNext:     false,
  archivedHasPrevious: false,
};

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ tasks, filter }) => {
    // Shared inner filter function so grids update instantly
    const applyFilters = (list: TaskDto[]) => {
      const b = filter().behaviorType;
      const f = filter().folderId;
      return list.filter(t => 
        (b === undefined || t.behaviorType === b) &&
        (f === undefined || t.folderId === f)
      );
    };

    return {
      activeTasks:    computed(() => applyFilters(tasks().filter(t => t.status === TaskStatus.Active && !t.isArchived))),
      completedTasks: computed(() => applyFilters(tasks().filter(t => t.status === TaskStatus.Completed))),
      archivedTasks:  computed(() => applyFilters(tasks().filter(t => t.isArchived))),
      filteredAllTasks: computed(() => applyFilters(tasks())),
      count:          computed(() => applyFilters(tasks().filter(t => t.status === TaskStatus.Active && !t.isArchived)).length),
    };
  }),
  withMethods((store, api = inject(TasksApiService), toast = inject(ToastService)) => ({

    // ─── Load all tasks ─────────────────────────────────
    async load(params?: TaskQueryParams): Promise<void> {
      patchState(store, { isLoading: true, error: null, filter: { ...store.filter(), ...(params ?? {}) } });
      try {
        const effectiveParams = { PageSize: 100, ...params } as any;
        if (params?.behaviorType !== undefined) {
          effectiveParams.behavior = params.behaviorType;
        }
        
        const response: any = await firstValueFrom(api.getAll(effectiveParams));
        const tasks = Array.isArray(response) ? response : (response.items ?? []);
        patchState(store, {
          tasks,
          isLoading:       false,
          totalCount:      response.totalCount ?? tasks.length,
          pageNumber:      response.pageNumber ?? 1,
          totalPages:      response.totalPages ?? 1,
          hasNextPage:     response.hasNextPage ?? false,
          hasPreviousPage: response.hasPreviousPage ?? false,
        });
      } catch (e: unknown) {
        patchState(store, { isLoading: false, error: (e as { message: string }).message });
      }
    },

    // ─── Load archived tasks (paginated) ────────────────
    async loadArchived(page: number = 1, pageSize: number = 10): Promise<void> {
      patchState(store, { archivedLoading: true });
      try {
        const res = await firstValueFrom(api.getArchived({ PageNumber: page, PageSize: pageSize }));
        patchState(store, {
          archivedItems:       res.items,
          archivedLoading:     false,
          archivedPageNumber:  res.pageNumber,
          archivedPageSize:    res.pageSize,
          archivedTotalCount:  res.totalCount,
          archivedTotalPages:  res.totalPages,
          archivedHasNext:     res.hasNextPage,
          archivedHasPrevious: res.hasPreviousPage,
        });
      } catch (e: unknown) {
        patchState(store, { archivedLoading: false });
        toast.error((e as { message: string }).message);
      }
    },

    // ─── Search with pagination ─────────────────────────
    async searchTasks(query: string, page: number = 1, pageSize: number = 10): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const res = await firstValueFrom(api.search(query, { PageNumber: page, PageSize: pageSize }));
        patchState(store, {
          tasks:           res.items,
          isLoading:       false,
          totalCount:      res.totalCount,
          pageNumber:      res.pageNumber,
          totalPages:      res.totalPages,
          hasNextPage:     res.hasNextPage,
          hasPreviousPage: res.hasPreviousPage,
        });
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message);
      }
    },

    // ─── Load by folder (paginated) ─────────────────────
    async loadByFolder(folderId: string, page: number = 1, pageSize: number = 100): Promise<void> {
      patchState(store, { isLoading: true, filter: { ...store.filter(), folderId: undefined } });
      try {
        const res: any = await firstValueFrom(api.getByFolder(folderId, { PageNumber: page, PageSize: pageSize }));
        const tasks = Array.isArray(res) ? res : (res.items ?? []);
        patchState(store, {
          tasks,
          isLoading:       false,
          totalCount:      res.totalCount ?? tasks.length,
          pageNumber:      res.pageNumber ?? 1,
          totalPages:      res.totalPages ?? 1,
          hasNextPage:     res.hasNextPage ?? false,
          hasPreviousPage: res.hasPreviousPage ?? false,
        });
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message);
      }
    },

    // ─── Load by category (paginated) ───────────────────
    async loadByCategory(categoryId: string, page: number = 1, pageSize: number = 10): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const res = await firstValueFrom(api.getByCategory(categoryId, { PageNumber: page, PageSize: pageSize }));
        patchState(store, {
          tasks:           res.items,
          isLoading:       false,
          totalCount:      res.totalCount,
          pageNumber:      res.pageNumber,
          totalPages:      res.totalPages,
          hasNextPage:     res.hasNextPage,
          hasPreviousPage: res.hasPreviousPage,
        });
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message);
      }
    },

    // ─── Load by behavior (paginated) ───────────────────
    async loadByBehavior(behaviorType: number, page: number = 1, pageSize: number = 10): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const res = await firstValueFrom(api.getByBehavior(behaviorType, { PageNumber: page, PageSize: pageSize }));
        patchState(store, {
          tasks:           res.items,
          isLoading:       false,
          totalCount:      res.totalCount,
          pageNumber:      res.pageNumber,
          totalPages:      res.totalPages,
          hasNextPage:     res.hasNextPage,
          hasPreviousPage: res.hasPreviousPage,
        });
      } catch (e: unknown) {
        patchState(store, { isLoading: false });
        toast.error((e as { message: string }).message);
      }
    },

    // ─── CRUD Commands ──────────────────────────────────
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

    // ─── PATCH actions (return 204 No Content) ──────────
    async complete(id: string): Promise<void> {
      try {
        await firstValueFrom(api.complete(id));
        // 204 No Content — re-fetch task to get updated state
        const updated = await firstValueFrom(api.getById(id));
        patchState(store, { tasks: store.tasks().map(t => t.id === id ? updated : t) });
        toast.success('Task completed ✅');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async archive(id: string): Promise<void> {
      try {
        await firstValueFrom(api.archive(id));
        // Remove from active list after archiving
        patchState(store, { tasks: store.tasks().filter(t => t.id !== id) });
        toast.success('Task archived');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async activate(id: string): Promise<void> {
      try {
        await firstValueFrom(api.activate(id));
        // Re-fetch task to get updated state
        const updated = await firstValueFrom(api.getById(id));
        patchState(store, { tasks: store.tasks().map(t => t.id === id ? updated : t) });
        toast.success('Task reactivated ✅');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async restore(id: string): Promise<void> {
      try {
        await firstValueFrom(api.unarchive(id));
        // Remove from archived list and re-fetch to put back into active list
        const updated = await firstValueFrom(api.getById(id));
        patchState(store, {
          archivedItems: store.archivedItems().filter(t => t.id !== id),
          tasks: [...store.tasks().filter(t => t.id !== id), updated]
        });
        toast.success('Task restored & moved to active list');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async duplicate(id: string): Promise<void> {
      try {
        const duplicated = await firstValueFrom(api.duplicate(id));
        patchState(store, { tasks: [...store.tasks(), duplicated] });
        toast.success('Task duplicated');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },

    // ─── Filter Helpers ─────────────────────────────────
    setSearch(query: string, behavior?: number): void {
      if (query) {
        this.searchTasks(query, 1, store.pageSize());
      } else {
        const newFilter = { 
          ...store.filter(), 
          search: undefined,
          behaviorType: behavior !== undefined ? behavior : store.filter().behaviorType
        };
        this.load(newFilter);
      }
    },
    setBehavior(behavior: number | undefined): void {
      patchState(store, { filter: { ...store.filter(), behaviorType: behavior } });
      if (store.tasks().length === 0) {
        this.load();
      }
    },
    setFolder(folderId: string | undefined): void {
      patchState(store, { filter: { ...store.filter(), folderId } });
      if (store.tasks().length === 0) {
        this.load();
      }
    },
  })),
);
