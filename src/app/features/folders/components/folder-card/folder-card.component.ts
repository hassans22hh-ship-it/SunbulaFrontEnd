import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FolderDto } from '@shared/models/task.models';

@Component({
  selector: 'sb-folder-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './folder-card.component.html',
  styleUrl: './folder-card.component.scss'
})
export class FolderCardComponent {
  folder = input.required<FolderDto>();

  edit   = output<FolderDto>();
  delete = output<FolderDto>();
}
