import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TimeReportDto, ReportFilterDto } from '@shared/models/reports.models';

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  // Using a hypothetical analytics endpoint based on the standard REST API for this project
  private readonly base = `${environment.apiUrl}/api/v1/Analytics`;

  getReport(filters: ReportFilterDto): Observable<TimeReportDto> {
    let params = new HttpParams()
      .set('startDate', filters.from || '')
      .set('endDate', filters.to || '');

    return this.http.get<TimeReportDto>(`${this.base}/summary`, { params });
  }
}
