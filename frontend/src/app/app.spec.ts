import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  it('renders the layout with the app name and navigation', async () => {
    await render(App, { routes });

    expect(screen.getByText('Salary Management')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Employees' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Insights' })).toBeInTheDocument();
  });

  it('shows the employees page at /', async () => {
    const { navigate } = await render(App, { routes });
    await navigate('/');

    expect(await screen.findByRole('heading', { name: 'Employees' })).toBeInTheDocument();
  });

  it('navigates to the insights page from the nav', async () => {
    await render(App, { routes });

    await userEvent.click(screen.getByRole('link', { name: 'Insights' }));

    expect(await screen.findByRole('heading', { name: 'Insights' })).toBeInTheDocument();
  });
});
