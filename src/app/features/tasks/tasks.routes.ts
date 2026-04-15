import { Routes } from '@angular/router';

export const TASKS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./tasks.component').then(m => m.TasksComponent) },
  { path: 'archived', loadComponent: () => import('./archived/archived-tasks.component').then(m => m.ArchivedTasksComponent) },
  { path: ':id', loadComponent: () => import('./task-detail/task-detail.component').then(m => m.TaskDetailComponent) },
];
