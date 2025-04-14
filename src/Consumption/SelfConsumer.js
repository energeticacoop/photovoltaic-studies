/**
 * Class representing a self-consumer's data managed from a Google Sheet.
 * Provides methods to process and handle various load curves related to the self-consumer.
 */
class SelfConsumer {
  /**
   * Creates an instance of SelfConsumer.
   * Initializes the sheet and self-consumer index, then loads basic fields from the sheet.
   * 
   * @param {number} selfConsumerIndex - The column index in the sheet representing the self-consumer's data.
   */
  constructor(selfConsumerIndex) {
    this.selfConsumerIndex = selfConsumerIndex

    // Initialize fields from the sheet, excluding Load Curve fields.
    this.initializeFields()
  }

  /**
   * Initializes fields from the Google Sheet excluding Load Curve-related fields.
   * Fields are dynamically created as properties on the SelfConsumer instance.
   */
  initializeFields() {
    const data = get("selfConsumersData")

    data.forEach(row => {
      const fieldName = row[0] // Field name is in the first column

      // Only create fields for valid names
      if (fieldName && fieldName.trim() !== '') {
        const fieldValue = row[this.selfConsumerIndex] // Get value for the selfConsumerIndex column
        this[fieldName] = fieldValue // Dynamically assign field value to the instance
      }

    })
  }

  /**
   * Retrieves the range for the load curve based on the named range and self-consumer index.
   * 
   * @param {string} headingNamedRange - The named range for the heading in the sheet.
   * @returns {Range} The range object for the load curve values.
   * @throws {Error} Throws an error if the named range is not found.
   */
  getLoadCurveRange(headingNamedRange) {
    const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(headingNamedRange)

    if (!range) {
      throw new Error(`Named range '${headingNamedRange}' not found`)
    }

    const startRow = range.getRow()
    const sheet = range.getSheet()

    return sheet.getRange(startRow, this.selfConsumerIndex + 1, 8760, 1)
  }

  /**
   * Sets the Load Curve in the sheet for the self-consumer.
   * 
   * @param {string} headingNamedRange - The named range for the heading in the sheet.
   * @param {LoadCurveValues} newLoadCurve - The new load curve values to set.
   */
  setLoadCurve(headingNamedRange, newLoadCurve) {
    const loadCurveRange = this.getLoadCurveRange(headingNamedRange)

    // Convert to 2D array for writing to the sheet
    const newValues = newLoadCurve.map(value => [value])

    if (loadCurveRange) {
      loadCurveRange.setValues(newValues)
    } else {
      throw new Error("Load Curve range not initialized")
    }
  }

 /**
 * Clears the Load Curve in the sheet for the self-consumer.
 * 
 * @param {string} headingNamedRange - The named range for the heading in the sheet.
 * @throws {Error} Throws an error if the load curve range is not initialized.
 */
clearLoadCurve(headingNamedRange) {
  const loadCurveRange = this.getLoadCurveRange(headingNamedRange)

  if (loadCurveRange) {
    loadCurveRange.clearContent()
  } else {
    throw new Error("Load Curve range not initialized")
  }
}

  /**
   * Retrieves the load curve values from the sheet for a specific self-consumer
   * and returns them as a LoadCurveValues object.
   * 
   * @param {string} headingNamedRange - The name of the heading range (e.g., 'cchConventional') that is used to locate the starting row for the load curve.
   * @returns {LoadCurveValues} A LoadCurveValues object constructed from the load curve values (should have exactly 8760 values).
   * @throws {Error} Throws an error if the load curve range could not be initialized (e.g., if the named range is not found).
   */
  getLoadCurve(headingNamedRange) {
    const loadCurveRange = this.getLoadCurveRange(headingNamedRange)

    if (loadCurveRange) {
      // Read the values from the sheet and convert them to a 1D array
      const values = loadCurveRange.getValue().flat().map(value => Number(value))

      // Return a LoadCurveValues object constructed from the values
      return new LoadCurveValues(...values)
    } else {
      throw new Error("Load Curve range not initialized")
    }
  }

