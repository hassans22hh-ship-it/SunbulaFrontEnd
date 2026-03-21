import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PlantDto } from '@features/plant-store/models/plant-store.models';
import { PlantLevel, GrowthStage, PLANT_LEVEL_META, GROWTH_STAGE_META } from '@shared/models/enums';

@Component({
  selector: 'sb-plant-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card p-4 h-full flex flex-col justify-between group cursor-pointer"
         (click)="clicked.emit(plant())" role="button" tabindex="0">
      
      <!-- Top Badges -->
      <div class="flex justify-between items-start mb-4">
        <div class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
             [style.background]="levelMeta.color + '20'"
             [style.color]="levelMeta.color">
          {{ levelMeta.label }}
        </div>
        
        <div class="coin-badge text-xs px-2 py-1">
          {{ plant().basePrice }} 🪙
        </div>
      </div>

      <!-- Icon/Image -->
      <div class="flex-1 flex items-center justify-center py-6 group-hover:scale-110 transition-transform duration-300">
        @if (plant().imageUrl) {
          <img [src]="plant().imageUrl" [alt]="plant().name" class="w-16 h-16 object-contain drop-shadow-md" />
        } @else {
          <div class="text-5xl drop-shadow-md">{{ stageMeta.emoji }}</div>
        }
      </div>

      <!-- Detail -->
      <div class="mt-2 text-center">
        <h3 class="font-semibold text-text text-lg">{{ plant().name }}</h3>
        <p class="text-xs text-subtle line-clamp-2 mt-1">{{ plant().description }}</p>
      </div>

    </div>
  `,
  styles: [`
    .text-text { color: var(--color-text); }
    .text-subtle { color: var(--color-text-muted); }
  `]
})
export class PlantCardComponent {
  plant = input.required<PlantDto>();
  clicked = output<PlantDto>();

  get levelMeta() {
    return PLANT_LEVEL_META[this.plant().plantLevel as PlantLevel] || PLANT_LEVEL_META[PlantLevel.Beginner];
  }

  get stageMeta() {
    return GROWTH_STAGE_META[this.plant().growthStage as GrowthStage] || GROWTH_STAGE_META[GrowthStage.Seedling];
  }
}
