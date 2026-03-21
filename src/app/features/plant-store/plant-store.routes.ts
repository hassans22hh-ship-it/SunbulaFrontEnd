import { Routes } from '@angular/router';
import { PlantStore } from './store/plant-store.store';

export const STORE_ROUTES: Routes = [
  {
    path: '',
    providers: [PlantStore],
    children: [
      {
        path: '',
        redirectTo: 'catalog',
        pathMatch: 'full'
      },
      {
        path: 'catalog',
        loadComponent: () => import('./components/plant-catalog/plant-catalog.component').then(m => m.PlantCatalogComponent)
      },
      {
        path: 'garden',
        loadComponent: () => import('./components/my-garden/my-garden.component').then(m => m.MyGardenComponent)
      }
    ]
  }
];
