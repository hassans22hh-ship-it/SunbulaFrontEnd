import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { PlantApiService } from '../services/plant.api.service';
import { GardenApiService } from '../services/garden.api.service';
import { AuthService } from '@core/auth/auth.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { PlantDto, UserPlantDto, GardenSummaryDto } from '@shared/models/plant.models';
import { GrowthStage } from '@shared/models/enums';
import { pipe, switchMap, tap, catchError, of, firstValueFrom, map, concatMap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { forkJoin } from 'rxjs';
import { environment } from '@env/environment';

interface PlantState { available: PlantDto[]; garden: UserPlantDto[]; summary: GardenSummaryDto | null; isLoading: boolean; error: string | null; }

export const PlantStoreStore = signalStore(
  withState<PlantState>({ available: [], garden: [], summary: null, isLoading: false, error: null }),
  withComputed(({ garden }) => ({
    gardenCount: computed(() => garden().length),
    allMyPlants: computed(() => garden()),
    seedInventory: computed(() => garden().filter(p => p.currentStage === GrowthStage.Seed)),
    plantedPlants: computed(() => garden().filter(p => p.currentStage !== GrowthStage.Seed)),
  })),
  withMethods((store, 
    plantApi = inject(PlantApiService), 
    gardenApi = inject(GardenApiService),
    auth = inject(AuthService), 
    toast = inject(ToastService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        concatMap(() => forkJoin({
          availableData: plantApi.getAll(),
          gardenData: gardenApi.getGarden()
        }).pipe(
          map(({ availableData, gardenData }) => {
            const baseUrl = environment.apiUrl;
            const fixUrl = (u?: string): string => {
              if (!u) return '';
              if (u.startsWith('http')) return u;
              return u.startsWith('/') ? `${baseUrl}${u}` : `${baseUrl}/${u}`;
            };

            const summary = Array.isArray(gardenData) ? null : gardenData as unknown as GardenSummaryDto;
            const gardenArray = Array.isArray(gardenData) 
              ? gardenData 
              : (gardenData as unknown as GardenSummaryDto)?.plants || [];

            return {
              available: (availableData || []).map((p: PlantDto) => ({ ...p, imageUrl: fixUrl(p.imageUrl) })),
              garden: gardenArray.map((p: UserPlantDto) => ({ ...p, plantImageUrl: fixUrl(p.plantImageUrl) })),
              summary
            };
          }),
          tap(({ available, garden, summary }) => {
            patchState(store, { available, garden, summary, isLoading: false });
          }),
          catchError((e: unknown) => {
            const error = e as { message?: string; statusText?: string };
            patchState(store, { isLoading: false, error: error.message || 'Unknown error' });
            return of(null);
          })
        ))
      )
    ),
    async purchase(plantId: string): Promise<void> {
      try {
        const userPlant = await firstValueFrom(gardenApi.purchase({ plantId }));
        patchState(store, { garden: [...store.garden(), userPlant] });
        toast.success('Plant purchased! 🌱');
        await auth.refreshUserProfile(); 
      } catch (e: unknown) { toast.error((e as { message: string }).message ?? 'Failed to purchase'); }
    },
    async waterPlant(id: string): Promise<void> { 
      try {
        const updated = await firstValueFrom(gardenApi.grow(id));
        patchState(store, { 
          garden: store.garden().map(p => p.id === id ? updated : p) 
        });
        toast.success('Plant watered! 💧'); 
      } catch (e: unknown) { toast.error('Failed to water plant'); }
    },
    async plantSeed(id: string): Promise<void> { 
      try {
        const updated = await firstValueFrom(gardenApi.grow(id));
        patchState(store, { 
          garden: store.garden().map(p => p.id === id ? updated : p) 
        });
        toast.success('Seed planted! 🌱');
      } catch (e: unknown) { toast.error('Failed to plant seed'); }
    },
  })),
);
