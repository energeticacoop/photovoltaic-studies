/**
 * Class representing a fixed-length array of 8760 elements.
 * This class enforces a fixed length of 8760, representing values for each of the 8760 hours in a year.
 * Mutations that change the array length are disabled.
 */
class FixedArray8760 extends Array {
  /**
   * Creates a FixedArray8760 instance with a fixed length of 8760.
   * @param {...any} items - The initial values for the array.
   * @throws {Error} Throws an error if the number of items is not equal to 8760.
   */
  constructor(...items) {
    const fixedLength = 8760
    super(...items)
    if (this.length !== fixedLength) {
      throw new Error(`Array must have exactly ${fixedLength} values.`)
    }
  }

  /**
   * Overrides Array.prototype.push to prevent adding elements.
   * @throws {Error} Throws an error indicating that the array length cannot be modified.
   */
  push(...items) {
    throw new Error("Cannot modify the length of a fixed array.")
  }

  /**
   * Overrides Array.prototype.pop to prevent removing elements.
   * @throws {Error} Throws an error indicating that the array length cannot be modified.
   */
  pop() {
    throw new Error("Cannot modify the length of a fixed array.")
  }

  /**
   * Overrides Array.prototype.shift to prevent removing elements.
   * @throws {Error} Throws an error indicating that the array length cannot be modified.
   */
  shift() {
    throw new Error("Cannot modify the length of a fixed array.")
  }

  /**
   * Overrides Array.prototype.unshift to prevent adding elements.
   * @throws {Error} Throws an error indicating that the array length cannot be modified.
   */
  unshift(...items) {
    throw new Error("Cannot modify the length of a fixed array.")
  }

  /**
   * Overrides Array.prototype.splice to prevent modifying the length of the array.
   * @param {number} start - The index at which to start changing the array.
   * @param {number} deleteCount - The number of elements to remove.
   * @param {...any} items - The elements to add to the array.
   * @returns {Array} The deleted elements.
   * @throws {Error} Throws an error for invalid arguments or if items are provided.
   */
  splice(start, deleteCount, ...items) {
    if (start < 0 || start >= this.length || deleteCount < 0) {
      throw new Error("Invalid arguments for splice.")
    }
    if (items.length > 0) {
      throw new Error("Cannot modify the length of a fixed array.")
    }
    return super.splice(start, deleteCount, ...items)
  }

  /**
   * Overrides the length setter to enforce the fixed length constraint of 8760.
   * @param {number} value - The new length of the array.
   * @throws {Error} Throws an error if the length is not exactly 8760.
   */
  set length(value) {
    if (value !== 8760) {
      throw new Error(`Array length must be exactly 8760.`)
    }
    super.length = value
  }

  /**
   * Returns a string representation of the FixedArray8760 instance.
   * @returns {string} A string representing the array values.
   */
  toString() {
    return super.toString()
  }
}

/**
 * Class representing load curve values for an electric load curve.
 * The load curve consists of 8760 numerical values representing the load for each hour in a year.
 * Extends FixedArray8760, enforcing that all values are numbers.
 */
class LoadCurveValues extends FixedArray8760 {
  /**
   * Creates a LoadCurveValues instance with a fixed length of 8760.
   * If no arguments are provided, the array will be initialized with 8760 zeros.
   * @param {...number} items - The initial values for the array (optional).
   * @throws {Error} Throws an error if the number of items is not equal to 8760 or if any item is not a number.
   */
  constructor(...items) {
    if (items.length === 0) {
      // Initialize with 8760 zeros if no arguments are passed
      super(...Array(8760).fill(0))
    } else {
      // Validate that all items are numbers
      items.forEach(item => {
        if (typeof item !== 'number') {
          throw new Error("All items must be numbers.")
        }
      })
      super(...items)
    }
  }
}

/**
   * Class representing the dates corresponding to an electric load curve.
   * This class consists of 8760 Date objects, representing the time of each load value.
   * Extends FixedArray8760, enforcing that all values are Date objects.
   */
