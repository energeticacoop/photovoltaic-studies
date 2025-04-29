/**
 * Retrieves the destination folder based on the provided folder name.
 * @param {string} destinationFolderName - The name of the destination folder.
 * @returns {Folder} The destination folder.
 */
function getDestinationFolder(destinationFolderName) {
  const folder01 = DriveApp.getFolderById(getParentFolderId())
  const clientFolder = folder01.getParents().next()
  const folder02 = clientFolder.getFoldersByName("02 - Tramitación").next()
  const folder03 = clientFolder.getFoldersByName("03 - Ejecución").next()

  switch (destinationFolderName) {
    case "clientFolder":
      return clientFolder
    case "folder01":
      return folder01
    case "folder02":
      return folder02
    case "folder0200":
      return folder02.getFoldersByName("00 - Documentación para firma").next()
    case "folder0201":
      return folder02.getFoldersByName("01 - DROU").next()
    case "folder0202":
      return folder02.getFoldersByName("02 - BOEL").next()
    case "folder0203":
      return folder02.getFoldersByName("03 - Registro autoconsumo").next()
    case "folder0204":
      return folder02.getFoldersByName("04 - Documentación proyecto").next()
    case "folder0205":
      return folder02.getFoldersByName("05 - Distribuidora").next()
    case "folder03":
      return folder03
  }
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
