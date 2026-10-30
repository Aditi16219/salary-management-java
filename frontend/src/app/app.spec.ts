import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import { App } from './app';
import { routes } from './app.routes';
import { EmployeesService } from './api/employees.service';
import { InsightsService } from './api/insights.service';

// Pages load data on navigation; stub the API so these tests only exercise routing.
const empty = () => of([]);
const providers = [
  {
    provide: EmployeesService,
    useValue: { list: () => of({ items: [], total: 0, page: 1, page_size: 20 }) },
  },
  {
    provide: InsightsService,
    useValue: {
      salaryByCountry: empty,
      departmentSummary: empty,
      topEarners: empty,
      headcountByCountry: empty,
    },
  },
];

describe('App', () => {
  it('renders the layout with the app name and navigation', async () => {
    await render(App, { routes, providers });

    expect(screen.getByText('Salary Management')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Employees' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Insights' })).toBeInTheDocument();
  });

  it('shows the employees page at /', async () => {
    const { navigate } = await render(App, { routes, providers });
    await navigate('/');

    expect(await screen.findByRole('heading', { name: 'Employees' })).toBeInTheDocument();
  });

  it('navigates to the insights page from the nav', async () => {
    await render(App, { routes, providers });

    await userEvent.click(screen.getByRole('link', { name: 'Insights' }));

    expect(await screen.findByRole('heading', { name: 'Insights' })).toBeInTheDocument();
  });
});
