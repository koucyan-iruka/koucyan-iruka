"use strict";

const exprEl = document.getElementById("expression");

let expression = "";
let justEvaluated = false;

// ---------- Safe expression evaluation (no eval) ----------

function tokenize(src) {
    const tokens = [];
    let i = 0;
    while (i < src.length) {
        const ch = src[i];
        if (ch === " ") { i++; continue; }
        if (/[0-9.]/.test(ch)) {
            let num = "";
            while (i < src.length && /[0-9.]/.test(src[i])) num += src[i++];
            if (!/^(\d+\.?\d*|\.\d+)$/.test(num)) throw new Error("Invalid number");
            tokens.push({ type: "num", value: parseFloat(num) });
            continue;
        }
        if ("+-×÷^()".includes(ch)) { tokens.push({ type: ch }); i++; continue; }
        throw new Error("Invalid character");
    }
    return tokens;
}

function evaluateExpression(src) {
    const tokens = tokenize(src);
    let pos = 0;
    const peek = () => tokens[pos];
    const next = () => tokens[pos++];

    function parseExpr() {
        let left = parseTerm();
        while (peek() && (peek().type === "+" || peek().type === "-")) {
            const op = next().type;
            const right = parseTerm();
            left = op === "+" ? left + right : left - right;
        }
        return left;
    }

    function parseTerm() {
        let left = parsePower();
        while (peek() && (peek().type === "×" || peek().type === "÷")) {
            const op = next().type;
            const right = parsePower();
            left = op === "×" ? left * right : left / right;
        }
        return left;
    }

    // Right-associative exponentiation
    function parsePower() {
        const base = parseUnary();
        if (peek() && peek().type === "^") {
            next();
            return base ** parsePower();
        }
        return base;
    }

    function parseUnary() {
        if (peek() && (peek().type === "-" || peek().type === "+")) {
            const op = next().type;
            const value = parseUnary();
            return op === "-" ? -value : value;
        }
        return parseAtom();
    }

    function parseAtom() {
        const token = next();
        if (!token) throw new Error("Unexpected end of expression");
        if (token.type === "num") return token.value;
        if (token.type === "(") {
            const value = parseExpr();
            const close = next();
            if (!close || close.type !== ")") throw new Error("Missing closing parenthesis");
            return value;
        }
        throw new Error("Unexpected token");
    }

    const result = parseExpr();
    if (pos < tokens.length) throw new Error("Unexpected trailing input");
    if (!Number.isFinite(result)) throw new Error("Result is not finite");
    return result;
}

// Trim float noise like 0.30000000000000004 while keeping precision
function formatResult(n) {
    return String(parseFloat(n.toPrecision(12)));
}

// ---------- Natural math notation for display ----------

function groupDigits(numStr) {
    const [int, dec] = numStr.split(".");
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return dec !== undefined ? grouped + "." + dec : grouped;
}

// Render an internal expression ("2^10×-3+1000") as natural notation
// ("2¹⁰ × −3 + 1,000") using thin spacing, real minus signs, superscript
// exponents and digit grouping. Input only ever contains calculator
// characters, so building HTML here is safe.
function formatExpression(expr) {
    let html = "";
    let i = 0;
    let prev = null; // "num" | "op" | "open" | null
    while (i < expr.length) {
        const ch = expr[i];
        if (/[0-9.]/.test(ch)) {
            let num = "";
            while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
            html += groupDigits(num);
            prev = "num";
            continue;
        }
        if (ch === "^") {
            i++;
            let exp = "";
            if (expr[i] === "-" || expr[i] === "+") exp += expr[i++];
            while (i < expr.length && /[0-9.]/.test(expr[i])) exp += expr[i++];
            // Nothing typed after "^" yet: keep the caret visible
            html += exp === "" ? "^" : "<sup>" + exp.replace("-", "−") + "</sup>";
            prev = "num";
            continue;
        }
        if (ch === "+" || ch === "-") {
            const isUnary = prev === null || prev === "op" || prev === "open";
            const sym = ch === "-" ? "−" : "+";
            html += isUnary ? sym : ` ${sym} `;
            prev = "op";
            i++;
            continue;
        }
        if (ch === "×" || ch === "÷") { html += ` ${ch} `; prev = "op"; i++; continue; }
        if (ch === "(") { html += "("; prev = "open"; i++; continue; }
        if (ch === ")") { html += ")"; prev = "num"; i++; continue; }
        html += ch;
        i++;
    }
    return html;
}

// ---------- UI ----------

const display = document.getElementById("display");

function render() {
    display.innerHTML = expression === "" ? "0" : formatExpression(expression);
    display.classList.remove("error");
    // Shrink the font as the expression grows
    display.style.fontSize = expression.length > 12
        ? `clamp(20px, ${Math.max(16, 40 - (expression.length - 12) * 1.4)}px, 40px)`
        : "";
}

function showError() {
    exprEl.innerHTML = "&nbsp;";
    display.textContent = "Error";
    display.classList.add("error");
    expression = "";
    justEvaluated = true;
}

function insert(value) {
    if (justEvaluated) {
        // Continue calculating with the result for operators, start fresh for digits
        if (!"+-×÷^".includes(value)) expression = "";
        justEvaluated = false;
    }
    expression += value;
    exprEl.innerHTML = "&nbsp;";
    render();
}

function clearAll() {
    expression = "";
    justEvaluated = false;
    exprEl.innerHTML = "&nbsp;";
    render();
}

function backspace() {
    if (justEvaluated) { clearAll(); return; }
    expression = expression.slice(0, -1);
    render();
}

function equals() {
    if (expression === "") return;
    try {
        const result = evaluateExpression(expression);
        exprEl.innerHTML = formatExpression(expression) + " =";
        expression = formatResult(result);
        justEvaluated = true;
        render();
    } catch (err) {
        showError();
    }
}

function applyUnary(fn, symbol) {
    if (expression === "") return;
    try {
        const value = evaluateExpression(expression);
        const result = fn(value);
        if (!Number.isFinite(result)) throw new Error("Result is not finite");
        exprEl.innerHTML = symbol + "(" + formatExpression(expression) + ") =";
        expression = formatResult(result);
        justEvaluated = true;
        render();
    } catch (err) {
        showError();
    }
}

const actions = {
    clear: clearAll,
    backspace: backspace,
    equals: equals,
    sqrt: () => applyUnary(Math.sqrt, "√"),
    percent: () => applyUnary(v => v / 100, "%"),
};

document.querySelector(".keys").addEventListener("click", (event) => {
    const key = event.target.closest("button.key");
    if (!key) return;
    if (key.dataset.action) actions[key.dataset.action]();
    else if (key.dataset.insert) insert(key.dataset.insert);
});

// Keyboard support
document.addEventListener("keydown", (event) => {
    const key = event.key;
    if (/^[0-9.]$/.test(key)) { insert(key); }
    else if (key === "+" || key === "-") { insert(key); }
    else if (key === "*") { insert("×"); }
    else if (key === "/") { event.preventDefault(); insert("÷"); }
    else if (key === "^") { insert("^"); }
    else if (key === "(" || key === ")") { insert(key); }
    else if (key === "%") { actions.percent(); }
    else if (key === "Enter" || key === "=") { event.preventDefault(); equals(); }
    else if (key === "Backspace") { backspace(); }
    else if (key === "Escape" || key === "Delete") { clearAll(); }
});

render();