class LoadCurveDates extends FixedArray8760 {
  /**
   * Creates a LoadCurveDates instance with a fixed length of 8760.
   * @param {...Date} items - The initial Date values for the array.
   * @throws {Error} Throws an error if the number of items is not equal to 8760 or if any item is not a Date object.
   */
  constructor(...items) {
    items.forEach(item => {
      if (!(item instanceof Date)) {
        throw new Error("All items must be Date objects.")
      }
    })
    super(...items)
  }
}


/**
 * Processes consumption data in various formats based on CSV origin.
 * @param {string} CSVfilename - The filename of the CSV file.
 * @param {string} origin - The origin of the CSV (Infoenergia, CNMC, Datadis).
 * @returns {Array<Array>} The processed load curve data [dates, values].
 */
function getLoadCurveFromCSV(CSVfilename, origin) {
  const configs = {
    "CSV Infoenergia": {
      delimiter: ",",
      csvEntryParser: parseInfoenergiaEntry,
    },
    "CSV Iberdrola": {
      delimiter: ";",
      csvEntryParser: parseCNMCEntry,
    },
    "CSV Datadis": {
      delimiter: ";",
      csvEntryParser: parseDatadisCsvEntry,
    }
  }

  const config = configs[origin]
  if (!config) throw new Error("Invalid CSV origin")

  // Get CSV Matrix from CSV file
  const csvMatrix = getCsvMatrix(CSVfilename, config.delimiter)

  // Parse all entries in CSV. Note that those can be of arbitrary length
  const loadCurveDatesAndValues = csvMatrix.map(entry => config.csvEntryParser(entry))
  const loadCurveDates = loadCurveDatesAndValues.map(e => e.date)
  const loadCurveValues = loadCurveDatesAndValues.map(e => e.value)

  // Construct normalized load curve as a LoadCurveValues instance
  const normalizedLoadCurveValues = normalizeElectricLoadCurve(loadCurveDates, loadCurveValues)
  return normalizedLoadCurveValues

}

/**
 * Retrieves the CSV matrix from the working folder.
 * @param {string} CSVfilename - The CSV filename.
 * @param {string} delimiter - The CSV delimiter.
 * @returns {Array<Array<string>>} The CSV matrix.
 */
function getCsvMatrix(CSVfilename, delimiter) {
  try {
    const workingFolder = DriveApp.getFolderById(getParentFolderId())
    const files = workingFolder.getFilesByName(CSVfilename)
    if (!files.hasNext()) {
      throw new Error('No CSV file found with the given name.')
    }
    const csv = files.next().getBlob().getDataAsString()
    // Parse CSV and remove header
    return Utilities.parseCsv(csv, delimiter).slice(1)
  } catch (e) {
    throw new Error('Failed to load the CSV file: ' + e.message)
  }
}


// Entry parser functions
function parseInfoenergiaEntry(entry) {
  const [day, month, year] = entry[1].split("/")
  const hour = entry[2]
  const date = new Date(year, month - 1, day, hour) // JS months are 0..11
  // Infoenergia's values 1,2,3..22,23,0 are mapped to 0..23
  date.setHours(date.getHours() - 1)
  const value = normalizeValue(entry[3])
  return { date, value }
}

function parseCNMCEntry(entry) {
  const [day, month, year] = entry[1].split("/")
  const hour = entry[2]
  const date = new Date(year, month - 1, day, hour - 1) // JS months are 0..11
  const value = normalizeValue(entry[3])
  return { date, value }
}

function parseDatadisCsvEntry(entry) {
  const [year, month, day] = entry[1].split("/")
  const hour = entry[2].slice(0, 2)
  const date = new Date(year, month - 1, day, hour - 1) // JS months are 0..11
  const value = normalizeValue(entry[3])
  return { date, value }
}

function parseDatadisApiEntry(entry) {
  const [year, month, day] = entry["date"].split("/")
  const hour = entry["time"].slice(0, 2)
  const date = new Date(year, month - 1, day, hour - 1) // JS months are 0..11
  const value = normalizeValue(entry["consumptionKWh"])
  return { date, value }
}





