import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, forkJoin } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

import { PlantDto, UserPlantDto } from '../models/plant-store.models';
import { PlantStoreApiService } from '../services/plant-store.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';

interface PlantStoreState {
  catalog:  PlantDto[];
  myGarden: UserPlantDto[];
  isLoading: boolean;
  error:     string | null;
}

const initialState: PlantStoreState = {
  catalog:  [],
  myGarden: [],
  isLoading: false,
  error:     null,
};

export const PlantStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ catalog, myGarden }) => ({
    allPlants:      computed(() => catalog()),
    allMyPlants:    computed(() => myGarden()),
    plantedPlants:  computed(() => myGarden().filter(p => p.isPlanted)),
    seedInventory:  computed(() => myGarden().filter(p => !p.isPlanted)),
  })),
  withMethods((
    store,
    api = inject(PlantStoreApiService),
    toast = inject(ToastService)
  ) => ({
    
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          forkJoin({
            catalog: api.getAllPlants(),
            garden:  api.getMyGarden()
          }).pipe(
            tapResponse({
              next: (data) => patchState(store, {
                catalog: data.catalog,
                myGarden: data.garden,
                isLoading: false
              }),
              error: (err: any) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    purchasePlant: rxMethod<string>(
      pipe(
        switchMap((plantId) => api.purchasePlant(plantId).pipe(
          tapResponse({
            next: (userPlant) => {
              patchState(store, (s) => ({ myGarden: [...s.myGarden, userPlant] }));
              toast.success('Purchase successful! Plant added to your inventory.');
            },
            error: console.error
          })
        ))
      )
    ),

    plantSeed: rxMethod<string>(
      pipe(
        switchMap((userPlantId) => api.plantSeed(userPlantId).pipe(
          tapResponse({
            next: (updatedPlant) => {
              patchState(store, (s) => ({
                myGarden: s.myGarden.map(p => p.id === userPlantId ? updatedPlant : p)
              }));
              toast.success('Seed planted successfully in your garden.');
            },
            error: console.error
          })
        ))
      )
    ),

    waterPlant: rxMethod<string>(
      pipe(
        switchMap((userPlantId) => api.waterPlant(userPlantId).pipe(
          tapResponse({
            next: (updatedPlant) => {
              patchState(store, (s) => ({
                myGarden: s.myGarden.map(p => p.id === userPlantId ? updatedPlant : p)
              }));
              toast.success('Plant watered! Keep it up to see it grow.');
            },
            error: console.error
          })
        ))
      )
    )

  }))
);
