/**
 * Clears the output ranges related to production data in the "Producción" sheet.
 */
function Borraroutputproduccion() {
  const outputRanges = [
    "tmyFileepw",
    "tmyFilecsv",
    "satelliteImages",
    "scales",
    "UTMcoordinates",
    "CP"
  ]
  SpreadsheetApp.getActive()
    .getSheetByName("Producción")
    .getNamedRanges()
    .forEach((range) => {
      if (outputRanges.includes(range.getName()))
        range.getRange().clearContent()
    })
}

/**
 * Clears the output ranges related to conventional consumption data in the "Consumo base" sheet.
 */
function Borraroutputconsumoconvencional() {
  const outputRanges = [
    "yearlyConsumption",
    "csvCUPS",
    "monthlyConsumption",
    "monthlyHourlyPeak",
    "hourlyConsumptionMeans",
    "normalizedDates",
    "normalizedCCH",
    "normalizedComments",
    "weeklyConsumptionMeans",
    "exceedingValues",
  ]
  SpreadsheetApp.getActive()
    .getSheetByName("Consumo base")
    .getNamedRanges()
    .forEach((range) => {
      if (outputRanges.includes(range.getName()))
        range.getRange().clearContent()
    })
}
