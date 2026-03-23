import { Routes } from '@angular/router';
export const PLANT_STORE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./plant-store.component').then(m => m.PlantStoreComponent) },
];
