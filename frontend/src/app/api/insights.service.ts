import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CountryHeadcount,
  CountrySalaryStats,
  DepartmentSummary,
  JobTitleSalaryStats,
  TopEarner,
} from '../models/insights';
import { API_BASE_URL, toParams } from './api-config';

@Injectable({ providedIn: 'root' })
export class InsightsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/insights`;

  salaryByCountry(): Observable<CountrySalaryStats[]> {
    return this.http.get<CountrySalaryStats[]>(`${this.baseUrl}/salary-by-country`);
  }

  salaryByJobTitle(country: string): Observable<JobTitleSalaryStats[]> {
    return this.http.get<JobTitleSalaryStats[]>(`${this.baseUrl}/salary-by-jobtitle`, {
      params: toParams({ country }),
    });
  }

  headcountByCountry(): Observable<CountryHeadcount[]> {
    return this.http.get<CountryHeadcount[]>(`${this.baseUrl}/headcount-by-country`);
  }

  departmentSummary(): Observable<DepartmentSummary[]> {
    return this.http.get<DepartmentSummary[]>(`${this.baseUrl}/department-summary`);
  }

  topEarners(limit?: number): Observable<TopEarner[]> {
    return this.http.get<TopEarner[]>(`${this.baseUrl}/top-earners`, {
      params: toParams({ limit }),
    });
  }
}
