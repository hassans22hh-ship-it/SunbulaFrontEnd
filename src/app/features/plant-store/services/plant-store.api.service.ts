import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PlantDto, UserPlantDto, PurchasePlantDto } from '../models/plant-store.models';

@Injectable({ providedIn: 'root' })
export class PlantStoreApiService {
  private readonly http = inject(HttpClient);
  // Based on the contract outline
  private readonly storeBase = `${environment.apiUrl}/api/v1/Store/plants`;
  private readonly gardenBase = `${environment.apiUrl}/api/v1/Garden`;

  // --- Store ---
  getAllPlants(): Observable<PlantDto[]> {
    return this.http.get<PlantDto[]>(this.storeBase);
  }

  purchasePlant(plantId: string): Observable<UserPlantDto> {
    return this.http.post<UserPlantDto>(`${this.storeBase}/purchase`, { plantId });
  }

  // --- Garden ---
  getMyGarden(): Observable<UserPlantDto[]> {
    return this.http.get<UserPlantDto[]>(this.gardenBase);
  }

  plantSeed(userPlantId: string): Observable<UserPlantDto> {
    return this.http.post<UserPlantDto>(`${this.gardenBase}/${userPlantId}/plant`, {});
  }

  waterPlant(userPlantId: string): Observable<UserPlantDto> {
    return this.http.post<UserPlantDto>(`${this.gardenBase}/${userPlantId}/water`, {});
  }
}
