import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { PlantStoreStore } from './store/plant-store.store';
import { AuthService } from '@core/auth/auth.service';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbBadgeComponent } from '@shared/ui/badge/sb-badge.component';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { DecimalPipe } from '@angular/common';
import { PLANT_LEVEL_META, GROWTH_STAGE_META } from '@shared/models/enums';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';

@Component({
  selector: 'sb-plant-store',
  standalone: true,
  imports: [SbCardComponent, SbButtonComponent, SbSpinnerComponent, SbEmptyStateComponent, SbBadgeComponent, CoinsPipe, DecimalPipe, PageTransitionDirective],
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

  getStageVariant(stage: number | string): 'default' | 'success' | 'warning' | 'info' {
    const s = stage as import('@shared/models/enums').GrowthStage;
    return this.stageMeta[s]?.variant ?? 'default';
  }

  getStageLabel(stage: number | string): string {
    const s = stage as import('@shared/models/enums').GrowthStage;
    return this.stageMeta[s]?.label ?? stage.toString();
  }
}
