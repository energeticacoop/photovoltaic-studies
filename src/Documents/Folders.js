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
 * Clears content from specific ranges in the spreadsheet.
 * @returns {void}
 */
function forgetFolders() {

  const erasableRangesDocumentation = [
    "clientFolder",
    "outputStudy",
    "adminFolder",
    "outputGuide",
    "output00Folder",
    "output01Folder",
    "output02Folder",
    "output03Folder",
    "output04Folder",
    "outputMemoryOrProject",
    "outputBill",
    "folder01",
    "folder02",
    "folder0200",
    "folder0201",
    "folder0202",
    "folder0203",
    "folder0204",
    "folder0205",
    "folder03",
    "outputMGE",
  ]

  SpreadsheetApp.getActiveSpreadsheet().getNamedRanges().forEach((range) => {
    if (erasableRangesDocumentation.includes(range.getName()))
      range.getRange().clearContent()
  })
}


/**
 * Prints the link to a folder in the spreadsheet.
 * @param {string} rangename - The name of the range in the spreadsheet.
 * @returns {void}
 */
function printFolderLink(rangename) {
  const folder = getDestinationFolder(rangename)
  set()
  setURL(getRangeByName(rangename), folder.getUrl(), folder.getName())
}

/**
 * Prints links to all folders in the spreadsheet.
 * @returns {void}
 */
function printAllFoldersLinks(){
  // Print folder links
  const clientFolder = getDestinationFolder("clientFolder")
  setURL(getRangeByName("clientFolder"), clientFolder.getUrl(), `Directorio madre: ${clientFolder.getName()}`)
  printFolderLink("folder01")
  printFolderLink("folder02")
  printFolderLink("folder0200")
  printFolderLink("folder0201")
  printFolderLink("folder0202")
  printFolderLink("folder0203")
  printFolderLink("folder0204")
  printFolderLink("folder0205")
  printFolderLink("folder03")

}
