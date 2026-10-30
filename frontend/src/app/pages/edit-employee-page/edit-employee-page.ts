import { Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { EmployeesService } from '../../api/employees.service';
import { Employee, EmployeeCreate } from '../../models/employee';
import { EmployeeForm } from '../../components/employees/employee-form';
import { apiErrorMessage } from '../../api/api-config';

@Component({
  selector: 'app-edit-employee-page',
  imports: [EmployeeForm],
  template: `
    @if (loading()) {
      <div class="text-gray-500 py-8">Loading...</div>
    } @else if (employee(); as emp) {
      <div class="max-w-2xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Edit Employee</h2>
          <p class="text-sm text-gray-500 mt-1">{{ emp.full_name }}</p>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          @if (error()) {
            <p class="mb-4 text-sm text-red-600">{{ error() }}</p>
          }
          <app-employee-form
            [initialData]="emp"
            submitLabel="Save Changes"
            [submitting]="submitting()"
            (save)="onSave($event)"
            (cancel)="router.navigate(['/'])"
          />
        </div>
      </div>
    } @else {
      <div class="text-gray-500 py-8">Employee not found.</div>
    }
  `,
})
export class EditEmployeePage {
  /** Bound from the :id route param (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly router = inject(Router);
  private readonly employeesService = inject(EmployeesService);

  protected readonly employee = signal<Employee | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((id) => this.employeesService.get(id).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((employee) => {
        this.employee.set(employee);
        this.loading.set(false);
      });
  }

  protected onSave(data: EmployeeCreate): void {
    this.submitting.set(true);
    this.error.set(null);
    this.employeesService.update(this.id(), data).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(apiErrorMessage(err));
        this.submitting.set(false);
      },
    });
  }
}
