import { ChangeDetectionStrategy, Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { FoldersStore } from './store/folders.store';
import { TasksStore } from '../tasks/store/tasks.store';
import { FolderDto } from '@shared/models/task.models';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';

@Component({
  selector: 'sb-folders-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, SbButtonComponent, SbModalComponent,
    SbEmptyStateComponent, SbSpinnerComponent, SbConfirmDialogComponent,
    PageTransitionDirective, RouterLink
  ],

  templateUrl: './folders-page.component.html',
  styleUrl: './folders-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoldersPageComponent implements OnInit {
  protected readonly store = inject(FoldersStore);
  protected readonly tasksStore = inject(TasksStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly folderStats = computed(() => {
    const tasks = this.tasksStore.tasks();
    const stats: Record<string, { active: number, archived: number, completed: number, total: number }> = {};
    tasks.forEach(t => {
      if (!t.folderId) return;
      if (!stats[t.folderId]) stats[t.folderId] = { active: 0, archived: 0, completed: 0, total: 0 };
      
      stats[t.folderId].total++;
      if (t.isArchived) stats[t.folderId].archived++;
      else if (t.status === 1) stats[t.folderId].completed++;
      else stats[t.folderId].active++;
    });
    return stats;
  });

  readonly activeMenu = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly showDelete = signal(false);
  readonly editing = signal<FolderDto | null>(null);
  readonly deleting = signal<FolderDto | null>(null);

  readonly folderForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    color: ['#52B788', Validators.required],
  });

  async ngOnInit(): Promise<void> {
    await this.store.load();
    // Load ALL tasks with large page size to ensure counts are accurate
    await this.tasksStore.load({ PageSize: 500 } as any);
    console.log('Tasks loaded:', this.tasksStore.tasks().length);
    console.log('Folder stats:', this.folderStats());
  }

  getStats(folderId: string) {
    return this.folderStats()[folderId] ?? { total: 0, active: 0, completed: 0, archived: 0 };
  }

  toggleMenu(event: Event, folderId: string): void {
    event.stopPropagation();
    this.activeMenu.set(this.activeMenu() === folderId ? null : folderId);
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.activeMenu.set(null);
  }

  navigateToFolderTasks(folderId: string): void {
    this.router.navigate(['/folders', folderId]);
  }


  openCreate(): void {
    this.editing.set(null);
    this.folderForm.reset({ name: '', color: '#52B788' });
    this.showForm.set(true);
  }

  openEdit(event: Event, folder: FolderDto): void {
    event.stopPropagation();
    this.editing.set(folder);
    this.folderForm.patchValue({ name: folder.name, color: folder.color });
    this.showForm.set(true);
  }

  onSave(): void {
    if (this.folderForm.invalid) return;
    const data = this.folderForm.getRawValue();
    const e = this.editing();

    if (e) {
      this.store.update(e.id, data);
    } else {
      this.store.create(data);
    }
    this.showForm.set(false);
  }

  confirmDelete(event: Event, folder: FolderDto): void {
    event.stopPropagation();
    this.deleting.set(folder);
    this.showDelete.set(true);
  }

  onDelete(): void {
    const d = this.deleting();
    if (d) this.store.remove(d.id);
    this.showDelete.set(false);
  }
}
