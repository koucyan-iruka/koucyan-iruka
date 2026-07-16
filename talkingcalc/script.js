"use strict";

// ---------- Speech ----------

const speechSupported = "speechSynthesis" in window;

if (!speechSupported) {
    document.getElementById("speech-support-msg").hidden = false;
}

const voiceSelect = document.getElementById("voice-names");
const rateInput = document.getElementById("rate");
const rateValue = document.getElementById("rate-value");
const muteInput = document.getElementById("mute");

function getVoices() {
    return speechSupported ? speechSynthesis.getVoices() : [];
}

function loadVoices() {
    const voices = getVoices();
    if (voices.length === 0) return;

    const previous = voiceSelect.value;
    voiceSelect.innerHTML = "";

    voices.forEach(voice => {
        const option = document.createElement("option");
        option.value = voice.name;
        option.dataset.lang = voice.lang;
        option.text = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });

    // Keep the user's choice across voice-list refreshes; otherwise prefer
    // a voice matching the browser language.
    if (previous && voices.some(voice => voice.name === previous)) {
        voiceSelect.value = previous;
    } else {
        const browserLang = (navigator.language || "en").substring(0, 2);
        const match = voices.find(voice => voice.lang.substring(0, 2) === browserLang);
        if (match) voiceSelect.value = match.name;
    }
}

function getSelectedVoice() {
    return getVoices().find(voice => voice.name === voiceSelect.value) || null;
}

function currentLang() {
    const voice = getSelectedVoice();
    return voice ? voice.lang.substring(0, 2) : (navigator.language || "en").substring(0, 2);
}

function speak(text) {
    if (!speechSupported || muteInput.checked) return;
    speechSynthesis.cancel();
    const uttr = new SpeechSynthesisUtterance(String(text));
    const voice = getSelectedVoice();
    if (voice) {
        uttr.voice = voice;
        uttr.lang = voice.lang;
    }
    uttr.rate = parseFloat(rateInput.value);
    speechSynthesis.speak(uttr);
}

// Speak the localized name of an operation, falling back to English,
// then to the raw symbol.
function speakOperation(symbol) {
    const names = operationName[symbol];
    if (names) {
        speak(names[currentLang()] || names.en);
    } else {
        speak(symbol);
    }
}

if (speechSupported) {
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
}

rateInput.addEventListener("input", () => {
    rateValue.textContent = parseFloat(rateInput.value).toFixed(1) + "×";
});

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
const exprEl = document.getElementById("expression");

let expression = "";
let justEvaluated = false;

function render() {
    display.innerHTML = expression === "" ? "0" : formatExpression(expression);
    display.classList.remove("error");
    display.style.fontSize = expression.length > 12
        ? `clamp(20px, ${Math.max(16, 40 - (expression.length - 12) * 1.4)}px, 40px)`
        : "";
}

function showError() {
    exprEl.innerHTML = "&nbsp;";
    display.textContent = operationName["Error"][currentLang()] || operationName["Error"].en;
    display.classList.add("error");
    expression = "";
    justEvaluated = true;
    speakOperation("Error");
}

function insert(value) {
    if (justEvaluated) {
        if (!"+-×÷^".includes(value)) expression = "";
        justEvaluated = false;
    }
    if (operationName[value]) {
        speakOperation(value);
    } else {
        speak(value);
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
    speakOperation("C");
}

function backspace() {
    if (speechSupported) speechSynthesis.cancel();
    if (justEvaluated) {
        expression = "";
        justEvaluated = false;
        exprEl.innerHTML = "&nbsp;";
    } else {
        expression = expression.slice(0, -1);
    }
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
        const equalsName = operationName["="][currentLang()] || operationName["="].en;
        speak(`${equalsName} ${expression}`);
    } catch (err) {
        showError();
    }
}

