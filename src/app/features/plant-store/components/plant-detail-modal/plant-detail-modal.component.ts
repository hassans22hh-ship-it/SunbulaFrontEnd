import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PlantDto } from '@features/plant-store/models/plant-store.models';
import { PlantLevel, GrowthStage, PLANT_LEVEL_META, GROWTH_STAGE_META } from '@shared/models/enums';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';

@Component({
  selector: 'sb-plant-detail-modal',
  standalone: true,
  imports: [SbModalComponent, SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (plant()) {
      <sb-modal [title]="' '" maxWidth="450px" (closed)="closed.emit()">
        
        <div class="flex flex-col items-center text-center -mt-6">
          
          <!-- Large visually featured icon -->
          <div class="w-28 h-28 rounded-full bg-surface-2 border border-border flex items-center justify-center text-6xl mb-6 shadow-inner relative">
            @if (plant()!.imageUrl) {
              <img [src]="plant()!.imageUrl" [alt]="plant()!.name" class="w-20 h-20 object-contain drop-shadow-md" />
            } @else {
              <div class="drop-shadow-md">{{ stageMeta.emoji }}</div>
            }
            
            <div class="absolute -bottom-3 text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm"
                 [style.background]="levelMeta.color"
                 [style.color]="'#fff'">
              {{ levelMeta.label }}
            </div>
          </div>

          <h2 class="text-2xl font-bold text-text mb-2">{{ plant()!.name }}</h2>
          <p class="text-subtle text-sm mb-6 leading-relaxed px-4">
            {{ plant()!.description }}
          </p>

          <div class="bg-surface-2 rounded-xl p-4 w-full mb-6 flex justify-between items-center border border-border">
             <div class="text-left">
               <div class="text-[10px] uppercase tracking-wider text-subtle font-medium mb-1">Price</div>
               <div class="text-xl font-bold coin-badge px-3 py-1 inline-block">{{ plant()!.basePrice }} 🪙</div>
             </div>
             <div class="text-right">
               <div class="text-[10px] uppercase tracking-wider text-subtle font-medium mb-1">Growth Stage</div>
               <div class="text-sm font-semibold text-text">{{ stageMeta.label }}</div>
             </div>
          </div>

          <div class="w-full">
            <sb-button 
              fullWidth="true" 
              (clicked)="purchase.emit(plant()!)"
              [disabled]="purchasing()">
              {{ purchasing() ? 'Purchasing...' : 'Buy Seed' }}
            </sb-button>
          </div>

        </div>

      </sb-modal>
    }
  `,
  styles: [`
    .text-text { color: var(--color-text); }
    .text-subtle { color: var(--color-text-muted); }
    .bg-surface-2 { background: var(--color-surface-2); }
    .border-border { border-color: var(--color-border); }
  `]
})
export class PlantDetailModalComponent {
  plant = input<PlantDto | null>(null);
  purchasing = input<boolean>(false);

  closed   = output<void>();
  purchase = output<PlantDto>();

  get levelMeta() {
    const p = this.plant();
    if (!p) return PLANT_LEVEL_META[PlantLevel.Beginner];
    return PLANT_LEVEL_META[p.plantLevel as PlantLevel] || PLANT_LEVEL_META[PlantLevel.Beginner];
  }

  get stageMeta() {
    const p = this.plant();
    if (!p) return GROWTH_STAGE_META[GrowthStage.Seedling];
    return GROWTH_STAGE_META[p.growthStage as GrowthStage] || GROWTH_STAGE_META[GrowthStage.Seedling];
  }
}
