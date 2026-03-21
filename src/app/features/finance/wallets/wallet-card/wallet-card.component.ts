import { WalletType, WALLET_META } from '@shared/models/enums';
import { WalletDto } from '@features/finance/models/finance.models';

@Component({
  selector: 'sb-wallet-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="wallet-card p-5 outline-none rounded-2xl flex flex-col justify-between"
      [class.selected]="selected()"
      [style.background]="wallet().color || 'var(--color-surface)'"
      [style.color]="wallet().color ? '#fff' : 'var(--color-text)'"
      (click)="clicked.emit(wallet())"
      role="button"
      tabindex="0"
    >
      <div class="flex justify-between items-start mb-6">
        <div>
          <div class="text-xs uppercase tracking-wider opacity-80 font-medium mb-1 flex items-center gap-1">
             {{ meta.emoji }} {{ meta.label }}
          </div>
          <h3 class="font-semibold text-lg line-clamp-1">{{ wallet().name }}</h3>
        </div>
        <button class="icon-btn" (click)="editClicked.emit(wallet()); $event.stopPropagation()">⚙️</button>
      </div>

      <div>
        <div class="text-[10px] uppercase tracking-widest opacity-70 mb-1">Balance</div>
        <div class="font-display text-3xl font-bold tracking-tight">
          {{ formatCurrency(wallet().balance, wallet().currency) }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wallet-card {
      min-height: 160px;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, outline 0.2s;
      outline: 2px solid transparent;
      outline-offset: 2px;
    }
    .wallet-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .wallet-card.selected {
      outline-color: var(--color-primary);
    }
    .icon-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      width: 28px; height: 28px;
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .icon-btn:hover { background: rgba(255, 255, 255, 0.3); }
    .font-display { font-family: var(--font-display); }
  `]
})
export class WalletCardComponent {
  wallet = input.required<WalletDto>();
  selected = input<boolean>(false);
  
  clicked = output<WalletDto>();
  editClicked = output<WalletDto>();

  get meta() {
    return WALLET_META[this.wallet().walletType as WalletType] || WALLET_META[WalletType.Cash];
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  }
}
