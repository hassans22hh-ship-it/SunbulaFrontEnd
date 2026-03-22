import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { TaskDto, CreateTaskDto, UpdateTaskDto } from '../../models/task.models';
import { FolderDto } from '@features/folders/models/folder.models';
import { TaskStatus, BehaviorCategory, BEHAVIOR_META } from '@shared/models/enums';
import { FolderSelectorComponent } from '../folder-selector/folder-selector.component';

const TASK_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

@Component({
  selector: 'sb-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, SbModalComponent, SbButtonComponent, FolderSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sb-modal
      [title]="task() ? 'Edit Task' : 'New Task'"
      maxWidth="500px"
      (closed)="cancelled.emit()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        
        <!-- Header: Emoji + Title -->
        <div class="flex gap-3 mb-4">
          <div class="emoji-picker w-12 flex-shrink-0">
            <input class="input-field text-center text-xl p-0 h-[46px]" type="text" formControlName="emoji" maxlength="2" placeholder="🌱">
          </div>
          <div class="flex-grow">
            <input class="input-field text-lg font-medium h-[46px]" type="text" formControlName="title" placeholder="Task title...">
            @if (form.get('title')?.touched && form.get('title')?.hasError('required')) {
              <span class="error-text">Title is required</span>
            }
          </div>
        </div>

        <!-- Folder Selection -->
        <div class="form-group mb-4">
          <label class="label-text">Folder</label>
          <sb-folder-selector formControlName="folderId" [folders]="folders()" />
        </div>

        <!-- Behavior Category Selection -->
        <div class="form-group mb-4">
          <label class="label-text">Behavior Category</label>
          <div class="grid grid-cols-2 gap-2">
            @for (b of behaviorOptions; track b.value) {
              <button
                type="button"
                class="behavior-select-btn"
                [class.selected]="form.value.behaviorType === b.value"
                (click)="form.patchValue({ behaviorType: b.value })"
              >
                <div class="flex items-center gap-2">
                   <div class="w-2 h-2 rounded-full" [style.background]="b.meta.color"></div>
                   <span>{{ b.meta.emoji }} {{ b.meta.label }}</span>
                </div>
              </button>
            }
          </div>
        </div>

        <!-- Color Selection -->
        <div class="form-group mb-6">
          <label class="label-text">Task Color</label>
          <div class="flex gap-2 flex-wrap">
            @for (color of taskColors; track color) {
              <button
                type="button"
                [style.background]="color"
                [class.selected]="form.value.color === color"
                class="color-btn"
                (click)="form.patchValue({ color: color })"
              ></button>
            }
          </div>
        </div>

        <!-- Meta info below for Edit mode -->
        @if (task()) {
          <div class="flex gap-4 mb-6">
             <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-subtle">
              <input type="checkbox" formControlName="isArchived" class="w-4 h-4 rounded">
              Archived
            </label>
          </div>
        }

        <!-- Actions -->
        <div class="flex gap-3 justify-end">
          <sb-button variant="ghost" (clicked)="cancelled.emit()">Cancel</sb-button>
          <sb-button type="submit" [disabled]="form.invalid || loading()">
            {{ task() ? 'Save Changes' : 'Create Task' }}
          </sb-button>
        </div>
      </form>
    </sb-modal>
  `,
  styles: [`
    .behavior-select-btn {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      text-align: left;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--color-text);
      transition: all 0.2s;
    }
    .behavior-select-btn:hover { background: var(--color-surface-2); }
    .behavior-select-btn.selected {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 5%, transparent);
      box-shadow: 0 0 0 1px var(--color-primary);
    }
    
    .color-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
    }
    .color-btn:hover { transform: scale(1.1); }
    .color-btn.selected {
      border-color: var(--color-surface);
      outline: 2px solid var(--color-primary);
      transform: scale(1.1);
    }
    .error-text { color: var(--color-danger); font-size: 0.8rem; margin-top: 0.25rem; display: block; }
    .text-subtle { color: var(--color-text-muted); }
  `]
})
export class TaskFormComponent implements OnInit {
  task    = input<TaskDto | null>(null);
  folders = input<FolderDto[]>([]);

  saved     = output<{ dto: CreateTaskDto | UpdateTaskDto, isEdit: boolean }>();
  cancelled = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly taskColors = TASK_COLORS;
  
  // Transform enum and meta to an array for the template
  readonly behaviorOptions = [
    BehaviorCategory.Good,
    BehaviorCategory.Neutral,
    BehaviorCategory.Negative
  ].map(value => ({ value, meta: BEHAVIOR_META[value] }));

  loading = signal(false);

  form = this.fb.group({
    title:        ['', Validators.required],
    emoji:        [''],
    color:        ['#3B82F6', Validators.required],
    behaviorType: [BehaviorCategory.Neutral, Validators.required],
    folderId:     [null as string | null],
    // Update specific fields
    status:       [TaskStatus.Todo],
    isArchived:   [false]
  });

  ngOnInit(): void {
    const t = this.task();
    if (t) {
      this.form.patchValue({
        title:        t.title,
        emoji:        t.emoji,
        color:        t.color,
        behaviorType: t.behaviorType,
        folderId:     t.folderId,
        status:       t.status,
        isArchived:   t.isArchived,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const v = this.form.getRawValue();
    let dto: CreateTaskDto | UpdateTaskDto;

    if (this.task()) {
      dto = {
        title:        v.title!,
        emoji:        v.emoji,
        color:        v.color!,
        behaviorType: v.behaviorType!,
        folderId:     v.folderId,
        status:       v.status!,
        isArchived:   v.isArchived!
      };
    } else {
      dto = {
        title:        v.title!,
        emoji:        v.emoji,
        color:        v.color!,
        behaviorType: v.behaviorType!,
        folderId:     v.folderId,
      };
    }

    this.saved.emit({ dto, isEdit: !!this.task() });
  }
}
