/**
 * Processes the solar energy flux, applying "Flux Solar" compensation to the bill.
 * It calculates monthly savings over 25 years by simulating the consumption of
 * "soles" (credits) generated from energy production.
 */
function processFluxSolar() {
  
  // Retrieve initial values from sheet
  const totalBillBefore = get("totalBillBefore")  // Total bill before compensation
  const fluxCoefficient = get("fluxCoefficient")  // Coefficient for "Flux Solar" conversion
  const monthlyEnergyTermsAfterPVwithLimitlessCompensation = get("monthlyEnergyTermsAfterPVwithLimitlessCompensation")  // Energy terms after limitless compensation
  
  const monthlyEnergyTermsAfterPVwithCompensation = get("monthlyEnergyTermsAfterPVwithCompensation")
  const monthlyPowerCost = get("monthlyPowerCost")
  const monthlyRegulatedCosts =get("monthlyRegulatedCosts")
  const monthlyBillBeforeFlux = monthlyEnergyTermsAfterPVwithCompensation.map((e, index)=> e + monthlyPowerCost[index] + monthlyRegulatedCosts[index])

  // Calculate the monthly soles input by subtracting limitless compensation and applying the flux coefficient
  const monthlySolesInput = monthlyEnergyTermsAfterPVwithCompensation.map(
    (monthlyCost, index) => (monthlyCost - monthlyEnergyTermsAfterPVwithLimitlessCompensation[index]) * fluxCoefficient
  )

  var solesQueue = []  // Queue to track soles credits

  for (let year = 0; year < 25; year++) {
    // Simulate over a 25-year period

    var currentBill = [...monthlyBillBeforeFlux]  // Reset the bill for each year
    for (let month = 0; month < 12; month++) {
      // Process each month of the year

      const currentMonth = month + 12 * year  // Calculate current month index across years
      Logger.log(
        `******** Paso ${currentMonth.toString()}: mes ${month}, año ${year} ********`
      )
      Logger.log("   Cola de soles: " + JSON.stringify(solesQueue))
      Logger.log("   Factura mensual antes de Flux: " + currentBill[month])

      // Process soles in the queue and apply discounts to the current bill
      while (solesQueue.length > 0) {
        // Check if there are soles in the queue
        const oldestSoles = solesQueue.shift()  // Take the oldest soles from the queue
        if (currentMonth - oldestSoles.monthOfGeneration < 60) {
          // If soles are still valid (within 5 years after generation)

          if (currentBill[month] >= oldestSoles.value) {
            // If the current bill can fully consume the soles
            currentBill[month] -= oldestSoles.value
            Logger.log("   Consumidos soles totales: " + oldestSoles.value.toString())
          } else {
            // If soles exceed the current bill, consume part of the soles
            oldestSoles.value -= currentBill[month]
            Logger.log("   Consumidos soles parciales: " + currentBill[month])
            solesQueue.unshift(oldestSoles)  // Return the remaining soles to the queue
            currentBill[month] -= currentBill[month]  // Set current bill to 0
            break
          }
          Logger.log(` Factura mensual: ${currentBill[month]}`)

          if (currentBill[month] == 0) break  // If the bill is fully covered, stop processing
        } else {
          // If soles are expired, discard them
          Logger.log("   Soles caducados, se eliminan: " + oldestSoles.value)
        }
      }

      // Generate new soles for the current month and add them to the queue
      if (monthlySolesInput[month] > 0) generateSolesForMonth(solesQueue, monthlySolesInput[month], currentMonth)
    }
  }

  // Store the results in the sheet
  set("monthlyBillFlux", currentBill)
}

/**
 * Checks if the soles (credits) are still valid.
 * @param {Object} soles - The soles object containing value and generation month.
 * @param {number} currentMonth - The current month index across the years.
 * @returns {boolean} - True if the soles are valid, false if they have expired.
 */
function isSolesValid(soles, currentMonth) {
  return (currentMonth - soles.monthOfGeneration) < 60
}

/**
 * Generates soles for the current month and adds them to the soles queue.
 * @param {Array} solesQueue - The queue that holds the soles (credits).
 * @param {number} solesValue - The value of the soles generated for the month.
 * @param {number} currentMonth - The current month index across the years.
 */
function generateSolesForMonth(solesQueue, solesValue, currentMonth) {
  const soles = {
    value: solesValue,
    monthOfGeneration: currentMonth
  }
  solesQueue.push(soles)
  Logger.log("   Generados soles: " + soles.value.toString())
}
