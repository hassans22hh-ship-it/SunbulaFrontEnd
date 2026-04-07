import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { PlantStoreStore } from './store/plant-store.store';
import { AuthService } from '@core/auth/auth.service';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbBadgeComponent } from '@shared/ui/badge/sb-badge.component';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { DecimalPipe } from '@angular/common';
import { PLANT_LEVEL_META, GROWTH_STAGE_META, GrowthStage, PlantLevel } from '@shared/models/enums';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { FormsModule } from '@angular/forms';
import { SbIconCoinComponent } from '@shared/ui/icons/coin-icon.component';
import { PlantLevelFilterComponent } from './components/plant-level-filter/plant-level-filter.component';

@Component({
  selector: 'sb-plant-store',
  standalone: true,
  imports: [
    SbButtonComponent, SbSpinnerComponent,
    SbEmptyStateComponent, SbBadgeComponent, CoinsPipe, DecimalPipe,
    PageTransitionDirective, FormsModule, SbIconCoinComponent,
    PlantLevelFilterComponent
  ],
  providers: [PlantStoreStore],
  templateUrl: './plant-store.component.html',
  styleUrl: './plant-store.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlantStoreComponent implements OnInit {
  protected readonly store = inject(PlantStoreStore);
  protected readonly auth  = inject(AuthService);
  readonly tab = signal<'store' | 'garden'>('store');
  protected readonly levelMeta  = PLANT_LEVEL_META;
  protected readonly stageMeta  = GROWTH_STAGE_META;

  ngOnInit(): void { this.store.loadAll(); }

  canAfford(price: number): boolean { return this.auth.coinBalance() >= price; }

  getLevelVariant(level: number | string): 'default' | 'success' | 'warning' | 'info' | 'danger' {
    const l = level as PlantLevel;
    return this.levelMeta[l]?.variant ?? 'default';
  }

  getStageVariant(stage: number | string): 'default' | 'success' | 'warning' | 'info' {
    const s = stage as GrowthStage;
    return this.stageMeta[s]?.variant ?? 'default';
  }

  getStageLabel(stage: number | string): string {
    const s = stage as GrowthStage;
    return this.stageMeta[s]?.label ?? stage.toString();
  }

  getStageEmoji(stage: number | string): string {
    const s = stage as GrowthStage;
    return this.stageMeta[s]?.emoji ?? '🌱';
  }

  onLevelChange(level: PlantLevel | null): void {
    this.store.setLevelFilter(level);
  }

  // Interactive Coin Investment State
  readonly activeInvestmentPlant = signal<string | null>(null);
  readonly investmentAmount = signal<number>(10);

  openInvestment(plantId: string) {
    this.activeInvestmentPlant.set(plantId);
    this.investmentAmount.set(10);
  }

  closeInvestment() {
    this.activeInvestmentPlant.set(null);
  }

  setInvestmentAmount(amount: number) {
    this.investmentAmount.set(Math.max(1, amount));
  }

  submitInvestment(plant: any) {
    const amount = this.investmentAmount();
    if (amount <= 0) return;

    const maxAffordable = Math.min(amount, this.auth.coinBalance());
    if (maxAffordable <= 0) return;

    if (plant.currentStage === GrowthStage.Seed) {
      this.store.plantSeed(plant.id, maxAffordable);
    } else {
      this.store.waterPlant(plant.id, maxAffordable);
    }
    this.closeInvestment();
  }
}