/**
 * Processes consumption data using the Datadis API.
 * @returns {Array<Object>} The processed consumption data.
 */
function getLoadCurveFromDatadisAPI(nif, clientCups, startDate, endDate) {

  // Verify that the needed variables are not empty
  if (!(nif && clientCups && startDate && endDate)) {
    throw new Error('Los valores de NIF, CUPS y fechas de inicio y fin de Datadis no pueden estar vacías.')
  }

  const scriptProperties = PropertiesService.getScriptProperties()
  const datadisUser = scriptProperties.getProperty("DATADIS_USER")
  const datadisPassword = scriptProperties.getProperty("DATADIS_PASSWORD")
  // Get authentication token from DATADIS
  const auth = {
    username: datadisUser,
    password: datadisPassword
  }
  const loginOptions = {
    method: "POST",
    payload: auth,
    muteHttpExceptions: true,
    validateHttpsCertificates: false,
  }
  const loginResponse = UrlFetchApp.fetch("https://datadis.es/nikola-auth/tokens/login", loginOptions)
  if (loginResponse.getResponseCode() != 200) {
    throw new Error(
      "Error en la API de Datadis al solicitar el token de autenticación.\n\n" +
      "Código de respuesta: " + loginResponse.getResponseCode() + "\n\n" +
      "Contenido de la respuesta: " + loginResponse.getContentText()
    )
  }
  const token = loginResponse.getContentText()



  // Get supplies from authorized NIF
  const headers = {
    "Authorization": "Bearer " + token,
    'Content-Type': "application/json", 'Accept': "application/json",
  }
  var payload = {
    authorizedNif: nif
  }
  const suppliesOptions = {
    method: "GET",
    headers: headers,
    muteHttpExceptions: true,
    validateHttpsCertificates: false,
  }
  const suppliesResponse = UrlFetchApp.fetch("https://datadis.es/api-private/api/get-supplies?authorizedNif=" + payload.authorizedNif, suppliesOptions)
  if (suppliesResponse.getResponseCode() != 200) {
    throw new Error(
      "Error en la API de Datadis al solicitar los datos del contrato.\n\n" +
      "Código de respuesta: " + suppliesResponse.getResponseCode() + "\n\n" +
      "Contenido de la respuesta: " + suppliesResponse.getContentText()
    )
  }
  const datadisSupplies = JSON.parse(suppliesResponse.getContentText())

  // Select supply from list with same CUPS
  try {
    const suppliesList = datadisSupplies.map(e => e["cups"].slice(0, 20))
    var supplyIndex = suppliesList.indexOf(clientCups.slice(0, 20))

    // Check if supplyIndex is -1
    if (supplyIndex === -1) {
      throw new Error("El listado de contratos obtenido no contiene el CUPS " + clientCups + ".")
    }

  } catch (error) {
    throw error
  }
  const supply = datadisSupplies[supplyIndex]



  // Get consumption data from supply
  payload.cups = supply.cups
  payload.distributorCode = supply.distributorCode
  payload.startDate = startDate
  payload.endDate = endDate
  payload.measurementType = "0"
  payload.pointType = supply.pointType

  var consumptionOptions = {
    method: "get",
    headers: headers,
    muteHttpExceptions: true
  }
  const getConsumptionDataURL =
    "https://datadis.es/api-private/api/get-consumption-data?cups=" + payload.cups
    + "&distributorCode=" + payload.distributorCode
    + "&startDate=" + payload.startDate
    + "&endDate=" + payload.endDate
    + "&measurementType=0&pointType=" + payload.pointType
    + "&authorizedNif=" + payload.authorizedNif
  var consumptionResponse = UrlFetchApp.fetch(getConsumptionDataURL, consumptionOptions)

  if (consumptionResponse.getResponseCode() != 200) {

    throw new Error(
      "Error en la API de Datadis al solicitar los datos de consumo.\n\n" +
      "Código de respuesta: " + consumptionResponse.getResponseCode() + "\n\n" +
      "Contenido: " + consumptionResponse.getContentText()
    )
  }
  var datadisCch = JSON.parse(consumptionResponse.getContentText())


  // Select CCH from list with same CUPS
  try {
    const cupsList = datadisCch.map(e => e["cups"].slice(0, 20))
  } catch {
    throw "El listado de CUPS obtenido no contiene el CUPS " + clientCups + "."
  }



  // Parse all entries in CSV. Note that those can be of arbitrary length
  const loadCurveDatesAndValues = datadisCch.map(entry => parseDatadisApiEntry(entry))
  const loadCurveDates = loadCurveDatesAndValues.map(e => e.date)
  const loadCurveValues = loadCurveDatesAndValues.map(e => e.value)

  // Construct normalized load curve as a LoadCurveValues instance
  const normalizedLoadCurveValues = normalizeElectricLoadCurve(loadCurveDates, loadCurveValues)
  return normalizedLoadCurveValues

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
 * Normalizes an electric load data set by calculating the mean value for each hour of each weekday,
 * separately for each month. After normalization, it shifts the values so that the first value
 * corresponds to the day of the week of the normalized dates.
 *
 * @param {Array} dates - An array of Date objects representing the dates of the load data
 * @param {Array} values - An array of numerical load values corresponding to each date
 *
 * @returns {LoadCurveValues} - An instance of LoadCurveValues containing normalized and shifted numerical values.
 */
function normalizeElectricLoadCurve(dates, values) {

  // Ensure that dates and values have the same length
  const length = dates.length
  if (length !== values.length) {
    throw new Error('Dates and values must have the same length')
  }

  // Initialize 3D arrays to hold sums and counts for each month, hour, and weekday
  const sums = Array.from({ length: 12 }, () => Array.from({ length: 24 }, () => Array.from({ length: 7 }, () => 0)))
  const counts = Array.from({ length: 12 }, () => Array.from({ length: 24 }, () => Array.from({ length: 7 }, () => 0)))

  // Helper functions to extract hour, day of the week, and month from a Date object
  const getHour = date => date.getHours()
  const getDayOfWeek = date => date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const getMonth = date => date.getMonth() // 0 = January, 11 = December

  // Process the input data
  for (let i = 0; i < length; i++) {
    const date = dates[i]
    const value = values[i]

    const month = getMonth(date)
    const hour = getHour(date)
    const dayOfWeek = getDayOfWeek(date)

    // Update the sum and count for the corresponding month, hour, and weekday
    sums[month][hour][dayOfWeek] += value
    counts[month][hour][dayOfWeek]++
  }

  // Compute the averages for each combination of month, hour, and weekday
  const averages = sums.map((monthSums, monthIndex) =>
    monthSums.map((hourSums, hourIndex) =>
      hourSums.map((sum, dayIndex) => {
        const count = counts[monthIndex][hourIndex][dayIndex]
        return count > 0 ? sum / count : 0
      })
    )
  )

  // Construct the normalized values array based on the yearDates 
  const normalizedDates = get("normalizedDates").map(e => new Date(e))
  const normalizedValues = normalizedDates.map(date => {
    const month = getMonth(date)
    const hour = getHour(date)
    const dayOfWeek = getDayOfWeek(date)
    return averages[month][hour][dayOfWeek]
  })

  // Determine the day of the week of the first day of the provided year
  const firstDayOfWeek = getDayOfWeek(normalizedDates[0])

  // Find the index of the first occurrence of the target day of the week in the yearDates array
  const firstTargetDayIndex = normalizedDates.findIndex(date => getDayOfWeek(date) === firstDayOfWeek)

  // If the target day is found, shift the normalized values accordingly
  let shiftedNormalizedValues
  if (firstTargetDayIndex !== -1) {
    shiftedNormalizedValues = [
      ...normalizedValues.slice(firstTargetDayIndex),
      ...normalizedValues.slice(0, firstTargetDayIndex)
    ]
  } else {
    // If no target day is found, keep the normalized values unchanged
    shiftedNormalizedValues = normalizedValues
  }

  // Return a new LoadCurveValues instance with normalized and shifted values
  return new LoadCurveValues(...shiftedNormalizedValues)
}

