import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { PlantApiService } from '../services/plant.api.service';
import { GardenApiService } from '../services/garden.api.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { PlantDto, UserPlantDto, GardenSummaryDto } from '@shared/models/plant.models';
import { GrowthStage, PlantLevel } from '@shared/models/enums';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';

interface PlantState {
  available: PlantDto[];
  garden: UserPlantDto[];
  summary: GardenSummaryDto | null;
  selectedLevel: PlantLevel | null;
  isLoading: boolean;
  error: string | null;
}

export const PlantStoreStore = signalStore(
  withState<PlantState>({
    available: [],
    garden: [],
    summary: null,
    selectedLevel: null,
    isLoading: false,
    error: null,
  }),
  withComputed(({ garden, available, selectedLevel }) => ({
    gardenCount: computed(() => garden().length),
    allMyPlants: computed(() => garden()),
    seedInventory: computed(() => garden().filter(p => p.currentStage === GrowthStage.Seed)),
    plantedPlants: computed(() => garden().filter(p => p.currentStage !== GrowthStage.Seed)),
    filteredAvailable: computed(() => {
      const level = selectedLevel();
      const all = available();
      if (level === null) return all;
      return all.filter(p => p.level === level);
    }),
  })),
  withMethods((store,
    plantApi = inject(PlantApiService),
    gardenApi = inject(GardenApiService),
    auth = inject(AuthService),
    toast = inject(ToastService)) => ({

    async loadAll(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const availableData = await firstValueFrom(plantApi.getAll());
        const gardenData = await firstValueFrom(gardenApi.getGarden());

        const baseUrl = environment.apiUrl;
        const fixUrl = (u?: string): string => {
          if (!u) return '';
          if (u.startsWith('http')) return u;
          return u.startsWith('/') ? `${baseUrl}${u}` : `${baseUrl}/${u}`;
        };

        const summary = gardenData;
        const gardenArray = summary?.plants || [];

        patchState(store, {
          available: (availableData || []).map((p: PlantDto) => ({ ...p, imageUrl: fixUrl(p.imageUrl) })),
          garden: gardenArray.map((p: UserPlantDto) => ({ ...p, plantImageUrl: fixUrl(p.plantImageUrl) })),
          summary,
          isLoading: false
        });
      } catch (e: unknown) {
        const error = e as { message?: string; statusText?: string };
        patchState(store, { isLoading: false, error: error.message || 'Unknown error' });
      }
    },

    setLevelFilter(level: PlantLevel | null): void {
      patchState(store, { selectedLevel: level });
    },

    async purchase(plantId: string, price: number): Promise<void> {
      try {
        auth.updateCoinBalance(Math.max(0, auth.coinBalance() - price));
        const userPlant = await firstValueFrom(gardenApi.purchase({ plantId }));
        patchState(store, { garden: [...store.garden(), userPlant] });
        toast.success('Plant purchased! 🌱');
        // Refresh profile + full garden summary to keep stats in sync
        await auth.refreshUserProfile();
        await this.refreshGardenSummary();
      } catch (e: unknown) {
        toast.error((e as { message: string }).message ?? 'Failed to purchase');
        await auth.refreshUserProfile();
      }
    },

    async waterPlant(id: string, coinsSpent: number): Promise<void> {
      try {
        auth.updateCoinBalance(Math.max(0, auth.coinBalance() - coinsSpent));
        const updated = await firstValueFrom(gardenApi.grow(id, coinsSpent));
        patchState(store, {
          garden: store.garden().map(p => p.id === id ? updated : p)
        });
        toast.success(`Plant watered! Spent ${coinsSpent} 🪙`);
        // Refresh to keep summary stats accurate
        await auth.refreshUserProfile();
        await this.refreshGardenSummary();
      } catch (e: unknown) {
        toast.error('Failed to water plant');
        await auth.refreshUserProfile();
      }
    },

    async plantSeed(id: string, coinsSpent: number): Promise<void> {
      try {
        if (coinsSpent > 0) auth.updateCoinBalance(Math.max(0, auth.coinBalance() - coinsSpent));
        const updated = await firstValueFrom(gardenApi.grow(id, coinsSpent));
        patchState(store, {
          garden: store.garden().map(p => p.id === id ? updated : p)
        });
        toast.success('Seed planted! 🌱');
        await auth.refreshUserProfile();
        await this.refreshGardenSummary();
      } catch (e: unknown) {
        toast.error('Failed to plant seed');
        await auth.refreshUserProfile();
      }
    },

    /** Refresh only the garden summary (keeps store.available untouched) */
    async refreshGardenSummary(): Promise<void> {
      try {
        const gardenData = await firstValueFrom(gardenApi.getGarden());
        const baseUrl = environment.apiUrl;
        const fixUrl = (u?: string): string => {
          if (!u) return '';
          if (u.startsWith('http')) return u;
          return u.startsWith('/') ? `${baseUrl}${u}` : `${baseUrl}/${u}`;
        };
        const gardenArray = gardenData?.plants || [];
        patchState(store, {
          garden: gardenArray.map((p: UserPlantDto) => ({ ...p, plantImageUrl: fixUrl(p.plantImageUrl) })),
          summary: gardenData,
        });
      } catch {
        // Silently fail — data will be stale but not broken
      }
    },
  })),
);
