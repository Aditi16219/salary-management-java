import { render, screen } from '@testing-library/angular';
import { NEVER, of } from 'rxjs';
import { AddEmployeePage } from './add-employee-page/add-employee-page';
import { EditEmployeePage } from './edit-employee-page/edit-employee-page';
import { EmployeesService } from '../api/employees.service';
import { Employee } from '../models/employee';

const mockEmployee: Employee = {
  id: '123',
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

const serviceWith = (get: jest.Mock) => ({
  provide: EmployeesService,
  useValue: { get, create: jest.fn(), update: jest.fn() },
});

describe('AddEmployeePage', () => {
  it('renders the add form with heading', async () => {
    await render(AddEmployeePage, { providers: [serviceWith(jest.fn())] });
    expect(screen.getAllByText('Add Employee').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('Jane Doe')).toBeInTheDocument();
  });
});

describe('EditEmployeePage', () => {
  const renderEdit = (get: jest.Mock) =>
    render(EditEmployeePage, { inputs: { id: '123' }, providers: [serviceWith(get)] });

  it('shows loading state initially', async () => {
    await renderEdit(jest.fn().mockReturnValue(NEVER));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('populates form with employee data', async () => {
    const get = jest.fn().mockReturnValue(of(mockEmployee));
    await renderEdit(get);
    expect(await screen.findByDisplayValue('Jane Doe')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('123');
  });

  it('shows employee name as subtitle', async () => {
    await renderEdit(jest.fn().mockReturnValue(of(mockEmployee)));
    expect((await screen.findAllByText('Jane Doe')).length).toBeGreaterThan(0);
  });
});
