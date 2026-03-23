import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { DebtDto, DebtWithPaymentsDto, DebtSummaryDto, CreateDebtDto, RecordPaymentDto, DebtPaymentDto } from '@shared/models/debt.models';

@Injectable({ providedIn: 'root' })
export class DebtsApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/debts`;

  getAll(): Observable<DebtDto[]>                                  { return this.http.get<DebtDto[]>(this.BASE); }
  getById(id: string): Observable<DebtWithPaymentsDto>             { return this.http.get<DebtWithPaymentsDto>(`${this.BASE}/${id}`); }
  getSummary(): Observable<DebtSummaryDto>                         { return this.http.get<DebtSummaryDto>(`${this.BASE}/summary`); }
  create(dto: CreateDebtDto): Observable<DebtDto>                  { return this.http.post<DebtDto>(this.BASE, dto); }
  recordPayment(id: string, dto: RecordPaymentDto): Observable<DebtPaymentDto> {
    return this.http.post<DebtPaymentDto>(`${this.BASE}/${id}/payment`, dto);
  }
  delete(id: string): Observable<void>                              { return this.http.delete<void>(`${this.BASE}/${id}`); }
}
