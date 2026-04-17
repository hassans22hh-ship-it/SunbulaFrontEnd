import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TimeReportDto, ReportFilterDto, TaskReportDto } from '@shared/models/reports.models';

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  private readonly reportsBase = `${environment.apiUrl}/api/v1/Reports`;
  private readonly sessionBase = `${environment.apiUrl}/api/v1/TimeSession`;

  getReport(filters: ReportFilterDto): Observable<TimeReportDto> {
    return this.http.get<TimeReportDto>(`${this.sessionBase}/range`, {
      params: { from: filters.from || '', to: filters.to || '' }
    });
  }

  getSummaryReport(): Observable<TaskReportDto> {
    return this.http.get<TaskReportDto>(`${this.reportsBase}/summary`);
  }
}