function applyUnary(fn, symbol) {
    if (expression === "") {
        showError();
        return;
    }
    try {
        const value = evaluateExpression(expression);
        const result = fn(value);
        if (!Number.isFinite(result)) throw new Error("Result is not finite");
        exprEl.innerHTML = symbol + "(" + formatExpression(expression) + ") =";
        expression = formatResult(result);
        justEvaluated = true;
        render();
        const opName = operationName[symbol][currentLang()] || operationName[symbol].en;
        speak(`${opName}, ${expression}`);
    } catch (err) {
        showError();
    }
}

const actions = {
    clear: clearAll,
    backspace: backspace,
    equals: equals,
    sqrt: () => applyUnary(Math.sqrt, "√"),
    cbrt: () => applyUnary(Math.cbrt, "³√"),
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

// ---------- Translations ----------

const operationName = {
    "+": {
        "en": "plus",
        "de": "plus",
        "es": "más",
        "fr": "plus",
        "hi": "जोड़",
        "id": "tambah",
        "it": "più",
        "ja": "たす",
        "ko": "더하기",
        "nl": "plus",
        "pl": "plus",
        "pt": "mais",
        "ru": "плюс",
        "zh": "加",
        "ar": "زائد",
        "el": "συν",
        "he": "פלוס",
        "th": "บวก"
    },
    "-": {
        "en": "minus",
        "de": "minus",
        "es": "menos",
        "fr": "moins",
        "hi": "घटाना",
        "id": "kurang",
        "it": "meno",
        "ja": "ひく",
        "ko": "빼기",
        "nl": "min",
        "pl": "minus",
        "pt": "menos",
        "ru": "минус",
        "zh": "减",
        "ar": "ناقص",
        "el": "πλην",
        "he": "מינוס",
        "th": "ลบ"
    },
    "×": {
        "en": "times",
        "de": "mal",
        "es": "por",
        "fr": "fois",
        "hi": "गुणा",
        "id": "kali",
        "it": "moltiplicato",
        "ja": "掛ける",
        "ko": "곱하기",
        "nl": "keer",
        "pl": "razy",
        "pt": "vezes",
        "ru": "умножить",
        "zh": "乘以",
        "ar": "ضرب",
        "el": "επί",
        "he": "כפול",
        "th": "คูณ"
    },
    "÷": {
        "en": "divided by",
        "de": "geteilt durch",
        "es": "dividido por",
        "fr": "divisé par",
        "hi": "विभाजित",
        "id": "dibagi",
        "it": "diviso per",
        "ja": "割る",
        "ko": "나누기",
        "nl": "gedeeld door",
        "pl": "podzielone przez",
        "pt": "dividido por",
        "ru": "делить на",
        "zh": "除以",
        "ar": "مقسوم على",
        "el": "δια",
        "he": "חלקי",
        "th": "หาร"
    },
    "^": {
        "en": "to the power of",
        "de": "hoch",
        "es": "a la potencia de",
        "fr": "à la puissance de",
        "hi": "घात",
        "id": "pangkat",
        "it": "alla potenza di",
        "ja": "累乗",
        "ko": "제곱",
        "nl": "tot de macht van",
        "pl": "do potęgi",
        "pt": "elevado a",
        "ru": "в степени",
        "zh": "次方",
        "ar": "إلى القوة",
        "el": "στην δύναμη του",
        "he": "בחזקת",
        "th": "ยกกำลัง"
    },
    "=": {
        "en": "equals",
        "de": "gleich",
        "es": "es igual a",
        "fr": "égal",
        "hi": "बराबर",
        "id": "sama dengan",
        "it": "uguale",
        "ja": "イコール",
        "ko": "같다",
        "nl": "gelijk aan",
        "pl": "równa się",
        "pt": "igual a",
        "ru": "равно",
        "zh": "等于",
        "ar": "يساوي",
        "el": "ίσον",
        "he": "שווה",
        "th": "เท่ากับ"
    },
    "√": {
        "en": "square root",
        "de": "Quadratwurzel",
        "es": "raíz cuadrada",
        "fr": "racine carrée",
        "hi": "वर्गमूल",
        "id": "akar kuadrat",
        "it": "radice quadrata",
        "ja": "平方根",
        "ko": "제곱근",
        "nl": "vierkantswortel",
        "pl": "pierwiastek kwadratowy",
        "pt": "raiz quadrada",
        "ru": "квадратный корень",
        "zh": "平方根",
        "ar": "الجذر التربيعي",
        "el": "τετραγωνική ρίζα",
        "he": "שורש ריבועי",
        "th": "รากที่สอง"
    },
    "³√": {
        "en": "cube root",
        "de": "Kubikwurzel",
        "es": "raíz cúbica",
        "fr": "racine cubique",
        "hi": "घनमूल",
        "id": "akar kubik",
        "it": "radice cubica",
        "ja": "立方根",
        "ko": "세제곱근",
        "nl": "derdemachtswortel",
        "pl": "pierwiastek sześcienny",
        "pt": "raiz cúbica",
        "ru": "кубический корень",
        "zh": "立方根",
        "ar": "الجذر التكعيبي",
        "el": "κυβική ρίζα",
        "he": "שורש שלישי",
        "th": "รากที่สาม"
    },
    "(": {
        "en": "open parenthesis",
        "de": "Klammer auf",
        "es": "abrir paréntesis",
        "fr": "parenthèse ouvrante",
        "hi": "कोष्ठक खोलें",
        "id": "kurung buka",
        "it": "parentesi aperta",
        "ja": "かっこ",
        "ko": "괄호 열기",
        "nl": "haakje openen",
        "pl": "nawias otwierający",
        "pt": "abre parênteses",
        "ru": "открыть скобку",
        "zh": "左括号",
        "ar": "قوس مفتوح",
        "el": "άνοιγμα παρένθεσης",
        "he": "סוגריים פתוחים",
        "th": "วงเล็บเปิด"
    },
    ")": {
        "en": "close parenthesis",
        "de": "Klammer zu",
        "es": "cerrar paréntesis",
        "fr": "parenthèse fermante",
        "hi": "कोष्ठक बंद करें",
        "id": "kurung tutup",
        "it": "parentesi chiusa",
        "ja": "かっことじ",
        "ko": "괄호 닫기",
        "nl": "haakje sluiten",
        "pl": "nawias zamykający",
        "pt": "fecha parênteses",
        "ru": "закрыть скобку",
        "zh": "右括号",
        "ar": "قوس مغلق",
        "el": "κλείσιμο παρένθεσης",
        "he": "סוגריים סגורים",
        "th": "วงเล็บปิด"
    },
    "%": {
        "en": "percent",
        "de": "Prozent",
        "es": "por ciento",
        "fr": "pour cent",
        "hi": "प्रतिशत",
        "id": "persen",
        "it": "per cento",
        "ja": "パーセント",
        "ko": "퍼센트",
        "nl": "procent",
        "pl": "procent",
        "pt": "por cento",
        "ru": "процент",
        "zh": "百分之",
        "ar": "بالمئة",
        "el": "τοις εκατό",
        "he": "אחוז",
        "th": "เปอร์เซ็นต์"
    },
    "C": {
        "en": "clear",
        "de": "löschen",
        "es": "borrar",
        "fr": "effacer",
        "hi": "साफ",
        "id": "hapus",
        "it": "cancella",
        "ja": "クリア",
        "ko": "지우기",
        "nl": "wissen",
        "pl": "wyczyść",
        "pt": "limpar",
        "ru": "очистить",
        "zh": "归零",
        "ar": "مسح",
        "el": "διαγραφή",
        "he": "נקה",
        "th": "ล้าง"
    },
    "Error": {
        "en": "Error",
        "de": "Fehler",
        "es": "Error",
        "fr": "Erreur",
        "hi": "त्रुटि",
        "id": "Kesalahan",
        "it": "Errore",
        "ja": "エラー",
        "ko": "오류",
        "nl": "Fout",
        "pl": "Błąd",
        "pt": "Erro",
        "ru": "Ошибка",
        "zh": "错误",
        "ar": "خطأ",
        "el": "σφάλμα",
        "he": "שגיאה",
        "th": "ข้อผิดพลาด"
    }
};
