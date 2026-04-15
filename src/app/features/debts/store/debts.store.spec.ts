import { TestBed } from '@angular/core/testing';
import { DebtsStore } from './debts.store';
import { DebtsApiService } from '../services/debts.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { of, throwError } from 'rxjs';
import { DebtDto, CreateDebtDto } from '@shared/models/debt.models';

describe('DebtsStore', () => {
  let store: InstanceType<typeof DebtsStore>;
  let apiSpy: jasmine.SpyObj<DebtsApiService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const mockDebt: DebtDto = {
    id: '1', creditorName: 'Test', amount: 100, remainingAmount: 100, isPaid: false, isOverdue: false, debtType: 'OWED_TO_ME', notes: null, createdAt: new Date().toISOString(), dueDate: new Date().toISOString()
  };

  const mockSummary = { totalDebtsCount: 1, unpaidDebtsCount: 1, overdueDebtsCount: 0 };

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('DebtsApiService', ['getAll', 'getSummary', 'create', 'recordPayment', 'delete']);
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      providers: [
        DebtsStore,
        { provide: DebtsApiService, useValue: apiSpy },
        { provide: ToastService, useValue: toastSpy }
      ]
    });

    store = TestBed.inject(DebtsStore);
  });

  it('should load all debts and summary successfully', async () => {
    apiSpy.getAll.and.returnValue(of([mockDebt]));
    apiSpy.getSummary.and.returnValue(of(mockSummary));

    await store.loadAll();

    expect(apiSpy.getAll).toHaveBeenCalled();
    expect(apiSpy.getSummary).toHaveBeenCalled();
    expect(store.debts().length).toBe(1);
    expect(store.summary()?.totalDebtsCount).toBe(1);
    expect(store.isLoading()).toBeFalse();
  });

  it('should handle load errors', async () => {
    apiSpy.getAll.and.returnValue(throwError(() => new Error('API Error')));
    apiSpy.getSummary.and.returnValue(of(mockSummary));

    await store.loadAll();

    expect(store.error()).toBe('API Error');
    expect(store.isLoading()).toBeFalse();
  });

  it('should create a debt and display success toast', async () => {
    const dto: CreateDebtDto = { creditorName: 'New', amount: 50, debtType: 'OWED_BY_ME', dueDate: '', notes: null };
    const newDebt = { ...mockDebt, id: '2', ...dto };
    apiSpy.create.and.returnValue(of(newDebt as DebtDto));

    await store.create(dto);

    expect(apiSpy.create).toHaveBeenCalledWith(dto);
    expect(store.debts()).toContain(newDebt as DebtDto);
    expect(toastSpy.success).toHaveBeenCalledWith('Debt created');
  });

  it('should record payment and reload store', async () => {
    apiSpy.recordPayment.and.returnValue(of({ amount: 50, paymentDate: '', notes: null }));
    apiSpy.getAll.and.returnValue(of([mockDebt]));
    apiSpy.getSummary.and.returnValue(of(mockSummary));

    await store.recordPayment('1', { amount: 50, paymentDate: '', notes: null });

    expect(apiSpy.recordPayment).toHaveBeenCalledWith('1', jasmine.any(Object));
    expect(apiSpy.getAll).toHaveBeenCalled(); 
    expect(toastSpy.success).toHaveBeenCalledWith('Payment recorded');
  });
});
