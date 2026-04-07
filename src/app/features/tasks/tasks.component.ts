import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TasksStore } from './store/tasks.store';
import { FoldersStore } from '../folders/store/folders.store';
import { TimerStore } from '../timer/store/timer.store';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskDto } from '@shared/models/task.models';
import { BehaviorCategory } from '@shared/models/enums';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { AuthService } from '@core/auth/auth.service';
import { TaskCardComponent } from './components/task-card/task-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'sb-tasks',
  standalone: true,
  imports: [
    SbButtonComponent, SbModalComponent, SbEmptyStateComponent,
    SbSpinnerComponent, SbConfirmDialogComponent,
    ReactiveFormsModule, PageTransitionDirective, TaskCardComponent, CoinsPipe,
    RouterLink,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksComponent implements OnInit {
  protected readonly store   = inject(TasksStore);
  protected readonly folders = inject(FoldersStore);
  protected readonly auth    = inject(AuthService);
  protected readonly timer   = inject(TimerStore);
  private readonly fb        = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router     = inject(Router);

  readonly showForm       = signal(false);
  readonly showFolderForm = signal(false);
  readonly showDelete     = signal(false);
  readonly editing        = signal<TaskDto | null>(null);
  readonly deleting       = signal<TaskDto | null>(null);
  readonly tab            = signal<'active' | 'completed' | 'archived' | 'all'>('active');
  readonly viewMode       = signal<'grid' | 'list'>('grid');

  protected readonly behaviors = [
    BehaviorCategory.Positive, BehaviorCategory.Neutral,
    BehaviorCategory.Negative, BehaviorCategory.Rest,
  ];

  readonly form = this.fb.nonNullable.group({
    title:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    emoji:        [''],
    color:        ['#52B788', Validators.required],
    behaviorType: [BehaviorCategory.Positive as BehaviorCategory, Validators.required],
    folderId:     [''],
  });

  readonly folderForm = this.fb.nonNullable.group({
    name:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    color: ['#52B788', Validators.required],
  });

  readonly searchCtrl = new FormControl('');

  ngOnInit(): void {
    this.store.load();
    this.folders.load();

    this.searchCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(val => {
      this.store.setSearch(val ?? '', this.store.filter().behaviorType);
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({ title: '', emoji: '', color: '#52B788', behaviorType: BehaviorCategory.Positive, folderId: '' });
    this.showForm.set(true);
  }

  openEdit(task: TaskDto): void {
    this.editing.set(task);
    this.form.patchValue({
      title: task.title, emoji: task.emoji ?? '', color: task.color,
      behaviorType: task.behaviorType, folderId: task.folderId ?? '',
    });
    this.showForm.set(true);
  }

  onSave(): void {
    if (this.form.invalid) return;
    const data = this.form.getRawValue();
    const dto = { ...data, folderId: data.folderId || undefined };
    const e = this.editing();
    if (e) {
      this.store.update(e.id, dto);
    } else {
      this.store.create(dto);
    }
    this.showForm.set(false);
  }

  protected onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  viewTaskDetails(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }

  protected filterByBehavior(behavior: number | undefined): void {
    this.store.setBehavior(behavior);
  }

  protected userInitials(): string {
    const u = this.auth.user();
    if (!u) return '?';
    return (u.firstName[0] ?? '') + (u.lastName[0] ?? '');
  }

  confirmDelete(task: TaskDto): void {
    this.deleting.set(task);
    this.showDelete.set(true);
  }

  onDelete(): void {
    const d = this.deleting();
    if (d) this.store.remove(d.id);
    this.showDelete.set(false);
  }

  selectFolder(folderId: string | undefined): void {
    this.store.setFolder(folderId);
  }

  openFolderCreate(): void {
    this.folderForm.reset({ name: '', color: '#52B788' });
    this.showFolderForm.set(true);
  }

  onSaveFolder(): void {
    if (this.folderForm.invalid) return;
    this.folders.create(this.folderForm.getRawValue());
    this.showFolderForm.set(false);
  }

  // BUG-09: Clear all filters
  clearFilters(): void {
    this.searchCtrl.setValue('');
    this.tab.set('active');
    this.store.load();
  }

  // BUG-09: Format elapsed for timer badge in header
  formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  getFolderCount(folderId: string): number {
    return this.store.tasks().filter(t => t.folderId === folderId && t.status === 0 && !t.isArchived).length;
  }
}
