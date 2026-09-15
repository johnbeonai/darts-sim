/**
 * Career Calendar & Timeline
 * In accordance with Technical Blueprint Section 56 & Phase 2.
 */

export interface CalendarDate {
  year: number;
  month: number; // 1-12
  week: number;  // 1-52
}

export class Calendar {
  public currentYear: number;
  public currentWeek: number; // 1 to 52

  constructor(startYear: number = 2026, startWeek: number = 1) {
    this.currentYear = startYear;
    this.currentWeek = startWeek;
  }

  public get currentMonth(): number {
    return Math.min(12, Math.ceil(this.currentWeek / 4.33));
  }

  public static readonly MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  public static getMonthName(month: number): string {
    const idx = Math.max(0, Math.min(11, month - 1));
    return Calendar.MONTH_NAMES[idx];
  }

  public static getMonthForWeek(week: number): number {
    return Math.min(12, Math.max(1, Math.ceil(week / 4.33)));
  }

  public static getWeeksForMonth(month: number): number[] {
    const weeks: number[] = [];
    for (let w = 1; w <= 52; w++) {
      if (Calendar.getMonthForWeek(w) === month) {
        weeks.push(w);
      }
    }
    return weeks;
  }

  public get dateString(): string {
    return `Week ${this.currentWeek} • ${Calendar.getMonthName(this.currentMonth)} ${this.currentYear}`;
  }

  /**
   * Returns upcoming N weeks ahead of the current calendar week (e.g. Next 4 weeks)
   */
  public getUpcomingWeeks(count: number = 4): { week: number; year: number; month: number; monthName: string }[] {
    const results: { week: number; year: number; month: number; monthName: string }[] = [];
    let w = this.currentWeek;
    let y = this.currentYear;

    for (let i = 0; i < count; i++) {
      w++;
      if (w > 52) {
        w = 1;
        y++;
      }
      const m = Calendar.getMonthForWeek(w);
      results.push({
        week: w,
        year: y,
        month: m,
        monthName: Calendar.getMonthName(m)
      });
    }

    return results;
  }

  /**
   * Advances calendar by one week. Returns true if a new year has started.
   */
  public advanceWeek(): { yearChanged: boolean; newYear: number; newWeek: number } {
    this.currentWeek++;
    let yearChanged = false;

    if (this.currentWeek > 52) {
      this.currentWeek = 1;
      this.currentYear++;
      yearChanged = true;
    }

    return {
      yearChanged,
      newYear: this.currentYear,
      newWeek: this.currentWeek
    };
  }
}
