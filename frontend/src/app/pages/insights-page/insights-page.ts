import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, filter, forkJoin, of, switchMap } from 'rxjs';
import { InsightsService } from '../../api/insights.service';
import {
  CountryHeadcount,
  CountrySalaryStats,
  DepartmentSummary,
  JobTitleSalaryStats,
  TopEarner,
} from '../../models/insights';
import { StatCard } from '../../components/ui/stat-card';
import { SalaryByCountryTable } from '../../components/insights/salary-by-country-table';
import { SalaryByJobTitleTable } from '../../components/insights/salary-by-job-title-table';
import { DepartmentSummaryTable } from '../../components/insights/department-summary-table';
import { TopEarnersTable } from '../../components/insights/top-earners-table';
import { formatSalary } from '../../utils/format';

@Component({
  selector: 'app-insights-page',
  imports: [
    DecimalPipe,
    StatCard,
    SalaryByCountryTable,
    SalaryByJobTitleTable,
    DepartmentSummaryTable,
    TopEarnersTable,
  ],
  template: `
    @if (loading()) {
      <div class="text-gray-500 py-8">Loading insights…</div>
    } @else if (failed()) {
      <div class="text-red-600 py-8">Failed to load insights. Please try again.</div>
    } @else {
      <div class="space-y-8">
        <div>
          <h2 class="text-2xl font-bold text-indigo-900">Insights</h2>
          <p class="text-sm text-indigo-400 mt-1">Salary analytics across your organization.</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <app-stat-card label="Total Employees" [value]="(totalEmployees() | number) ?? '0'" color="indigo" />
          <app-stat-card label="Global Avg Salary" [value]="fmt(globalAvg())" color="blue" />
          <app-stat-card label="Highest Salary" [value]="fmt(globalMax())" color="violet" />
          <app-stat-card
            label="Top Country"
            color="sky"
            [value]="topCountry()?.country ?? '—'"
            [sub]="((topCountry()?.employee_count ?? 0) | number) + ' employees'"
          />
        </div>

        <app-salary-by-country-table [rows]="countryStats()" />

        <app-salary-by-job-title-table
          [rows]="jobTitleStats()"
          [country]="jobTitleCountry()"
          [countries]="countryNames()"
          (countryChange)="jobTitleCountry.set($event)"
        />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <app-department-summary-table [rows]="deptStats()" />
          <app-top-earners-table [rows]="topEarners()" />
        </div>
      </div>
    }
  `,
})
export class InsightsPage {
  private readonly insightsService = inject(InsightsService);

  protected readonly fmt = formatSalary;
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly countryStats = signal<CountrySalaryStats[]>([]);
  protected readonly deptStats = signal<DepartmentSummary[]>([]);
  protected readonly topEarners = signal<TopEarner[]>([]);
  protected readonly headcount = signal<CountryHeadcount[]>([]);

  protected readonly totalEmployees = computed(() =>
    this.headcount().reduce((sum, r) => sum + r.employee_count, 0),
  );

  /** Average across all employees, weighting each country's average by its headcount. */
  protected readonly globalAvg = computed(() => {
    const rows = this.countryStats();
    const count = rows.reduce((sum, r) => sum + r.employee_count, 0);
    return count ? rows.reduce((sum, r) => sum + r.avg_salary * r.employee_count, 0) / count : 0;
  });

  protected readonly globalMax = computed(() =>
    this.countryStats().reduce((max, r) => Math.max(max, r.max_salary), 0),
  );

  /** headcount-by-country is sorted by count desc, so the first row is the largest. */
  protected readonly topCountry = computed<CountryHeadcount | undefined>(() => this.headcount()[0]);

  protected readonly countryNames = computed(() => this.countryStats().map((r) => r.country));
  protected readonly jobTitleCountry = signal('');
  protected readonly jobTitleStats = signal<JobTitleSalaryStats[]>([]);

  constructor() {
    // Reload the job-title breakdown whenever the selected country changes.
    toObservable(this.jobTitleCountry)
      .pipe(
        filter((country) => country !== ''),
        switchMap((country) =>
          this.insightsService.salaryByJobTitle(country).pipe(catchError(() => of([]))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((rows) => this.jobTitleStats.set(rows));

    forkJoin({
      countries: this.insightsService.salaryByCountry(),
      departments: this.insightsService.departmentSummary(),
      topEarners: this.insightsService.topEarners(10),
      headcount: this.insightsService.headcountByCountry(),
    })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: ({ countries, departments, topEarners, headcount }) => {
          this.countryStats.set(countries);
          this.deptStats.set(departments);
          this.topEarners.set(topEarners);
          this.headcount.set(headcount);
          this.jobTitleCountry.set(headcount[0]?.country ?? '');
          this.loading.set(false);
        },
        error: () => {
          this.failed.set(true);
          this.loading.set(false);
        },
      });
  }
}
