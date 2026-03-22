import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { TasksStore } from '../../store/tasks.store';
import { FoldersStore } from '@features/folders/store/folders.store';
import { TasksApiService } from '../../services/tasks.api.service';
import { TaskStatus } from '@shared/models/enums';
import { TaskDto, CreateTaskDto, UpdateTaskDto, TaskQueryParams } from '../../models/task.models';
import { ToastService } from '@shared/ui/toast/toast.service';
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
  imports: [
    DragDropModule,
    SbButtonComponent,
    SbSpinnerComponent,
    SbEmptyStateComponent,
    SbConfirmDialogComponent,
    TaskCardComponent,
    TaskFormComponent,
    TaskFilterBarComponent,
    AnimateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export class TaskListComponent implements OnInit {
  protected readonly store        = inject(TasksStore);
  protected readonly foldersStore = inject(FoldersStore);
  protected readonly api          = inject(TasksApiService);
  private   readonly toast        = inject(ToastService);

  readonly TaskStatus = TaskStatus;

  showForm     = signal(false);
  selectedTask = signal<TaskDto | null>(null);
  taskToDelete = signal<TaskDto | null>(null);

  ngOnInit(): void {
    if (this.foldersStore.allFolders().length === 0) {
      this.foldersStore.loadAll();
    }
    this.store.loadAll();
  }

  onFiltersChanged(filters: TaskQueryParams): void {
    this.store.setFilters(filters);
    this.store.loadAll();
  }

  drop(event: CdkDragDrop<TaskDto[]>, newStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      this.store.optimisticStatusChange(task.id, newStatus);

      this.api.changeStatus(task.id, newStatus).subscribe({
        next: (updated) => {
          this.store.updateTask(updated);
          if (newStatus === TaskStatus.Done) {
            this.toast.success('Task completed! Great job.');
          }
        },
        error: () => {
          this.store.optimisticStatusChange(task.id, task.status);
          this.toast.error('Failed to change task status');
        }
      });
    }
  }

  openForm(task: TaskDto | null = null): void {
    this.selectedTask.set(task);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedTask.set(null);
  }

  onFormSave(event: { dto: CreateTaskDto | UpdateTaskDto, isEdit: boolean }): void {
    const { dto, isEdit } = event;
    const current = this.selectedTask();
    this.closeForm();

    if (isEdit && current) {
      this.api.update(current.id, dto as UpdateTaskDto).subscribe({
        next: (res) => {
          this.store.updateTask(res);
          this.toast.success('Task updated');
        }
      });
    } else {
      this.api.create(dto as CreateTaskDto).subscribe({
        next: (res) => {
          this.store.addTask(res);
          this.toast.success('Task created');
        }
      });
    }
  }

  confirmDelete(task: TaskDto): void { this.taskToDelete.set(task); }

  onDelete(): void {
    const task = this.taskToDelete();
    if (!task) return;
    this.taskToDelete.set(null);
    this.store.removeTask(task.id);
    this.api.delete(task.id).subscribe({
      error: () => this.store.addTask(task)
    });
  }
}
