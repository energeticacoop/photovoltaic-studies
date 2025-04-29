/**
 * Retrieves satellite images from Google Static Maps API and calculates its scales (meters per 100 pixels).
 * The logic is separated into two parts: one for handling the retrieval and setting of data,
 * and the other for the actual image retrieval and scale calculation.
 */
function getSatelliteImages() {
  const destinationFolder = getParentFolder()
  const coordinates = get("coordinates")
  const [latitude, longitude] = coordinates
    .toString()
    .split(/(?:,| )+/)
    .map((el) => parseFloat(el)) // Parse them into latitude and longitude

  const minZoom = 19
  const maxZoom = 22
  const size = "640x640"
  const scale = 2
  const scalePrecision = 4 // Decimal places of meters per pixel scale
  const mapType = "satellite"

  let lastFileName = ""
  const satelliteImagesUrls = new Array(4).fill("")
  const scales = new Array(4).fill("")
  const imagesTexts = new Array(4).fill("")

  // Get maps for every zoom level
  getMaps: for (let zoom = minZoom; zoom < maxZoom + 1; zoom++) {
    Tools.showMessage(
      "ℹ️ Descargando mapa",
      `Intentando obtener mapa con nivel de zoom ${zoom}...`
    )

    // Calculate and show scale (meters per 100 pixels)
    const metersPer100Px = calculateScale(latitude, zoom, scale)
    const roundedMetersPer100Px = roundToPrecision(
      metersPer100Px,
      scalePrecision
    )

    // Download image from Google Static Map API
    const currentFile = downloadMapImage(
      coordinates,
      zoom,
      size,
      scale,
      mapType,
      roundedMetersPer100Px,
      latitude,
      longitude,
      destinationFolder
    )

    // Check if the downloaded file is the same as the last one (maximum zoom level reached)
    const currentSize = currentFile.getSize()
    const lastFiles = destinationFolder.getFilesByName(lastFileName)
    if (lastFiles.hasNext()) {
      const lastSize = lastFiles.next().getSize()
      if (currentSize === lastSize) {
        Tools.showMessage(
          "ℹ️ Descargando mapa",
          `No hay imágenes con nivel de zoom ${zoom} para las coordenadas indicadas. Finalizando la descarga de imágenes.`
        )
        Tools.deleteFile(currentFile.getName(), destinationFolder)
        break getMaps
      }
    }

    satelliteImagesUrls[zoom - minZoom] = currentFile.getUrl()
    imagesTexts[zoom - minZoom] = `Zoom ${zoom}`
    scales[zoom - minZoom] = roundedMetersPer100Px

    lastFileName = currentFile.getName()
  }

  // Set the retrieved data (Satellite Images and Scales)
  for (let zoom = minZoom; zoom < maxZoom + 1; zoom++) {
    setURL(
      "satellite" + zoom.toString(),
      satelliteImagesUrls[zoom - minZoom],
      imagesTexts[zoom - minZoom]
    )
  }
  set("scales", scales) // Set the scales for the images
}

/**
 * Calculates the scale (meters per 100 pixels) for the given latitude and zoom level.
 *
 * @param {number} latitude The latitude of the location.
 * @param {number} zoom The zoom level.
 * @param {number} scale The scale of the map (usually 1 or 2).
 * @returns {number} The scale in meters per 100 pixels.
 */
function calculateScale(latitude, zoom, scale) {
  return (
    (((156543.03392 * Math.cos((latitude * Math.PI) / 180)) /
      Math.pow(2, zoom)) *
      100) /
    scale
  )
}

/**
 * Rounds a number to the specified decimal precision.
 *
 * @param {number} value The value to round.
 * @param {number} precision The number of decimal places to round to.
 * @returns {number} The rounded value.
 */
function roundToPrecision(value, precision) {
  return (
    Math.round((value + Number.EPSILON) * Math.pow(10, precision)) /
    Math.pow(10, precision)
  )
}

/**
 * Downloads the map image from the Google Static Maps API.
 *
 * @param {string} coordinates The coordinates in "latitude,longitude" format.
 * @param {number} zoom The zoom level for the map.
 * @param {string} size The size of the map image.
 * @param {number} scale The scale of the map.
 * @param {string} mapType The type of map (satellite, road, etc.).
 * @param {number} scaleValue The scale in meters per 100 pixels.
 * @param {number} latitude The latitude of the location.
 * @param {number} longitude The longitude of the location.
 * @param {Folder} destinationFolder The destination folder to save the map image.
 * @returns {File} The downloaded file.
 */
function downloadMapImage(
  coordinates,
  zoom,
  size,
  scale,
  mapType,
  scaleValue,
  latitude,
  longitude,
  destinationFolder
) {
  const scriptProperties = PropertiesService.getScriptProperties()
  const googleMapsApiKey = scriptProperties.getProperty("GOOGLEMAPS_API_KEY")

  const staticMapURL = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates}&zoom=${zoom}&size=${size}&scale=${scale}&maptype=${mapType}&key=${googleMapsApiKey}`
  const currentFilename = `mapa-(${latitude},${longitude})-zoom-(${zoom})-scale-(${scaleValue}).png`

  Tools.deleteFile(currentFilename, destinationFolder)
  return Tools.downloadFile(staticMapURL, currentFilename, destinationFolder)
    .file
}
