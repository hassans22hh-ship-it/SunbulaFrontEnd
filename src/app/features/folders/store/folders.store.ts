import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, filter, map } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { FolderDto } from '../models/folder.models';
import { FoldersApiService } from '../services/folders.api.service';

interface FoldersState {
  folders:   FolderDto[];
  isLoading: boolean;
  error:     string | null;
}

const initialState: FoldersState = {
  folders: [],
  isLoading: false,
  error: null,
};

export const FoldersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ folders }) => ({
    allFolders: computed(() => folders()),
    totalFolders: computed(() => folders().length),
  })),
  withMethods((store, api = inject(FoldersApiService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          api.getAll().pipe(
            tapResponse({
              next: (folders) => patchState(store, { folders, isLoading: false }),
              error: (err: any) => patchState(store, { error: err.message, isLoading: false }),
            }),
          ),
        ),
      ),
    ),
    addFolder: (folder: FolderDto) => {
      patchState(store, (state) => ({ folders: [...state.folders, folder] }));
    },
    updateFolder: (updated: FolderDto) => {
      patchState(store, (state) => ({
        folders: state.folders.map(f => f.id === updated.id ? updated : f)
      }));
    },
    removeFolder: (id: string) => {
      patchState(store, (state) => ({
        folders: state.folders.filter(f => f.id !== id)
      }));
    }
  }))
);
