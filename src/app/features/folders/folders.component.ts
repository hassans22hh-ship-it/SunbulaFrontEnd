import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FoldersStore } from './store/folders.store';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FolderDto } from '@shared/models/task.models';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';

@Component({
  selector: 'sb-folders',
  standalone: true,
  imports: [
    SbCardComponent, SbButtonComponent, SbModalComponent, SbEmptyStateComponent,
    SbSpinnerComponent, SbConfirmDialogComponent, ReactiveFormsModule, PageTransitionDirective,
  ],
  templateUrl: './folders.component.html',
  styleUrl: './folders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoldersComponent implements OnInit {
  protected readonly store = inject(FoldersStore);
  private readonly fb      = inject(FormBuilder);

  readonly showForm    = signal(false);
  readonly showDelete  = signal(false);
  readonly editing     = signal<FolderDto | null>(null);
  readonly deleting    = signal<FolderDto | null>(null);

  readonly form = this.fb.nonNullable.group({
    name:  ['', [Validators.required, Validators.minLength(2)]],
    color: ['#52B788', Validators.required],
  });

  ngOnInit(): void { this.store.load(); }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({ name: '', color: '#52B788' });
    this.showForm.set(true);
  }

  openEdit(folder: FolderDto): void {
    this.editing.set(folder);
    this.form.patchValue({ name: folder.name, color: folder.color });
    this.showForm.set(true);
  }

  onSave(): void {
    if (this.form.invalid) return;
    const data = this.form.getRawValue();
    const e = this.editing();
    if (e) {
      this.store.update(e.id, data);
    } else {
      this.store.create(data);
    }
    this.showForm.set(false);
  }

  confirmDelete(folder: FolderDto): void {
    this.deleting.set(folder);
    this.showDelete.set(true);
  }

  onDelete(): void {
    const d = this.deleting();
    if (d) this.store.remove(d.id);
    this.showDelete.set(false);
  }
}
