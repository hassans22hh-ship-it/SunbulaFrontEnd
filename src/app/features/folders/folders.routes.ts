import { Routes } from '@angular/router';

export const FOLDERS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./folders-page.component').then(m => m.FoldersPageComponent) },

];
