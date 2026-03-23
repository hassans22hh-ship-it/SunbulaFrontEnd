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
  template: `
    <div class="page-container" sbPage>
      
      <!-- Top header -->
      <div class="flex items-center justify-between mb-8" sbAnimate="slideIn">
        <div>
          <h1 class="section-title">Folders</h1>
          <p class="text-subtle mt-1 text-sm">Organize your tasks and workflows.</p>
        </div>
        <sb-button (clicked)="openForm()">
          <span style="font-size: 1.2em; line-height: 1;">+</span> New Folder
        </sb-button>
      </div>

      <!-- Main Content Area -->
      @if (store.isLoading() && store.folders().length === 0) {
        <sb-spinner />
      } @else if (store.error()) {
        <sb-empty-state
          icon="⚠️"
          title="Failed to load folders"
          [message]="store.error()!"
          (retry)="store.load()"
        />
      } @else if (store.folders().length === 0) {
        <sb-empty-state
          icon="📁"
          title="No folders yet"
          message="Create your first folder to start organizing tasks."
        >
          <div class="mt-4">
            <sb-button (clicked)="openForm()">Create Folder</sb-button>
          </div>
        </sb-empty-state>
      } @else {
        <div class="folder-grid">
          @for (folder of store.folders(); track folder.id) {
            <div class="folder-card-wrapper">
              <sb-folder-card
                [folder]="folder"
                (edit)="openForm($event)"
                (delete)="confirmDelete($event)"
              />
            </div>
          }
        </div>
      }

      <!-- Form logic -->
      @if (showForm()) {
        <sb-folder-form
          [folder]="selectedFolder()"
          (saved)="onFormSave($event)"
          (cancelled)="closeForm()"
        />
      }

      <!-- Delete confirmation -->
      @if (folderToDelete()) {
        <sb-confirm-dialog
          title="Delete Folder"
          message="Are you sure you want to delete '{{ folderToDelete()?.name }}'? This action cannot be undone."
          confirmLabel="Delete"
          (confirmed)="onDelete()"
          (cancelled)="folderToDelete.set(null)"
        />
      }
    </div>
  `,
  styles: [`
    .folder-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }
  `]
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
