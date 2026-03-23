import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { PlantStoreApiService } from '../services/plant-store.api.service';
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
  withMethods((store, api = inject(PlantStoreApiService), auth = inject(AuthService), toast = inject(ToastService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { isLoading: true, error: null });
          console.log('Fetching store data...');
        }),
        concatMap(() => forkJoin({
          availableData: api.getAvailablePlants(),
          gardenData: api.getGarden()
        }).pipe(
          map(({ availableData, gardenData }) => {
            const baseUrl = environment.apiUrl;
            const fixUrl = (u?: string): string => {
              if (!u) return '';
              if (u.startsWith('http')) return u;
              return u.startsWith('/') ? `${baseUrl}${u}` : `${baseUrl}/${u}`;
            };

            // Handle GardenSummaryDto or UserPlantDto[]
            const gardenArray: UserPlantDto[] = Array.isArray(gardenData) 
              ? gardenData 
              : (gardenData as unknown as GardenSummaryDto)?.plants || [];
            
            const summary = Array.isArray(gardenData) ? null : gardenData as unknown as GardenSummaryDto;

            return {
              available: (availableData || []).map((p: PlantDto) => ({ ...p, imageUrl: fixUrl(p.imageUrl) })),
              garden: gardenArray.map((p: UserPlantDto) => ({ ...p, plantImageUrl: fixUrl(p.plantImageUrl) })),
              summary
            };
          }),
          tap(({ available, garden, summary }) => {
            patchState(store, { available, garden, summary, isLoading: false });
            console.log('✅ Data loaded successfully:', { available, garden, summary });
          }),
          catchError((e: any) => {
            const errorMsg = e.message || e.statusText || 'Unknown error';
            patchState(store, { isLoading: false, error: errorMsg });
            console.error('❌ Data loading failed:', e);
            return of(null);
          })
        ))
      )
    ),
    async purchase(plantId: string): Promise<void> {
      try {
        const userPlant = await firstValueFrom(api.purchase({ plantId }));
        patchState(store, { garden: [...store.garden(), userPlant] });
        toast.success('Plant purchased! 🌱');
        await auth.refreshUserProfile(); // Update coin balance
      } catch (e: unknown) { toast.error((e as { message: string }).message ?? 'Failed to purchase'); }
    },
    async waterPlant(id: string): Promise<void> { toast.success('Plant watered! 💧'); },
    async plantSeed(id: string): Promise<void> { toast.success('Seed planted! 🌱'); },
  })),
);
