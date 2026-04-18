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
  templateUrl: './plant-catalog.component.html',
  styleUrl: './plant-catalog.component.scss'
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
