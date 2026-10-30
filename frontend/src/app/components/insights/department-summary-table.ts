import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DepartmentSummary } from '../../models/insights';
import { formatSalary } from '../../utils/format';

@Component({
  selector: 'app-department-summary-table',
  imports: [DecimalPipe],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-cyan-100 bg-cyan-50">
        <h3 class="font-semibold text-cyan-800 text-sm">Department Summary</h3>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-4 py-2 font-semibold text-cyan-600 text-xs uppercase tracking-wide text-left">Department</th>
            <th class="px-4 py-2 font-semibold text-cyan-600 text-xs uppercase tracking-wide text-left">Employees</th>
            <th class="px-4 py-2 font-semibold text-cyan-600 text-xs uppercase tracking-wide text-right">Avg Salary</th>
            <th class="px-4 py-2 font-semibold text-cyan-600 text-xs uppercase tracking-wide text-right">Min</th>
            <th class="px-4 py-2 font-semibold text-cyan-600 text-xs uppercase tracking-wide text-right">Max</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          @for (r of rows(); track r.department) {
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-2 font-medium text-gray-900">{{ r.department }}</td>
              <td class="px-4 py-2 text-gray-600">{{ r.employee_count | number }}</td>
              <td class="px-4 py-2 text-right font-medium text-gray-900">{{ fmt(r.avg_salary) }}</td>
              <td class="px-4 py-2 text-right text-gray-600">{{ fmt(r.min_salary) }}</td>
              <td class="px-4 py-2 text-right text-gray-600">{{ fmt(r.max_salary) }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DepartmentSummaryTable {
  readonly rows = input.required<DepartmentSummary[]>();
  protected readonly fmt = formatSalary;
}
