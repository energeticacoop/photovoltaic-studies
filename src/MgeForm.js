/**
 * Creates an MGE certificate using Energética's API fill-mge-form endpoint.
 */
function createMGEcertificate() {
  try {
    // Define the FastAPI endpoint URL
    const fastApiUrl = 'https://api.energetica.coop/fill-mge-form/'

    // Define the payload data
    const namedRanges = SpreadsheetApp.getActiveSpreadsheet().getNamedRanges()
    const replacementValues = namedRanges.reduce((acc, namedRange) => {
      const keyWithBraces = `<${namedRange.getName()}>`
      acc[keyWithBraces] = namedRange.getRange().getDisplayValue()
      return acc
    }, {})
    const payload = { data: replacementValues }

    // Make a POST request to the FastAPI endpoint
    const response = UrlFetchApp.fetch(fastApiUrl, {
      method: 'POST',
      payload: JSON.stringify(payload),
      contentType: 'application/json',
    })

    // Check if the response status is OK
    if (response.getResponseCode() === 200) {
      // Get the response content as a Blob
      const blob = response.getBlob()

      // Get the destination folder
      const destinationFolder = getDestinationFolder("folder0205")

      // Create a file in the same folder with a specific name
      const fileName = `${getValue("nombreCompletoPromotor")} - Certificado MGE.pdf`
      Tools.deleteFile(fileName, destinationFolder)
      const file = destinationFolder.createFile(blob.setName(fileName))

      // Output link to document
      setURL(getRangeByName("outputMGE"), file.getUrl(), "Certificado MGE")
      SpreadsheetApp.flush()

      // Log the file URL
      Logger.log(`File URL: ${file.getUrl()}`)
    } else {
      Logger.log(`HTTP error! Status: ${response.getResponseCode()}`)
    }
  } catch (error) {
    Logger.log(`Error: ${error}`)
  }
}