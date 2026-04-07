import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { TasksStore } from '../../store/tasks.store';
import { FoldersStore } from '@features/folders/store/folders.store';
import { TaskStatus } from '@shared/models/enums';
import { TaskDto, CreateTaskDto, UpdateTaskDto, TaskQueryParams } from '@shared/models/task.models';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskFilterBarComponent } from '../task-filter-bar/task-filter-bar.component';
import { AnimateDirective } from '@shared/directives/animate.directive';

@Component({
  selector: 'sb-task-list',
  standalone: true,
  imports: [DragDropModule, SbButtonComponent, SbSpinnerComponent, SbEmptyStateComponent, SbConfirmDialogComponent, TaskCardComponent, TaskFormComponent, TaskFilterBarComponent, AnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export class TaskListComponent implements OnInit {
  protected readonly store        = inject(TasksStore);
  protected readonly foldersStore = inject(FoldersStore);
  protected readonly router       = inject(Router);
  readonly TaskStatus = TaskStatus;

  showForm     = signal(false);
  selectedTask = signal<TaskDto | null>(null);
  taskToDelete = signal<TaskDto | null>(null);

  ngOnInit(): void {
    if (this.foldersStore.folders().length === 0) this.foldersStore.load();
    this.store.load();
  }

  onFiltersChanged(filters: TaskQueryParams): void {
    this.store.load(filters);
  }

  drop(event: CdkDragDrop<TaskDto[]>, newStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      if (newStatus === TaskStatus.Completed) {
        this.store.complete(task.id);
      } else if (newStatus === TaskStatus.Active) {
        this.store.restore(task.id);
      }
    }
  }

  openForm(task: TaskDto | null = null): void { this.selectedTask.set(task); this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); this.selectedTask.set(null); }

  viewTaskDetails(taskId: string): void {
    this.router.navigate(['/tasks', taskId]);
  }

  onFormSave(event: { dto: CreateTaskDto | UpdateTaskDto, isEdit: boolean }): void {
    const { dto, isEdit } = event;
    const current = this.selectedTask();
    this.closeForm();
    
    // Convert emoji null to undefined to match shared models
    const parsedDto = { ...dto, emoji: (dto as any).emoji || undefined };
    
    if (isEdit && current) this.store.update(current.id, parsedDto as UpdateTaskDto);
    else this.store.create(parsedDto as CreateTaskDto);
  }

  confirmDelete(task: TaskDto): void { this.taskToDelete.set(task); }

  onDelete(): void {
    const task = this.taskToDelete();
    if (!task) return;
    this.taskToDelete.set(null);
    this.store.remove(task.id);
  }
}
