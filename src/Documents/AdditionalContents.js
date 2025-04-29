/**
 * Replaces the content of a budget table in a Google Docs document.
 * @param {Array} budget - The budget data to populate the table with.
 * @param {Table} budgetTable - The budget table to replace.
 * @param {string} [subtotalColumName="Total Capítulo (€)"] - The name of the subtotal column, which varies in different budget templates
 * presentations. Defaults to the value used in Study budget.
 */
function replaceBudgetTable(
  budget,
  budgetTable,
  subtotalColumName = "Total Capítulo (€)"
) {
  // Get master TableRows
  const titleRow = budgetTable.getRow(0).copy()
  const itemRow = budgetTable.getRow(2).copy()
  const lastRow = budgetTable.getRow(4).copy()
  budgetTable.clear()

  // Add table rows to template
  budget.forEach((element, index) => {
    var row
    switch (element.type) {
      case "title":
        row = budgetTable.insertTableRow(index, titleRow.copy())
        row
          .getCell(0)
          .editAsText()
          .replaceText("title", element["Concepto título"])
        break
      case "item":
        row = budgetTable.insertTableRow(index, itemRow.copy())
        row
          .getCell(0)
          .editAsText()
          .replaceText("Concept", element["Concepto ítem"])
          .replaceText("Description", element["Descripción"])
        row.getCell(1).editAsText().replaceText("quantity", element.Cantidad)
        row
          .getCell(2)
          .editAsText()
          .replaceText("subtotal", element[subtotalColumName])
        break
      case "empty":
        budgetTable.insertTableRow(index, lastRow.copy())
        break
    }
  })
}

/**
 * Replaces the content of a guide table (a budget table relevant for Energética's technicians) in a Google Docs document.
 * @param {Array} budget - The budget data to populate the table with.
 * @param {Table} budgetTable - The guide table to replace.
 */
function replaceGuideTable(budget, budgetTable) {
  // Get master TableRows
  const titleRow = budgetTable.getRow(0).copy()
  const itemRow = budgetTable.getRow(2).copy()
  const lastRow = budgetTable.getRow(3).copy()
  budgetTable.clear()

  // Add table rows to template
  budget.forEach((element, index) => {
    var row
    switch (element.type) {
      case "item":
        row = budgetTable.insertTableRow(index, titleRow.copy())
        row
          .getCell(0)
          .editAsText()
          .replaceText("code", element.code)
          .replaceText("item", element["Concepto ítem"])
        break
      case "subitem":
        row = budgetTable.insertTableRow(index, itemRow.copy())
        row
          .getCell(0)
          .editAsText()
          .replaceText("ProviderReference", element["Referencia Proveedor"])
        row
          .getCell(1)
          .editAsText()
          .replaceText("Description", element["Concepto subítem"])
        row.getCell(2).editAsText().replaceText("quantity", element.Cantidad)
        break
      case "empty":
        budgetTable.insertTableRow(index, lastRow.copy())
        break
    }
  })
}

/**
 * Creates additional contents (budget table) for a PEM (Presupuesto de Ejecución Material) document.
 * @param {Document} doc - The Google Docs document to add contents to.
 */
function createPemAdditionalContents(doc) {
  // Replace budget table
  const tables = doc.getBody().getTables()
  const budgetTable = tables[0] // Manually select budget table!

  // Get budgets and replace tables
  const budget = getBudget((getOptionalElements = false)).filter(
    (e) => e.type != "subitem"
  )
  // Take only chapter one and add empty line
  const chapter1Budget = budget.slice(
    0,
    budget.findIndex((e) => e.code == "2")
  )
  replaceBudgetTable(
    chapter1Budget,
    budgetTable,
    (subtotalColumName = "Total Capítulo sin BI/CG (PEM) (€)")
  )
}

/**
 * Creates additional contents (budget table) for a bill document.
 * @param {Document} doc - The Google Docs document to add contents to.
 */
function createBillAdditionalContents(doc) {
  // Replace budget table
  const tables = doc.getBody().getTables()
  const budgetTable = tables[tables.length - 2] // Manually select budget table!

  // Get budgets and replace tables
  const budget = getBudget((getOptionalElements = false)).filter(
    (e) => e.type != "subitem"
  )
  replaceBudgetTable(budget, budgetTable)
}

/**
 * Creates additional contents (budget table, energy fluxes tables, energy charts) for a final study document.
 * @param {Document} doc - The Google Docs document to add contents to.
 */
