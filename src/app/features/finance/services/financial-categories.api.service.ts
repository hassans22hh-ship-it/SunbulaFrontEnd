import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { FinancialCategoryDto, CreateFinancialCategoryDto } from '@features/finance/models/finance.models';

@Injectable({ providedIn: 'root' })
export class FinancialCategoriesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/FinancialCategories`;

  getAll(): Observable<FinancialCategoryDto[]> {
    return this.http.get<FinancialCategoryDto[]>(this.base);
  }

  create(dto: CreateFinancialCategoryDto): Observable<FinancialCategoryDto> {
    return this.http.post<FinancialCategoryDto>(this.base, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
