import { Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeCreate, EmploymentType } from '../../models/employee';

type FieldName = 'full_name' | 'email' | 'job_title' | 'department' | 'country' | 'salary' | 'hire_date';

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        @for (field of fields; track field.name) {
          <div>
            <label [for]="field.name" class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}</label>
            <input
              [id]="field.name"
              [type]="field.type"
              [placeholder]="field.placeholder"
              [formControlName]="field.name"
              [attr.min]="field.type === 'number' ? 0 : null"
              class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              [class.border-red-400]="error(field.name)"
              [class.border-gray-300]="!error(field.name)"
            />
            @if (error(field.name); as message) {
              <p class="text-red-500 text-xs mt-1">{{ message }}</p>
            }
          </div>
        }
        <div>
          <label for="employment_type" class="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
          <select
            id="employment_type"
            formControlName="employment_type"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            @for (type of employmentTypes; track type.value) {
              <option [value]="type.value">{{ type.label }}</option>
            }
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          (click)="cancel.emit()"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          [disabled]="submitting()"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {{ submitting() ? 'Saving…' : submitLabel() }}
        </button>
      </div>
    </form>
  `,
})
export class EmployeeForm implements OnInit {
  readonly initialData = input<Partial<EmployeeCreate>>();
  readonly submitLabel = input.required<string>();
  readonly submitting = input(false);

  readonly save = output<EmployeeCreate>();
  readonly cancel = output<void>();

  protected readonly fields: { name: FieldName; label: string; type: string; placeholder: string }[] = [
    { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Jane Doe' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com' },
    { name: 'job_title', label: 'Job Title', type: 'text', placeholder: 'Software Engineer' },
    { name: 'department', label: 'Department', type: 'text', placeholder: 'Engineering' },
    { name: 'country', label: 'Country', type: 'text', placeholder: 'United States' },
    { name: 'salary', label: 'Salary (USD)', type: 'number', placeholder: '80000' },
    { name: 'hire_date', label: 'Hire Date', type: 'date', placeholder: '' },
  ];

  protected readonly employmentTypes: { value: EmploymentType; label: string }[] = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
  ];

  protected readonly form = inject(FormBuilder).nonNullable.group({
    full_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    job_title: ['', Validators.required],
    department: ['', Validators.required],
    country: ['', Validators.required],
    salary: [null as number | null, [Validators.required, Validators.min(0)]],
    hire_date: ['', Validators.required],
    employment_type: ['full_time' as EmploymentType],
  });

  ngOnInit(): void {
    const data = this.initialData();
    if (data) {
      this.form.patchValue(data);
    }
  }

  /** Errors only show once the user has interacted with the field or tried to submit. */
  protected error(name: FieldName): string | null {
    const control = this.form.controls[name];
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('email')) {
      return 'Invalid email';
    }
    return control.hasError('min') ? 'Must be positive' : 'Required';
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.save.emit({ ...value, salary: Number(value.salary) });
  }
}
