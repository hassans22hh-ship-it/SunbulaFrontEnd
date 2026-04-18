import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PlantDto } from '@shared/models/plant.models';
import { PlantLevel, GrowthStage, PLANT_LEVEL_META, GROWTH_STAGE_META } from '@shared/models/enums';

@Component({
  selector: 'sb-plant-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plant-card.component.html',
  styleUrl: './plant-card.component.scss'
})
export class PlantCardComponent {
  plant = input.required<PlantDto>();
  clicked = output<PlantDto>();

  get levelMeta() {
    return PLANT_LEVEL_META[this.plant().level as PlantLevel] || PLANT_LEVEL_META[PlantLevel.Beginner];
  }

  get stageMeta() {
    return GROWTH_STAGE_META[GrowthStage.Seed];
  }
}
