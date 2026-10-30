import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EmployeesService } from './employees.service';
import { EmployeeCreate } from '../models/employee';

const API = 'http://localhost:8000';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmployeesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists employees with only the params that are set', () => {
    service.list({ page: 2, page_size: 20, country: 'India', search: '' }).subscribe();

    const req = http.expectOne((r) => r.url === `${API}/employees`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('page_size')).toBe('20');
    expect(req.request.params.get('country')).toBe('India');
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ items: [], total: 0, page: 2, page_size: 20 });
  });

  it('gets an employee by id', () => {
    service.get('abc').subscribe();
    expect(http.expectOne(`${API}/employees/abc`).request.method).toBe('GET');
  });

  it('creates an employee', () => {
    const data = { full_name: 'Jane Doe' } as EmployeeCreate;
    service.create(data).subscribe();

    const req = http.expectOne(`${API}/employees`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
  });

  it('updates an employee', () => {
    service.update('abc', { salary: 110000 }).subscribe();

    const req = http.expectOne(`${API}/employees/abc`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ salary: 110000 });
  });

  it('removes an employee', () => {
    service.remove('abc').subscribe();
    expect(http.expectOne(`${API}/employees/abc`).request.method).toBe('DELETE');
  });
});
