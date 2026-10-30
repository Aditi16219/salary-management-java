import { Component, input, output } from '@angular/core';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';
import { Employee } from '../../models/employee';
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
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              @for (header of headers; track header) {
                <th
                  class="px-4 py-3 font-medium text-gray-600"
                  [class.text-right]="header === 'Salary'"
                  [class.text-left]="header !== 'Salary'"
                >
                  {{ header }}
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
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap"
                  >
                    {{ formatType(emp.employment_type) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ emp.hire_date }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2 justify-end">
                    <button
                      (click)="edit.emit(emp.id)"
                      class="p-1 text-gray-400 hover:text-blue-600"
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
  protected readonly headers = [
    'Name', 'Email', 'Job Title', 'Department', 'Country', 'Salary', 'Type', 'Hire Date', '',
  ];
  protected readonly formatSalary = formatSalary;
  protected readonly formatType = formatType;

  readonly employees = input.required<Employee[]>();
  readonly loading = input(false);

  readonly edit = output<string>();
  readonly delete = output<string>();
}
