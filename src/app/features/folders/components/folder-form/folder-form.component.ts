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
  templateUrl: './folder-form.component.html',
  styleUrl: './folder-form.component.scss'
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
