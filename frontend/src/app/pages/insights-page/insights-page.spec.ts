import { render, screen } from '@testing-library/angular';
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
];

const mockHeadcount = [
  { country: 'United States', employee_count: 500 },
  { country: 'United Kingdom', employee_count: 200 },
];

const mockService = () => ({
  salaryByCountry: jest.fn().mockReturnValue(of(mockSalaryByCountry)),
  departmentSummary: jest.fn().mockReturnValue(of(mockDeptSummary)),
  topEarners: jest.fn().mockReturnValue(of(mockTopEarners)),
  headcountByCountry: jest.fn().mockReturnValue(of(mockHeadcount)),
  salaryByJobTitle: jest.fn().mockReturnValue(of([])),
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

  it('summarises headcount, highest salary and top country', async () => {
    await renderPage();
    const card = async (label: string) => (await screen.findByText(label)).parentElement;

    expect(await card('Total Employees')).toHaveTextContent('700');
    expect(await card('Highest Salary')).toHaveTextContent('$150,000');
    expect(await card('Top Country')).toHaveTextContent('United States');
    expect(await card('Top Country')).toHaveTextContent('500 employees');
  });
});