  /**
   * Processes and normalizes the Load Curve values based on the specified source.
   * Updates the load curve based on different sources like REE profiles or CSV files.
   * 
   * @throws {Error} Throws an error if the load curve origin is unknown.
   */
  processConventionalLoadCurve() {

    const loadCurveOrigin = this["Procedencia Curva de Consumo"]
    const annualConsumption = this["Consumo anual para escalar curva REE (kWh)"]
    const CSVfilename = this["Fichero CSV"]

    switch (loadCurveOrigin) {
      case "Perfil REE 2.0TD":
        const profileREE20 = get("perfilREE2.0")
        const loadCurveREE20 = new LoadCurveValues(...profileREE20.map(entry => Number(entry) * annualConsumption))
        this.setLoadCurve("cchConventional", loadCurveREE20)
        break

      case "Perfil REE 3.0TD":
        const profileREE30 = get("perfilREE3.0")
        const loadCurveREE30 = new LoadCurveValues(...profileREE30.map(entry => Number(entry) * annualConsumption))
        this.setLoadCurve("cchConventional", loadCurveREE30)
        break

      case "CSV Infoenergia":
      case "CSV Iberdrola":
      case "CSV Datadis":
        const loadCurve = getLoadCurveFromCSV(CSVfilename, loadCurveOrigin)
        this.setLoadCurve("cchConventional", loadCurve)
        break
      case "API Datadis":
        const datadisResponseCell = getRangeByName("datadisResponses").getCell(1, this.selfConsumerIndex)
        try {
          datadisResponseCell.clearContent()
          const loadCurveDatadisAPI = getLoadCurveFromDatadisAPI(this["DNI/NIF/CIE titular contrato"].replaceAll(' ', ''), this["CUPS aportado por cliente (sin espacios)"], this["Fecha inicio periodo descarga API Datadis"].replaceAll(' ', ''), this["Fecha final periodo descarga API Datadis"].replaceAll(' ', ''))
          this.setLoadCurve("cchConventional", loadCurveDatadisAPI)
        }
        catch (e) {
          // Set error response in "Respuesta API Datadis" cell for this Self Consumer
          datadisResponseCell.set(e)
        }
        break
      default:
        throw new Error("Unknown Load Curve origin")
    }
  }

  /**
   * Processes recurring consumption data to generate a load curve.
   * Considers daily, monthly, weekly, and seasonal consumption patterns.
   * Outputs the recurring load curve to the sheet.
   */
  processRecurringLoadCurve() {
    const dates = get("normalizedDates").map(e => new Date(e))
    const recurringDaily = get("recurringDaily")
    const recurringMonthly = get("recurringMonthly")
    const recurringWeekly = get("recurringWeekly")
    const recurringSeasonal = get("recurringSeasonal")
    const isWeekendOrHoliday = get("isWeekendOrHoliday")
    const seasons = get("seasons")

    const recurringLoadCurve = dates.map(
      (date, index) =>
        +recurringDaily[date.getHours()] +
        +recurringMonthly[date.getHours()][date.getMonth()] +
        +recurringWeekly[date.getHours()][(date.getDay() + 6) % 7] +
        +recurringSeasonal[date.getHours()][
          isWeekendOrHoliday[index]
            ? seasons[index] * 2 + 1 // Weekend or national holiday column
            : seasons[index] * 2 // Weekdays column
        ]
    )

    // Create and set the recurring load curve
    const recurringLoadCurveValues = new LoadCurveValues(...recurringLoadCurve)
    this.setLoadCurve("cchRecurring", recurringLoadCurveValues)
  }

  /**
   * Processes ASHP (Air Source Heat Pump) consumption data.
   * Generates the ASHP load curve and updates the sheet.
   */
  processASHPLoadCurve() {
    const ashpConsumption = get("ASHPconsumption")
    const ashpCurveName = get("ASHPcurveName")

    const ashpCurvesHeaders = get("ashpCurvesHeaders")[0]
    const ashpCurves = get("ASHPcurves")
    const ashpIndex = ashpCurvesHeaders.indexOf(ashpCurveName)

    const ashpLoadCurve = ashpCurves.map(row => (row[ashpIndex] || 0) * (ashpConsumption || 0))

    // Create and set the ASHP load curve
    const ashpLoadCurveValues = new LoadCurveValues(...ashpLoadCurve)
    this.setLoadCurve("cchASHP", ashpLoadCurveValues)

  }

