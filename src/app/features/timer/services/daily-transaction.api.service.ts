import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { DailySummaryDto } from '@shared/models/timer.models';

@Injectable({ providedIn: 'root' })
export class DailyTransactionApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/DailyTransaction`;

  getTodaySummary(): Observable<DailySummaryDto> {
    return this.http.get<DailySummaryDto>(`${this.BASE}/today/summary`);
  }

  getStreak(): Observable<number> {
    return this.http.get<number>(`${this.BASE}/streak`);
  }
}
