import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

/** Distinct values from active employees, for filter dropdowns. */
@Injectable({ providedIn: 'root' })
export class MetaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/meta`;

  countries(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/countries`);
  }

  departments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/departments`);
  }

  jobTitles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/job-titles`);
  }
}
