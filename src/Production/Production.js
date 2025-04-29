/**
 * Processes data and files to be used in SAM (System Advisor Model) for production curve generation.
 */
function processProduction() {
  getClimateFile()
  getSatelliteImages()
  getUTMcoordinates()
  getPostalCode()
}
