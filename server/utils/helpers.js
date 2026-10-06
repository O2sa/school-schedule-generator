import { WEEK_DAYS, DAYS_OF_WEEK_TEMP } from "./constants.js";

export function getLargestPropertyValue(array, propertyName) {
  let largestValue = -Infinity;
  for (const obj of array) {
    const value = obj[propertyName];
    if (value > largestValue) {
      largestValue = value;
    }
  }
  return largestValue;
}

export function getWeekDays(startDay, workDays) {
  let weekDays = [];
  const startDayEn = Object.keys(WEEK_DAYS).find(
    (val) => WEEK_DAYS[val] === startDay
  );
  const startIndex = DAYS_OF_WEEK_TEMP.indexOf(startDayEn);
  if (startIndex === -1) return [];
  weekDays = DAYS_OF_WEEK_TEMP.slice(startIndex, startIndex + workDays);

  return weekDays;
}

export const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    const groupKey = currentValue[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(currentValue);
    return result;
  }, {});
};