function createFinalStudyAdditionalContents(doc) {
  // Replace budget tables
  const body = doc.getBody()
  const tables = body.getTables()
  const budgetTable = tables[tables.length - 3] // Manually select budget table!
  const optionalElementsTable = tables[tables.length - 1] // Manually select optional elements table!

  // Get budgets and replace tables
  const budget = getBudget((getOptionalElements = false)).filter(
    (e) => e.type != "subitem"
  )
  replaceBudgetTable(budget, budgetTable)

  const optionalBudget = getBudget((getOptionalElements = true)).filter(
    (e) => e.type != "subitem"
  )
  replaceBudgetTable(optionalBudget, optionalElementsTable)

  // Remove null production values lines in summary table
  const conventionalTotal = get("conventionalTotal")
  const recurringTotal = get("recurringTotal")
  const ashpTotal = get("ashpTotal")
  const saveTotal = get("saveTotal")
  // Get master TableRows
  const summaryTable = tables[2] // Manually select summary table!
  const conventionalTotalRow = summaryTable.getRow(1)
  const recurringTotalRow = summaryTable.getRow(2)
  const ashpTotalRow = summaryTable.getRow(3)
  const saveTotalRow = summaryTable.getRow(4)
  if (conventionalTotal == 0) conventionalTotalRow.removeFromParent()
  if (recurringTotal == 0) recurringTotalRow.removeFromParent()
  if (ashpTotal == 0) ashpTotalRow.removeFromParent()
  if (saveTotal == 0) saveTotalRow.removeFromParent()

  // Replace chart images
  const chartReplacementValues = [
    {
      sheetName: "Documentación",
      replacementValue: "<graficaConsumos>",
      index: 0,
    },
    {
      sheetName: "Documentación",
      replacementValue: "<graficaAutoconsumo>",
      index: 1,
    },
    {
      sheetName: "Documentación",
      replacementValue: "<graficaFacturaMensual>",
      index: 2,
    },
    {
      sheetName: "Documentación",
      replacementValue: "<graficaFacturaAnualImpuestos>",
      index: 3,
    },
  ]
  Tools.replaceChartsInDoc(doc, chartReplacementValues)
}

/**
 * Creates additional contents (a filtered budget table that contains just material items) for an installation guide document.
 * @param {Document} doc - The Google Docs document to add contents to.
 */
function createInstallationGuideAdditionalContents(doc) {
  // Replace budget table
  const tables = doc.getBody().getTables()
  const budgetTable = tables[0] // Manually select budget table!

  // Get budgets and replace tables
  const budget = getBudget(
    (getOptionalElements = false),
    (getGuideTable = true)
  )

  const filteredBudget = budget.filter(
    (e) =>
      e.type == "item" ||
      (e.type == "subitem" && e["Subcat. Coste"] == "MAT") ||
      e.type == "empty"
  )
  replaceGuideTable(filteredBudget, budgetTable)
}

/**
 * Creates additional contents for study for shared installations
 * @param {Document} doc - The Google Docs document to add contents to.
 */
function createCELstudy(doc) {
  // Replace budget tables
  const body = doc.getBody()
  const tables = body.getTables()
  const budgetTable = tables[tables.length - 2] // Manually select budget table!

  // Get budgets and replace tables
  const budget = getBudget((getOptionalElements = false)).filter(
    (e) => e.type != "subitem"
  )
  replaceBudgetTable(budget, budgetTable)

  // Replace chart images
  const chartReplacementValues = [
    {
      sheetName: "Documentación",
      replacementValue: "<graficaConsumos>",
      index: 0,
    },
    {
      sheetName: "Documentación",
      replacementValue: "<graficaAutoconsumo>",
      index: 1,
    },
    {
      sheetName: "Documentación",
      replacementValue: "<graficaFacturaMensual>",
      index: 2,
    },
    {
      sheetName: "Documentación",
      replacementValue: "<graficaFacturaAnualImpuestos>",
      index: 3,
    },
  ]
  Tools.replaceChartsInDoc(doc, chartReplacementValues)
}

/**
 * Creates additional contents for the document on savings through CEL.
 * @param {Document} doc - The Google Docs document to add contents to.
 */
function createCELwithQuotaAdditionalContents(doc) {
  // Replace chart images
  const chartReplacementValues = [
    {
      sheetName: "Flujos",
      replacementValue: "<graficaEstacionalidadConsumo>",
      index: 7,
    },
    {
      sheetName: "Flujos",
      replacementValue: "<graficaConsumoProduccionHoras>",
      index: 3,
    },
    {
      sheetName: "Flujos",
      replacementValue: "<graficaExcedenteDemanda>",
      index: 4,
    },
    {
      sheetName: "Documentación",
      replacementValue: "<graficaFacturaMensual>",
      index: 2,
    },
  ]
  Tools.replaceChartsInDoc(doc, chartReplacementValues)
}
