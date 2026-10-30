import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { EmployeeForm } from './employee-form';
import { EmployeeCreate } from '../../models/employee';

const renderForm = async (initialData?: Partial<EmployeeCreate>) => {
  const save = jest.fn();
  const cancel = jest.fn();
  await render(EmployeeForm, {
    inputs: { submitLabel: 'Save', initialData },
    on: { save, cancel },
  });
  return { save, cancel };
};

describe('EmployeeForm', () => {
  it('renders all required fields', async () => {
    await renderForm();
    expect(screen.getByPlaceholderText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('United States')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows validation errors when submitted with empty fields', async () => {
    const { save } = await renderForm();
    await userEvent.click(screen.getByText('Save'));

    expect((await screen.findAllByText('Required')).length).toBeGreaterThan(0);
    expect(save).not.toHaveBeenCalled();
  });

  it('calls cancel when Cancel is clicked', async () => {
    const { cancel } = await renderForm();
    await userEvent.click(screen.getByText('Cancel'));
    expect(cancel).toHaveBeenCalled();
  });

  it('pre-fills form with initialData', async () => {
    await renderForm({ full_name: 'John Smith', email: 'john@example.com' });
    expect(screen.getByDisplayValue('John Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  it('emits the typed form data when valid', async () => {
    const { save } = await renderForm({
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      job_title: 'Engineer',
      department: 'Engineering',
      country: 'India',
      salary: 90000,
      hire_date: '2022-01-15',
    });
    await userEvent.click(screen.getByText('Save'));

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ full_name: 'Jane Doe', salary: 90000, employment_type: 'full_time' }),
    );
  });
});
