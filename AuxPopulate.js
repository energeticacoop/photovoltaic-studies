/**
 * Functions for populating certains named ranges. Those are intended to use just once.
 */

function createTariffPeriods() {
  const tariff = "6.1TD"
  const rangeName = "tariffPeriods61"
  const dates = getValues("normalizedDates").map(dateString => new Date(dateString))
  const nationalHolidays = getValues("nationalHolidays").map(dateString => new Date(dateString))
  const tariffPeriod = dates.map(date => getTariffPeriod(date, tariff, nationalHolidays))
  setColumn(rangeName, tariffPeriod)

}

function createDates() {
  const dates = getValues("normalizedDates").map(dateString => new Date(dateString))
  setColumn("dates", dates)

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
      return 6
    } else {
      if (date.getHours() >= 0 && date.getHours() <= 7) {
        return 6
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

function populateHolidays(){
  const dates = getColumn("normalizedDates").map(string => new Date(string))
  const nationalHolidays = getColumn("nationalHolidays")
  const weekends = dates.map(date => isWeekendOrNationalHoliday(date, nationalHolidays))
  setColumn("isWeekendOrHoliday", weekends)
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

function populateSeasons(){
  const dates = getColumn("normalizedDates").map(string => new Date(string))
  const seasons = dates.map(date => getSeason(date))
  setColumn("seasons", seasons)
}
