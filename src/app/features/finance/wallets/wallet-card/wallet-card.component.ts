import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WalletType, WALLET_TYPE_META } from '@shared/models/enums';
import { WalletDto } from '@shared/models/finance.models';

@Component({
  selector: 'sb-wallet-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wallet-card.component.html',
  styleUrl: './wallet-card.component.scss',
})
export class WalletCardComponent {
  wallet = input.required<WalletDto>();
  selected = input<boolean>(false);

  clicked = output<WalletDto>();
  editClicked = output<WalletDto>();
  deleteClicked = output<WalletDto>();

  get meta() {
    return WALLET_TYPE_META[this.wallet().type as unknown as WalletType] || WALLET_TYPE_META[WalletType.Cash];
  }

  formatCurrency(value: number, currency: string = 'SAR'): string {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(value);
  }
}
