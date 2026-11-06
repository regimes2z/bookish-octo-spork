const display = document.querySelector("#display");
const keypad = document.querySelector(".keypad");

let displayValue = "0";
let storedValue = null;
let pendingOperator = null;
let startNewNumber = false;

function render() {
  display.textContent = displayValue;
}

function enterDigit(digit) {
  if (startNewNumber || displayValue === "0" || displayValue === "Error") {
    displayValue = digit;
    startNewNumber = false;
  } else if (displayValue.replace(/[^0-9]/g, "").length < 15) {
    displayValue += digit;
  }
  render();
}

function enterDecimal() {
  if (startNewNumber || displayValue === "Error") {
    displayValue = "0.";
    startNewNumber = false;
  } else if (!displayValue.includes(".")) {
    displayValue += ".";
  }
  render();
}

function calculate(left, right, operator) {
  switch (operator) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return right === 0 ? NaN : left / right;
    default: return right;
  }
}

function formatResult(value) {
  if (!Number.isFinite(value)) return "Error";
  return String(Number(value.toPrecision(12)));
}

function chooseOperator(operator) {
  const currentValue = Number(displayValue);
  if (!Number.isFinite(currentValue)) {
    clearCalculator();
    return;
  }

  if (pendingOperator && !startNewNumber) {
    const result = calculate(storedValue, currentValue, pendingOperator);
    displayValue = formatResult(result);
    storedValue = result;
    if (displayValue === "Error") {
      pendingOperator = null;
      startNewNumber = true;
      render();
      return;
    }
  } else {
    storedValue = currentValue;
  }

  pendingOperator = operator;
  startNewNumber = true;
  render();
}

function equals() {
  if (!pendingOperator || startNewNumber) return;
  const result = calculate(storedValue, Number(displayValue), pendingOperator);
  displayValue = formatResult(result);
  storedValue = null;
  pendingOperator = null;
  startNewNumber = true;
  render();
}

function clearCalculator() {
  displayValue = "0";
  storedValue = null;
  pendingOperator = null;
  startNewNumber = false;
  render();
}

function deleteDigit() {
  if (startNewNumber || displayValue === "Error") {
    displayValue = "0";
    startNewNumber = false;
  } else {
    displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : "0";
    if (displayValue === "-" || displayValue === "") displayValue = "0";
  }
  render();
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number !== undefined) enterDigit(button.dataset.number);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else if (button.dataset.action === "decimal") enterDecimal();
  else if (button.dataset.action === "equals") equals();
  else if (button.dataset.action === "clear") clearCalculator();
  else if (button.dataset.action === "delete") deleteDigit();
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) enterDigit(event.key);
  else if (event.key === ".") enterDecimal();
  else if (["+", "-", "*", "/"].includes(event.key)) chooseOperator(event.key);
  else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    equals();
  } else if (event.key === "Backspace") deleteDigit();
  else if (event.key === "Escape") clearCalculator();
});
