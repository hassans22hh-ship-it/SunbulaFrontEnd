import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PlantDto } from '@shared/models/plant.models';
import { PlantLevel, GrowthStage, PLANT_LEVEL_META, GROWTH_STAGE_META } from '@shared/models/enums';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';

@Component({
  selector: 'sb-plant-detail-modal',
  standalone: true,
  imports: [SbModalComponent, SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plant-detail-modal.component.html',
  styleUrl: './plant-detail-modal.component.scss'
})
export class PlantDetailModalComponent {
  plant = input<PlantDto | null>(null);
  purchasing = input<boolean>(false);

  closed   = output<void>();
  purchase = output<PlantDto>();

  get levelMeta() {
    const p = this.plant();
    if (!p) return PLANT_LEVEL_META[PlantLevel.Beginner];
    return PLANT_LEVEL_META[p.level as PlantLevel] || PLANT_LEVEL_META[PlantLevel.Beginner];
  }

  get stageMeta() {
    return GROWTH_STAGE_META[GrowthStage.Seed];
  }
}
