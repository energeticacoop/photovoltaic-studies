/**
 * Adds custom menus to the Google Sheets UI.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu("🌤️ Producción")
    .addItem("🌤️ Obtener ficheros de clima para SAM", "getClimateFile")
    .addItem("🛰️ Obtener imágenes de satélite", "getSatelliteImages")
    .addItem("🗺️ Calcular coordenadas UTM", "getUTMcoordinates")
    .addItem("📌 Obtener código postal", "getPostalCode")
    .addSeparator()
    .addItem(
      "⏬ Procesar todas las acciones de producción",
      "processProduction"
    )
    .addToUi()

  ui.createMenu("🔌 Consumo")
    .addItem(
      "💡 Procesar consumos convencionales",
      "processConventionalConsumption"
    )
    .addItem("⏱️ Procesar consumos recurrentes", "processRecurringConsumption")
    .addItem("♨️ Simular consumos aerotermia", "processASHPConsumptions")
    .addItem("🚘 Simular consumos vehículo eléctrico", "processSAVEConsumption")
    .addSeparator()
    .addItem("⏬ Procesar todos los consumos", "processAllConsumptions")
    .addToUi()

  ui.createMenu("👩‍💻 Ingeniería")
    .addItem("📋 Cargar presupuesto tipo", "populateBudget")
    .addSeparator()
    .addItem("🐝 Procesar Flux Solar", "processFluxSolar")
    .addToUi()

  ui.createMenu("📚 Documentación")
    .addItem("📗 Generar estudio definitivo", "createFinalStudy")
    .addItem(
      "📙 Generar documentación para firma",
      "create00FolderDocumentation"
    )
    .addItem("📙 Generar documentación DROU", "create01FolderDocumentation")
    .addItem(
      "📙 Generar memoria técnica o proyecto y guía instalación",
      "createMemoryOrProjectAndGuide"
    )
    .addItem("📙 Generar factura", "createBill")
    .addItem(
      "📙 Generar BOEL y registro autoconsumo",
      "create02And03FolderDocumentation"
    )
    .addItem("📙 Generar documentación proyecto", "create04FolderDocumentation")
    .addItem(
      "📙 Generar documentación distribuidora",
      "create05FolderDocumentation"
    )
    .addItem(
      "📚 Generar estudio definitivo individual y toda la documentación",
      "createAllDocuments"
    )
    .addSeparator()
    .addItem("📙 Generar Certificado MGE", "createMGEcertificate")
    .addSeparator()
    .addItem("📗 Generar estudio instalación compartida", "createSharedStudy")
    .addItem(
      "📗 Generar estudio personalizado instalación compartida",
      "createCustomSharedStudy"
    )
    .addItem(
      "📗 Generar estudios ahorro instalación compartida",
      "createSavingsSharedStudy"
    )
    .addToUi()

  ui.createMenu("🤖 Utilidades")
    //.addItem("🗑️ Eliminar campos en la hoja activa","clearCells")
    .addItem("🗑️ Eliminar curvas de carga seleccionadas", "clearLoadCurves")
    .addItem("🖇️ Importar base de datos de materiales", "Tools.importDb")
    .addToUi()
}
