console.log("JS is loaded!");

// ===========================
// Helper Functions
// ===========================
var _a, _b, _c;
// Factorial (safe)
function factorial(n) {
    if (!Number.isInteger(n) || n < 0) {
        throw new Error("Factorial only allowed for non-negative integers");
    }
    var res = 1;
    for (var i = 2; i <= n; i++)
        res *= i;
    return res;
}
// Token-safe math evaluation (no eval)
function safeEval(expr) {
    // Replace symbols to JS-safe equivalents
    expr = expr.replace(/×/g, "*");
    expr = expr.replace(/÷/g, "/");
    expr = expr.replace(/π/g, "".concat(Math.PI));
    // Replace power operator: x ** y
    expr = expr.replace(/\*\*/g, "^");
    // Implement ^ safely
    expr = expr.replace(/(\d+(\.\d+)?|\(.+?\))\s*\^\s*(\d+(\.\d+)?|\(.+?\))/g, function (_, a, __, b) {
        return "Math.pow(".concat(a, ", ").concat(b, ")");
    });
    // Disallow letters (XSS mitigation)
    if (/[^0-9+\-*/().^% ]/.test(expr)) {
        throw new Error("Invalid characters in expression");
    }
    // Safe evaluation using Function — allowed because input is sanitized
    return Function("\"use strict\"; return (".concat(expr, ");"))();
}
// ===========================
// Select DOM Elements
// ===========================
var display = document.getElementById("display");
var expression = "";
function updateDisplay(value) {
    display.textContent = value;
}
// ===========================
// Input Handlers
// ===========================
function appendValue(val) {
    if (expression === "0")
        expression = "";
    expression += val;
    updateDisplay(expression);
}
function applyUnaryOperation(op) {
    try {
        // Evaluate current expression safely
        var currentValue = safeEval(expression);
        var result = void 0;
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
    }
    catch (error) {
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
        const val = btn.dataset.val;
        if (val && val !== "=") {
            appendValue(val);
        }
    });
});


// Constants like π and e
document.querySelectorAll("button[data-direct-value]").forEach(function (btn) {
    btn.addEventListener("click", function () {
        var constant = btn.dataset.directValue;
        if (constant === "pi")
            appendValue("".concat(Math.PI));
        if (constant === "e")
            appendValue("".concat(Math.E));
    });
});
// Unary operations
document.querySelectorAll("button[data-unary-operation]").forEach(function (btn) {
    btn.addEventListener("click", function () {
        var op = btn.dataset.unaryOperation;
        applyUnaryOperation(op);
    });
});
// Backspace
(_a = document.getElementById("backspace-btn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
    expression = expression.slice(0, -1) || "0";
    updateDisplay(expression);
});
// Clear
(_b = document.getElementById("clear-btn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
    expression = "0";
    updateDisplay(expression);
});
// Evaluate (=)
document.querySelector("button[data-val='=']")?.addEventListener("click", () => {
    try {
        console.log("EXPR =", expression);   // ADD THIS LINE
        const result = safeEval(expression);
        expression = result.toString();
        updateDisplay(expression);
    } catch (error) {
        console.error(error);
        updateDisplay("Error");
        expression = "";
    }
});


