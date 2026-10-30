import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the layout with the app name and navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('nav')?.textContent).toContain('Salary Management');
    const links = Array.from(compiled.querySelectorAll('nav a')).map((a) => a.textContent?.trim());
    expect(links).toEqual(['Employees', 'Insights']);
  });

  it('routes / to the employees page and /insights to the insights page', () => {
    expect(routes.find((r) => r.path === '')?.component?.name).toContain('EmployeesPage');
    expect(routes.find((r) => r.path === 'insights')?.component?.name).toContain('InsightsPage');
  });
});
