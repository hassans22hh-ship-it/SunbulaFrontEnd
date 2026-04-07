import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PlantStoreStore } from '../../store/plant-store.store';
import { PlantDto } from '@shared/models/plant.models';
import { PlantLevel } from '@shared/models/enums';
import { PlantCardComponent } from '../plant-card/plant-card.component';
import { PlantLevelFilterComponent } from '../plant-level-filter/plant-level-filter.component';
import { PlantDetailModalComponent } from '../plant-detail-modal/plant-detail-modal.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { AnimateDirective } from '@shared/directives/animate.directive';

@Component({
  selector: 'sb-plant-catalog',
  standalone: true,
  imports: [
    PlantCardComponent, 
    PlantLevelFilterComponent, 
    PlantDetailModalComponent, 
    SbSpinnerComponent, 
    SbEmptyStateComponent, 
    AnimateDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col pt-6 pb-2" sbPage>
      
      <div class="mb-6" sbAnimate="slideIn">
        <h2 class="section-title">Plant Store</h2>
        <p class="text-subtle mt-1 text-sm">Use your earned 🪙 coins to buy new plants for your virtual garden.</p>
      </div>

      <div class="mb-6" sbAnimate="fadeInUp">
         <sb-plant-level-filter [selected]="selectedLevel()" (changed)="selectedLevel.set($event)" />
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4" sbAnimate="fadeInUp" style="animation-delay: 0.1s;">
        @if (store.isLoading() && store.available().length === 0) {
          <div class="py-12 flex justify-center"><sb-spinner /></div>
        } @else if (filteredPlants().length === 0) {
          <sb-empty-state 
            icon="🌱" 
            title="No plants found" 
            message="There are no plants available in the store right now for this level." 
          />
        } @else {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            @for (plant of filteredPlants(); track plant.id) {
              <sb-plant-card 
                [plant]="plant"
                (clicked)="inspectPlant(plant)"
              />
            }
          </div>
        }
      </div>

      <sb-plant-detail-modal 
        [plant]="inspectingPlant()"
        [purchasing]="isPurchasing()"
        (closed)="inspectingPlant.set(null)"
        (purchase)="onPurchase($event)"
      />

    </div>
  `,
  styles: [`
    .text-subtle { color: var(--color-text-muted); }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
  `]
})
export class PlantCatalogComponent implements OnInit {
  protected readonly store = inject(PlantStoreStore);
  private readonly titleService = inject(Title);

  selectedLevel = signal<PlantLevel | null>(null);
  inspectingPlant = signal<PlantDto | null>(null);
  isPurchasing = signal<boolean>(false);

  ngOnInit(): void {
    this.titleService.setTitle('Store | Sunbula');
    if (this.store.available().length === 0) {
      this.store.loadAll();
    }
  }

  filteredPlants(): PlantDto[] {
    const l = this.selectedLevel();
    const all = this.store.available();
    if (l === null) return all;
    return all.filter(p => p.level === l);
  }

  inspectPlant(plant: PlantDto): void {
    this.inspectingPlant.set(plant);
  }

  onPurchase(plant: PlantDto): void {
    // Basic validation could happen here (check wallet balance via finance store if connected)
    this.isPurchasing.set(true);
    // Mimic the async call finishing by temporarily setting this
    setTimeout(() => {
       this.store.purchase(plant.id, plant.price ?? 0);
       this.isPurchasing.set(false);
       this.inspectingPlant.set(null);
    }, 500);
  }
}
