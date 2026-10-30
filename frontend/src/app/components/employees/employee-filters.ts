import { Component, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Search } from 'lucide-angular';
import { catchError, of } from 'rxjs';
import { MetaService } from '../../api/meta.service';

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

      <select
        aria-label="Country"
        (change)="countryChange.emit(valueOf($event))"
        class="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="" [selected]="country() === ''">All Countries</option>
        @for (c of countries(); track c) {
          <option [value]="c" [selected]="c === country()">{{ c }}</option>
        }
      </select>

      <select
        aria-label="Department"
        (change)="departmentChange.emit(valueOf($event))"
        class="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="" [selected]="department() === ''">All Departments</option>
        @for (d of departments(); track d) {
          <option [value]="d" [selected]="d === department()">{{ d }}</option>
        }
      </select>
    </div>
  `,
})
export class EmployeeFilters {
  protected readonly SearchIcon = Search;

  private readonly meta = inject(MetaService);
  // A failed lookup only empties the dropdown; it must not break the page.
  protected readonly countries = toSignal(this.meta.countries().pipe(catchError(() => of([]))), {
    initialValue: [],
  });
  protected readonly departments = toSignal(this.meta.departments().pipe(catchError(() => of([]))), {
    initialValue: [],
  });

  readonly search = input('');
  readonly country = input('');
  readonly department = input('');

  readonly searchChange = output<string>();
  readonly countryChange = output<string>();
  readonly departmentChange = output<string>();

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }
}
