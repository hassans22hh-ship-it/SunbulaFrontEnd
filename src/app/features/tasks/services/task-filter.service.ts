import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskFilterService {
  private readonly _categoryFilter$ = new BehaviorSubject<string | undefined>(undefined);
  readonly categoryFilter$ = this._categoryFilter$.asObservable();

  setCategoryFilter(categoryId: string | undefined): void {
    this._categoryFilter$.next(categoryId);
  }
}
