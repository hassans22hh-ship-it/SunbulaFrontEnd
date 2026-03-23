import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { FoldersApiService } from '../services/folders.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { FolderDto, CreateFolderDto, UpdateFolderDto } from '@shared/models/task.models';
import { firstValueFrom } from 'rxjs';

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
        patchState(store, { folders, isLoading: false });
      } catch (e: unknown) {
        patchState(store, { isLoading: false, error: (e as { message: string }).message });
      }
    },
    async create(dto: CreateFolderDto): Promise<void> {
      try {
        const folder = await firstValueFrom(api.create(dto));
        patchState(store, { folders: [...store.folders(), folder] });
        toast.success('Folder created');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async update(id: string, dto: UpdateFolderDto): Promise<void> {
      try {
        const updated = await firstValueFrom(api.update(id, dto));
        patchState(store, {
          folders: store.folders().map(f => f.id === id ? updated : f),
        });
        toast.success('Folder updated');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
    async remove(id: string): Promise<void> {
      try {
        await firstValueFrom(api.delete(id));
        patchState(store, {
          folders: store.folders().filter(f => f.id !== id),
        });
        toast.success('Folder deleted');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },
  })),
);
