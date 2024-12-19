function gradientDescentOptimize() {
  const sheetName = "Cálculo de betas";
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  const decisionRange = sheet.getRange("D2:D4"); // Variables to tweak
  const targetCell = sheet.getRange("S2"); // Cell to minimize
  const learningRate = 0.1; // Step size
  const maxIterations = 1000; // Maximum number of iterations
  const tolerance = 1e-2; // Convergence tolerance for stopping

  // Initialize variables
  let variables = decisionRange.getValues().map(row => row[0]);
  variables = [0.7,0.2,0.1]
  let prevValue = targetCell.getValue(); // Current value of S2
  let iteration = 0;

  while (iteration < maxIterations) {
    Logger.log("Iteración " + iteration)
    iteration++;

    // Calculate gradients
    let gradients = calculateGradients(sheet, variables, decisionRange, targetCell);

    // Update variables using gradient descent rule
    variables = variables.map((v, i) => v - learningRate * gradients[i]);

    // Apply constraints: non-negative values and sum to 1
    variables = applyConstraints(variables);

    // Update the sheet with new variables
    decisionRange.setValues(variables.map(v => [v]));
    SpreadsheetApp.flush()

    // Get new target value
    const currentValue = targetCell.getValue();

    // Check for convergence
    if (Math.abs(prevValue - currentValue) < tolerance) {
      Logger.log(`Converged in ${iteration} iterations. Optimal S2: ${currentValue}`);
      break;
    }

    prevValue = currentValue;
  }

  Logger.log(`Optimization completed in ${iteration} iterations. Optimal S2: ${prevValue}`);
}

// Helper function: Calculate gradients using finite differences
function calculateGradients(sheet, variables, decisionRange, targetCell) {
  const epsilon = 1e-2; // Small value for numerical gradient approximation
  const gradients = [];

  // Loop through each variable
  for (let i = 0; i < variables.length; i++) {
    let originalValue = variables[i];

    // Perturb the variable by a small amount
    variables[i] = originalValue + epsilon;
    decisionRange.setValues(variables.map(v => [v]));
    const valuePlus = targetCell.getValue();

    variables[i] = originalValue - epsilon;
    decisionRange.setValues(variables.map(v => [v]));
    const valueMinus = targetCell.getValue();

    // Compute the gradient as the central difference
    const gradient = (valuePlus - valueMinus) / (2 * epsilon);
    gradients.push(gradient);

    // Restore the original value
    variables[i] = originalValue;
  }

  // Restore the original variables in the sheet
  decisionRange.setValues(variables.map(v => [v]));

  return gradients;
}

// Helper function: Apply constraints to ensure non-negative values and sum to 1
function applyConstraints(variables) {
  // Ensure non-negative values
  variables = variables.map(v => Math.max(v, 0));

  // Normalize to make the sum equal to 1
  const total = variables.reduce((sum, v) => sum + v, 0);
  return variables.map(v => v / total);
}
