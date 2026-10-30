import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { JobTitleSalaryStats } from '../../models/insights';
import { formatSalary } from '../../utils/format';

@Component({
  selector: 'app-salary-by-job-title-table',
  imports: [DecimalPipe],
  template: `
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-sky-100 bg-sky-50 flex items-center justify-between">
        <h3 class="font-semibold text-sky-800 text-sm">Avg Salary by Job Title</h3>
        <select
          aria-label="Country"
          (change)="countryChange.emit($any($event.target).value)"
          class="text-sm border border-sky-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          @for (c of countries(); track c) {
            <option [value]="c" [selected]="c === country()">{{ c }}</option>
          }
        </select>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-4 py-2 font-semibold text-sky-600 text-xs uppercase tracking-wide text-left">Job Title</th>
            <th class="px-4 py-2 font-semibold text-sky-600 text-xs uppercase tracking-wide text-left">Employees</th>
            <th class="px-4 py-2 font-semibold text-sky-600 text-xs uppercase tracking-wide text-right">Avg Salary</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          @for (r of rows(); track r.job_title) {
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-2 font-medium text-gray-900">{{ r.job_title }}</td>
              <td class="px-4 py-2 text-gray-600">{{ r.employee_count | number }}</td>
              <td class="px-4 py-2 text-right font-semibold text-gray-900">{{ fmt(r.avg_salary) }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="3" class="px-4 py-6 text-center text-gray-400 text-sm">No data for this country.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class SalaryByJobTitleTable {
  readonly rows = input.required<JobTitleSalaryStats[]>();
  readonly country = input.required<string>();
  readonly countries = input.required<string[]>();

  readonly countryChange = output<string>();

  protected readonly fmt = formatSalary;
}
