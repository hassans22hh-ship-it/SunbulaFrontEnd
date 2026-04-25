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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { CategoriesStore } from './store/categories.store';
import { EmojiPickerComponent } from '@shared/ui/emoji-picker/emoji-picker.component';
import { SbBehaviorBadgeComponent } from '@shared/ui/behavior-badge/sb-behavior-badge.component';
import { RelativeDatePipe } from '@shared/pipes/relative-date.pipe';
import { DurationPipe } from '@shared/pipes/duration.pipe';

@Component({
  selector: 'sb-tasks',
  standalone: true,
  imports: [
    SbButtonComponent, SbModalComponent, SbEmptyStateComponent,
    SbSpinnerComponent, SbConfirmDialogComponent,
    ReactiveFormsModule, PageTransitionDirective, CoinsPipe,
    RouterLink, EmojiPickerComponent, SbBehaviorBadgeComponent,
    RelativeDatePipe, DurationPipe
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksComponent implements OnInit {
  protected readonly store = inject(TasksStore);
  protected readonly folders = inject(FoldersStore);
  protected readonly auth = inject(AuthService);
  protected readonly timer = inject(TimerStore);
  protected readonly categoriesStore = inject(CategoriesStore);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly showForm = signal(false);
  readonly showFolderForm = signal(false);
  readonly showCategoryForm = signal(false);
  readonly showEmojiPicker = signal(false);
  readonly showDelete = signal(false);
  readonly editing = signal<TaskDto | null>(null);
  readonly deleting = signal<TaskDto | null>(null);
  readonly tab = signal<'active' | 'completed' | 'archived' | 'all'>('active');
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly showSidebar = signal(false);

  protected readonly behaviors = [
    BehaviorCategory.Positive, BehaviorCategory.Neutral,
    BehaviorCategory.Negative, BehaviorCategory.Rest,
  ];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    emoji: [''],
    color: ['#52B788', Validators.required],
    behaviorType: [BehaviorCategory.Positive as BehaviorCategory, Validators.required],
    folderId: [''],
    categoryIds: [[] as string[]],
  });

  readonly folderForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    color: ['#52B788', Validators.required],
  });

  readonly categoryForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    color: ['#B1a', Validators.required],
  });

  readonly searchCtrl = new FormControl('');

  ngOnInit(): void {
    this.store.load();
    this.folders.load();
    this.categoriesStore.load();

    this.searchCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(val => {
      this.store.setSearch(val ?? '', this.store.filter().behaviorType);
    });
  }

  setTab(t: 'active' | 'completed' | 'archived' | 'all') {
    this.tab.set(t);
    this.showSidebar.set(false);
    if (t === 'archived') {
      this.store.loadArchived();
    } else {
      this.store.load();
    }
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({ title: '', emoji: '', color: '#52B788', behaviorType: BehaviorCategory.Positive, folderId: '', categoryIds: [] });
    this.showEmojiPicker.set(false);
    this.showForm.set(true);
  }

  openEdit(task: TaskDto): void {
    this.editing.set(task);
    this.form.patchValue({
      title: task.title, emoji: task.emoji ?? '', color: task.color,
      behaviorType: task.behaviorType, folderId: task.folderId ?? '',
      categoryIds: task.categories?.map(c => c.id) ?? []
    });
    this.showEmojiPicker.set(false);
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

  markActive(task: TaskDto): void {
    this.store.update(task.id, {
      title: task.title,
      emoji: task.emoji ?? '',
      color: task.color,
      behaviorType: task.behaviorType,
      folderId: task.folderId ?? undefined,
      categoryIds: task.categories?.map(c => c.id) ?? [],
      status: 0 // TaskStatus.Active
    } as any);
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

  openCategoryCreate(): void {
    this.categoryForm.reset({ name: '', color: '#B1a' });
    this.showCategoryForm.set(true);
  }

  onSaveCategory(): void {
    if (this.categoryForm.invalid) return;
    this.categoriesStore.create(this.categoryForm.getRawValue());
    this.showCategoryForm.set(false);
  }

  onEmojiSelected(emoji: string): void {
    this.form.patchValue({ emoji });
    this.showEmojiPicker.set(false);
  }

  toggleCategory(categoryId: string): void {
    const current = this.form.get('categoryIds')?.value ?? [];
    if (current.includes(categoryId)) {
      this.form.patchValue({ categoryIds: current.filter(id => id !== categoryId) });
    } else {
      this.form.patchValue({ categoryIds: [...current, categoryId] });
    }
  }

  // Clear all filters
  clearFilters(): void {
    this.searchCtrl.setValue('');
    this.setTab('active');
  }

  // Format elapsed for timer badge in header
  formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  getFolderCount(folderId: string): number {
    return this.store.tasks().filter(t => t.folderId === folderId && t.status === 0 && !t.isArchived).length;
  }

  // --- Inlined Task Card Logic ---
  isActive(taskId: string): boolean {
    return this.timer.activeSessions().some((s: any) => s.taskId === taskId);
  }

  isPaused(taskId: string): boolean {
    const session = this.timer.activeSessions().find((s: any) => s.taskId === taskId);
    return !!session?.isPaused;
  }

  displayElapsed(task: TaskDto): number {
    const session = this.timer.activeSessions().find((s: any) => s.taskId === task.id);
    if (session) return session.durationSeconds || 0;
    return task.totalTrackedSeconds ?? 0;
  }

  toggleTimer(event: Event, task: TaskDto): void {
    event.stopPropagation();
    if (this.isActive(task.id)) {
      const session = this.timer.activeSessions().find((s: any) => s.taskId === task.id);
      if (session) {
        if (!session.isPaused) this.timer.pauseTimer(session.id);
        else this.timer.resumeTimer(session.id);
      }
    } else {
      this.timer.start(task.id);
    }
  }

  getFolderName(folderId: string | null): string {
    if (!folderId) return '';
    return this.folders.folders().find(f => f.id === folderId)?.name || '';
  }

  getFolderColor(folderId: string | null): string {
    if (!folderId) return '#52B788';
    return this.folders.folders().find(f => f.id === folderId)?.color || '#52B788';
  }
}
