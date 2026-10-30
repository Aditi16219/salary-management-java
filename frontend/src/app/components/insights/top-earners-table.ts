import { Component, input } from '@angular/core';
import { TopEarner } from '../../models/insights';
import { formatSalary } from '../../utils/format';

@Component({
  selector: 'app-top-earners-table',
  template: `
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100">
        <h3 class="font-semibold text-gray-800 text-sm">Top Earners</h3>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            @for (h of headers; track h) {
              <th
                class="px-4 py-2 font-medium text-gray-500"
                [class.text-right]="h === 'Salary'"
                [class.text-left]="h !== 'Salary'"
              >
                {{ h }}
              </th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          @for (r of rows(); track r.id; let i = $index) {
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-2 text-gray-400 w-8">{{ i + 1 }}</td>
              <td class="px-4 py-2 font-medium text-gray-900">{{ r.full_name }}</td>
              <td class="px-4 py-2 text-gray-600">{{ r.job_title }}</td>
              <td class="px-4 py-2 text-gray-600">{{ r.department }}</td>
              <td class="px-4 py-2 text-gray-600">{{ r.country }}</td>
              <td class="px-4 py-2 text-right font-semibold text-gray-900">{{ fmt(r.salary) }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class TopEarnersTable {
  readonly rows = input.required<TopEarner[]>();
  protected readonly headers = ['#', 'Name', 'Job Title', 'Department', 'Country', 'Salary'];
  protected readonly fmt = formatSalary;
}
