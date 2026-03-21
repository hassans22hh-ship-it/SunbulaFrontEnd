import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PlantLevel, PLANT_LEVEL_META } from '@shared/models/enums';

@Component({
  selector: 'sb-plant-level-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
      <button class="filter-btn" 
              [class.active]="selected() === null"
              (click)="select(null)">
        All Levels
      </button>
      
      @for (l of levels; track l.value) {
        <button class="filter-btn"
                [class.active]="selected() === l.value"
                (click)="select(l.value)">
          {{ l.meta.emoji }} {{ l.meta.label }}
        </button>
      }
    </div>
  `,
  styles: [`
    .filter-btn {
      white-space: nowrap;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-muted);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover { background: var(--color-surface-2); color: var(--color-text); }
    .filter-btn.active {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }
    
    .custom-scrollbar::-webkit-scrollbar { height: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
  `]
})
export class PlantLevelFilterComponent {
  selected = input<PlantLevel | null>(null);
  changed  = output<PlantLevel | null>();

  readonly levels = [
    PlantLevel.Beginner,
    PlantLevel.Intermediate,
    PlantLevel.Advanced,
    PlantLevel.Rare
  ].map(value => ({ value, meta: PLANT_LEVEL_META[value] }));

  select(level: PlantLevel | null): void {
    this.changed.emit(level);
  }
}
