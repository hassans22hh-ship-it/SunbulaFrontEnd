import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PlantDto } from '@shared/models/plant.models';

@Injectable({ providedIn: 'root' })
export class PlantApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/v1/Plant`;

  getAll(): Observable<PlantDto[]> { return this.http.get<PlantDto[]>(this.BASE); }
  getById(id: string): Observable<PlantDto> { return this.http.get<PlantDto>(`${this.BASE}/${id}`); }
  getByLevel(level: number): Observable<PlantDto[]> { return this.http.get<PlantDto[]>(`${this.BASE}/level/${level}`); }
  getSeasonal(): Observable<PlantDto[]> { return this.http.get<PlantDto[]>(`${this.BASE}/seasonal`); }

  // Admin Endpoints
  create(dto: any): Observable<PlantDto> { return this.http.post<PlantDto>(this.BASE, dto); }
  update(id: string, dto: any): Observable<PlantDto> { return this.http.put<PlantDto>(`${this.BASE}/${id}`, dto); }
  patchAvailability(id: string, isAvailable: boolean): Observable<void> { 
    return this.http.patch<void>(`${this.BASE}/${id}/availability`, { isAvailable }); 
  }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.BASE}/${id}`); }
}
