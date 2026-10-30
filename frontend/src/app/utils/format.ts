const salaryFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const formatSalary = (salary: number): string => salaryFormatter.format(salary);

/** "full_time" -> "Full Time" */
export const formatType = (type: string): string =>
  type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
