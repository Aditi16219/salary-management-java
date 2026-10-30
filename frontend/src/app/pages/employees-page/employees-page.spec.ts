import { render, screen } from '@testing-library/angular';
import { NEVER, of } from 'rxjs';
import { EmployeesPage } from './employees-page';
import { EmployeesService } from '../../api/employees.service';
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

const renderPage = (list = jest.fn().mockReturnValue(mockResponse())) =>
  render(EmployeesPage, {
    providers: [{ provide: EmployeesService, useValue: { list, remove: jest.fn() } }],
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

  it('renders job title and country', async () => {
    await renderPage();
    expect(await screen.findByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
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
});
