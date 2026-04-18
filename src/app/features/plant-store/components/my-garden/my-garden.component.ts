import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PlantStoreStore } from '../../store/plant-store.store';
import { UserPlantDto } from '@shared/models/plant.models';
import { PlantLevel, GrowthStage, PLANT_LEVEL_META, GROWTH_STAGE_META } from '../../../../shared/models/enums';
import { SbButtonComponent } from '../../../../shared/ui/button/sb-button.component';
import { SbEmptyStateComponent } from '../../../../shared/ui/empty-state/sb-empty-state.component';
import { AnimateDirective } from '../../../../shared/directives/animate.directive';

@Component({
  selector: 'sb-my-garden',
  standalone: true,
  imports: [SbButtonComponent, SbEmptyStateComponent, AnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-garden.component.html',
  styleUrl: './my-garden.component.scss'
})
export class MyGardenComponent implements OnInit {
  protected readonly store = inject(PlantStoreStore);
  private readonly titleService = inject(Title);

  ngOnInit(): void {
    this.titleService.setTitle('My Garden | Sunbula');
    if (this.store.allMyPlants().length === 0) {
      this.store.loadAll();
    }
  }

  getLevelMeta(p: UserPlantDto) {
    return PLANT_LEVEL_META[PlantLevel.Beginner];
  }

  getStageMeta(p: UserPlantDto) {
    return GROWTH_STAGE_META[p.currentStage as GrowthStage] || GROWTH_STAGE_META[GrowthStage.Seedling] || {};
  }

  waterPlantPrompt(id: string, isSeed: boolean): void {
    const amtStr = window.prompt('How many coins to invest?', '10');
    if (!amtStr) return;
    const amt = parseInt(amtStr, 10);
    if (isNaN(amt) || amt <= 0) return;
    if (isSeed) this.store.plantSeed(id, amt);
    else this.store.waterPlant(id, amt);
  }
}
