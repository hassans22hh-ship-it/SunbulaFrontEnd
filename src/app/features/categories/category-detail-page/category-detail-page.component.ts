import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, Input, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { CategoriesStore } from '../../tasks/store/categories.store';
import { TasksApiService } from '../../tasks/services/tasks.api.service';
import { TimeSessionApiService } from '../../timer/services/time-session.api.service';
import { TaskDto, CategoryDto } from '@shared/models/task.models';
import { TimeSessionDto } from '@shared/models/timer.models';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { TaskCardComponent } from '../../tasks/components/task-card/task-card.component';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryApiService } from '../../tasks/services/category.api.service';


import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';



@Component({
  selector: 'sb-category-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DurationPipe,
    SbButtonComponent,
    SbSpinnerComponent,
    TaskCardComponent,
    SbModalComponent,
    SbConfirmDialogComponent,
    SbEmptyStateComponent,
    ReactiveFormsModule
  ],


  templateUrl: './category-detail-page.component.html',
  styleUrl: './category-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})

export class CategoryDetailPageComponent {
  protected readonly categoriesStore = inject(CategoriesStore);
  private readonly tasksApi = inject(TasksApiService);

  private readonly timeSessionApi = inject(TimeSessionApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly categoryApi = inject(CategoryApiService);





  @Input() set id(value: string) {
    this.categoryId.set(value);
    this.loadData(value);
  }

  readonly categoryId = signal<string | null>(null);
  readonly category = signal<CategoryDto | null>(null);
  readonly categoryColor = computed(() => this.category()?.color ?? '#52B788');


  readonly tasks = signal<TaskDto[]>([]);
  readonly history = signal<TimeSessionDto[]>([]);
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
    return this.history()
      .filter(s => taskIds.has(s.taskId))
      .reduce((sum, s) => sum + (s.durationSeconds || s.durationMinutes || 0), 0);
  });

  async loadData(id: string) {
    this.isLoading.set(true);
    try {
      const [categoryRes, tasksRes, historyRes] = await Promise.all([
        firstValueFrom(this.categoryApi.getById(id)),
        firstValueFrom(this.tasksApi.getByCategory(id)),
        firstValueFrom(this.timeSessionApi.getHistory())
      ]);
      this.category.set(categoryRes);
      this.tasks.set(tasksRes.items || []);
      this.history.set(historyRes || []);
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }


  viewTaskDetails(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu.set(!this.showMenu());
  }

  openEdit(): void {
    const cat = this.category();
    if (cat) this.editForm.patchValue({ name: cat.name, color: cat.color });
    this.showEditForm.set(true);
  }


  async onSave(): Promise<void> {
    if (this.editForm.invalid) return;
    const id = this.categoryId();
    if (!id) return;
    const payload = this.editForm.getRawValue();
    console.log('Updating category:', id, payload);
    const updated = await firstValueFrom(this.categoryApi.update(id, payload));
    this.showEditForm.set(false);

    this.category.set(null);
    setTimeout(() => {
      this.category.set(updated);
    }, 0);
    await this.categoriesStore.load();
  }




  confirmDelete(): void {
    this.showDelete.set(true);
  }

  async onDelete(): Promise<void> {
    const id = this.categoryId();
    if (id) await this.categoriesStore.remove(id);
    this.router.navigate(['/tasks']);
  }
}


