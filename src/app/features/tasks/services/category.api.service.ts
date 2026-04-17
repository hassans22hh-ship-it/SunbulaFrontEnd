import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '@shared/models/task.models';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/v1/Category`;

  getAll(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.BASE);
  }

  getById(id: string): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.BASE}/${id}`);
  }

  create(dto: CreateCategoryDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.BASE, dto);
  }

  update(id: string, dto: UpdateCategoryDto): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.BASE}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}
