import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Employee,
  EmployeeCreate,
  EmployeeListParams,
  EmployeeListResponse,
  EmployeeUpdate,
} from '../models/employee';
import { API_BASE_URL, toParams } from './api-config';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/employees`;

  list(params?: EmployeeListParams): Observable<EmployeeListResponse> {
    return this.http.get<EmployeeListResponse>(this.baseUrl, { params: toParams(params) });
  }

  get(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  create(data: EmployeeCreate): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, data);
  }

  update(id: string, data: EmployeeUpdate): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
