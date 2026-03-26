import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { SettingsApiService } from '../services/settings.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { UserSettingsDto } from '@shared/models/auth.models';
import { firstValueFrom } from 'rxjs';

interface SettingsState {
  userSettings: UserSettingsDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  userSettings: null,
  isLoading: false,
  error: null,
};

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ userSettings }) => ({
    hasSettings: computed(() => userSettings() !== null),
  })),
  withMethods((
    store,
    api = inject(SettingsApiService),
    toast = inject(ToastService)
  ) => ({
    async loadSettings(): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const result = await firstValueFrom(api.getSettings());
        patchState(store, { userSettings: result, isLoading: false, error: null });
      } catch (e: unknown) {
        const error = e as { message?: string };
        patchState(store, { isLoading: false, error: error.message ?? 'Unknown error' });
      }
    },
    async updateSettings(dto: UserSettingsDto): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const result = await firstValueFrom(api.updateSettings(dto));
        patchState(store, { userSettings: result, isLoading: false, error: null });
        toast.success('Settings updated successfully');
      } catch (e: unknown) {
        const error = e as { message?: string };
        patchState(store, { isLoading: false, error: error.message ?? 'Unknown error' });
        toast.error('Failed to update settings');
        throw e;
      }
    }
  }))
);
