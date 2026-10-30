const salaryFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const formatSalary = (salary: number): string => salaryFormatter.format(salary);

/** "full_time" -> "Full Time" */
export const formatType = (type: string): string =>
  type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

/** "Mary Ann Smith" -> "MS": first letters of the first and last name. */
export const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};
