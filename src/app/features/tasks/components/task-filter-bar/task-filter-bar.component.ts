import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TaskQueryParams, FolderDto } from '@shared/models/task.models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'sb-task-filter-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-bar flex flex-wrap gap-4 items-center">
      <!-- Folder Filter -->
      <div class="filter-group flex items-center gap-2">
        <label class="text-sm font-medium text-subtle">Folder:</label>
        <select [formControl]="folderCtrl" class="input-field max-w-[200px] text-sm py-1.5 min-h-0">
          <option [value]="null">All Folders</option>
          @for (folder of folders(); track folder.id) {
            <option [value]="folder.id">{{ folder.name }}</option>
          }
        </select>
      </div>

      <!-- Archived Toggle -->
      <div class="filter-group flex items-center gap-2 ml-auto">
        <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-subtle">
          <input type="checkbox" [formControl]="archivedCtrl" class="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-surface">
          Show Archived
        </label>
      </div>
    </div>
  `,
  styles: [`
    .filter-bar {
      background: var(--color-surface);
      padding: 0.75rem 1rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
    }
    .text-subtle { color: var(--color-text-muted); }
  `]
})
export class TaskFilterBarComponent {
  folders = input<FolderDto[]>([]);
  filtersChanged = output<TaskQueryParams>();

  folderCtrl = new FormControl<string | null>(null);
  archivedCtrl = new FormControl<boolean>(false);

  constructor() {
    this.folderCtrl.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.filtersChanged.emit({ folderId: val || undefined, archived: this.archivedCtrl.value || false });
    });
    this.archivedCtrl.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.filtersChanged.emit({ folderId: this.folderCtrl.value || undefined, archived: val || false });
    });
  }
}
