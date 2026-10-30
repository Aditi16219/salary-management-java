import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';
import { EmployeeFilters } from './employee-filters';
import { MetaService } from '../../api/meta.service';

const optionsOf = (name: string) =>
  Array.from(screen.getByRole('combobox', { name }).querySelectorAll('option')).map((o) =>
    o.textContent?.trim(),
  );

const renderFilters = async () => {
  const countryChange = jest.fn();
  const departmentChange = jest.fn();
  const jobTitleChange = jest.fn();
  await render(EmployeeFilters, {
    on: { countryChange, departmentChange, jobTitleChange },
    providers: [
      {
        provide: MetaService,
        useValue: {
          countries: () => of(['India', 'United States']),
          departments: () => of(['Engineering', 'Finance']),
          jobTitles: () => of(['Data Analyst', 'QA Engineer']),
        },
      },
    ],
  });
  return { countryChange, departmentChange, jobTitleChange };
};

describe('EmployeeFilters', () => {
  it('populates the country dropdown from the database', async () => {
    await renderFilters();
    expect(optionsOf('Country')).toEqual(['All Countries', 'India', 'United States']);
  });

  it('populates the department dropdown from the database', async () => {
    await renderFilters();
    expect(optionsOf('Department')).toEqual(['All Departments', 'Engineering', 'Finance']);
  });

  it('populates the job title dropdown from the database', async () => {
    await renderFilters();
    expect(optionsOf('Job Title')).toEqual(['All Job Titles', 'Data Analyst', 'QA Engineer']);
  });

  it('still renders the filters when the meta API fails', async () => {
    const fail = () => throwError(() => new Error('network'));
    await render(EmployeeFilters, {
      providers: [
        { provide: MetaService, useValue: { countries: fail, departments: fail, jobTitles: fail } },
      ],
    });

    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveTextContent('All Countries');
    expect(screen.getByRole('combobox', { name: 'Job Title' })).toHaveTextContent('All Job Titles');
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('emits the selected country, department and job title', async () => {
    const { countryChange, departmentChange, jobTitleChange } = await renderFilters();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Country' }), 'India');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Department' }), 'Finance');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Job Title' }), 'QA Engineer');

    expect(countryChange).toHaveBeenCalledWith('India');
    expect(departmentChange).toHaveBeenCalledWith('Finance');
    expect(jobTitleChange).toHaveBeenCalledWith('QA Engineer');
  });
});
