import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';
import { EmployeeFilters } from './employee-filters';
import { MetaService } from '../../api/meta.service';

const renderFilters = async () => {
  const countryChange = jest.fn();
  const departmentChange = jest.fn();
  await render(EmployeeFilters, {
    on: { countryChange, departmentChange },
    providers: [
      {
        provide: MetaService,
        useValue: {
          countries: () => of(['India', 'United States']),
          departments: () => of(['Engineering', 'Finance']),
        },
      },
    ],
  });
  return { countryChange, departmentChange };
};

describe('EmployeeFilters', () => {
  it('populates the country dropdown from the database', async () => {
    await renderFilters();
    const select = screen.getByRole('combobox', { name: 'Country' });
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.textContent?.trim());
    expect(options).toEqual(['All Countries', 'India', 'United States']);
  });

  it('populates the department dropdown from the database', async () => {
    await renderFilters();
    const select = screen.getByRole('combobox', { name: 'Department' });
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.textContent?.trim());
    expect(options).toEqual(['All Departments', 'Engineering', 'Finance']);
  });

  it('still renders the filters when the meta API fails', async () => {
    await render(EmployeeFilters, {
      providers: [
        {
          provide: MetaService,
          useValue: {
            countries: () => throwError(() => new Error('network')),
            departments: () => throwError(() => new Error('network')),
          },
        },
      ],
    });

    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveTextContent('All Countries');
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('emits the selected country and department', async () => {
    const { countryChange, departmentChange } = await renderFilters();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Country' }), 'India');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Department' }), 'Finance');

    expect(countryChange).toHaveBeenCalledWith('India');
    expect(departmentChange).toHaveBeenCalledWith('Finance');
  });
});
