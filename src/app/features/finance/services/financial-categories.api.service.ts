import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { FinancialCategoryDto, CreateFinancialCategoryDto } from '@shared/models/finance.models';

@Injectable({ providedIn: 'root' })
export class FinancialCategoriesApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/financial-categories`;

  getAll(): Observable<FinancialCategoryDto[]>                        { return this.http.get<FinancialCategoryDto[]>(this.BASE); }
  create(dto: CreateFinancialCategoryDto): Observable<FinancialCategoryDto> { return this.http.post<FinancialCategoryDto>(this.BASE, dto); }
  /** ⚠️ Rename uses query param ?newName= with null body */
  rename(id: string, newName: string): Observable<FinancialCategoryDto> {
    return this.http.put<FinancialCategoryDto>(`${this.BASE}/${id}/rename`, null, { params: { newName } });
  }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.BASE}/${id}`); }
}
