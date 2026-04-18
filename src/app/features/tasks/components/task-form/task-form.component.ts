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
import { TaskDto, CreateTaskDto, UpdateTaskDto, FolderDto } from '@shared/models/task.models';
import { TaskStatus, BehaviorCategory, BEHAVIOR_META } from '@shared/models/enums';
import { FolderSelectorComponent } from '../folder-selector/folder-selector.component';

const TASK_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

@Component({
  selector: 'sb-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, SbModalComponent, SbButtonComponent, FolderSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent implements OnInit {
  task    = input<TaskDto | null>(null);
  folders = input<FolderDto[]>([]);

  saved     = output<{ dto: CreateTaskDto | UpdateTaskDto, isEdit: boolean }>();
  cancelled = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly taskColors = TASK_COLORS;
  readonly showEmojiPicker = signal(false);

  readonly behaviorOptions = [
    BehaviorCategory.Positive,
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
    status:       [TaskStatus.Active],
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
        emoji:        v.emoji || undefined,
        color:        v.color!,
        behaviorType: v.behaviorType!,
        folderId:     v.folderId || undefined
      };
    } else {
      dto = {
        title:        v.title!,
        emoji:        v.emoji || undefined,
        color:        v.color!,
        behaviorType: v.behaviorType!,
        folderId:     v.folderId || undefined
      };
    }

    this.saved.emit({ dto, isEdit: !!this.task() });
  }
}
