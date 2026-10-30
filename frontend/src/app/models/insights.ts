export interface CountrySalaryStats {
  country: string;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
  employee_count: number;
}

export interface JobTitleSalaryStats {
  job_title: string;
  country: string;
  avg_salary: number;
  employee_count: number;
}

export interface CountryHeadcount {
  country: string;
  employee_count: number;
}

export interface DepartmentSummary {
  department: string;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
  employee_count: number;
}

export interface TopEarner {
  id: string;
  full_name: string;
  job_title: string;
  country: string;
  department: string;
  salary: number;
}
