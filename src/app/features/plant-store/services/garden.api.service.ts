import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { UserPlantDto, PurchasePlantDto, GrowthHistoryDto } from '@shared/models/plant.models';

@Injectable({ providedIn: 'root' })
export class GardenApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/v1/Garden`;

  getGarden(): Observable<UserPlantDto[]> { return this.http.get<UserPlantDto[]>(this.BASE); }
  getById(id: string): Observable<UserPlantDto> { return this.http.get<UserPlantDto>(`${this.BASE}/${id}`); }
  purchase(dto: PurchasePlantDto): Observable<UserPlantDto> { return this.http.post<UserPlantDto>(`${this.BASE}/purchase`, dto); }
  grow(id: string): Observable<UserPlantDto> { return this.http.post<UserPlantDto>(`${this.BASE}/${id}/grow`, {}); }
  
  // Historical context (if needed by frontend)
  getHistory(id: string): Observable<GrowthHistoryDto[]> { 
    return this.http.get<GrowthHistoryDto[]>(`${this.BASE}/${id}/history`); 
  }
}
