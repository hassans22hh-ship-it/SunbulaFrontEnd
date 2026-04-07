import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
  output,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Common Unicode emojis grouped by category — no npm package needed */
const EMOJI_LIST: { emoji: string; name: string }[] = [
  // Smileys
  { emoji: '😀', name: 'grinning' }, { emoji: '😊', name: 'smiling' }, { emoji: '😎', name: 'cool' },
  { emoji: '🤓', name: 'nerd' }, { emoji: '🥳', name: 'party' }, { emoji: '😴', name: 'sleeping' },
  { emoji: '🤔', name: 'thinking' }, { emoji: '😤', name: 'angry' },
  // Hands & People
  { emoji: '💪', name: 'strong muscle' }, { emoji: '👋', name: 'wave' }, { emoji: '🙏', name: 'pray' },
  { emoji: '🧠', name: 'brain' }, { emoji: '👀', name: 'eyes' }, { emoji: '🫡', name: 'salute' },
  { emoji: '🏃', name: 'running' }, { emoji: '🧘', name: 'yoga meditation' },
  // Nature
  { emoji: '🌱', name: 'seedling plant' }, { emoji: '🌿', name: 'herb leaf' }, { emoji: '🌳', name: 'tree' },
  { emoji: '🌻', name: 'sunflower' }, { emoji: '🍀', name: 'clover luck' }, { emoji: '🌸', name: 'blossom' },
  { emoji: '🌈', name: 'rainbow' }, { emoji: '☀️', name: 'sun' },
  // Objects & Tools
  { emoji: '📝', name: 'memo writing' }, { emoji: '📚', name: 'books study' }, { emoji: '💻', name: 'laptop computer' },
  { emoji: '🎯', name: 'target goal' }, { emoji: '🔥', name: 'fire hot' }, { emoji: '⚡', name: 'lightning energy' },
  { emoji: '💡', name: 'idea light bulb' }, { emoji: '🧹', name: 'cleaning broom' },
  { emoji: '🎵', name: 'music note' }, { emoji: '🎮', name: 'gaming controller' }, { emoji: '🏋️', name: 'weightlifting gym' },
  { emoji: '🚀', name: 'rocket launch' }, { emoji: '📊', name: 'chart analytics' }, { emoji: '🗂️', name: 'folder organize' },
  { emoji: '⏰', name: 'alarm clock time' }, { emoji: '📱', name: 'phone mobile' },
  // Food & Drink
  { emoji: '☕', name: 'coffee' }, { emoji: '🍕', name: 'pizza food' }, { emoji: '🥗', name: 'salad healthy' },
  { emoji: '🍎', name: 'apple fruit' }, { emoji: '💧', name: 'water drop' }, { emoji: '🧃', name: 'juice' },
  // Symbols
  { emoji: '✅', name: 'check done' }, { emoji: '❌', name: 'cross cancel' }, { emoji: '⭐', name: 'star favorite' },
  { emoji: '💎', name: 'gem diamond' }, { emoji: '🏆', name: 'trophy win' }, { emoji: '🎉', name: 'celebration party' },
  { emoji: '💰', name: 'money bag' }, { emoji: '🪙', name: 'coin' },
  // Hearts
  { emoji: '❤️', name: 'red heart love' }, { emoji: '💚', name: 'green heart' }, { emoji: '💜', name: 'purple heart' },
  { emoji: '🩵', name: 'light blue heart' },
  // Animals
  { emoji: '🐱', name: 'cat' }, { emoji: '🐶', name: 'dog' }, { emoji: '🦋', name: 'butterfly' },
  { emoji: '🐝', name: 'bee' }, { emoji: '🦅', name: 'eagle bird' }, { emoji: '🐢', name: 'turtle slow' },
];

@Component({
  selector: 'sb-emoji-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmojiPickerComponent {
  /** Currently selected emoji (two-way binding style) */
  value = input<string>('');
  selected = output<string>();

  readonly search = signal('');

  readonly filteredEmojis = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return EMOJI_LIST;
    return EMOJI_LIST.filter(e => e.name.includes(q) || e.emoji === q);
  });

  readonly preview = computed(() => this.value() || '🌱');

  selectEmoji(emoji: string): void {
    this.selected.emit(emoji);
  }
}
