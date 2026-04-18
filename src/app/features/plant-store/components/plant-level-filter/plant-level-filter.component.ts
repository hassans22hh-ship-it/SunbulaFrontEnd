import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PlantLevel, PLANT_LEVEL_META } from '@shared/models/enums';

@Component({
  selector: 'sb-plant-level-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plant-level-filter.component.html',
  styleUrl: './plant-level-filter.component.scss'
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
