import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FinanceStore } from '@features/finance/store/finance.store';
import { FinancialCategoryDto, CreateFinancialCategoryDto } from '@features/finance/models/finance.models';
import { TransactionType } from '@shared/models/enums';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { AnimateDirective } from '@shared/directives/animate.directive';

const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
const CATEGORY_ICONS  = ['🛒', '🍔', '🚗', '🏠', '🎮', '🏥', '🎓', '✈️', '💼', '🎁', '⚡', '💧'];

@Component({
  selector: 'sb-financial-category-manager',
  standalone: true,
  imports: [ReactiveFormsModule, SbButtonComponent, SbModalComponent, SbEmptyStateComponent, AnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col pt-6 pb-2" sbPage>
      
      <div class="flex justify-between items-end mb-6" sbAnimate="slideLeft">
        <div>
          <h2 class="section-title">Categories</h2>
          <p class="text-subtle mt-1 text-sm">Manage income and expense categories.</p>
        </div>
        <sb-button variant="secondary" size="sm" (clicked)="showForm.set(true)">+ Add Category</sb-button>
      </div>

      <!-- Category Type Filter -->
      <div class="flex gap-2 mb-6 bg-surface-2 p-1 rounded-lg border border-border self-start inline-flex" sbAnimate="fadeUp">
         <button class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
                 [class.bg-surface]="currentType() === TransactionType.Expense"
                 [class.shadow-sm]="currentType() === TransactionType.Expense"
                 (click)="currentType.set(TransactionType.Expense)">
           Expenses
         </button>
         <button class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
                 [class.bg-surface]="currentType() === TransactionType.Income"
                 [class.shadow-sm]="currentType() === TransactionType.Income"
                 (click)="currentType.set(TransactionType.Income)">
           Income
         </button>
      </div>

      <!-- Category List -->
      <div class="flex-1 overflow-y-auto custom-scrollbar" sbAnimate="fadeUp" style="animation-delay: 0.1s;">
        @if (filteredCategories().length === 0) {
          <sb-empty-state 
            icon="🏷️" 
            title="No categories" 
            message="Create categories to organize your transactions." 
          />
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            @for (cat of filteredCategories(); track cat.id) {
              <div class="bg-surface border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:shadow-sm transition-shadow">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl" [style.background]="cat.color || '#f1f5f9'">
                  {{ cat.icon || '🏷️' }}
                </div>
                <div class="font-medium text-text text-sm w-full truncate px-1" [title]="cat.name">{{ cat.name }}</div>
                <button class="text-xs text-danger opacity-70 hover:opacity-100 transition-opacity mt-1"
                        (click)="onDelete(cat)">
                  Remove
                </button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Form Modal -->
      @if (showForm()) {
        <sb-modal title="New Category" maxWidth="400px" (closed)="showForm.set(false)">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            
            <div class="form-group mb-4">
              <label class="label-text">Type</label>
              <select class="input-field" formControlName="type">
                <option [value]="TransactionType.Expense">Expense</option>
                <option [value]="TransactionType.Income">Income</option>
              </select>
            </div>

            <div class="form-group mb-4">
              <label class="label-text">Name</label>
              <input class="input-field" type="text" formControlName="name" placeholder="e.g. Groceries">
            </div>

            <div class="form-group mb-4">
              <label class="label-text">Icon</label>
              <div class="flex gap-2 flex-wrap">
                @for (icon of availableIcons; track icon) {
                  <button type="button" 
                          class="w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-colors hover:bg-surface-2"
                          [class.border-border]="form.value.icon !== icon"
                          [class.border-primary]="form.value.icon === icon"
                          [class.bg-primary-light]="form.value.icon === icon"
                          (click)="form.patchValue({ icon })">
                    {{ icon }}
                  </button>
                }
              </div>
            </div>

            <div class="form-group mb-6">
              <label class="label-text">Color Base</label>
              <div class="flex gap-2 flex-wrap">
                @for (color of availableColors; track color) {
                  <button type="button"
                          class="w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110"
                          [style.background]="color"
                          [style.opacity]="0.2"
                          [style.border]="form.value.color === getLightColor(color) ? '2px solid var(--color-primary)' : '2px solid transparent'"
                          (click)="form.patchValue({ color: getLightColor(color) })">
                  </button>
                }
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <sb-button variant="ghost" (clicked)="showForm.set(false)">Cancel</sb-button>
              <sb-button type="submit" [disabled]="form.invalid">Create</sb-button>
            </div>
            
          </form>
        </sb-modal>
      }

    </div>
  `,
  styles: [`
    .text-text { color: var(--color-text); }
    .text-subtle { color: var(--color-text-muted); }
    .text-danger { color: var(--color-danger); }
    .bg-surface { background: var(--color-surface); }
    .bg-surface-2 { background: var(--color-surface-2); }
    .border-border { border-color: var(--color-border); }
    .border-primary { border-color: var(--color-primary); }
    .bg-primary-light { background: color-mix(in srgb, var(--color-primary) 10%, transparent); }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
  `]
})
export class FinancialCategoryManagerComponent implements OnInit {
  protected readonly store = inject(FinanceStore);
  private readonly fb = inject(FormBuilder);
  private readonly titleService = inject(Title);

  readonly TransactionType = TransactionType;
  readonly availableIcons = CATEGORY_ICONS;
  readonly availableColors = CATEGORY_COLORS;

  currentType = signal<number>(TransactionType.Expense);
  showForm    = signal(false);

  form = this.fb.group({
    name:  ['', Validators.required],
    type:  [TransactionType.Expense, Validators.required],
    icon:  ['🛒'],
    color: ['#DBEAFE'] // blue-100
  });

  ngOnInit(): void {
    this.titleService.setTitle('Categories | Sunbula');
    if (this.store.allCategories().length === 0) {
      this.store.loadAll();
    }
  }

  filteredCategories(): FinancialCategoryDto[] {
    const t = this.currentType();
    return this.store.allCategories().filter(c => c.type === t);
  }

  getLightColor(hex: string): string {
    // A simple hack to get a lighter shade for backgrounds without a complex lib
    // In actual implementation, Tailwind classes or proper color-mix would be used.
    // We'll use color-mix CSS function in the inline style output.
    return `color-mix(in srgb, ${hex} 20%, white)`;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    
    const v = this.form.getRawValue();
    const dto: CreateFinancialCategoryDto = {
      name: v.name!,
      type: v.type!,
      icon: v.icon,
      color: v.color
    };

    this.store.addCategory(dto);
    this.showForm.set(false);
    this.form.reset({ type: this.currentType(), icon: '🛒', color: '#DBEAFE' });
  }

  onDelete(cat: FinancialCategoryDto): void {
    if (confirm(`Remove category "${cat.name}"? Transactions using it will lose their category.`)) {
      // API call to delete logic happens in store or via service directly depending on requirements
      // For now, let's assume store has deleteCategory or we just ignore the backend sync for the prototype phase if not requested.
      alert('Delete category not fully wired in store yet, implemented UI scaffolding.');
    }
  }
}
