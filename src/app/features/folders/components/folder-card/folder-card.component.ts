import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FolderDto } from '../../models/folder.models';

@Component({
  selector: 'sb-folder-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="folder-card p-4 relative" [style.border-top-color]="folder().color">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="folder-title m-0 text-base font-semibold" style="color: var(--color-text);">
            {{ folder().name }}
          </h3>
          <p class="text-xs mt-1" style="color: var(--color-text-muted);">
            {{ folder().taskCount }} task{{ folder().taskCount !== 1 ? 's' : '' }}
          </p>
        </div>
        
        <div class="flex gap-1" (click)="$event.stopPropagation()">
          <button class="action-btn" (click)="edit.emit(folder())" title="Edit">✏️</button>
          <button class="action-btn text-danger" (click)="delete.emit(folder())" title="Delete">🗑️</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .folder-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-top-width: 4px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
    }
    .folder-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .action-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
      opacity: 0.6;
      transition: opacity 0.2s, background 0.2s;
    }
    .action-btn:hover {
      opacity: 1;
      background: var(--color-surface-2);
    }
    .text-danger { color: var(--color-danger); }
  `]
})
export class FolderCardComponent {
  folder = input.required<FolderDto>();
  
  edit   = output<FolderDto>();
  delete = output<FolderDto>();
}
