import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebtsComponent } from './debts.component';
import { DebtsStore } from './store/debts.store';
import { AuthService } from '@core/auth/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';

describe('DebtsComponent', () => {
  let component: DebtsComponent;
  let fixture: ComponentFixture<DebtsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { currentUser: signal({ id: 'user-1' }) }
        }
      ]
    })
    // We override the DebtsStore to use a mock implementation so we can inject values directly without relying on API
    .overrideProvider(DebtsStore, {
      useValue: {
        loadAll: jasmine.createSpy('loadAll'),
        create: jasmine.createSpy('create'),
        recordPayment: jasmine.createSpy('recordPayment'),
        remove: jasmine.createSpy('remove'),
        summary: signal({ totalDebtsCount: 2, unpaidDebtsCount: 1, overdueDebtsCount: 1 }),
        activeDebts: signal([{
          id: '1', creditorName: 'John', amount: 100, remainingAmount: 100, isPaid: false, isOverdue: true, debtType: 'OWED_BY_ME', notes: null, createdAt: new Date().toISOString()
        }]),
        settledDebts: signal([{
          id: '2', creditorName: 'Alice', amount: 50, remainingAmount: 0, isPaid: true, isOverdue: false, debtType: 'OWED_TO_ME', notes: null, createdAt: new Date().toISOString()
        }]),
        isLoading: signal(false)
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load debts', () => {
    expect(component).toBeTruthy();
    const store = TestBed.inject(DebtsStore);
    expect(store.loadAll).toHaveBeenCalled();
  });

  it('should display summary statistics', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const values = Array.from(compiled.querySelectorAll('.summary-value')).map(el => el.textContent?.trim());
    expect(values).toEqual(['2', '1', '1']);
  });

  it('should switch tabs correctly', () => {
    expect(component.tab()).toBe('active');
    
    // Switch to settled
    const tabs = fixture.nativeElement.querySelectorAll('.nav-tab');
    tabs[1].click();
    fixture.detectChanges();
    
    expect(component.tab()).toBe('settled');
  });

  it('should toggle new debt form modal', () => {
    expect(component.showCreate()).toBeFalse();
    
    // Click Fab
    const fabButton = fixture.nativeElement.querySelector('.fab');
    fabButton.click();
    fixture.detectChanges();
    
    expect(component.showCreate()).toBeTrue();
    const modal = fixture.nativeElement.querySelector('sb-modal');
    expect(modal).toBeTruthy();
  });

  it('should properly track expanded detail', () => {
    expect(component.selectedDebtId()).toBeNull();
    component.toggleDebtDetail('1');
    expect(component.selectedDebtId()).toBe('1');
    component.toggleDebtDetail('1');
    expect(component.selectedDebtId()).toBeNull();
  });
});
