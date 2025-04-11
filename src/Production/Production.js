/**
 * Processes data and files to be used in SAM (System Advisor Model) for production curve generation.
 */
function processProduction() {
  getClimateFile()
  getSatelliteImages()
  getUTMcoordinates()
  getPostalCode()
}

/**
 * Retrieves climate file data from the European Commission's Joint Research Centre (JRC) API.
 */
function getClimateFile() {
  const climateFilesFolder = "10R7QO6UcCrIcZSVmAyHKWfaZV1MkzbP4" 
  const destinationFolder = DriveApp.getFolderById(climateFilesFolder)

  const coordinates = get("coordinates")
  const [latitude, longitude] = coordinates.toString().split(/(?:,| )+/)
  const outputFormat = "epw"
  const useHorizon = 1
  const browser = 0

  const tmyFileName = get("tmyFileName")
  const tmyFilename = `${tmyFileName}.${outputFormat}`;

  const tmyURL = `https://re.jrc.ec.europa.eu/api/tmy`
    + `?lat=${latitude}`
    + `&lon=${longitude}`
    + `&usehorizon=${useHorizon}`
    + `&outputformat=${outputFormat}`
    + `&browser=${browser}`

  Tools.deleteFile(tmyFilename, destinationFolder)

  const tmyFile = downloadFile(tmyURL, tmyFilename, destinationFolder).file
  setURL(
    "tmyFileepw",
    tmyFile.getUrl(),
    tmyFileName)
  }




// module.exports = {
//  extractPostalCodeFromCoordinates,
//  convertLatLonToUTM,
//}; 