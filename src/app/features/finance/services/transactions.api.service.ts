import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { TransactionDto, CreateTransactionDto } from '@features/finance/models/finance.models';

@Injectable({ providedIn: 'root' })
export class TransactionsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/Transactions`;

  getAll(walletId?: string): Observable<TransactionDto[]> {
    let params = new HttpParams();
    if (walletId) params = params.set('walletId', walletId);
    
    return this.http.get<TransactionDto[]>(this.base, { params });
  }

  create(dto: CreateTransactionDto): Observable<TransactionDto> {
    return this.http.post<TransactionDto>(this.base, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
