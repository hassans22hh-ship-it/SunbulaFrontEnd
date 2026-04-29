import { ChangeDetectionStrategy, Component, computed, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { FoldersStore } from '../store/folders.store';
import { TasksStore } from '../../tasks/store/tasks.store';
import { FoldersApiService } from '../services/folders.api.service';
import { TimeSessionApiService } from '../../timer/services/time-session.api.service';
import { TaskDto, FolderDto } from '@shared/models/task.models';
import { TimeSessionDto } from '@shared/models/timer.models';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { TaskCardComponent } from '../../tasks/components/task-card/task-card.component';


@Component({
  selector: 'sb-folder-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DurationPipe,
    SbButtonComponent,
    SbSpinnerComponent,
    SbModalComponent,
    SbConfirmDialogComponent,
    SbEmptyStateComponent,
    TaskCardComponent,
    ReactiveFormsModule
  ],
  templateUrl: './folder-detail-page.component.html',
  styleUrl: './folder-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FolderDetailPageComponent {
  private readonly foldersStore = inject(FoldersStore);
  private readonly tasksStore = inject(TasksStore);
  private readonly foldersApi = inject(FoldersApiService);
  private readonly timeSessionApi = inject(TimeSessionApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);


  @Input() set id(value: string) {
    this.folderId.set(value);
    this.loadData(value);
  }

  readonly folderId = signal<string | null>(null);
  readonly folder = signal<FolderDto | null>(null);
  readonly sessions = signal<TimeSessionDto[]>([]);

  readonly tasks = computed(() => {
    const id = this.folderId();
    if (!id) return [];
    return this.tasksStore.tasks().filter(t => t.folderId === id);
  });

  readonly isLoading = signal(false);
  readonly showMenu = signal(false);
  readonly showEditForm = signal(false);
  readonly showDelete = signal(false);

  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    color: ['#52B788', Validators.required],
  });

  readonly totalSeconds = computed(() => {
    const taskIds = new Set(this.tasks().map(t => t.id));
    return this.sessions()
      .filter(s => taskIds.has(s.taskId))
      .reduce((sum, s) => sum + (s.durationSeconds || s.durationMinutes || 0), 0);
  });

  readonly activeCount = computed(() => this.tasks().filter(t => !t.isArchived && t.status === 0).length);
  readonly completedCount = computed(() => this.tasks().filter(t => t.status === 1).length);
  readonly archivedCount = computed(() => this.tasks().filter(t => t.isArchived).length);

  async loadData(id: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const [folderRes, sessionsRes] = await Promise.all([
        firstValueFrom(this.foldersApi.getById(id)),
        firstValueFrom(this.timeSessionApi.getHistory()),
        this.tasksStore.load({ PageSize: 500 } as any)
      ]);
      this.folder.set(folderRes);
      this.sessions.set(Array.isArray(sessionsRes) ? sessionsRes : []);
    } catch (error) {
      console.error('Error loading folder data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }


  goBack(): void {
    this.router.navigate(['/folders']);
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu.set(!this.showMenu());
  }

  openEdit(): void {
    const f = this.folder();
    if (f) this.editForm.patchValue({ name: f.name, color: f.color });
    this.showEditForm.set(true);
  }

  async onSave(): Promise<void> {
    if (this.editForm.invalid) return;
    const id = this.folderId();
    if (!id) return;
    const updated = await firstValueFrom(this.foldersApi.update(id, this.editForm.getRawValue()));
    this.folder.set(updated);
    await this.foldersStore.load();
    this.showEditForm.set(false);
  }

  confirmDelete(): void {
    this.showDelete.set(true);
  }

  async onDelete(): Promise<void> {
    const id = this.folderId();
    if (id) await this.foldersStore.remove(id);
    this.router.navigate(['/folders']);
  }

  viewTaskDetails(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }
}
