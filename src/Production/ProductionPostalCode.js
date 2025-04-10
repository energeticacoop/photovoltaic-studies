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