  /**
   * Processes consumption data for the electric vehicle charger.
   * Constructs and updates the SAVE load curve based on charge and discharge patterns.
   */
  processSAVELoadCurve() {
    const dates = get("normalizedDates").map(dateString => new Date(dateString))
    const gridUsage = get("SAVEgridUsage")
    const seasonsKm = get("SAVEseasonsKm")[0]
    const batteryCapacity = get("SAVEbatteryCapacity")
    const consumptionPerKm = get("SAVEconsumptionPer100Km") / 100
    const maxSAVEpower = get("maxSAVEpower")
    const saveType = get("saveType")
    const normalizedPowersOrbis = get("normalizedPowersOrbis")
    const normalizedPowersFronius = get("normalizedPowersFronius")
    const isWeekendOrHoliday = get("isWeekendOrHoliday")
    const seasons = get("seasons")


    // Compute charge availability curve
    const chargeAvailability = dates.map((date, index) =>
      gridUsage[date.getHours()][
      isWeekendOrHoliday[index]
        ? seasons[index] * 2 + 1 // Weekend column
        : seasons[index] * 2 // Weekday column
      ]
    )

    // Compute discharge daily hours curve, wich is a map of (timekey for each day)->(number of discharging hours)
    const dailyHoursOfDischarge = new Map()
    dates.forEach((date, index) => {
      if (!chargeAvailability[index]) {
        const timeKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
        dailyHoursOfDischarge.set(timeKey, (dailyHoursOfDischarge.get(timeKey) || 0) + 1)
      }
    })

    // Compute battery usage curve
    const seasonsConsumption = seasonsKm.map(e => +e * consumptionPerKm)
    const batteryUsage = dates.map((date, index) => {
      const timeKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      const numberOfDailyHoursOfDischarge = dailyHoursOfDischarge.get(timeKey)
      const saveUsageValue = chargeAvailability[index]
        ? 0
        : isWeekendOrHoliday[index]
          ? seasonsConsumption[seasons[index] * 2 + 1] / numberOfDailyHoursOfDischarge
          : seasonsConsumption[seasons[index] * 2] / numberOfDailyHoursOfDischarge
      return saveUsageValue
    })

    // Compute and set SAVE load curve
    const conventionalCCH = this.getLoadCurve("cchConventional")
    const recurringCCH = this.getLoadCurve("cchRecurring")
    const ashpCCH = this.getLoadCurve("cchASHP")
    const partialCCH = conventionalCCH.map(
      (e, index) => e + recurringCCH[index] + ashpCCH[index]
    )
    const beta = get("chosenBetas")[this.selfConsumerIndex - 1] 
    const production = get("normalizedProduction").map(value => value * beta)
    const partialSurplus = partialCCH.map((e, index) =>
      Math.max(0, production[index] - e)
    )
    const partialGridDemand = partialCCH.map((e, index) =>
      Math.max(0, e - production[index])
    )

    // Compute maximum charge power for each tariff period as max of contracted power, SAVE power and normalized power
    const electricalInstallationType = this["Instalación eléctrica"]
    const saveContractedPowers = [
      this["Potencia P1"], this["Potencia P2"], this["Potencia P3"],
      this["Potencia P4"], this["Potencia P5"], this["Potencia P6"],
    ]

    const normalizedPowersArray =
      saveType === "Orbis"
        ? normalizedPowersOrbis
        : normalizedPowersFronius
    const normalizedPowers =
      electricalInstallationType === "Monofásica"
        ? normalizedPowersArray.map(e => e[0])
        : normalizedPowersArray.map(e => e[1])
    const maxChargePowers = saveContractedPowers.map(saveContractedPower => {
      const inferiorNormalizedPowerIndex =
        normalizedPowers.findIndex(e => e > saveContractedPower) - 1
      const inferiorNormalizedPower =
        inferiorNormalizedPowerIndex < 0
          ? Number.MAX_VALUE
          : normalizedPowers[inferiorNormalizedPowerIndex]
      return Math.min(saveContractedPower, maxSAVEpower, inferiorNormalizedPower)
    })

    // Calculate SAVE CCH curve
    let batteryStatus = batteryCapacity // Battery starts fully charged
    let batteryNegativeEnergy = 0
    let batteryNegativeOccurrences = 0
    const tariff = this["Peaje de acceso"]
    const tariffPeriods = tariff == "2.0TD"
      ? get("tariffPeriods20")
      : tariff == "3.0TD"
        ? get("tariffPeriods30")
        : get("tariffPeriods61")

    const saveCCH = new Array(8760)
    batteryUsage.forEach((hourlyLoad, index) => {
      if (hourlyLoad) {
        // Discharge battery
        batteryStatus -= hourlyLoad
        // Track when battery is depleted
        if (batteryStatus < 0) {
          batteryNegativeEnergy += -batteryStatus
          batteryNegativeOccurrences++
          batteryStatus = 0
        }
        saveCCH[index] = 0
      } else {
        if (chargeAvailability[index]) {
          // Charge battery
          const datePeriod = tariffPeriods[index]
          const isNightPeriod = ((tariff == "2.0TD" && datePeriod == 3) || datePeriod == 6)
          const availableEnergy = isNightPeriod
            ? Math.max(0, saveContractedPowers[datePeriod - 1] - partialGridDemand[index])
            : Math.min(partialSurplus[index], maxSAVEpower)
          const actualDemand = Math.min(
            batteryCapacity - batteryStatus,
            availableEnergy,
            maxChargePowers[datePeriod - 1]
          )
          batteryStatus += actualDemand
          saveCCH[index] = actualDemand
        } else {
          saveCCH[index] = 0
        }
      }
    })

    // Set the SAVE load curve
    const saveLoadCurveValues = saveCCH
    this.setLoadCurve("cchSAVE", saveLoadCurveValues)

    // Log battery energy deficit information
    set("batteryNegativeEnergy", batteryNegativeEnergy)
    set("batteryNegativeOccurrences", batteryNegativeOccurrences)
  }
}
