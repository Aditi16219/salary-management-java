import { initials } from './format';

describe('initials', () => {
  it('uses the first letters of the first and last name', () => {
    expect(initials('Jane Doe')).toBe('JD');
  });

  it('ignores middle names', () => {
    expect(initials('Mary Ann Smith')).toBe('MS');
  });

  it('handles a single name and extra whitespace', () => {
    expect(initials('  cher  ')).toBe('C');
  });

  it('returns an empty string for a blank name', () => {
    expect(initials('   ')).toBe('');
  });
});
