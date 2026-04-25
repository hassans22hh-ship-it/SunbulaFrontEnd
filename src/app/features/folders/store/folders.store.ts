import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { FoldersApiService } from '../services/folders.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { FolderDto, CreateFolderDto, UpdateFolderDto } from '@shared/models/task.models';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface FoldersState {
  folders:   FolderDto[];
  isLoading: boolean;
  error:     string | null;
}

const initialState: FoldersState = {
  folders:   [],
  isLoading: false,
  error:     null,
};

export const FoldersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ folders }) => ({
    count: computed(() => folders().length),
  })),
  withMethods((store, api = inject(FoldersApiService), toast = inject(ToastService)) => ({
    async load(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const folders = await firstValueFrom(api.getAll());

        if (folders.length === 0) {
          patchState(store, { folders: [], isLoading: false });
          return;
        }

        const enriched = await firstValueFrom(
          forkJoin(
            folders.map(f =>
              api.getTasksInFolder(f.id).pipe(
                map(tasks => ({ ...f, taskCount: Array.isArray(tasks) ? tasks.length : 0 })),
                catchError(() => of({ ...f, taskCount: 0 }))
              )
            )
          )
        );

        patchState(store, { folders: enriched, isLoading: false });
      } catch (e: unknown) {
        patchState(store, { isLoading: false, error: (e as { message: string }).message });
      }
    },
    async create(dto: CreateFolderDto): Promise<void> {
      try {
        await firstValueFrom(api.create(dto));
        toast.success('Folder created');
        await this.load();
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async update(id: string, dto: UpdateFolderDto): Promise<void> {
      try {
        await firstValueFrom(api.update(id, dto));
        toast.success('Folder updated');
        await this.load();
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async remove(id: string): Promise<void> {
      try {
        await firstValueFrom(api.delete(id));
        toast.success('Folder deleted');
        await this.load();
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
  })),
);
