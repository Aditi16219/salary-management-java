import { Component, WritableSignal, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { EmployeesService } from '../../api/employees.service';
import { Employee } from '../../models/employee';
import { EmployeeFilters } from '../../components/employees/employee-filters';
import { EmployeeTable } from '../../components/employees/employee-table';
import { Pagination } from '../../components/ui/pagination';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-employees-page',
  imports: [DecimalPipe, EmployeeFilters, EmployeeTable, Pagination, ConfirmDialog],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Employees</h2>
          @if (!loading()) {
            <p class="text-sm text-gray-500 mt-1">
              {{ total() | number }} total employee{{ total() !== 1 ? 's' : '' }}
            </p>
          }
        </div>
        <button
          (click)="router.navigate(['/employees/new'])"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add Employee
        </button>
      </div>

      <app-employee-filters
        [search]="search()"
        [country]="country()"
        [department]="department()"
        (searchChange)="onFilter(search, $event)"
        (countryChange)="onFilter(country, $event)"
        (departmentChange)="onFilter(department, $event)"
      />

      <app-employee-table
        [employees]="employees()"
        [loading]="loading()"
        (edit)="router.navigate(['/employees', $event, 'edit'])"
        (delete)="deleteId.set($event)"
      />

      @if (deleteId()) {
        <app-confirm-dialog
          title="Delete Employee"
          message="Are you sure you want to delete this employee? This cannot be undone."
          (confirm)="executeDelete()"
          (cancel)="deleteId.set(null)"
        />
      }

      @if (!loading() && total() > pageSize) {
        <app-pagination
          [page]="page()"
          [pageSize]="pageSize"
          [total]="total()"
          (pageChange)="page.set($event)"
        />
      }
    </div>
  `,
})
export class EmployeesPage {
  protected readonly router = inject(Router);
  private readonly employeesService = inject(EmployeesService);

  protected readonly pageSize = PAGE_SIZE;
  protected readonly employees = signal<Employee[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly loading = signal(true);
  protected readonly search = signal('');
  protected readonly country = signal('');
  protected readonly department = signal('');
  protected readonly deleteId = signal<string | null>(null);

  private readonly query = computed(() => ({
    page: this.page(),
    page_size: PAGE_SIZE,
    search: this.search(),
    country: this.country(),
    department: this.department(),
  }));

  constructor() {
    // switchMap drops responses for stale queries when filters change quickly.
    toObservable(this.query)
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap((params) => this.employeesService.list(params).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        if (result) {
          this.employees.set(result.items);
          this.total.set(result.total);
        }
        this.loading.set(false);
      });
  }

  protected onFilter(filter: WritableSignal<string>, value: string): void {
    filter.set(value);
    this.page.set(1);
  }

  protected executeDelete(): void {
    const id = this.deleteId();
    if (!id) {
      return;
    }
    this.employeesService.remove(id).subscribe(() => {
      this.employees.update((list) => list.filter((e) => e.id !== id));
      this.total.update((t) => t - 1);
      this.deleteId.set(null);
    });
  }
}
