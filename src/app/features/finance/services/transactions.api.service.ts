import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { FinancialTransactionDto, CreateFinancialTransactionDto, UpdateFinancialTransactionDto } from '@shared/models/finance.models';

@Injectable({ providedIn: 'root' })
export class TransactionsApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/transactions`;

  getAll(): Observable<FinancialTransactionDto[]>                  { return this.http.get<FinancialTransactionDto[]>(this.BASE); }
  getByWallet(walletId: string): Observable<FinancialTransactionDto[]> { return this.http.get<FinancialTransactionDto[]>(`${this.BASE}/wallet/${walletId}`); }
  create(dto: CreateFinancialTransactionDto): Observable<FinancialTransactionDto> { return this.http.post<FinancialTransactionDto>(this.BASE, dto); }
  update(id: string, dto: UpdateFinancialTransactionDto): Observable<FinancialTransactionDto> { return this.http.put<FinancialTransactionDto>(`${this.BASE}/${id}`, dto); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.BASE}/${id}`); }
}
