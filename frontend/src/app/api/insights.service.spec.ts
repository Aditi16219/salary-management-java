import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InsightsService } from './insights.service';

const API = 'http://localhost:8000';

describe('InsightsService', () => {
  let service: InsightsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InsightsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches salary by country', () => {
    service.salaryByCountry().subscribe();
    http.expectOne(`${API}/insights/salary-by-country`);
  });

  it('fetches salary by job title for a country', () => {
    service.salaryByJobTitle('India').subscribe();
    const req = http.expectOne((r) => r.url === `${API}/insights/salary-by-jobtitle`);
    expect(req.request.params.get('country')).toBe('India');
  });

  it('fetches headcount by country', () => {
    service.headcountByCountry().subscribe();
    http.expectOne(`${API}/insights/headcount-by-country`);
  });

  it('fetches the department summary', () => {
    service.departmentSummary().subscribe();
    http.expectOne(`${API}/insights/department-summary`);
  });

  it('fetches top earners with an optional limit', () => {
    service.topEarners(5).subscribe();
    const req = http.expectOne((r) => r.url === `${API}/insights/top-earners`);
    expect(req.request.params.get('limit')).toBe('5');
  });
});
