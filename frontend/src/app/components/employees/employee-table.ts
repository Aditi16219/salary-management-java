import { Component, input, output } from '@angular/core';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  LucideAngularModule,
  Pencil,
  Trash2,
} from 'lucide-angular';
import { Employee, EmploymentType, SortBy, SortOrder } from '../../models/employee';
import { formatSalary, formatType } from '../../utils/format';

@Component({
  selector: 'app-employee-table',
  imports: [LucideAngularModule],
  template: `
    @if (loading()) {
      <div class="flex justify-center py-12 text-gray-500">Loading...</div>
    } @else if (employees().length === 0) {
      <div class="text-center py-12 text-gray-500">No employees found.</div>
    } @else {
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-indigo-50 border-b border-indigo-100">
            <tr>
              @for (col of columns; track col.label) {
                <th
                  class="px-4 py-3 font-semibold text-indigo-700 text-xs uppercase tracking-wide whitespace-nowrap"
                  [class.text-right]="col.right"
                  [class.text-left]="!col.right"
                  [attr.aria-sort]="col.sortKey ? ariaSort(col.sortKey) : null"
                >
                  @if (col.sortKey; as key) {
                    <button
                      type="button"
                      (click)="sort.emit(key)"
                      class="uppercase tracking-wide font-semibold cursor-pointer hover:text-indigo-900 select-none"
                    >
                      {{ col.label }}
                      <lucide-icon
                        [img]="sortIcon(key)"
                        [size]="13"
                        class="inline ml-1"
                        [class.opacity-40]="sortBy() !== key"
                        [class.text-indigo-300]="sortBy() === key"
                      />
                    </button>
                  } @else {
                    {{ col.label }}
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (emp of employees(); track emp.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ emp.full_name }}</td>
                <td class="px-4 py-3 text-gray-500 text-xs">{{ emp.email }}</td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ emp.job_title }}</td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ emp.department }}</td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ emp.country }}</td>
                <td class="px-4 py-3 text-right text-gray-900">{{ formatSalary(emp.salary) }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                    [class]="badgeClass[emp.employment_type]"
                  >
                    {{ formatType(emp.employment_type) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ emp.hire_date }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2 justify-end">
                    <button
                      (click)="edit.emit(emp.id)"
                      class="p-1 text-gray-400 hover:text-indigo-600"
                      aria-label="Edit"
                    >
                      <lucide-icon [img]="PencilIcon" [size]="15" />
                    </button>
                    <button
                      (click)="delete.emit(emp.id)"
                      class="p-1 text-gray-400 hover:text-red-600"
                      aria-label="Delete"
                    >
                      <lucide-icon [img]="TrashIcon" [size]="15" />
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class EmployeeTable {
  protected readonly PencilIcon = Pencil;
  protected readonly TrashIcon = Trash2;
  protected readonly columns: { label: string; sortKey?: SortBy; right?: boolean }[] = [
    { label: 'Name' },
    { label: 'Email' },
    { label: 'Job Title' },
    { label: 'Department' },
    { label: 'Country' },
    { label: 'Salary', sortKey: 'salary', right: true },
    { label: 'Type' },
    { label: 'Hire Date', sortKey: 'hire_date' },
    { label: '' },
  ];
  protected readonly formatSalary = formatSalary;
  protected readonly formatType = formatType;
  protected readonly badgeClass: Record<EmploymentType, string> = {
    full_time: 'bg-green-100 text-green-700',
    part_time: 'bg-yellow-100 text-yellow-700',
    contract: 'bg-blue-100 text-blue-700',
  };

  readonly employees = input.required<Employee[]>();
  readonly loading = input(false);
  readonly sortBy = input<SortBy>('full_name');
  readonly sortOrder = input<SortOrder>('asc');

  readonly edit = output<string>();
  readonly delete = output<string>();
  readonly sort = output<SortBy>();

  protected sortIcon(key: SortBy) {
    if (this.sortBy() !== key) {
      return ChevronsUpDown;
    }
    return this.sortOrder() === 'asc' ? ChevronUp : ChevronDown;
  }

  protected ariaSort(key: SortBy): string {
    if (this.sortBy() !== key) {
      return 'none';
    }
    return this.sortOrder() === 'asc' ? 'ascending' : 'descending';
  }
}
