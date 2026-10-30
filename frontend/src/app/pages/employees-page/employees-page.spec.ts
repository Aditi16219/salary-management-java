import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NEVER, of } from 'rxjs';
import { EmployeesPage } from './employees-page';
import { EmployeesService } from '../../api/employees.service';
import { MetaService } from '../../api/meta.service';
import { Employee } from '../../models/employee';

const mockEmployee: Employee = {
  id: '1',
  full_name: 'Jane Doe',
  job_title: 'Software Engineer',
  country: 'United States',
  salary: 95000,
  department: 'Engineering',
  email: 'jane@example.com',
  hire_date: '2022-01-15',
  employment_type: 'full_time',
  is_active: true,
  created_at: '2022-01-15T00:00:00',
  updated_at: '2022-01-15T00:00:00',
};

const mockResponse = (items = [mockEmployee], total = 1) =>
  of({ items, total, page: 1, page_size: 20 });

// The filters load dropdown options; stub them so tests never hit the network.
const metaStub = {
  provide: MetaService,
  useValue: {
    countries: () => of(['Canada']),
    departments: () => of(['Finance']),
    jobTitles: () => of(['QA Engineer']),
  },
};

/** The params of the most recent list() call. */
const lastQuery = (list: jest.Mock) => list.mock.calls[list.mock.calls.length - 1][0];

const renderPage = (list = jest.fn().mockReturnValue(mockResponse())) =>
  render(EmployeesPage, {
    providers: [{ provide: EmployeesService, useValue: { list, remove: jest.fn() } }, metaStub],
  });

describe('EmployeesPage', () => {
  it('shows loading state initially', async () => {
    await renderPage(jest.fn().mockReturnValue(NEVER));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders employee name after loading', async () => {
    await renderPage();
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows an initials avatar next to each name', async () => {
    await renderPage();
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('JD')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders job title and country', async () => {
    await renderPage();
    expect(await screen.findByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('renders email and hire date columns', async () => {
    await renderPage();
    expect(await screen.findByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('2022-01-15')).toBeInTheDocument();

    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent?.trim());
    expect(headers).toEqual([
      'Name', 'Email', 'Job Title', 'Department', 'Country', 'Salary', 'Type', 'Hire Date', '',
    ]);
  });

  it('shows total employee count', async () => {
    await renderPage();
    expect(await screen.findByText(/1 total employee/i)).toBeInTheDocument();
  });

  it('shows empty state when no employees', async () => {
    await renderPage(jest.fn().mockReturnValue(mockResponse([], 0)));
    expect(await screen.findByText(/no employees found/i)).toBeInTheDocument();
  });

  it('has a search input', async () => {
    await renderPage();
    expect(await screen.findByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('has an Add Employee button', async () => {
    await renderPage();
    expect(await screen.findByText('Add Employee')).toBeInTheDocument();
  });

  it('sorts by full name ascending by default', async () => {
    const list = jest.fn().mockReturnValue(mockResponse());
    await renderPage(list);
    await screen.findByText('Jane Doe');

    expect(lastQuery(list)).toEqual(expect.objectContaining({ sort_by: 'full_name', sort_order: 'asc' }));
  });

  it('sorts by salary on header click and toggles direction on a second click', async () => {
    const list = jest.fn().mockReturnValue(mockResponse());
    await renderPage(list);

    await userEvent.click(await screen.findByRole('button', { name: /salary/i }));
    expect(lastQuery(list)).toEqual(expect.objectContaining({ sort_by: 'salary', sort_order: 'asc', page: 1 }));
    expect(screen.getByRole('columnheader', { name: /salary/i })).toHaveAttribute('aria-sort', 'ascending');

    await userEvent.click(await screen.findByRole('button', { name: /salary/i }));
    expect(lastQuery(list)).toEqual(expect.objectContaining({ sort_by: 'salary', sort_order: 'desc' }));
    expect(screen.getByRole('columnheader', { name: /salary/i })).toHaveAttribute('aria-sort', 'descending');
  });

  it('switching to hire date starts ascending and resets to page 1', async () => {
    const list = jest.fn().mockReturnValue(of({ items: [mockEmployee], total: 45, page: 1, page_size: 20 }));
    await renderPage(list);

    await userEvent.click(await screen.findByRole('button', { name: 'Next page' }));
    expect(lastQuery(list).page).toBe(2);

    await userEvent.click(await screen.findByRole('button', { name: /salary/i }));
    await userEvent.click(await screen.findByRole('button', { name: /salary/i }));
    await userEvent.click(await screen.findByRole('button', { name: /hire date/i }));

    expect(lastQuery(list)).toEqual(expect.objectContaining({ sort_by: 'hire_date', sort_order: 'asc', page: 1 }));
  });

  it('filters by job title', async () => {
    const list = jest.fn().mockReturnValue(mockResponse());
    await renderPage(list);

    await userEvent.selectOptions(await screen.findByRole('combobox', { name: 'Job Title' }), 'QA Engineer');

    expect(lastQuery(list)).toEqual(expect.objectContaining({ job_title: 'QA Engineer', page: 1 }));
  });

  it('asks for confirmation before deleting', async () => {
    const remove = jest.fn().mockReturnValue(of(undefined));
    await render(EmployeesPage, {
      providers: [
        { provide: EmployeesService, useValue: { list: jest.fn().mockReturnValue(mockResponse()), remove } },
        metaStub,
      ],
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));
    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete Employee' }));
    expect(remove).toHaveBeenCalledWith('1');
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
  });
});
