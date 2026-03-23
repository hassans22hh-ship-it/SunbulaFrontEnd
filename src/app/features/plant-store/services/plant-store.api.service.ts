import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PlantDto, UserPlantDto, GardenSummaryDto, PurchasePlantDto, GrowthHistoryDto } from '@shared/models/plant.models';

@Injectable({ providedIn: 'root' })
export class PlantStoreApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api`;

  getAvailablePlants(): Observable<PlantDto[]> { return this.http.get<PlantDto[]>(`${this.BASE}/store/plants`); }
  getGarden(): Observable<UserPlantDto[]> { return this.http.get<UserPlantDto[]>(`${this.BASE}/garden`); }

  purchase(dto: PurchasePlantDto): Observable<UserPlantDto> { return this.http.post<UserPlantDto>(`${this.BASE}/purchase`, dto); }
  getPlantHistory(userPlantId: string): Observable<GrowthHistoryDto[]> { return this.http.get<GrowthHistoryDto[]>(`${this.BASE}/garden/${userPlantId}/history`); }
}
