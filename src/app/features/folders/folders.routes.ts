import { Routes } from '@angular/router';

export const FOLDERS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./folders.component').then(m => m.FoldersComponent) },
];
