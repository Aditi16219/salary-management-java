import { Component, input, output } from '@angular/core';
import { LucideAngularModule, Search } from 'lucide-angular';

@Component({
  selector: 'app-employee-filters',
  imports: [LucideAngularModule],
  template: `
    <div class="flex gap-3 mb-4 flex-wrap">
      <div class="relative flex-1 min-w-[200px]">
        <lucide-icon
          [img]="SearchIcon"
          [size]="15"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by name, email, or job title..."
          [value]="search()"
          (input)="searchChange.emit(valueOf($event))"
          class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <input
        type="text"
        placeholder="Filter by country"
        [value]="country()"
        (input)="countryChange.emit(valueOf($event))"
        class="w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Filter by department"
        [value]="department()"
        (input)="departmentChange.emit(valueOf($event))"
        class="w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  `,
})
export class EmployeeFilters {
  protected readonly SearchIcon = Search;

  readonly search = input('');
  readonly country = input('');
  readonly department = input('');

  readonly searchChange = output<string>();
  readonly countryChange = output<string>();
  readonly departmentChange = output<string>();

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
