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
  template: `
    <div class="page-container h-full flex flex-col pt-6 pb-6" sbPage>
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 shrink-0" sbAnimate="slideLeft">
        <div>
          <h1 class="section-title">Tasks Board</h1>
          <p class="text-subtle mt-1 text-sm">Manage your workflow and productivity.</p>
        </div>
        <input type="hidden" [value]="foldersStore.allFolders().length"> <!-- Preemptively load folders if empty? -->
        <sb-button (clicked)="openForm()">
          <span style="font-size: 1.2em; line-height: 1;">+</span> New Task
        </sb-button>
      </div>

      <!-- Filters -->
      <div class="mb-6 shrink-0" sbAnimate="fadeUp">
        <sb-task-filter-bar
          [folders]="foldersStore.allFolders()"
          (filtersChanged)="onFiltersChanged($event)"
        />
      </div>

      <!-- Main Board Area -->
      @if (store.isLoading() && store.allTasks().length === 0) {
        <div class="flex-1 flex items-center justify-center"><sb-spinner /></div>
      } @else if (store.error()) {
        <div class="flex-1">
          <sb-empty-state icon="⚠️" title="Failed to load tasks" [message]="store.error()!" [showRetry]="true" (retry)="store.loadAll()" />
        </div>
      } @else {
        <div class="kanban-board flex-1 flex gap-6 overflow-x-auto pb-4" cdkDropListGroup sbAnimate="fadeUp">
          
          <!-- Todo Column -->
          <div class="kanban-column flex flex-col flex-1 min-w-[300px] max-w-[400px] bg-surface-2 rounded-xl p-3 border border-border">
            <h3 class="column-header flex justify-between items-center mb-3 px-2 font-semibold text-text">
              <span class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-slate-400"></div> To Do</span>
              <span class="count-badge text-subtle text-xs bg-surface px-2 py-0.5 rounded-full border border-border">{{ store.todoTasks().length }}</span>
            </h3>
            <div 
              class="task-drop-list flex-1 overflow-y-auto flex flex-col gap-3 min-h-[150px]"
              id="col-0"
              cdkDropList
              [cdkDropListData]="store.todoTasks()"
              (cdkDropListDropped)="drop($event, TaskStatus.Todo)"
            >
              @for (task of store.todoTasks(); track task.id) {
                <sb-task-card [task]="task" cdkDrag (cardClicked)="openForm(task)" (menuClicked)="confirmDelete(task)" />
              }
              @if (store.todoTasks().length === 0) {
                <div class="text-center text-subtle text-sm py-8 border-2 border-dashed border-border rounded-lg mt-2">No tasks</div>
              }
            </div>
          </div>

          <!-- In Progress Column -->
          <div class="kanban-column flex flex-col flex-1 min-w-[300px] max-w-[400px] bg-surface-2 rounded-xl p-3 border border-border">
            <h3 class="column-header flex justify-between items-center mb-3 px-2 font-semibold text-text">
              <span class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-primary animate-pulse"></div> In Progress</span>
              <span class="count-badge text-subtle text-xs bg-surface px-2 py-0.5 rounded-full border border-border">{{ store.inProgressTasks().length }}</span>
            </h3>
            <div 
              class="task-drop-list flex-1 overflow-y-auto flex flex-col gap-3 min-h-[150px]"
              id="col-1"
              cdkDropList
              [cdkDropListData]="store.inProgressTasks()"
              (cdkDropListDropped)="drop($event, TaskStatus.InProgress)"
            >
              @for (task of store.inProgressTasks(); track task.id) {
                <sb-task-card [task]="task" cdkDrag (cardClicked)="openForm(task)" (menuClicked)="confirmDelete(task)" />
              }
            </div>
          </div>

          <!-- Done Column -->
          <div class="kanban-column flex flex-col flex-1 min-w-[300px] max-w-[400px] bg-surface-2 rounded-xl p-3 border border-border opacity-90">
            <h3 class="column-header flex justify-between items-center mb-3 px-2 font-semibold text-text">
              <span class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-success"></div> Done</span>
              <span class="count-badge text-subtle text-xs bg-surface px-2 py-0.5 rounded-full border border-border">{{ store.doneTasks().length }}</span>
            </h3>
            <div 
              class="task-drop-list flex-1 overflow-y-auto flex flex-col gap-3 min-h-[150px]"
              id="col-2"
              cdkDropList
              [cdkDropListData]="store.doneTasks()"
              (cdkDropListDropped)="drop($event, TaskStatus.Done)"
            >
              @for (task of store.doneTasks(); track task.id) {
                <sb-task-card [task]="task" cdkDrag (cardClicked)="openForm(task)" (menuClicked)="confirmDelete(task)" />
              }
            </div>
          </div>

        </div>
      }

      <!-- Form logic -->
      @if (showForm()) {
        <sb-task-form
          [task]="selectedTask()"
          [folders]="foldersStore.allFolders()"
          (saved)="onFormSave($event)"
          (cancelled)="closeForm()"
        />
      }

      <!-- Delete logic (Using menu event on card temporarily for demo) -->
      @if (taskToDelete()) {
        <sb-confirm-dialog
          title="Delete Task"
          message="Are you sure you want to delete '{{ taskToDelete()?.title }}'?"
          confirmLabel="Delete"
          [destructive]="true"
          (confirmed)="onDelete()"
          (cancelled)="taskToDelete.set(null)"
        />
      }
    </div>
  `,
  styles: [`
    .cdk-drag-preview {
      box-shadow: var(--shadow-xl);
      transform: scale(1.02);
      border-radius: var(--radius-lg);
      cursor: grabbing !important;
    }
    .cdk-drag-placeholder { opacity: 0.3; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .task-drop-list.cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .bg-surface-2 { background: var(--color-surface-2); }
    .text-subtle { color: var(--color-text-muted); }
    .text-text { color: var(--color-text); }
  `]
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
    // Ensure folders are loaded for selectors
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
      // Re-ordering within the same column (not persisted in this simplified demo, but updates UI)
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between columns
      const task = event.previousContainer.data[event.previousIndex];
      // Optimistic update
      this.store.optimisticStatusChange(task.id, newStatus);
      
      this.api.changeStatus(task.id, newStatus).subscribe({
        next: (updated) => {
          this.store.updateTask(updated); // Sync final server representation
          if (newStatus === TaskStatus.Done) {
            this.toast.success('Task completed! Great job.');
          }
        },
        error: () => {
          // Rollback on failure
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
      const updateDto = dto as UpdateTaskDto;
      
      // We do a full fetch-back on edit here to keep simplicity
      this.api.update(current.id, updateDto).subscribe({
        next: (res) => {
          this.store.updateTask(res);
          this.toast.success('Task updated');
        }
      });
    } else {
      const createDto = dto as CreateTaskDto;
      this.api.create(createDto).subscribe({
        next: (res) => {
          this.store.addTask(res);
          this.toast.success('Task created');
        }
      });
    }
  }

  confirmDelete(task: TaskDto): void {
    this.taskToDelete.set(task);
  }

  onDelete(): void {
    const task = this.taskToDelete();
    if (!task) return;
    this.taskToDelete.set(null);

    this.store.removeTask(task.id); // Optimistic
    this.api.delete(task.id).subscribe({
        error: () => this.store.addTask(task) // Revert
    });
  }
}
