/**
 * Adds custom menus to the Google Sheets UI.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi()
  ui
    .createMenu("🎛️ Producción y consumo")
    .addItem("🌤️ Obtener ficheros para SAM", "processSAMdata")
    .addSeparator()
    .addSeparator()
    .addItem(
      "🔌 Procesar producción y consumos convencionales",
      "processConventionalConsumptionAndProduction"
    )
    .addItem("⏱️ Procesar consumos recurrentes", "processRecurringConsumption")
    .addItem("♨️ Simular consumos aerotermia", "processASHP")
    .addItem("🚘 Simular consumos vehículo eléctrico", "processSAVE")
    .addSeparator()
    .addItem("⏬ Procesar producción y todos los consumos", "processAllConsumptions")
    .addToUi()

  ui
    .createMenu("👩‍💻 Dimensionado e ingeniería")
    .addItem("📋 Generar presupuesto tipo", "populateBudget")
    .addSeparator()
    .addSeparator()
    .addItem("🔋 Calcular flujos energéticos", "processEnergyFlows")
    .addItem("💶 Calcular flujos económicos", "processEconomicFlows")
    .addSeparator()
    .addItem("⏬ Calcular todos los flujos", "processAllFlows")
    .addToUi()

  ui
    .createMenu("📚 Documentación")
    .addItem("📂 Generar enlaces a directorios de documentación", "printAllFoldersLinks")
    .addSeparator()
    .addItem("📗 Generar estudio definitivo", "createFinalStudy")
    .addItem("📙 Generar documentación para firma", "create00FolderDocumentation")
    .addItem("📙 Generar documentación DROU", "create01FolderDocumentation")
    .addItem("📙 Generar memoria técnica o proyecto y guía instalación", "createMemoryOrProjectAndGuide")
    .addItem("📙 Generar factura", "createBill")
    .addItem("📙 Generar BOEL y registro autoconsumo", "create02And03FolderDocumentation")
    .addItem("📙 Generar documentación proyecto", "create04FolderDocumentation")
    .addItem("📙 Generar documentación distribuidora", "create05FolderDocumentation")
    .addItem("📙 Generar Certificado MGE", "createMGEcertificate")
    .addSeparator()
    .addItem("📚 Generar estudio definitivo y toda la documentación", "createAllDocuments")
    .addSeparator()
    .addItem("✉️ Generar email para envío en Helpscout", "generateEmail")
    .addToUi()


  ui.createMenu("🤖 Utilidades")
    //.addItem("💣 Borrar todos los campos de la pestaña actual", "eraseNamedFields")
    .addItem("💣 Borrar campos de salida de documentos", "forgetFolders")
    .addItem("🖇️ Importar base de datos de materiales", "importDb")
    .addToUi()

}
