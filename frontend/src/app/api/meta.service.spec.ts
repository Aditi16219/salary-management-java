import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MetaService } from './meta.service';

const API = 'http://localhost:8000';

describe('MetaService', () => {
  let service: MetaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MetaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches distinct countries', () => {
    service.countries().subscribe();
    http.expectOne(`${API}/meta/countries`);
  });

  it('fetches distinct departments', () => {
    service.departments().subscribe();
    http.expectOne(`${API}/meta/departments`);
  });
});
