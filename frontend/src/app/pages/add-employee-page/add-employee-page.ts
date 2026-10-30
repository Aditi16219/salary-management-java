import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeesService } from '../../api/employees.service';
import { EmployeeCreate } from '../../models/employee';
import { EmployeeForm } from '../../components/employees/employee-form';
import { apiErrorMessage } from '../../api/api-config';

@Component({
  selector: 'app-add-employee-page',
  imports: [EmployeeForm],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Add Employee</h2>
        <p class="text-sm text-gray-500 mt-1">Fill in the details to add a new employee.</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        @if (error()) {
          <p class="mb-4 text-sm text-red-600">{{ error() }}</p>
        }
        <app-employee-form
          submitLabel="Add Employee"
          [submitting]="submitting()"
          (save)="onSave($event)"
          (cancel)="router.navigate(['/'])"
        />
      </div>
    </div>
  `,
})
export class AddEmployeePage {
  protected readonly router = inject(Router);
  private readonly employeesService = inject(EmployeesService);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected onSave(data: EmployeeCreate): void {
    this.submitting.set(true);
    this.error.set(null);
    this.employeesService.create(data).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(apiErrorMessage(err));
        this.submitting.set(false);
      },
    });
  }
}
