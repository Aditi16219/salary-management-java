import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NEVER, of } from 'rxjs';
import { InsightsPage } from './insights-page';
import { InsightsService } from '../../api/insights.service';

const mockSalaryByCountry = [
  { country: 'United States', min_salary: 50000, max_salary: 150000, avg_salary: 95000, employee_count: 500 },
  { country: 'United Kingdom', min_salary: 40000, max_salary: 120000, avg_salary: 75000, employee_count: 200 },
];

const mockDeptSummary = [
  { department: 'Engineering', avg_salary: 110000, min_salary: 70000, max_salary: 200000, employee_count: 300 },
];

const mockTopEarners = [
  { id: '1', full_name: 'Alice Smith', job_title: 'Principal Engineer', country: 'USA', department: 'Engineering', salary: 200000 },
  { id: '2', full_name: 'Bob Jones', job_title: 'Engineering Manager', country: 'UK', department: 'Engineering', salary: 190000 },
];

const mockHeadcount = [
  { country: 'United States', employee_count: 500 },
  { country: 'United Kingdom', employee_count: 200 },
];

const mockJobTitleStats: Record<string, unknown[]> = {
  'United States': [{ job_title: 'Data Scientist', country: 'United States', avg_salary: 130000, employee_count: 25 }],
  'United Kingdom': [{ job_title: 'UX Designer', country: 'United Kingdom', avg_salary: 88000, employee_count: 12 }],
};

const mockService = () => ({
  salaryByCountry: jest.fn().mockReturnValue(of(mockSalaryByCountry)),
  departmentSummary: jest.fn().mockReturnValue(of(mockDeptSummary)),
  topEarners: jest.fn().mockReturnValue(of(mockTopEarners)),
  headcountByCountry: jest.fn().mockReturnValue(of(mockHeadcount)),
  salaryByJobTitle: jest.fn((country: string) => of(mockJobTitleStats[country] ?? [])),
});

const renderPage = (service = mockService()) =>
  render(InsightsPage, { providers: [{ provide: InsightsService, useValue: service }] });

describe('InsightsPage', () => {
  it('shows loading state initially', async () => {
    const service = mockService();
    service.salaryByCountry.mockReturnValue(NEVER);
    await renderPage(service);
    expect(screen.getByText('Loading insights…')).toBeInTheDocument();
  });

  it('shows Insights heading after load', async () => {
    await renderPage();
    expect(await screen.findByRole('heading', { name: 'Insights' })).toBeInTheDocument();
  });

  it('renders salary by country section', async () => {
    await renderPage();
    expect((await screen.findAllByText('United States')).length).toBeGreaterThan(0);
    expect(screen.getByText('Salary by Country')).toBeInTheDocument();
  });

  it('renders department summary section', async () => {
    await renderPage();
    expect((await screen.findAllByText('Engineering')).length).toBeGreaterThan(0);
    expect(screen.getByText('Department Summary')).toBeInTheDocument();
  });

  it('renders top earners section', async () => {
    const service = mockService();
    await renderPage(service);
    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    expect(service.topEarners).toHaveBeenCalledWith(10);
  });

  it('highlights only the #1 top earner', async () => {
    await renderPage();
    const first = (await screen.findByText('Alice Smith')).closest('tr');
    const second = screen.getByText('Bob Jones').closest('tr');

    expect(first).toHaveAttribute('data-top-earner', 'true');
    expect(first).toHaveClass('bg-teal-50');
    expect(second).not.toHaveAttribute('data-top-earner');
    expect(second).not.toHaveClass('bg-teal-50');
  });

  it('summarises headcount, highest salary and top country', async () => {
    await renderPage();
    const card = async (label: string) => (await screen.findByText(label)).parentElement;

    expect(await card('Total Employees')).toHaveTextContent('700');
    expect(await card('Highest Salary')).toHaveTextContent('$150,000');
    expect(await card('Top Country')).toHaveTextContent('United States');
    expect(await card('Top Country')).toHaveTextContent('500 employees');
  });

  it('shows avg salary by job title for the top country by default', async () => {
    const service = mockService();
    await renderPage(service);

    expect(await screen.findByText('Avg Salary by Job Title')).toBeInTheDocument();
    expect(screen.getByText('Data Scientist')).toBeInTheDocument();
    expect(service.salaryByJobTitle).toHaveBeenCalledWith('United States');
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveValue('United States');
  });

  it('reloads job title stats when another country is selected', async () => {
    const service = mockService();
    await renderPage(service);

    await userEvent.selectOptions(await screen.findByRole('combobox', { name: 'Country' }), 'United Kingdom');

    expect(service.salaryByJobTitle).toHaveBeenLastCalledWith('United Kingdom');
    expect(await screen.findByText('UX Designer')).toBeInTheDocument();
    expect(screen.queryByText('Data Scientist')).not.toBeInTheDocument();
  });

  it('shows an empty state when a country has no job title data', async () => {
    const service = mockService();
    service.salaryByJobTitle.mockImplementation(() => of([]));
    await renderPage(service);

    expect(await screen.findByText('No data for this country.')).toBeInTheDocument();
  });
});
