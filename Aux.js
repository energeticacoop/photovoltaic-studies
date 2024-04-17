/**
 * Calculates the sum of two numbers.
 * @param {number} sum - The initial sum value.
 * @param {number} number - The number to add to the sum.
 * @returns {number} The new sum.
 */
const sumVector = (sum, number) => sum + number


/**
 * Rotates the elements of an array by a given displacement, so that the last displacement elements move to the beggining.
 * @param {Array} array - The array to rotate.
 * @param {number} displacement - The number of positions to rotate the array.
 * @returns {Array} The rotated array.
 */
function rotateArray(array, displacement) {
  return [
    ...array.slice(array.length - displacement),
    ...array.slice(0, array.length - displacement),
  ]
}


/**
 * Retrieves the ID of the parent folder of the active spreadsheet.
 * @returns {string} The ID of the parent folder.
 */
function getParentFolderId() {
  return DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId())
    .getParents()
    .next()
    .getId()
}


/**
 * Gets the parent folder object of the active spreadsheet.
 * @returns {GoogleAppsScript.Drive.Folder} The parent folder as a Folder object.
 */
function getParentFolder() {
  return DriveApp.getFolderById(getParentFolderId())
}


/**
 * Downloads a file from a specified URL and saves it to a destination folder in Google Drive.
 * @param {string} fileURL - The URL of the file to download.
 * @param {string} fileName - The name to assign to the downloaded file.
 * @param {GoogleAppsScript.Drive.Folder} destinationFolder - The Google Drive folder where the file will be saved.
 * @returns {object} An object containing the response code and the file object.
 */
function downloadFile(fileURL, fileName, destinationFolder) {
  var response = UrlFetchApp.fetch(fileURL, { muteHttpExceptions: true })
  var rc = response.getResponseCode()
  var file
  if (rc == 200) {
    var fileBlob = response.getBlob()
    if (destinationFolder != null) {
      file = destinationFolder.createFile(fileBlob)
      file.setName(fileName)
    }
  }
  var fileInfo = { rc: rc, file: file }
  return fileInfo
}



/**
 * Clears certain named fields in the active sheet upon user confirmation.
 */
function eraseNamedFields() {
  var ui = SpreadsheetApp.getUi()

  var result = ui.alert(
    `Estás a punto de borrar todos los campos de entrada de la pestaña "${SpreadsheetApp.getActiveSheet().getName()}"`,
    "¿Seguro que quieres continuar?",
    ui.ButtonSet.YES_NO
  )

  const unerasableRanges = [
    "SIPS2",
    "SIPS3",
    "CSVtype",
    "CSVfilename",
    "REEconsumption",
    "surpassingValuesFactor",
    "ahorroTotal", "ahorroTotalConImpuestos", "installationSize"
  ]

  if (result == ui.Button.YES) {
    switch (SpreadsheetApp.getActive().getActiveSheet().getSheetName()) {

      case "Repositorio":
        SpreadsheetApp.getUi().alert("Hombre, el repositorio no, por favor 🤦‍♂️")
        break

      case "Presupuesto":
        break

      default:
        SpreadsheetApp.getActive()
          .getActiveSheet()
          .getNamedRanges()
          .forEach((range) => {
            if (!unerasableRanges.includes(range.getName()))
              range.getRange().clearContent()
          })
    }
    SpreadsheetApp.flush()
  }
}

/**
 * Replaces an image in a paragraph with a replacement value in a Google Doc with a new image.
 * @param {GoogleAppsScript.Document.Document} doc - The Google Doc object.
 * @param {string} replacementValue - The value to search for in the document.
 * @param {Blob} imageBlob - The image blob to replace with.
 * @param {number} imageWidth - The desired width of the inserted image.
 * @returns {GoogleAppsScript.Base.InlineImage} The inserted image object.
 */
function replaceImage(doc, replacementValue, imageBlob, imageWidth) {
  const searchResult = doc.getBody().findText(replacementValue)
  if (searchResult) {
    var imageContainer = searchResult.getElement().getParent().asParagraph()
    imageContainer.clear()
    const insertedImage = imageContainer.appendInlineImage(imageBlob)
    const width = insertedImage.getWidth()
    const height = insertedImage.getHeight()
    insertedImage.setWidth(imageWidth).setHeight(height * imageWidth / width)
    return insertedImage
  }
}

/**
 * Imports materials DB sheets from a the master Google Sheet into the active spreadsheet.
 */
function importDb() {

  // Define master study sheet Id
  const MASTERSHEETID = "19up24HvXQ0DqUkq0hpNqmQEU98D5GUuxeA1jrBr0etQ"
  
  // Define all materials sheets that must be imported
  const MATERIALSSHEETNAMES = ["Fusibles CA", "Puesta a tierra", "Cableado", "Fusibles CC", "Cargador VE", "Magnetos", "CombiIGA+Sobretensiones", "Dif.", "Cajas y Cuadros", "Canales", "Descargador CA", "Eq. Genéricos", "Repositorio", "Listas", "Tablas", "Normativa", "Inversores", "Módulos", "Estructura", "Consumibles", "Descargador CC", "Meters", "Enphase Extra", "Control y otros", "InterruptorSeccionador", "Contadores distri", "Cargador VE", "Obra civil", "Seguridad y Salud", "Gestión de Residuos"]

  // For each material sheet in current spreadsheet, update with the values from master 
  MATERIALSSHEETNAMES.forEach(sheetName => {
    // source sheet
    const ss = SpreadsheetApp.openById(MASTERSHEETID).getSheetByName(sheetName)

    // Get full range of data
    const dataRange = ss.getDataRange()

    // get the data values in range
    const dataValues = dataRange.getValues()

    // target sheet
    const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)

    // Clear the Google Sheet before copy
    targetSheet.clear({ contentsOnly: true })

    // set the target range to the values of the source data
    targetSheet.getRange(dataRange.getA1Notation()).setValues(dataValues)
  })

  // Set importation date to current date
  setValue("fechaImportacion", new Date())

}


/**
 * Completes an array with a fixed value up to a target length.
 * @param {Array} arr - The array to complete.
 * @param {*} fixedValue - The value to use for completing the array.
 * @param {number} targetLength - The desired length of the array after completion.
 * @returns {Array} The completed array.
 */
function completeArray(arr, fixedValue, targetLength) {
  if (arr.length >= targetLength) {
    return arr // No need to complete the array if it's already long enough.
  }

  const entriesToAdd = targetLength - arr.length
  const completedArray = arr.slice() // Clone the original array to avoid modifying it.

  for (let i = 0; i < entriesToAdd; i++) {
    completedArray.push(fixedValue)
  }

  return completedArray
}