import {
  ChangeDetectionStrategy,
  Component,
  output,
  input,
} from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'sb-emoji-picker',
  standalone: true,
  imports: [PickerComponent],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmojiPickerComponent {
  /** Currently selected emoji (two-way binding style) */
  value = input<string>('');
  selected = output<string>();

  selectEmoji(event: any): void {
    this.selected.emit(event.emoji.native);
  }
}
