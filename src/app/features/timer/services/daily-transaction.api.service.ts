import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { DailySummaryDto } from '@shared/models/timer.models';

@Injectable({ providedIn: 'root' })
export class DailyTransactionApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/v1/DailyTransaction`;

  getTodaySummary(): Observable<DailySummaryDto> { return this.http.get<DailySummaryDto>(`${this.BASE}/summary`); }
  getSummaryByDate(date: string): Observable<DailySummaryDto> { return this.http.get<DailySummaryDto>(`${this.BASE}/${date}/summary`); }
  getRangeSummary(startDate: string, endDate: string): Observable<DailySummaryDto[]> { 
    return this.http.get<DailySummaryDto[]>(`${this.BASE}/range`, { params: { startDate, endDate } }); 
  }
  getLastNDays(n: number): Observable<DailySummaryDto[]> { return this.http.get<DailySummaryDto[]>(`${this.BASE}/history`, { params: { days: n } }); }
  getStreak(): Observable<number> { return this.http.get<number>(`${this.BASE}/streak`); }
}
