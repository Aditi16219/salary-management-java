import { Component, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Search } from 'lucide-angular';
import { Observable, catchError, of } from 'rxjs';
import { MetaService } from '../../api/meta.service';

/** Dropdown options as a signal; a failed lookup only empties the dropdown, it never breaks the page. */
const options = (source: Observable<string[]>) =>
  toSignal(source.pipe(catchError(() => of([]))), { initialValue: [] });

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
          class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400"
        />
      </div>

      <select
        aria-label="Country"
        (change)="countryChange.emit(valueOf($event))"
        class="w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 bg-white"
      >
        <option value="" [selected]="country() === ''">All Countries</option>
        @for (c of countries(); track c) {
          <option [value]="c" [selected]="c === country()">{{ c }}</option>
        }
      </select>

      <select
        aria-label="Department"
        (change)="departmentChange.emit(valueOf($event))"
        class="w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 bg-white"
      >
        <option value="" [selected]="department() === ''">All Departments</option>
        @for (d of departments(); track d) {
          <option [value]="d" [selected]="d === department()">{{ d }}</option>
        }
      </select>

      <select
        aria-label="Job Title"
        (change)="jobTitleChange.emit(valueOf($event))"
        class="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 bg-white"
      >
        <option value="" [selected]="jobTitle() === ''">All Job Titles</option>
        @for (j of jobTitles(); track j) {
          <option [value]="j" [selected]="j === jobTitle()">{{ j }}</option>
        }
      </select>
    </div>
  `,
})
export class EmployeeFilters {
  protected readonly SearchIcon = Search;

  private readonly meta = inject(MetaService);
  protected readonly countries = options(this.meta.countries());
  protected readonly departments = options(this.meta.departments());
  protected readonly jobTitles = options(this.meta.jobTitles());

  readonly search = input('');
  readonly country = input('');
  readonly department = input('');
  readonly jobTitle = input('');

  readonly searchChange = output<string>();
  readonly countryChange = output<string>();
  readonly departmentChange = output<string>();
  readonly jobTitleChange = output<string>();

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }
}
