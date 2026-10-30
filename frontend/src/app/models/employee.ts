export type EmploymentType = 'full_time' | 'part_time' | 'contract';

export interface Employee {
  id: string;
  full_name: string;
  job_title: string;
  country: string;
  salary: number;
  department: string;
  email: string;
  hire_date: string;
  employment_type: EmploymentType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreate {
  full_name: string;
  job_title: string;
  country: string;
  salary: number;
  department: string;
  email: string;
  hire_date: string;
  employment_type: EmploymentType;
}

export type EmployeeUpdate = Partial<EmployeeCreate>;

export interface EmployeeListResponse {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
}

export interface EmployeeListParams {
  page?: number;
  page_size?: number;
  country?: string;
  job_title?: string;
  department?: string;
  search?: string;
}
