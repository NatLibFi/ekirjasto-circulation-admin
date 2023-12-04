import {
  daysBetween,
  getFirstAndLastDateOfMonth,
  getFirstAndLastDateOfWeek,
  getFirstAndLastDateOfYear,
  getWeekNumber,
} from "../finlandUtils";

describe("getWeekNumber", () => {
  it("should return the correct week number for a date within the same year", () => {
    const date = new Date("2023-06-15");
    const weekNumber = getWeekNumber(date);
    expect(weekNumber).toBe(24);
  });

  it("should return the correct week number for a date at the start of the year but week 52", () => {
    const date = new Date("2023-01-01");
    const weekNumber = getWeekNumber(date);
    expect(weekNumber).toBe(52);
  });

  it("should return the correct week number for a date at the start of the year but week 1", () => {
    const date = new Date("2023-01-02");
    const weekNumber = getWeekNumber(date);
    expect(weekNumber).toBe(1);
  });
});

describe("getFirstAndLastDateOfYear function", () => {
  it("should return the first and last date of the current year when no offset is provided", () => {
    const today = new Date("2023-11-15");
    const { firstDay, lastDay } = getFirstAndLastDateOfYear(undefined, today);
    expect(firstDay).toBe("2023-01-01");
    expect(lastDay).toBe("2023-12-31");
  });

  it("should return the first and last date of the next year when an offset of 1 is provided", () => {
    const today = new Date("2023-01-15");
    const { firstDay, lastDay } = getFirstAndLastDateOfYear(1, today);
    expect(firstDay).toBe("2024-01-01");
    expect(lastDay).toBe("2024-12-31");
  });
});

describe("getFirstAndLastDateOfMonth", () => {
  it("should return the first and last date of the current month when no offset is provided", () => {
    const today = new Date("2023-11-15");
    const { firstDay, lastDay } = getFirstAndLastDateOfMonth(0, today);
    expect(firstDay).toBe("2023-11-01");
    expect(lastDay).toBe("2023-11-30");
  });

  it("should handle positive offset correctly even when crossing into next year", () => {
    const today = new Date("2023-11-15");
    const { firstDay, lastDay } = getFirstAndLastDateOfMonth(2, today);
    expect(firstDay).toBe("2024-01-01");
    expect(lastDay).toBe("2024-01-31");
  });

  it("should handle negative offset correctly", () => {
    const today = new Date("2023-02-15");
    const { firstDay, lastDay } = getFirstAndLastDateOfMonth(-1, today);
    expect(firstDay).toBe("2023-01-01");
    expect(lastDay).toBe("2023-01-31");
  });
});

describe("getFirstAndLastDateOfWeek", () => {
  it("should return the first and last day of the current week when no offset is provided", () => {
    const today = new Date("2023-11-15");
    const { firstDay, lastDay } = getFirstAndLastDateOfWeek(0, today);
    expect(firstDay).toBe("2023-11-13");
    expect(lastDay).toBe("2023-11-19");
  });

  it("should handle positive offset correctly", () => {
    const today = new Date("2023-11-15");
    const { firstDay, lastDay } = getFirstAndLastDateOfWeek(2, today);
    expect(firstDay).toBe("2023-11-27");
    expect(lastDay).toBe("2023-12-03");
  });

  it("should handle negative offset correctly even when crossing into previous year", () => {
    const today = new Date("2023-1-1");
    const { firstDay, lastDay } = getFirstAndLastDateOfWeek(-2, today);
    expect(firstDay).toBe("2022-12-12");
    expect(lastDay).toBe("2022-12-18");
  });
});

describe("daysBetween", () => {
  it("should return 0 for same dates", () => {
    const startDate = "2023-01-01";
    const endDate = "2023-01-01";
    const result = daysBetween(startDate, endDate);
    expect(result).toBe(0);
  });

  it("should calculate days between dates in same month", () => {
    const startDate = "2023-01-10";
    const endDate = "2023-01-20";
    const result = daysBetween(startDate, endDate);
    expect(result).toBe(10);
  });

  it("should calculate days between dates one year apart", () => {
    const startDate = "2023-06-15";
    const endDate = "2024-06-15";
    const result = daysBetween(startDate, endDate);
    expect(result).toBe(366); // accounting for leap year
  });
});
