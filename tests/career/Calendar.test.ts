import { describe, it, expect } from 'vitest';
import { Calendar } from '../../src/core/career/Calendar';

describe('Calendar', () => {
  it('initializes and advances weeks correctly', () => {
    const cal = new Calendar(2026, 1);
    expect(cal.currentWeek).toBe(1);
    expect(cal.currentYear).toBe(2026);
    expect(cal.currentMonth).toBe(1);

    cal.advanceWeek();
    expect(cal.currentWeek).toBe(2);
  });

  it('rolls over to new year after week 52', () => {
    const cal = new Calendar(2026, 52);
    const res = cal.advanceWeek();

    expect(res.yearChanged).toBe(true);
    expect(cal.currentYear).toBe(2027);
    expect(cal.currentWeek).toBe(1);
  });
});
