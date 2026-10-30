import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CountrySalaryStats } from '../../models/insights';
import { formatSalary } from '../../utils/format';

@Component({
  selector: 'app-salary-by-country-table',
  imports: [DecimalPipe],
  template: `
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-indigo-100 bg-indigo-50">
        <h3 class="font-semibold text-indigo-800 text-sm">Salary by Country</h3>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-4 py-2 font-semibold text-indigo-600 text-xs uppercase tracking-wide text-left">Country</th>
            <th class="px-4 py-2 font-semibold text-indigo-600 text-xs uppercase tracking-wide text-left">Employees</th>
            <th class="px-4 py-2 font-semibold text-indigo-600 text-xs uppercase tracking-wide text-right">Min</th>
            <th class="px-4 py-2 font-semibold text-indigo-600 text-xs uppercase tracking-wide text-right">Avg</th>
            <th class="px-4 py-2 font-semibold text-indigo-600 text-xs uppercase tracking-wide text-right">Max</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          @for (r of rows(); track r.country) {
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-2 font-medium text-gray-900">{{ r.country }}</td>
              <td class="px-4 py-2 text-gray-600">{{ r.employee_count | number }}</td>
              <td class="px-4 py-2 text-right text-gray-600">{{ fmt(r.min_salary) }}</td>
              <td class="px-4 py-2 text-right font-medium text-gray-900">{{ fmt(r.avg_salary) }}</td>
              <td class="px-4 py-2 text-right text-gray-600">{{ fmt(r.max_salary) }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class SalaryByCountryTable {
  readonly rows = input.required<CountrySalaryStats[]>();
  protected readonly fmt = formatSalary;
}
