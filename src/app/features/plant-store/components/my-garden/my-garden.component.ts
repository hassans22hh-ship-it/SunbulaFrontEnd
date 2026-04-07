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
  template: `
    <div class="h-full flex flex-col pt-6 pb-2" sbPage>
      
      <div class="mb-8" sbAnimate="slideIn">
        <h2 class="section-title">My Garden</h2>
        <p class="text-subtle mt-1 text-sm">Plant your seeds and water them to grow your virtual garden.</p>
      </div>

      <!-- Seed Inventory -->
      @if (store.seedInventory().length > 0) {
        <div class="mb-10" sbAnimate="fadeInUp">
          <div class="flex items-center gap-2 mb-4">
             <h3 class="font-semibold text-lg text-text">Seed Inventory</h3>
             <span class="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{{ store.seedInventory().length }}</span>
          </div>
          <div class="flex gap-4 overflow-x-auto custom-scrollbar pb-4">
             @for (seed of store.seedInventory(); track seed.id) {
               <div class="card p-3 min-w-[200px] flex gap-3 items-center shrink-0 border border-border">
                 <div class="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-2xl border border-divider">
                   {{ getStageMeta(seed).emoji }}
                 </div>
                 <div class="flex-1">
                   <div class="font-semibold text-sm truncate" [title]="seed.plantName">{{ seed.plantName }}</div>
                   <div class="text-[10px] text-subtle mb-2">{{ getLevelMeta(seed).label }}</div>
                   <sb-button size="sm" [fullWidth]="true" (clicked)="waterPlantPrompt(seed.id, true)">Plant</sb-button>
                 </div>
               </div>
             }
          </div>
        </div>
      }

      <!-- Garden Grid -->
      <div class="flex-1" sbAnimate="fadeInUp" style="animation-delay: 0.1s;">
        <h3 class="font-semibold text-lg text-text mb-4">Planted Garden</h3>
        
        @if (store.plantedPlants().length === 0) {
          <sb-empty-state 
            title="Empty Garden" 
            message="You haven't planted anything yet. Buy seeds from the store or plant from your inventory." 
            icon="🪴" 
          />
        } @else {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            @for (plant of store.plantedPlants(); track plant.id) {
              
              <div class="garden-plot relative flex flex-col items-center p-4 bg-transparent group">
                
                <!-- Dirt base visual -->
                <div class="absolute bottom-16 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#8B5A2B] rounded-[100%] opacity-20 z-0"></div>

                <!-- Plant Visual -->
                <div class="relative z-10 w-24 h-24 mb-4 flex items-end justify-center group-hover:-translate-y-2 transition-transform duration-300">
                  @if (plant.plantImageUrl) {
                    <img [src]="plant.plantImageUrl" [alt]="plant.plantName" class="max-w-full max-h-full object-contain drop-shadow-lg" />
                  } @else {
                    <div class="text-6xl drop-shadow-md pb-2">{{ getStageMeta(plant).emoji }}</div>
                  }
                </div>

                <div class="text-center w-full z-10 bg-surface/80 backdrop-blur-sm border border-border rounded-xl pt-2 pb-3 px-2 shadow-sm">
                   <h4 class="font-semibold text-sm text-text truncate w-full" [title]="plant.plantName">{{ plant.plantName }}</h4>
                   <div class="flex justify-between items-center mt-2 px-1">
                     <span class="text-[10px] uppercase font-bold text-primary">{{ getStageMeta(plant).label }}</span>
                     <span class="text-xs font-medium text-subtle flex items-center gap-1">💧 {{ plant.stageCoinsAccumulated }}</span>
                   </div>
                   
                   <div class="mt-3">
                      <!-- Basic Growth Logic Mockup (Watering needed to advance stage typically calculated backend, but UI driven action here) -->
                      <sb-button variant="outline" size="sm" [fullWidth]="true" (clicked)="waterPlantPrompt(plant.id, false)">Water 💧</sb-button>
                   </div>
                </div>

              </div>
              
            }
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .text-text { color: var(--color-text); }
    .text-subtle { color: var(--color-text-muted); }
    .bg-surface-2 { background: var(--color-surface-2); }
    .bg-surface\\/80 { background: color-mix(in srgb, var(--color-surface) 80%, transparent); }
    .border-border { border-color: var(--color-border); }
    .border-divider { border-color: var(--color-border); opacity: 0.5; }
    
    .bg-primary\\/10 { background: color-mix(in srgb, var(--color-primary) 10%, transparent); }
    .text-primary { color: var(--color-primary); }

    .garden-plot {
      background-image: radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--color-surface-2) 40%, transparent) 0%, transparent 60%);
    }

    .custom-scrollbar::-webkit-scrollbar { height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 6px; }
  `]
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

  waterPlantPrompt(id: string, isSeed: boolean) {
    const amtStr = window.prompt('How many coins to invest?', '10');
    if (!amtStr) return;
    const amt = parseInt(amtStr, 10);
    if (isNaN(amt) || amt <= 0) return;
    if (isSeed) this.store.plantSeed(id, amt);
    else this.store.waterPlant(id, amt);
  }
}
