import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FoldersStore } from '../../store/folders.store';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { FolderCardComponent } from '../folder-card/folder-card.component';
import { FolderFormComponent } from '../folder-form/folder-form.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';
import { FolderDto, CreateFolderDto, UpdateFolderDto } from '@shared/models/task.models';
import { FoldersApiService } from '../../services/folders.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { GsapService } from '@core/animation/gsap.service';
import { AnimateDirective } from '@shared/directives/animate.directive';

@Component({
  selector: 'sb-folder-list',
  standalone: true,
  imports: [
    SbButtonComponent,
    FolderCardComponent,
    FolderFormComponent,
    SbSpinnerComponent,
    SbEmptyStateComponent,
    SbConfirmDialogComponent,
    AnimateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './folder-list.component.html',
  styleUrl: './folder-list.component.scss'
})
export class FolderListComponent implements OnInit {
  protected readonly store = inject(FoldersStore);
  private   readonly api   = inject(FoldersApiService);
  private   readonly toast = inject(ToastService);
  private   readonly gsap  = inject(GsapService);

  showForm       = signal(false);
  selectedFolder = signal<FolderDto | null>(null);
  folderToDelete = signal<FolderDto | null>(null);

  ngOnInit(): void {
    if (this.store.folders().length === 0) {
      this.store.load();
    } else {
      setTimeout(() => this.gsap.staggerIn('.folder-card-wrapper'), 50);
    }
  }

  openForm(folder: FolderDto | null = null): void {
    this.selectedFolder.set(folder);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedFolder.set(null);
  }

  async onFormSave(event: { dto: CreateFolderDto | UpdateFolderDto, isEdit: boolean }): Promise<void> {
    const { dto, isEdit } = event;
    const current = this.selectedFolder();
    
    // Close early for better UX feeling
    this.closeForm();

    if (isEdit && current) {
      const updateDto = dto as UpdateFolderDto;
      await this.store.update(current.id, updateDto);
    } else {
      const createDto = dto as CreateFolderDto;
      await this.store.create(createDto);
    }
  }

  confirmDelete(folder: FolderDto): void {
    this.folderToDelete.set(folder);
  }

  async onDelete(): Promise<void> {
    const folder = this.folderToDelete();
    if (!folder) return;
    this.folderToDelete.set(null);

    await this.store.remove(folder.id);
  }
}
