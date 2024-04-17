/**
 * Gets a new Date object shifted by a specified number of hours from the provided date.
 * @param {Date} date - The reference date.
 * @param {number} hours - The number of hours to shift the date by.
 * @returns {Date} The shifted date.
 */
function getShiftedDate(date, hours) {
  return new Date(date.getTime() + 3600000 * hours)
}

/**
 * Gets the previous hour from the provided date.
 * @param {Date} date - The reference date.
 * @returns {Date} The previous hour date.
 */
function getPreviousHour(date) {
  return getShiftedDate(date, -1)
}

/**
 * Normalizes the date convention by shifting each date in the array to the previous hour.
 * @param {Array} cch - The array of date objects to normalize.
 * @returns {Array} The normalized date array.
 */
function normalizeDateConvention(cch) {
  cch.forEach((element) => {
    element.date = getPreviousHour(element.date)
  })
  return cch
}

/**
 * Normalizes a number by parsing it to a float with '.' as the decimal separator.
 * @param {number} number - The number to normalize.
 * @returns {number} The normalized number.
 */
function normalizeValue(number) {
  return parseFloat(number.toString().replace(",", "."))
}

/**
 * Gets the date of the last Sunday before a given year and month.
 * @param {number} year - The year.
 * @param {number} month - The month (0-indexed).
 * @returns {Date} The date of the last Sunday.
 */
function getlastSunday(year, month) {
  const date = new Date(year, month, 1, 0)
  const weekday = date.getDay()
  const dayDiff = weekday === 0 ? 7 : weekday
  date.setDate(date.getDate() - dayDiff)
  return date
}

/**
 * Checks if a given date is the start date of daylight saving time.
 * @param {Date} date - The date to check.
 * @returns {boolean} True if the date is the start date of DST, otherwise false.
 */
function isDstStartDate(date) {
  const dstStartDay = getlastSunday(date.getFullYear(), (month = 3))
  return date.getTime() == dstStartDay.getTime()
}

/**
 * Checks if a given date is the end date of daylight saving time.
 * @param {Date} date - The date to check.
 * @returns {boolean} True if the date is the end date of DST, otherwise false.
 */
function isDstEndDate(date) {
  const dstEndDay = getlastSunday(date.getFullYear(), (month = 10))
  return date.getTime() == dstEndDay.getTime()
}

/**
 * Checks if a given date belong to a weekend or is a national holiday in Spain.
 * @param {Date} date - The date to check.
 * @param {Array} nationalHolidays - An array of national holiday dates.
 * @returns {boolean} True if the date is a weekend or a national holiday, otherwise false.
 */
function isWeekendOrNationalHoliday(date, nationalHolidays) {
  const datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()

  if (date.getDay() == 0 || date.getDay() == 6) {
    return true
  } else {
    if (nationalHolidays.some((holiday) => datesAreOnSameDay(holiday, date))) {
      return true
    } else return false
  }
}

/**
 * Gets the tariff period for a given date and tariff type.
 * @param {Date} date - The date for which to determine the tariff period.
 * @param {string} tariff - The tariff type (e.g., "2.0TD", "3.0TD").
 * @param {Array} nationalHolidays - An array of national holiday dates.
 * @returns {number} The tariff period (1, 2, or 3).
 */
function getTariffPeriod(date, tariff, nationalHolidays) {
  if (tariff == "2.0TD") {
    if (isWeekendOrNationalHoliday(date, nationalHolidays)) {
      return 3
    } else {
      const hour = date.getHours()
      if (hour >= 0 && hour <= 7) {
        return 3
      } else {
        if (
          (hour >= 8 && hour <= 9) ||
          (hour >= 14 && hour <= 17) ||
          (hour >= 22 && hour <= 23)
        ) {
          return 2
        } else {
          return 1
        }
      }
    }
  }

  if (tariff == "3.0TD" || tariff == "6.1TD") {
    if (isWeekendOrNationalHoliday(date, nationalHolidays)) {
      return 3
    } else {
      if (date.getHours() >= 0 && date.getHours() <= 7) {
        return 3
      } else {
        const month = date.getMonth()
        const hour = date.getHours()
        const secondPeriod = [8, 14, 15, 16, 17, 22, 23]
        if ([0, 1, 6, 11].includes(month)) {
          // Jan, Feb, Jul, Dec
          if (secondPeriod.includes(hour)) {
            return 2
          } else {
            return 1
          }
        }
        if ([2, 10].includes(month)) {
          // Mar, Nov
          if (secondPeriod.includes(hour)) {
            return 3
          } else {
            return 2
          }
        }
        if ([3, 4, 9].includes(month)) {
          // Apr, May, Oct
          if (secondPeriod.includes(hour)) {
            return 5
          } else {
            return 4
          }
        }
        if ([5, 7, 8].includes(month)) {
          // Jun, Aug, Sep
          if (secondPeriod.includes(hour)) {
            return 4
          } else {
            return 3
          }
        }
      }
    }
  }
}


/**
 * Gets the season for a given date. Winter is considered to include November to better represent Castilla y León's weather.
 * @param {Date} date - The date for which to determine the season.
 * @returns {number} The season (0 for spring, 1 for summer, 2 for autumn, 3 for winter).
 */
function getSeason(date) {
  // Returns 0 for spring, 1 for summer, 2 for autumn, 3 for winter
  const month = date.getMonth()
  switch (month) {
    case 10:
    case 11:
    case 0:
    case 1:
      return 3
    case 2:
    case 3:
    case 4:
      return 0
    case 5:
    case 6:
    case 7:
      return 1
    case 8:
    case 9:
      return 2
  }
}


/**
 * Gets the current date in the format YYMMDD.
 * @returns {string} The current date in YYMMDD format.
 */
function getYYMMDD(){
  return new Date().
  toLocaleString('en-us', {year: 'numeric', month: '2-digit', day: '2-digit'}).
  replace(/(\d+)\/(\d+)\/(\d+)/, '$3$1$2');
}