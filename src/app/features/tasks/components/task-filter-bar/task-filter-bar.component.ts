import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TaskQueryParams, FolderDto } from '@shared/models/task.models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'sb-task-filter-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-filter-bar.component.html',
  styleUrl: './task-filter-bar.component.scss',
})
export class TaskFilterBarComponent {
  folders = input<FolderDto[]>([]);
  filtersChanged = output<TaskQueryParams>();

  folderCtrl = new FormControl<string | null>(null);
  archivedCtrl = new FormControl<boolean>(false);
  searchCtrl = new FormControl<string>('');

  constructor() {
    this.folderCtrl.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => this.emitFilters());
    this.archivedCtrl.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => this.emitFilters());
    this.searchCtrl.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => this.emitFilters());
  }

  private emitFilters(): void {
    this.filtersChanged.emit({
      folderId: this.folderCtrl.value || undefined,
      archived: this.archivedCtrl.value || false,
      search:   this.searchCtrl.value || undefined
    });
  }
}
