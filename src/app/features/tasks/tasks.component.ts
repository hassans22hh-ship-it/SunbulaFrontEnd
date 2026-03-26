import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TasksStore } from './store/tasks.store';
import { FoldersStore } from '../folders/store/folders.store';
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

@Component({
  selector: 'sb-tasks',
  standalone: true,
  imports: [
    SbButtonComponent, SbModalComponent, SbEmptyStateComponent,
    SbSpinnerComponent, SbConfirmDialogComponent,
    ReactiveFormsModule, PageTransitionDirective, TaskCardComponent, CoinsPipe,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksComponent implements OnInit {
  protected readonly store   = inject(TasksStore);
  protected readonly folders = inject(FoldersStore);
  protected readonly auth    = inject(AuthService);
  private readonly fb        = inject(FormBuilder);

  readonly showForm   = signal(false);
  readonly showDelete = signal(false);
  readonly editing    = signal<TaskDto | null>(null);
  readonly deleting   = signal<TaskDto | null>(null);
  readonly tab        = signal<'active' | 'completed' | 'archived'>('active');

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

  readonly searchCtrl = new FormControl('');

  ngOnInit(): void {
    this.store.load();
    this.folders.load();

    this.searchCtrl.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.store.setSearch(val ?? '');
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

  confirmDelete(task: TaskDto): void {
    this.deleting.set(task);
    this.showDelete.set(true);
  }

  onDelete(): void {
    const d = this.deleting();
    if (d) this.store.remove(d.id);
    this.showDelete.set(false);
  }
}
