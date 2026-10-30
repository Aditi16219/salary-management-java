import { Routes } from '@angular/router';
import { EmployeesPage } from './pages/employees-page/employees-page';
import { AddEmployeePage } from './pages/add-employee-page/add-employee-page';
import { EditEmployeePage } from './pages/edit-employee-page/edit-employee-page';
import { InsightsPage } from './pages/insights-page/insights-page';

export const routes: Routes = [
  { path: '', component: EmployeesPage },
  { path: 'employees/new', component: AddEmployeePage },
  { path: 'employees/:id/edit', component: EditEmployeePage },
  { path: 'insights', component: InsightsPage },
];
