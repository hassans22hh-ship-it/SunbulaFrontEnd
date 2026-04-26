import { computed, inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { CategoryApiService } from '../services/category.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { CategoryDto, CreateCategoryDto } from '@shared/models/task.models';
import { firstValueFrom } from 'rxjs';

interface CategoriesState {
  categories: CategoryDto[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  isLoading: false,
  error: null,
};

export const CategoriesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(CategoryApiService), toast = inject(ToastService)) => ({
    async load(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const categories = await firstValueFrom(api.getAll());
        patchState(store, { categories, isLoading: false });
      } catch (e: unknown) {
        patchState(store, { isLoading: false, error: (e as { message: string }).message });
        toast.error('Failed to load categories');
      }
    },

    async create(dto: CreateCategoryDto): Promise<void> {
      try {
        const category = await firstValueFrom(api.create(dto));
        patchState(store, { categories: [...store.categories(), category] });
        toast.success('Category created');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },

    async remove(id: string): Promise<void> {
      try {
        await firstValueFrom(api.delete(id));
        patchState(store, { categories: store.categories().filter(c => c.id !== id) });
        toast.success('Category deleted');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    },

    async update(id: string, dto: { name: string; color: string }): Promise<void> {
      try {
        const updated = await firstValueFrom(api.update(id, dto));
        patchState(store, {
          categories: store.categories().map(c => c.id === id ? updated : c)
        });
        toast.success('Category updated');
      } catch (e: unknown) {
        toast.error((e as { message: string }).message);
      }
    }

  }))
);
