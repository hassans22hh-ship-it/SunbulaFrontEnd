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
import { FolderDto, CreateFolderDto, UpdateFolderDto } from '@shared/models/task.models';
import { ToastService } from '@shared/ui/toast/toast.service';

const PRESET_COLORS = [
  '#52B788', '#E63946', '#74B3CE', '#F4D35E', '#F4A261',
  '#A06CD5', '#EF476F', '#06D6A0', '#118AB2', '#073B4C'
];

@Component({
  selector: 'sb-folder-form',
  standalone: true,
  imports: [ReactiveFormsModule, SbModalComponent, SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sb-modal
      [title]="folder() ? 'Edit Folder' : 'New Folder'"
      maxWidth="400px"
      (closed)="cancelled.emit()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        
        <!-- Name -->
        <div class="form-group" style="margin-bottom: 1.25rem;">
          <label class="label-text">Folder Name</label>
          <input class="input-field" type="text" formControlName="name" placeholder="e.g. Work, Personal, Fitness">
          @if (form.get('name')?.touched && form.get('name')?.hasError('required')) {
            <span class="error-text" style="color: var(--color-danger); font-size: 0.8rem; margin-top: 0.25rem; display: block;">
              Name is required
            </span>
          }
        </div>

        <!-- Color Selection -->
        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label class="label-text">Folder Color</label>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            @for (color of presetColors; track color) {
              <button
                type="button"
                [style.background]="color"
                [class.selected]="form.value.color === color"
                class="color-btn"
                (click)="form.patchValue({ color: color })"
                title="Select color"
              ></button>
            }
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          <sb-button variant="ghost" (clicked)="cancelled.emit()">Cancel</sb-button>
          <sb-button type="submit" [disabled]="form.invalid || loading()">
            {{ folder() ? 'Save Changes' : 'Create Folder' }}
          </sb-button>
        </div>
      </form>
    </sb-modal>
  `,
  styles: [`
    .color-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
    }
    .color-btn:hover {
      transform: scale(1.1);
    }
    .color-btn.selected {
      border-color: var(--color-surface);
      outline: 2px solid var(--color-primary);
      transform: scale(1.1);
    }
  `]
})
export class FolderFormComponent implements OnInit {
  folder = input<FolderDto | null>(null);

  saved     = output<{ dto: CreateFolderDto | UpdateFolderDto, isEdit: boolean }>();
  cancelled = output<void>();

  private readonly fb    = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly presetColors = PRESET_COLORS;
  loading = signal(false);

  form = this.fb.group({
    name:  ['', Validators.required],
    color: ['#52B788', Validators.required],
  });

  ngOnInit(): void {
    const f = this.folder();
    if (f) {
      this.form.patchValue({ name: f.name, color: f.color });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    // We emit back to parent component to handle store logic + GSAP
    this.saved.emit({
      dto: this.form.getRawValue() as CreateFolderDto | UpdateFolderDto,
      isEdit: !!this.folder()
    });
  }
}
