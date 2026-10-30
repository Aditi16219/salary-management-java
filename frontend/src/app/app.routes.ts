import { Routes } from '@angular/router';
import { EmployeesPage } from './pages/employees-page/employees-page';
import { InsightsPage } from './pages/insights-page/insights-page';

export const routes: Routes = [
  { path: '', component: EmployeesPage },
  { path: 'insights', component: InsightsPage },
];
