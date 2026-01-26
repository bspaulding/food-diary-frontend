import { describe, it, expect } from "vitest";
import { startOfWeek, subWeeks, startOfDay, addDays } from "date-fns";
import {
  calculateCurrentWeekDays,
  calculateFourWeeksDays,
  calculateDailyAverage,
} from "./WeeklyStatsCalculations";

describe("Weekly Stats Integration Tests", () => {
  describe("Last 7 days rolling window", () => {
    it("Monday scenario: should calculate 7 days for last 7 days", () => {
      // If today is Monday, we should have 7 complete days (rolling window)
      const monday = new Date("2024-01-08T12:00:00Z"); // Monday, Jan 8
      const days = calculateCurrentWeekDays(monday);
      expect(days).toBe(7);
    });

    it("Tuesday scenario: should calculate 7 days for last 7 days", () => {
      // If today is Tuesday, we should have 7 complete days (rolling window)
      const tuesday = new Date("2024-01-09T12:00:00Z"); // Tuesday, Jan 9
      const days = calculateCurrentWeekDays(tuesday);
      expect(days).toBe(7);
    });

    it("Sunday scenario: should calculate 7 days for last 7 days", () => {
      // If today is Sunday, we should have 7 complete days (rolling window)
      const sunday = new Date("2024-01-07T12:00:00Z"); // Sunday, Jan 7
      const days = calculateCurrentWeekDays(sunday);
      expect(days).toBe(7);
    });
  });

  describe("Average calculation with real-world numbers", () => {
    it("calculates correct average for 1500 kcal over 1 day", () => {
      const avg = calculateDailyAverage(1500, 1);
      expect(avg).toBe(1500);
    });

    it("calculates correct average for 2100 kcal over 7 days (week)", () => {
      const avg = calculateDailyAverage(2100, 7);
      expect(avg).toBe(300);
    });

    it("calculates correct average for 42000 kcal over 28 days (4 weeks)", () => {
      const avg = calculateDailyAverage(42000, 28);
      expect(avg).toBe(1500);
    });

    it("rounds up partial calories correctly", () => {
      // 15000 / 10 = 1500.0 (exact)
      expect(calculateDailyAverage(15000, 10)).toBe(1500);

      // 15001 / 10 = 1500.1 -> rounds up to 1501
      expect(calculateDailyAverage(15001, 10)).toBe(1501);

      // 15009 / 10 = 1500.9 -> rounds up to 1501
      expect(calculateDailyAverage(15009, 10)).toBe(1501);
    });
  });

  describe("Full week progression", () => {
    it("should always return 7 days for any day of the week (rolling window)", () => {
      const sunday = new Date("2024-01-07T12:00:00Z");

      // All days should return 7 for rolling 7-day window
      expect(calculateCurrentWeekDays(sunday)).toBe(7);
      expect(calculateCurrentWeekDays(addDays(sunday, 1))).toBe(7); // Monday
      expect(calculateCurrentWeekDays(addDays(sunday, 2))).toBe(7); // Tuesday
      expect(calculateCurrentWeekDays(addDays(sunday, 3))).toBe(7); // Wednesday
      expect(calculateCurrentWeekDays(addDays(sunday, 4))).toBe(7); // Thursday
      expect(calculateCurrentWeekDays(addDays(sunday, 5))).toBe(7); // Friday
      expect(calculateCurrentWeekDays(addDays(sunday, 6))).toBe(7); // Saturday
    });
  });

  describe("Four weeks calculation", () => {
    it("should calculate 28 days for exactly 4 weeks", () => {
      const date = new Date("2024-02-04T12:00:00Z"); // Feb 4, 2024
      const days = calculateFourWeeksDays(date);
      expect(days).toBe(28);
    });

    it("should handle mid-week dates correctly", () => {
      const wednesday = new Date("2024-02-14T12:00:00Z"); // Wednesday
      const days = calculateFourWeeksDays(wednesday);
      // 4 weeks ago from Feb 14 is Jan 17, so we have 28 days
      expect(days).toBe(28);
    });
  });

  describe("Edge cases", () => {
    it("should handle end of month transitions", () => {
      const endOfJan = new Date("2024-01-31T12:00:00Z");
      // Rolling 7-day window always returns 7
      const days = calculateCurrentWeekDays(endOfJan);
      expect(days).toBe(7);
    });

    it("should handle leap year February correctly", () => {
      const leapDay = new Date("2024-02-29T12:00:00Z"); // 2024 is a leap year
      const days = calculateFourWeeksDays(leapDay);
      // 4 weeks = 28 days, regardless of leap year
      expect(days).toBe(28);
    });

    it("should return 7 days for rolling window", () => {
      // Rolling 7-day window always returns 7
      const date = new Date("2024-01-07T12:00:00Z"); // Sunday midday
      const days = calculateCurrentWeekDays(date);
      expect(days).toBe(7);
    });
  });
});
