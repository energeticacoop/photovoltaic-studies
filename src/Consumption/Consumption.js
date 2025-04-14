/**
 * Processes a specific type of load curve for selected self-consumers.
 * Creates an instance of SelfConsumer for each selected consumer and invokes the specified method.
 *
 * @param {string} methodName - The name of the method to call on the SelfConsumer instance ('processConventionalLoadCurve', 'processRecurringLoadCurve', 'processASHPLoadCurve', 'processSAVELoadCurve').
 */
function processLoadCurve(methodName) {
  const selectedSelfConsumers = get("selectedSelfConsumers")[0]
  selectedSelfConsumers.forEach((isSelected, index) => {
    if (isSelected) {

      const selfConsumerIndex = index + 1
      const selfConsumer = new SelfConsumer(selfConsumerIndex)

      // Call the method dynamically
      Logger.log("Processing load curve for self-consumer #" + selfConsumerIndex + " with method " + methodName)
      selfConsumer[methodName]()

    }
  })
}

/**
 * Processes the conventional consumption data for selected self-consumers.
 * Uses the generic processLoadCurve function to process conventional load curves.
 */
function processConventionalConsumption() {
  processLoadCurve('processConventionalLoadCurve')
}

/**
 * Processes the recurring consumption data for selected self-consumers.
 * Uses the generic processLoadCurve function to process recurring load curves.
 */
function processRecurringConsumption() {
  processLoadCurve('processRecurringLoadCurve')
}

/**
 * Processes the ASHP (Air Source Heat Pump) consumption data for selected self-consumers.
 * Uses the generic processLoadCurve function to process ASHP load curves.
 */
function processASHPConsumptions() {
  processLoadCurve('processASHPLoadCurve')
}

/**
 * Processes the SAVE (electric vehicle charger) consumption data for selected self-consumers.
 * Uses the generic processLoadCurve function to process SAVE load curves.
 */
function processSAVEConsumption() {
  processLoadCurve('processSAVELoadCurve')
}

/**
 * Processes all types of consumption data for selected self-consumers.
 * Invokes functions to process conventional, recurring, ASHP, and SAVE load curves for each selected self-consumer.
 */
function processAllConsumptions() {
  processConventionalConsumption()
  processRecurringConsumption()
  processASHPConsumptions()
  processSAVEConsumption()
}
