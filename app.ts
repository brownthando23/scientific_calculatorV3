// ===========================
// Helper Functions
// ===========================

// Factorial (safe)
function factorial(n: number): number {
    if (!Number.isInteger(n) || n < 0) {
        throw new Error("Factorial only allowed for non-negative integers");
    }
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

// Token-safe math evaluation (no eval)
function safeEval(expr: string): number {
    // Replace symbols to JS-safe equivalents
    expr = expr.replace(/×/g, "*");
    expr = expr.replace(/÷/g, "/");
    expr = expr.replace(/π/g, `${Math.PI}`);

    // Replace power operator: x ** y
    expr = expr.replace(/÷/g, "/");

    // Implement ^ safely
    expr = expr.replace(/(\d+(\.\d+)?|\(.+?\))\s*\^\s*(\d+(\.\d+)?|\(.+?\))/g, (_, a, __, b) => {
        return `Math.pow(${a}, ${b})`;
    });

    // Disallow letters (XSS mitigation)
    if (/[^0-9+\-*\/().^% ]/.test(expr)) {
    throw new Error("Invalid characters in expression");
}


    // Safe evaluation using Function — allowed because input is sanitized
    return Function(`"use strict"; return (${expr});`)();
}


// ===========================
// Select DOM Elements
// ===========================

const display = document.getElementById("display") as HTMLElement;

let expression: string = "";

function updateDisplay(value: string) {
    display.textContent = value;
}


// ===========================
// Input Handlers
// ===========================

function appendValue(val: string) {
    if (expression === "0") expression = "";
    expression += val;
    updateDisplay(expression);
}

function applyUnaryOperation(op: string) {
    try {
        // Evaluate current expression safely
        const currentValue = safeEval(expression);

        let result: number;

        switch (op) {
            case "ln":
                result = Math.log(currentValue);
                break;

            case "log":
                result = Math.log10(currentValue);
                break;

            case "sqrt":
                result = Math.sqrt(currentValue);
                break;

            case "exp":
                result = Math.exp(currentValue);
                break;

            case "!":
                result = factorial(currentValue);
                break;

            case "10^":
                result = Math.pow(10, currentValue);
                break;

            default:
                throw new Error("Unknown unary operator");
        }

        expression = result.toString();
        updateDisplay(expression);

    } catch (error: any) {
        updateDisplay("Error");
        expression = "";
    }
}


// ===========================
// Button Event Listeners
// ===========================

// Numbers and operators
document.querySelectorAll("button[data-val]").forEach(btn => {
    btn.addEventListener("click", () => {
        const val = (btn as HTMLButtonElement).dataset.val!;
        appendValue(val);
    });
});

// Constants like π and e
document.querySelectorAll("button[data-direct-value]").forEach(btn => {
    btn.addEventListener("click", () => {
        const constant = (btn as HTMLButtonElement).dataset.directValue!;
        if (constant === "pi") appendValue(`${Math.PI}`);
        if (constant === "e") appendValue(`${Math.E}`);
    });
});

// Unary operations
document.querySelectorAll("button[data-unary-operation]").forEach(btn => {
    btn.addEventListener("click", () => {
        const op = (btn as HTMLButtonElement).dataset.unaryOperation!;
        applyUnaryOperation(op);
    });
});

// Backspace
document.getElementById("backspace-btn")?.addEventListener("click", () => {
    expression = expression.slice(0, -1) || "0";
    updateDisplay(expression);
});

// Clear
document.getElementById("clear-btn")?.addEventListener("click", () => {
    expression = "0";
    updateDisplay(expression);
});

// Evaluate (=)
document.querySelector("button[data-val='=']")?.addEventListener("click", () => {
    try {
        console.log("EXPR =", expression);
        const result = safeEval(expression);
        expression = result.toString();
        updateDisplay(expression);
    } catch (error) {
        updateDisplay("Error");
        expression = "";
    }
});
