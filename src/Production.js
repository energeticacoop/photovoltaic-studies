/**
 * Processes data and files to be used in SAM (System Advisor Model) for production curve generation.
 */
function processSAMdata() {
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

  const coordinates = getValue("coordinates")
  const [latitude, longitude] = coordinates.toString().split(/(?:,| )+/)
  const outputFormat = "epw"
  const useHorizon = 1
  const browser = 0

  const tmyFileName = getValue("tmyFileName")
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
    SpreadsheetApp.getActiveSpreadsheet().getRangeByName(`tmyFileepw`),
    tmyFile.getUrl(),
    `Fichero TMY en ${outputFormat.toUpperCase()}`)
}



/**
 * Converts geographic coordinates (latitude, longitude) to UTM (Universal Transverse Mercator).
 *
 * Adapted from: https://github.com/proj4js/proj4js/blob/master/lib/projections/utm.js
 *
 * @param {number} latitude - Latitude in decimal degrees. Must be between -80 and 84.
 * @param {number} longitude - Longitude in decimal degrees. Must be between -180 and 180.
 * @param {number} [forceZoneNum] - Optional UTM zone override.
 * @returns {{
 *   easting: number,
 *   northing: number,
 *   zoneNum: number,
 *   zoneLetter: string
 * }} UTM coordinate object.
 *
 * @throws {RangeError} If input values are outside valid bounds.
 */
function convertLatLonToUTM(latitude, longitude, forceZoneNum) {
  if (latitude > 84 || latitude < -80) {
    throw new RangeError("Latitude out of range (must be between -80 and 84)");
  }
  if (longitude > 180 || longitude < -180) {
    throw new RangeError("Longitude out of range (must be between -180 and 180)");
  }

  const R = 6378137; // Earth radius in meters
  const E = 0.00669438; // Eccentricity squared
  const E_P2 = E / (1 - E);
  const K0 = 0.9996;

  const M1 = 1 - E / 4 - (3 * E * E) / 64 - (5 * E * E * E) / 256;
  const M2 = (3 * E) / 8 + (3 * E * E) / 32 + (45 * E * E * E) / 1024;
  const M3 = (15 * E * E) / 256 + (45 * E * E * E) / 1024;
  const M4 = (35 * E * E * E) / 3072;

  const ZONE_LETTERS = "CDEFGHJKLMNPQRSTUVWXX".split("");

  function toRadians(deg) {
    return (deg * Math.PI) / 180;
  }

  function latitudeToZoneLetter(lat) {
    if (-80 <= lat && lat <= 84) {
      return ZONE_LETTERS[Math.floor((lat + 80) / 8)];
    }
    return null;
  }

  function latLonToZoneNumber(lat, lon) {
    if (56 <= lat && lat < 64 && 3 <= lon && lon < 12) return 32;
    if (72 <= lat && lat <= 84 && lon >= 0) {
      if (lon < 9) return 31;
      if (lon < 21) return 33;
      if (lon < 33) return 35;
      if (lon < 42) return 37;
    }
    return Math.floor((lon + 180) / 6) + 1;
  }

  function zoneNumberToCentralLongitude(zoneNum) {
    return (zoneNum - 1) * 6 - 180 + 3;
  }

  const latRad = toRadians(latitude);
  const latSin = Math.sin(latRad);
  const latCos = Math.cos(latRad);
  const latTan = Math.tan(latRad);
  const latTan2 = latTan * latTan;
  const latTan4 = latTan2 * latTan2;

  const zoneNum = forceZoneNum ?? latLonToZoneNumber(latitude, longitude);
  const zoneLetter = latitudeToZoneLetter(latitude);

  const lonRad = toRadians(longitude);
  const centralLon = zoneNumberToCentralLongitude(zoneNum);
  const centralLonRad = toRadians(centralLon);

  const n = R / Math.sqrt(1 - E * latSin * latSin);
  const c = E_P2 * latCos * latCos;
  const a = latCos * (lonRad - centralLonRad);
  const a2 = a * a;
  const a3 = a2 * a;
  const a4 = a3 * a;
  const a5 = a4 * a;
  const a6 = a5 * a;

  const m =
    R *
    (M1 * latRad -
      M2 * Math.sin(2 * latRad) +
      M3 * Math.sin(4 * latRad) -
      M4 * Math.sin(6 * latRad));

  const easting =
    K0 *
      n *
      (a +
        (a3 / 6) * (1 - latTan2 + c) +
        (a5 / 120) * (5 - 18 * latTan2 + latTan4 + 72 * c - 58 * E_P2)) +
    500000;

  let northing =
    K0 *
    (m +
      n *
        latTan *
        (a2 / 2 +
          (a4 / 24) * (5 - latTan2 + 9 * c + 4 * c * c) +
          (a6 / 720) * (61 - 58 * latTan2 + latTan4 + 600 * c - 330 * E_P2)));

  if (latitude < 0) northing += 10000000;

  return {
    easting,
    northing,
    zoneNum,
    zoneLetter,
  };
}

/**
 * Retrieves postal code from coordinates via Google Maps Geocode API.
 */
function getPostalCode() {
  const scriptProperties = PropertiesService.getScriptProperties()
  const googleMapsApiKey = scriptProperties.getProperty("GOOGLEMAPS_API_KEY")

  try {
    // Retrieve coordinates using get() with validation
    const coordinates = get("coordinates")  // Get the value from the "coordinates" named range, validated
    const postalCode = extractPostalCodeFromCoordinates(coordinates, googleMapsApiKey)

    // Set the postal code in the "CP" named range
    set("CP", postalCode)
    
  } catch (error) {
    // Show the error with a custom alert message
    SpreadsheetApp.getUi().alert(`Ha habido un error al obtener el código postal: ${error.message}`)
    console.error(error.message)  // Log the detailed error message
  }
}

/**
 * Extracts the postal code from the coordinates using the Google Maps Geocode API.
 * 
 * @param {string} coordinates - The coordinates in 'lat,lng' format.
 * @param {string} apiKey - The Google Maps API key.
 * @returns {string} The postal code.
 * @throws {Error} If the postal code cannot be extracted or if there's an issue with the API.
 */
function extractPostalCodeFromCoordinates(coordinates, apiKey) {
  try {
    // Construct the URL for the API request
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.replace(/\s+/g, '')}&&result_type=postal_code&key=${apiKey}`
    
    // Make the request to the Google Maps API
    const response = UrlFetchApp.fetch(url)
    
    // Parse the JSON response
    const json = response.getContentText()
    const obj = JSON.parse(json)

    // Check if the API response contains results
    if (obj.status !== "OK" || obj.results.length === 0) {
      throw new Error(`No se encontraron resultados para las coordenadas: ${coordinates}`)
    }

    // Extract the postal code from the API response
    const addr = obj.results[0]
    const postalCode = addr.address_components[0].long_name

    // Return the postal code
    return postalCode

  } catch (error) {
    // Catching network or parsing errors
    const message = error.message || "Hubo un error al intentar obtener el código postal. Verifica las coordenadas."
    throw new Error(`❌ Error al obtener el código postal: ${message}. Coordenadas: ${coordinates}`)
  }
}


module.exports = {
  extractPostalCodeFromCoordinates,
  convertLatLonToUTM,
};