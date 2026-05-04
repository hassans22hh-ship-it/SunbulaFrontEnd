import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FinanceStore } from '../store/finance.store';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';
import { EmojiPickerComponent } from '@shared/ui/emoji-picker/emoji-picker.component';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { FinancialCategoryDto, CreateFinancialCategoryDto } from '@shared/models/finance.models';

@Component({
  selector: 'sb-categories-page',
  standalone: true,
  imports: [
    RouterLink, SbSpinnerComponent, SbEmptyStateComponent, SbModalComponent,
    SbButtonComponent, SbConfirmDialogComponent, EmojiPickerComponent, PageTransitionDirective,
  ],
  providers: [FinanceStore],
  templateUrl: './categories-page.component.html',
  styleUrl: './categories-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPageComponent implements OnInit {
  protected readonly store = inject(FinanceStore);

  readonly showAddForm = signal(false);
  readonly newCatName = signal('');
  readonly newCatIcon = signal('');

  readonly contextMenuCat = signal<FinancialCategoryDto | null>(null);
  readonly showRenameModal = signal(false);
  readonly showIconModal = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly renameName = signal('');
  readonly changeIcon = signal('');

  ngOnInit(): void {
    this.store.loadAll();
  }

  openAddForm(): void {
    this.newCatName.set('');
    this.newCatIcon.set('');
    this.showAddForm.set(true);
  }

  async addCategory(): Promise<void> {
    const name = this.newCatName().trim();
    if (name.length < 2) return;
    await this.store.createCategory({ name, icon: this.newCatIcon() } as CreateFinancialCategoryDto);
    this.showAddForm.set(false);
  }

  openContextMenu(event: MouseEvent, cat: FinancialCategoryDto): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuCat.set(cat);
  }

  closeContextMenu(): void {
    this.contextMenuCat.set(null);
  }

  openRename(): void {
    const cat = this.contextMenuCat();
    if (!cat) return;
    this.renameName.set(cat.name);
    this.showRenameModal.set(true);
    this.closeContextMenu();
  }

  async submitRename(): Promise<void> {
    const cat = this.contextMenuCat() ?? this.lastActionCat();
    const name = this.renameName().trim();
    if (!cat || name.length < 2) return;
    await this.store.renameCategory(cat.id, name);
    this.showRenameModal.set(false);
  }

  openChangeIcon(): void {
    const cat = this.contextMenuCat();
    if (!cat) return;
    this.changeIcon.set(cat.icon);
    this.showIconModal.set(true);
    this._lastActionCat.set(cat);
    this.closeContextMenu();
  }

  async submitChangeIcon(icon: string): Promise<void> {
    const cat = this._lastActionCat();
    if (!cat) return;
    await this.store.updateCategoryIcon(cat.id, icon);
    this.showIconModal.set(false);
  }

  openDelete(): void {
    this._lastActionCat.set(this.contextMenuCat());
    this.showDeleteConfirm.set(true);
    this.closeContextMenu();
  }

  async confirmDelete(): Promise<void> {
    const cat = this._lastActionCat();
    if (!cat) return;
    await this.store.deleteCategory(cat.id);
    this.showDeleteConfirm.set(false);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  // Helper to store the cat being acted upon when context menu closes
  private readonly _lastActionCat = signal<FinancialCategoryDto | null>(null);
  lastActionCat = this._lastActionCat.asReadonly();
}
