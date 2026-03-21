import { Routes } from '@angular/router';

export const FOLDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/folder-list/folder-list.component').then(m => m.FolderListComponent),
  }
];
