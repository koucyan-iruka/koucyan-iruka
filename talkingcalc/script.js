// Check if the browser supports speech synthesis
if (!"speechSynthesis" in window) {
    $("#msg").html(
        "Sorry. Your browser <strong>does not support</strong> speech synthesis."
    );
}

let currentLang = "";
let error = 0;
let answer = ""; 

//Loading voices then make a list
function loadVoices() {
    const voiceSelect = document.getElementById("voice-names");
    voiceSelect.innerHTML = '';  

    const voices = speechSynthesis.getVoices();
    voices.forEach(voice => {
        const option = document.createElement("option");
        option.value = voice.name;
        option.id = SpeechSynthesisVoice.lang;
        option.text = `${voice.name} (${voice.lang})`; 
        voiceSelect.appendChild(option);
    });
}

function getSelectedVoiceLang() {
    const selectedVoiceName = document.getElementById("voice-names").value; 
    const voices = speechSynthesis.getVoices(); 

    const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);

    if (selectedVoice) {
        return selectedVoice.lang; 
    } else {
        return null;
    }
}

function changeLanguage() {
    currentLang = getSelectedVoiceLang().substring(0,2);
}

function speakOperation(value) {
    if (operationName[value] && operationName[value][currentLang]) {
        const opname = operationName[value][currentLang];
        speak(opname); 
    } else {
        speak(value);
    }
}

function speak(text) {
    changeLanguage();
    speechSynthesis.cancel()
    const uttr = new SpeechSynthesisUtterance(text);

    const selectedVoice = document.getElementById("voice-names").value;
    uttr.voice = speechSynthesis.getVoices().filter(voice => voice.name == selectedVoice)[0];
    uttr.rate = document.getElementById("rate").value; 
    speechSynthesis.speak(uttr);
}
    
function addToDisplay(value) {
    changeLanguage();
    if (error == 1){
        document.calculator.display.value = '';
        error = 0;
    }

    if (operationName[value]) {
        speakOperation(value);
    } else {
        speak(value);
    }

    if (value == "×"){
        value = "*";
    }else if (value == "÷"){
        value = "/";
    }else if (value == "^"){
        value = "**";
    }
    document.calculator.display.value += value;
    console.log(value);
}

function clearDisplay() {
    changeLanguage();
    speechSynthesis.cancel();
    document.calculator.display.value = '';
    speak(operationName["C"][currentLang], currentLang);
    answer = "";
}

function gotError() {
    error = '1';
    document.calculator.display.value = operationName["Error"][currentLang], currentLang;
    changeLanguage();
    speak(operationName["Error"][currentLang], currentLang);
}

function calculate() {
    changeLanguage();
    speak(operationName["="][currentLang], currentLang);
        try {
            const result = eval(document.calculator.display.value);
            document.calculator.display.value = result;
            answer = result;
            speak(result, currentLang); 
            console.log('=',answer);
        } catch (error) {
            gotError();
        }
}

// calclation of sqroot
function sqrtcal() {
    changeLanguage();
    const value = document.calculator.display.value;
    if (value) {
        const result = Math.sqrt(value);
        document.calculator.display.value = result;
        speak(operationName["√"][currentLang] + " is " + result, currentLang); 
    } else {
        gotError();
    }
}

// cbroot
function cbrtcal() {
    changeLanguage();
    const value = document.calculator.display.value;
    if (value) {
        const result = Math.cbrt(value);
        document.calculator.display.value = result;
        speak(operationName["³√"][currentLang] + " is " + result, currentLang); 
    } else {
        gotError();
    }
}



window.speechSynthesis.onvoiceschanged = loadVoices;
document.addEventListener('DOMContentLoaded', loadVoices());


//Translations

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
    "*": {
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
    "/": {
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
    "**": {
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
}
