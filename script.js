const CR_KEY = 'diabetesCalcAdvPop_carbRatio'; 
const SF_KEY = 'diabetesCalcAdvPop_sensitivityFactor';
const TS_KEY = 'diabetesCalcAdvPop_targetSugar';
const INSULIN_ACTION_DURATION_HOURS = 4; // Standard duration for fast-acting insulin

const popupData = {
    settingsInfo: {
        title: "Индивидуальные коэффициенты",
        text: `<p>Эти коэффициенты являются ключевыми для персонализации расчетов. <strong>Они должны быть определены строго совместно с вашим лечащим врачом-эндокринологом.</strong> Неправильно установленные коэффициенты приведут к неверным расчетам и потенциально опасным выводам.</p>
               <p>Сохраняются в памяти вашего браузера (localStorage) и будут автоматически загружаться при следующем посещении страницы с этого же устройства и браузера.</p>`
    },
    carbRatioInfo: {
        title: "Углеводный коэффициент (УК)",
        text: `<p><strong>УК (ед/10г угл.)</strong>: Показывает, сколько единиц короткого/ультракороткого инсулина требуется для усвоения 10 граммов углеводов (примерно 1 Хлебная Единица, ХЕ).</p>
               <p>Например, если ваш УК = 1.5, это значит, что на каждые 10 грамм углеводов вам нужно 1.5 единицы инсулина.</p>
               <p>Этот коэффициент может меняться в течение дня (например, утром УК часто выше). В данном калькуляторе используется одно значение УК.</p>
               <p><strong>Типичные значения:</strong> 0.5 - 3.0 (очень индивидуально).</p>`
    },
    sensitivityFactorInfo: {
        title: "Фактор чувствительности к инсулину (ФЧИ)",
        text: `<p><strong>ФЧИ (ммоль/л на 1 ед.)</strong>: Показывает, на сколько ммоль/л снизит ваш уровень сахара в крови 1 единица введенного короткого/ультракороткого инсулина.</p>
               <p>Например, если ваш ФЧИ = 2.0, это значит, что 1 единица инсулина снизит ваш сахар примерно на 2.0 ммоль/л.</p>
               <p>Используется для расчета дозы инсулина на коррекцию высокого сахара. Также может меняться в течение дня или при болезни.</p>
               <p><strong>Типичные значения:</strong> 1.0 - 5.0 (очень индивидуально, может быть и выше).</p>`
    },
    targetSugarInfo: {
        title: "Целевой уровень сахара",
        text: `<p><strong>Целевой уровень сахара (ммоль/л)</strong>: Это тот уровень сахара в крови, к которому вы стремитесь перед едой или к которому должен вернуться сахар через некоторое время после еды и действия инсулина.</p>
               <p>Определяется индивидуально с вашим врачом. Может быть диапазон (например, 4.0 - 7.0 ммоль/л). Для расчетов здесь используется одно конкретное значение (например, середина вашего целевого диапазона перед едой).</p>
               <p><strong>Типичные значения для цели перед едой:</strong> 4.0 - 7.0 ммоль/л.</p>`
    },
    currentSugarInfo: {
        title: "Текущий уровень сахара",
        text: `<p>Введите ваш текущий уровень глюкозы в крови, измеренный глюкометром, в ммоль/л.</p>
               <p>Это отправная точка для всех расчетов. Точность этого значения критически важна.</p>`
    },
    carbsInfo: {
        title: "Количество углеводов в пище",
        text: `<p>Укажите общее количество усвояемых углеводов в граммах, которое вы планируете съесть или уже съели.</p>
               <p>Для подсчета используйте информацию на упаковках продуктов, таблицы пищевой ценности или специализированные приложения. Точный подсчет углеводов – ключ к правильному расчету дозы инсулина на еду.</p>
               <p>Помните, что 1 Хлебная Единица (ХЕ) ≈ 10-12 грамм углеводов.</p>`
    },
    mealTypeInfo: {
        title: "Тип пищи",
        text: `<p>Выбор типа пищи помогает калькулятору (очень упрощенно) учесть примерную скорость усвоения углеводов и их влияние на сахар в ближайшие ~2 часа.</p>
               <ul>
                   <li><strong>Сбалансированная еда (стандарт):</strong> Обычный прием пищи, содержащий белки, жиры и углеводы.</li>
                   <li><strong>Преимущественно быстрые углеводы:</strong> Продукты, которые быстро повышают сахар (сок, фрукты, сладости).</li>
                   <li><strong>Медленные углеводы / Жирная/белковая пища:</strong> Еда, богатая жирами/белками, замедляющими всасывание углеводов.</li>
               </ul>
               <p>Этот параметр вносит лишь небольшую поправку в прогноз.</p>`
    },
    activityLevelInfo: {
        title: "Физическая активность",
        text: `<p>Укажите предполагаемый уровень физической активности в ближайшие 1-2 часа.</p>
               <p>Физическая активность обычно повышает чувствительность к инсулину и помогает снижать уровень сахара.</p>
               <ul>
                   <li><strong>Без значительной активности:</strong> Сидячий образ жизни.</li>
                   <li><strong>Легкая (прогулка):</strong> Неспешная ходьба.</li>
                   <li><strong>Умеренная/Интенсивная:</strong> Быстрая ходьба, спорт.</li>
               </ul>
               <p>Калькулятор применяет примерный фактор снижения сахара. Эффект индивидуален.</p>`
    },
    insulinDoseInfo: {
        title: "Введенная доза инсулина",
        text: `<p>Укажите дозу короткого или ультракороткого инсулина (в единицах) для компенсации этой еды и/или коррекции сахара.</p>
               <p><strong>ВАЖНО:</strong> Этот калькулятор <strong>НЕ УЧИТЫВАЕТ активный инсулин (IOB)</strong> от предыдущих инъекций. Учет IOB критически важен, но требует более сложных моделей.</p>
               <p>Вводите только дозу для ДАННОГО приема пищи/коррекции.</p>`
    }
};

function showPopup(popupId) { // Calculator's showPopup
    const data = popupData[popupId];
    if (data) {
        document.getElementById('popupTitle').textContent = data.title;
        document.getElementById('popupText').innerHTML = data.text;
        document.getElementById('popupOverlay').style.display = 'flex';
    }
}

function hidePopup() { // Calculator's hidePopup
    document.getElementById('popupOverlay').style.display = 'none';
}

function closePopupOnClickOutside(event) { // Calculator's specific logic
    if (event.target === document.getElementById('popupOverlay')) {
        hidePopup();
    }
}

function validateAndGetNumber(valueStr, fieldNameForError, errorElementId) {
    const numValue = parseFloat(valueStr);
    const errorElement = document.getElementById(errorElementId);
    if (errorElement) errorElement.textContent = '';

    if (valueStr === null || valueStr.trim() === '' || isNaN(numValue)) {
        if (errorElement) errorElement.textContent = `Введите числовое значение для "${fieldNameForError}".`;
        return null;
    }
    if (numValue < 0) {
         if (errorElement) errorElement.textContent = `"${fieldNameForError}" не может быть отрицательным.`;
        return null;
    }
    
    if ((fieldNameForError.includes("УК") || fieldNameForError.includes("Углеводный коэффициент")) && (numValue === 0 || numValue > 10) ) {
         if (errorElement) errorElement.textContent = `УК (0.1-10). Не 0.`; return null;
    }
    if ((fieldNameForError.includes("ФЧИ") || fieldNameForError.includes("Фактор чувствительности")) && (numValue === 0 || numValue > 25)) { 
         if (errorElement) errorElement.textContent = `ФЧИ (0.5-25). Не 0.`; return null;
    }
     if ((fieldNameForError.includes("Целевой сахар")) && (numValue < 3 || numValue > 12)) {
         if (errorElement) errorElement.textContent = `Цель (3-12 ммоль/л).`; return null;
    }
    if (fieldNameForError.includes("Текущий сахар") && (numValue < 1 || numValue > 40)) {
         if (errorElement) errorElement.textContent = `Текущий сахар (1-40 ммоль/л).`; return null;
    }
     if (fieldNameForError.includes("Углеводы") && (numValue > 500)) { 
         if (errorElement) errorElement.textContent = `>500г углеводов. Проверьте.`;
    }
    if (fieldNameForError.includes("Доза инсулина") && (numValue > 100)) { 
         if (errorElement) errorElement.textContent = `>100ед инсулина. Проверьте.`;
    }
    return numValue;
}

function saveSettings() {
    document.querySelectorAll('#calculatorHost .settings-section .error-message').forEach(el => el.textContent = '');
    
    const carbRatio = validateAndGetNumber(document.getElementById('settingCarbRatio').value, "Углеводный коэффициент", "settingCarbRatioError");
    const sensitivityFactor = validateAndGetNumber(document.getElementById('settingSensitivityFactor').value, "Фактор чувствительности", "settingSensitivityFactorError");
    const targetSugar = validateAndGetNumber(document.getElementById('settingTargetSugar').value, "Целевой сахар", "settingTargetSugarError");

    if (carbRatio !== null && sensitivityFactor !== null && targetSugar !== null) {
        localStorage.setItem(CR_KEY, carbRatio.toString());
        localStorage.setItem(SF_KEY, sensitivityFactor.toString());
        localStorage.setItem(TS_KEY, targetSugar.toString());
        showAlertPopup('Коэффициенты сохранены!', 'success');
        loadSettingsToCalcForm(); 
    } else {
        showAlertPopup('Пожалуйста, исправьте ошибки в значениях коэффициентов.', 'error');
    }
}

function loadSettingsToCalcForm() {
    const cr = localStorage.getItem(CR_KEY);
    const sf = localStorage.getItem(SF_KEY);
    const ts = localStorage.getItem(TS_KEY);

    const crEl = document.getElementById('calcCarbRatio');
    const sfEl = document.getElementById('calcSensitivityFactor');
    const tsEl = document.getElementById('calcTargetSugar');
    const settingCrEl = document.getElementById('settingCarbRatio');
    const settingSfEl = document.getElementById('settingSensitivityFactor');
    const settingTsEl = document.getElementById('settingTargetSugar');

    if (cr && crEl && settingCrEl) { crEl.value = parseFloat(cr).toFixed(1); settingCrEl.value = parseFloat(cr).toFixed(1); } else if(crEl && settingCrEl) { crEl.value = ''; settingCrEl.value = '';}
    if (sf && sfEl && settingSfEl) { sfEl.value = parseFloat(sf).toFixed(1); settingSfEl.value = parseFloat(sf).toFixed(1); } else if(sfEl && settingSfEl) { sfEl.value = ''; settingSfEl.value = '';}
    if (ts && tsEl && settingTsEl) { tsEl.value = parseFloat(ts).toFixed(1); settingTsEl.value = parseFloat(ts).toFixed(1); } else if(tsEl && settingTsEl) { tsEl.value = ''; settingTsEl.value = '';}
}

function getCoefficientsForCalculation() {
    const carbRatioStr = document.getElementById('calcCarbRatio').value;
    const sensitivityFactorStr = document.getElementById('calcSensitivityFactor').value;
    const targetSugarStr = document.getElementById('calcTargetSugar').value;

    if (carbRatioStr === '' || sensitivityFactorStr === '' || targetSugarStr === '') {
         alert("Пожалуйста, сначала установите и сохраните корректные индивидуальные коэффициенты в разделе настроек.");
        return null;
    }

    const carbRatio = validateAndGetNumber(carbRatioStr, "УК", "NoIDNeeded1"); // Error IDs are dummy here as they are not displayed
    const sensitivityFactor = validateAndGetNumber(sensitivityFactorStr, "ФЧИ", "NoIDNeeded2");
    const targetSugar = validateAndGetNumber(targetSugarStr, "Целевой сахар", "NoIDNeeded3");

    if (carbRatio === null || sensitivityFactor === null || targetSugar === null) {
        alert("Сохраненные коэффициенты некорректны. Пожалуйста, проверьте и пересохраните их в разделе настроек.");
        return null;
    }
    return { carbRatio, sensitivityFactor, targetSugar };
}

function calculatePrediction() {
    document.querySelectorAll('#diabetesForm .error-message').forEach(el => el.textContent = '');
    
    const currentSugar = validateAndGetNumber(document.getElementById('currentSugar').value, "Текущий сахар", "currentSugarError");
    const carbs = validateAndGetNumber(document.getElementById('carbs').value, "Количество углеводов", "carbsError");
    const insulinDose = validateAndGetNumber(document.getElementById('insulinDose').value, "Введенная доза инсулина", "insulinDoseError");
    const mealType = document.getElementById('mealType').value;
    const activityLevel = document.getElementById('activityLevel').value;
    
    const coeffs = getCoefficientsForCalculation();

    if (currentSugar === null || carbs === null || insulinDose === null || coeffs === null) {
        document.getElementById('predictionArea').style.display = 'none';
        return;
    }

    const { carbRatio, sensitivityFactor, targetSugar } = coeffs;

    const foodDose = (carbs / 10) * carbRatio;
    let correctionDose = 0;
    if (currentSugar > targetSugar) {
        correctionDose = (currentSugar - targetSugar) / sensitivityFactor;
    }
    correctionDose = Math.max(0, correctionDose); 
    const totalCalculatedDose = foodDose + correctionDose;

    let carbAbsorptionFactor = 1.0; 
    switch (mealType) {
        case 'fast': carbAbsorptionFactor = 1.1; break; 
        case 'balanced': carbAbsorptionFactor = 1.0; break;
        case 'slow': carbAbsorptionFactor = 0.80; break; 
    }

    let activityEffectOnSugar = 0; 
    switch (activityLevel) {
        case 'none': activityEffectOnSugar = 0; break;
        case 'light': activityEffectOnSugar = -0.8; break; 
        case 'moderate': activityEffectOnSugar = -2.0; break; 
    }

    const sugarIncreaseFromEffectiveCarbs = ((carbs * carbAbsorptionFactor) / 10) * carbRatio * sensitivityFactor;
    const sugarDecreaseFromInsulin = insulinDose * sensitivityFactor;
    let predictedSugar = currentSugar + sugarIncreaseFromEffectiveCarbs - sugarDecreaseFromInsulin + activityEffectOnSugar;

    if (predictedSugar < 0.5) predictedSugar = 0.5; 
    if (predictedSugar > 40.0) predictedSugar = 40.0;

    document.getElementById('foodDoseResult').textContent = foodDose.toFixed(1);
    document.getElementById('correctionDoseResult').textContent = correctionDose.toFixed(1);
    document.getElementById('totalCalculatedDoseResult').textContent = totalCalculatedDose.toFixed(1);
    document.getElementById('enteredDoseDisplay').textContent = insulinDose.toFixed(1);
    const doseDifference = insulinDose - totalCalculatedDose;
    document.getElementById('doseDifferenceResult').textContent = doseDifference.toFixed(1) + 
        (doseDifference > 0.1 ? " (введено больше ОРПИ)" : doseDifference < -0.1 ? " (введено меньше ОРПИ)" : " (введено по ОРПИ)");
    
    document.getElementById('predictedSugarResult').textContent = predictedSugar.toFixed(1);

    let comments = "Это КРАЙНЕ ПРИБЛИЗИТЕЛЬНЫЙ прогноз! Активный инсулин (IOB) НЕ учтен. ";
    if (predictedSugar < 3.9 && predictedSugar > 0.5) {
        comments += "Прогнозируется НИЗКИЙ уровень сахара. Будьте предельно внимательны, готовы к купированию гипогликемии. СРОЧНО обсудите с врачом, если прогнозы или реальные ситуации повторяются.";
    } else if (predictedSugar > 11.1 && predictedSugar < 40.0) {
        comments += "Прогнозируется ВЫСОКИЙ уровень сахара. Обсудите с врачом, если прогнозы или реальные ситуации повторяются, для коррекции терапии.";
    } else if (predictedSugar >= 3.9 && predictedSugar <= 11.1) {
        comments += "Прогнозируется уровень сахара в условно целевом диапазоне (для постпрандиального значения).";
    }
     comments += " Реальный сахар может ЗНАЧИТЕЛЬНО отличаться. ВСЕГДА проверяйте глюкометром!"
     document.getElementById('additionalComments').textContent = comments;
    document.getElementById('predictionArea').style.display = 'block';
}
// --- END OF CALCULATOR JavaScript ---


// --- START OF DIARY APP JavaScript ---
// --- STATE ---
let currentView = 'calendar';

function getLocalDateYYYYMMDD(dateObj) {
    const yearStr = dateObj.getFullYear();
    const monthStr = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = dateObj.getDate().toString().padStart(2, '0');
    return `${yearStr}-${monthStr}-${dayStr}`;
}
let selectedDate = getLocalDateYYYYMMDD(new Date()); // Initial selectedDate is local YYYY-MM-DD

// New state for calendar view
let currentCalendarDate = new Date(); // Date object to track the displayed month/year

let currentTheme = localStorage.getItem('diabetesAppTheme') || 'light';

let products = JSON.parse(localStorage.getItem('diabetesAppProducts')) || [
    { id: 1, name: 'Хлеб белый', carbs: 50, insulinRatio: 1 }, 
    { id: 2, name: 'Рис отварной', carbs: 28, insulinRatio: 1.5 },
    { id: 3, name: 'Картофель отварной', carbs: 16, insulinRatio: 1 },
    { id: 4, name: 'Яблоко', carbs: 14, insulinRatio: 0.5 }, 
    { id: 5, name: 'Молоко 3.2%', carbs: 4.7, insulinRatio: 0.25 }
];
let meals = JSON.parse(localStorage.getItem('diabetesAppMeals')) || {};
let glucoseRecords = JSON.parse(localStorage.getItem('diabetesAppGlucoseRecords')) || {};

let editingProductId = null; 
let newMealFormState = { 
    products: []
};

// Chart instances
let dayGlucoseChartInstance, weekGlucoseChartInstance, carbsInsulinChartInstance, activityChartInstance;
let monthGlucoseChartInstance, monthCarbsInsulinChartInstance, monthActivityChartInstance;

const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

// --- DOM Elements ---
const navigationButtons = document.getElementById('navigation-buttons');
const calendarViewEl = document.getElementById('calendarView');
const analyticsViewEl = document.getElementById('analyticsView');
const reportsViewEl = document.getElementById('reportsView');
const productsViewEl = document.getElementById('productsView');
const calculatorViewEl = document.getElementById('calculatorView'); 
const viewContents = document.querySelectorAll('.view-content');

const calendarHeaderEl = document.getElementById('calendarHeader');
const calendarGridEl = document.getElementById('calendarGrid');
const mealsHeaderEl = document.getElementById('mealsHeader');
const dayMealsContainerEl = document.getElementById('dayMealsContainer');
const glucoseHeaderEl = document.getElementById('glucoseHeader');
const dayGlucoseContainerEl = document.getElementById('dayGlucoseContainer');
const dayGlucoseChartContainerEl = document.getElementById('dayGlucoseChartContainer');

const productsTableBodyEl = document.getElementById('productsTableBody');

// Modals
const addProductModalEl = document.getElementById('addProductModal');
const addMealModalEl = document.getElementById('addMealModal');
const addGlucoseModalEl = document.getElementById('addGlucoseModal');
const aiSettingsModalEl = document.getElementById('aiSettingsModal'); // New AI Settings Modal

// Theme Toggle
const darkModeToggleBtn = document.getElementById('darkModeToggle');

// --- DOM Elements for Prediction (New) ---
const predictedSugarSectionEl = document.getElementById('predictedSugarSection');
const predictedSugarDisplayEl = document.getElementById('predictedSugarDisplay');
const predictionContextEl = document.getElementById('predictionContextEl'); // Corrected ID
const correctPredictionBtnEl = document.getElementById('correctPredictionBtn');


// --- THEME FUNCTIONS ---
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        darkModeToggleBtn.innerHTML = `<i data-lucide="moon" class="w-6 h-6 text-blue-400"></i>`;
        if(document.getElementById('calculatorHost')) { 
            document.getElementById('calculatorHost').style.backgroundColor = '#1e293b'; 
            document.getElementById('calculatorHost').style.color = '#e2e8f0'; 
        }
    } else {
        document.documentElement.classList.remove('dark');
        darkModeToggleBtn.innerHTML = `<i data-lucide="sun" class="w-6 h-6 text-yellow-500"></i>`;
         if(document.getElementById('calculatorHost')) { 
            document.getElementById('calculatorHost').style.backgroundColor = '#f0f4f8';
            document.getElementById('calculatorHost').style.color = '#333'; 
        }
    }
    currentTheme = theme; 
    localStorage.setItem('diabetesAppTheme', theme);
    lucide.createIcons();
    updateChartColors(theme);
}

function updateChartColors(theme) {
    const isDark = theme === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#cbd5e1' : '#4b5563'; 

    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;
    
    if (dayGlucoseChartInstance) {
        const ds = dayGlucoseChartInstance.data.datasets[0];
        ds.borderColor = isDark ? '#f87171' : '#ef4444'; 
        ds.pointBackgroundColor = isDark ? '#f87171' : '#ef4444';
        dayGlucoseChartInstance.update('none'); 
    }
    if (weekGlucoseChartInstance) {
        const ds = weekGlucoseChartInstance.data.datasets[0];
        ds.borderColor = isDark ? '#f87171' : '#ef4444';
        ds.backgroundColor = isDark ? 'rgba(248, 113, 113, 0.3)' : '#fecaca'; 
        weekGlucoseChartInstance.update('none');
    }
    if (carbsInsulinChartInstance) {
        carbsInsulinChartInstance.data.datasets[0].backgroundColor = isDark ? '#60a5fa' : '#3b82f6'; 
        carbsInsulinChartInstance.data.datasets[1].backgroundColor = isDark ? '#34d399' : '#10b981'; 
        carbsInsulinChartInstance.update('none');
    }
    if (activityChartInstance) {
        activityChartInstance.data.datasets[0].backgroundColor = isDark ? '#fbbf24' : '#f59e0b'; 
        activityChartInstance.data.datasets[1].backgroundColor = isDark ? '#f87171' : '#ef4444'; 
        activityChartInstance.update('none');
    }
    if (monthGlucoseChartInstance) {
        const ds = monthGlucoseChartInstance.data.datasets[0];
        ds.borderColor = isDark ? '#f87171' : '#ef4444';
        ds.backgroundColor = isDark ? 'rgba(248, 113, 113, 0.3)' : '#fecaca';
        monthGlucoseChartInstance.update('none');
    }
    if (monthCarbsInsulinChartInstance) {
        monthCarbsInsulinChartInstance.data.datasets[0].backgroundColor = isDark ? '#60a5fa' : '#3b82f6';
        monthCarbsInsulinChartInstance.data.datasets[1].backgroundColor = isDark ? '#34d399' : '#10b981';
        monthCarbsInsulinChartInstance.update('none');
    }
    if (monthActivityChartInstance) {
        monthActivityChartInstance.data.datasets[0].backgroundColor = isDark ? '#fbbf24' : '#f59e0b';
        monthActivityChartInstance.data.datasets[1].backgroundColor = isDark ? '#f87171' : '#ef4444';
        monthActivityChartInstance.update('none');
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}


// --- UTILITY FUNCTIONS ---
function saveData() {
    localStorage.setItem('diabetesAppProducts', JSON.stringify(products));
    localStorage.setItem('diabetesAppMeals', JSON.stringify(meals));
    localStorage.setItem('diabetesAppGlucoseRecords', JSON.stringify(glucoseRecords));
}

function getDayMeals(date) {
    return meals[date] || [];
}

function getDayGlucose(date) {
    return glucoseRecords[date] || [];
}

function calculateMealStats(mealProducts) {
    let totalCarbs = 0;
    let totalInsulin = 0; 

    mealProducts.forEach(item => {
        const productDetails = products.find(p => p.id === item.id);
        if (!productDetails) return;

        const carbsPer100g = productDetails.carbs;
        const actualCarbs = (carbsPer100g * item.amount) / 100;
        const breadUnits = actualCarbs / 12; 
        
        totalCarbs += actualCarbs;
        totalInsulin += breadUnits * productDetails.insulinRatio;
    });

    return {
        carbs: parseFloat(totalCarbs.toFixed(1)),
        breadUnits: parseFloat((totalCarbs / 12).toFixed(1)), // Also ensuring breadUnits is numeric for consistency
        insulin: parseFloat(totalInsulin.toFixed(1))
    };
}

function getGlucoseColor(glucose) { 
    const isDark = currentTheme === 'dark';
    if (glucose < 4) return isDark ? 'text-blue-400' : 'text-blue-600';
    if (glucose <= 7) return isDark ? 'text-green-400' : 'text-green-600';
    if (glucose <= 10) return isDark ? 'text-yellow-400' : 'text-yellow-500'; 
    return isDark ? 'text-red-400' : 'text-red-600';
}

function getGlucoseTypeLabel(type) {
    switch (type) {
        case 'before': return 'До еды';
        case 'after': return 'После еды';
        case 'random': return 'Произвольно';
        default: return type;
    }
}

// Corrected formatDate function (relies on dateString being local YYYY-MM-DD)
function formatDate(dateString) { 
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; 
    const day = parseInt(parts[2], 10);
    
    const localDate = new Date(year, month, day); // Creates date at 00:00:00 local time
    
    return localDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// --- PREDICTION LOGIC (NEW) ---
function calculateSugarPredictionLogic(currentSugar, carbs, insulinDose, carbRatio, sensitivityFactor, mealType = 'balanced', activityLevel = 'none') {
    if (currentSugar === null || isNaN(carbs) || isNaN(insulinDose) || !carbRatio || !sensitivityFactor) {
        return null;
    }
    
    let carbAbsorptionFactor = 1.0;
    switch (mealType) {
        case 'fast': carbAbsorptionFactor = 1.1; break;
        case 'balanced': carbAbsorptionFactor = 1.0; break;
        case 'slow': carbAbsorptionFactor = 0.80; break;
    }

    let activityEffectOnSugar = 0;
    switch (activityLevel) {
        case 'none': activityEffectOnSugar = 0; break;
        case 'light': activityEffectOnSugar = -0.8; break;
        case 'moderate': activityEffectOnSugar = -2.0; break;
    }

    const sugarIncreaseFromCarbs = ((carbs * carbAbsorptionFactor) / 10) * carbRatio * sensitivityFactor;
    const sugarDecreaseFromActualInsulin = insulinDose * sensitivityFactor;

    let predictedSugar = currentSugar + sugarIncreaseFromCarbs - sugarDecreaseFromActualInsulin + activityEffectOnSugar;

    if (predictedSugar < 0.5) predictedSugar = 0.5;
    if (predictedSugar > 40.0) predictedSugar = 40.0;

    return predictedSugar;
}

function findSugarBeforeMeal(dateStr, mealTimeStr) { // dateStr is local YYYY-MM-DD
    const dayGlucose = getDayGlucose(dateStr)
        .filter(r => r.time < mealTimeStr)
        .sort((a, b) => b.time.localeCompare(a.time)); 
    
    if (dayGlucose.length > 0) {
        const latestGlucoseBeforeMeal = dayGlucose[0];
        const mealDateTime = new Date(`${dateStr}T${mealTimeStr}`);
        const glucoseDateTime = new Date(`${dateStr}T${latestGlucoseBeforeMeal.time}`);
        const diffMinutes = (mealDateTime - glucoseDateTime) / (1000 * 60);

        if (diffMinutes <= 90 && diffMinutes >= 0) { 
            return { glucose: latestGlucoseBeforeMeal.glucose, time: latestGlucoseBeforeMeal.time };
        }
    }
    return null;
}

function calculateIOB(insulinEvents, currentTime, insulinActionDurationHours, selectedDate) {
    let totalIOB = 0;
    if (!Array.isArray(insulinEvents)) {
        console.error("calculateIOB: insulinEvents is not an array.");
        return 0;
    }

    for (const event of insulinEvents) {
        if (typeof event.time !== 'string' || typeof event.dose !== 'number' || isNaN(event.dose)) {
            console.error("calculateIOB: Invalid event structure", event);
            continue;
        }
        const doseDateTime = new Date(selectedDate + 'T' + event.time);
        if (isNaN(doseDateTime.getTime())) {
            console.error("calculateIOB: Invalid date constructed for event", event, selectedDate);
            continue;
        }

        const hoursAgo = (currentTime.getTime() - doseDateTime.getTime()) / (1000 * 60 * 60);

        // If hoursAgo is negative, the dose is in the future, so we ignore it.
        if (hoursAgo >= 0 && hoursAgo < insulinActionDurationHours) {
            const remainingFraction = 1 - (hoursAgo / insulinActionDurationHours);
            totalIOB += event.dose * remainingFraction;
        }
    }
    return Math.max(0, parseFloat(totalIOB.toFixed(2))); // Return IOB rounded to 2 decimal places
}

function calculateAdvancedPrediction(baselineGlucose, recentCarbEvents, iob, coeffs, selectedDate, currentTime) {
    let predictedSugar = baselineGlucose;
    const { carbRatio, sensitivityFactor } = coeffs;

    if (carbRatio == null || sensitivityFactor == null || isNaN(carbRatio) || isNaN(sensitivityFactor) || carbRatio === 0 || sensitivityFactor === 0) {
        console.error("calculateAdvancedPrediction: Invalid coefficients", coeffs);
        return null; // Or baselineGlucose, depending on desired behavior for error
    }

    // Subtract IOB effect
    predictedSugar -= iob * sensitivityFactor;

    // Add Carb Effects
    if (Array.isArray(recentCarbEvents)) {
        for (const event of recentCarbEvents) {
            const carbs = event.carbs;
            // const carbTime = new Date(selectedDate + 'T' + event.time); // Not used in this simple model iteration
            
            // For this iteration, we'll use a simple model: add the full potential rise.
            // We'll assume a default carbAbsorptionFactor of 1.0.
            const carbAbsorptionFactor = 1.0; 
            const sugarIncreaseFromCarbs = ((carbs * carbAbsorptionFactor) / 10) * carbRatio * sensitivityFactor;
            predictedSugar += sugarIncreaseFromCarbs;
        }
    }

    // Apply Bounds
    if (predictedSugar < 0.5) predictedSugar = 0.5;
    if (predictedSugar > 40.0) predictedSugar = 40.0;

    return parseFloat(predictedSugar.toFixed(1));
}

function isPredictionSuperseded(dateStr, mealTimeStr) { // dateStr is local YYYY-MM-DD
    const dayGlucoseAfterMeal = getDayGlucose(dateStr)
        .filter(r => r.time > mealTimeStr)
        .sort((a, b) => a.time.localeCompare(b.time)); 
    
    if (dayGlucoseAfterMeal.length === 0) return false;

    const mealDateTime = new Date(`${dateStr}T${mealTimeStr}`);
    const firstGlucoseAfterMealTime = new Date(`${dateStr}T${dayGlucoseAfterMeal[0].time}`);
    const currentTime = new Date();
    const predictionWindowEnd = new Date(mealDateTime.getTime() + 4 * 60 * 60 * 1000); 

    if (firstGlucoseAfterMealTime < predictionWindowEnd) {
        if (dateStr === getLocalDateYYYYMMDD(new Date())) { 
            return firstGlucoseAfterMealTime <= currentTime;
        }
        return true; 
    }
    return false;
}

function renderPredictedCurrentSugar() {
    const PREDICTION_CARB_LOOKBACK_HOURS = 4;
    const PREDICTION_INSULIN_LOOKBACK_HOURS = 4;
    const PREDICTION_RECENT_GLUCOSE_MINUTES = 30; // For using a live BG as baseline

    // Main UI elements
    if (!predictedSugarSectionEl || !predictedSugarDisplayEl || !predictionContextEl) { // predictionContextEl is the main div
        console.error("Main prediction UI elements (section, display, or context div) not found.");
        return;
    }

    // New specific context span elements
    const pc_status = document.getElementById('pc_status');
    const pc_baseline = document.getElementById('pc_baseline');
    const pc_carbs = document.getElementById('pc_carbs');
    const pc_insulin = document.getElementById('pc_insulin');
    const pc_iob_element = document.getElementById('pc_iob');

    if (!pc_status || !pc_baseline || !pc_carbs || !pc_insulin || !pc_iob_element) {
        console.error("One or more new prediction context elements (pc_*) not found.");
        predictedSugarSectionEl.style.display = 'none'; // Hide section if critical parts are missing
        return;
    }

    // Clear previous context and hide section initially
    predictedSugarSectionEl.style.display = 'none';
    pc_status.innerHTML = ''; // Use innerHTML for consistency if it ever gets HTML
    pc_baseline.innerHTML = '';
    pc_carbs.innerHTML = '';
    pc_insulin.innerHTML = '';
    pc_iob_element.innerHTML = '';
    predictedSugarDisplayEl.innerHTML = '---'; // Use innerHTML for consistency

    let baselineGlucose = null;
    let baselineGlucoseTime = null;
    // predictionStatusMessage variable is removed.

    const currentTime = new Date();
    const todayLocalStr = getLocalDateYYYYMMDD(new Date());
    const isToday = (selectedDate === todayLocalStr);

    // Fetch Recent Actual Glucose (as potential baseline)
    const dayGlucoseData = getDayGlucose(selectedDate).sort((a, b) => b.time.localeCompare(a.time)); 

    if (dayGlucoseData.length > 0 && isToday) {
        const latestGlucoseRecord = dayGlucoseData[0];
        const glucoseDateTime = new Date(selectedDate + 'T' + latestGlucoseRecord.time);
        const minutesSinceLatestGlucose = (currentTime - glucoseDateTime) / (1000 * 60);

        if (minutesSinceLatestGlucose >= 0 && minutesSinceLatestGlucose <= PREDICTION_RECENT_GLUCOSE_MINUTES) {
            baselineGlucose = latestGlucoseRecord.glucose;
            baselineGlucoseTime = latestGlucoseRecord.time;
            pc_baseline.innerHTML = `<strong>Недавний СК:</strong> ${baselineGlucose} ммоль/л (${baselineGlucoseTime}).`;
        }
    }

    // Fetch Recent Carbohydrate Events
    let recentCarbEvents = [];
    const allDayMeals = getDayMeals(selectedDate); 

    allDayMeals.forEach(meal => {
        const mealDateTime = new Date(selectedDate + 'T' + meal.time);
        const hoursSinceMeal = (currentTime - mealDateTime) / (1000 * 60 * 60);

        if (hoursSinceMeal >= 0 && hoursSinceMeal <= PREDICTION_CARB_LOOKBACK_HOURS) {
            const mealStats = calculateMealStats(meal.products); 
            if (mealStats.carbs > 0) {
                recentCarbEvents.push({ time: meal.time, carbs: mealStats.carbs, notes: meal.notes || '' });
            }
        }
    });

    if (recentCarbEvents.length > 0) {
        recentCarbEvents.sort((a, b) => a.time.localeCompare(b.time)); // Oldest first
        pc_carbs.innerHTML = `<strong>Еда:</strong> ${recentCarbEvents.map(e => e.carbs + 'г в ' + e.time).join(' • ')}.`;
    } else {
        pc_carbs.innerHTML = ''; // Or "<strong>Еда:</strong> нет недавних записей"
    }

    // Fetch Recent Insulin Events
    let recentInsulinEvents = [];
    allDayMeals.forEach(meal => {
        if (meal.actualInsulin && meal.actualInsulin > 0) {
            const insulinDateTime = new Date(selectedDate + 'T' + meal.time);
            const hoursSinceInsulin = (currentTime - insulinDateTime) / (1000 * 60 * 60);

            if (hoursSinceInsulin >= 0 && hoursSinceInsulin <= PREDICTION_INSULIN_LOOKBACK_HOURS) {
                recentInsulinEvents.push({ time: meal.time, dose: meal.actualInsulin });
            }
        }
    });
    
    if (recentInsulinEvents.length > 0) {
        recentInsulinEvents.sort((a, b) => a.time.localeCompare(b.time)); // Oldest first
        pc_insulin.innerHTML = `<strong>Инсулин:</strong> ${recentInsulinEvents.map(e => e.dose + 'ед в ' + e.time).join(' • ')}.`;
    } else {
        pc_insulin.innerHTML = ''; // Or "<strong>Инсулин:</strong> нет недавних записей"
    }

    // Refine Baseline Glucose (if not found from recent actual)
    if (baselineGlucose === null) {
        let earliestActivityTime = null;
        if (recentCarbEvents.length > 0) {
            earliestActivityTime = recentCarbEvents[0].time; 
        }
        if (recentInsulinEvents.length > 0) {
            if (earliestActivityTime === null || recentInsulinEvents[0].time < earliestActivityTime) {
                earliestActivityTime = recentInsulinEvents[0].time; 
            }
        }

        if (earliestActivityTime) {
            const bgInfo = findSugarBeforeMeal(selectedDate, earliestActivityTime); 
            if (bgInfo !== null) {
                baselineGlucose = bgInfo.glucose;
                baselineGlucoseTime = bgInfo.time;
                pc_baseline.innerHTML = `<strong>СК перед (${earliestActivityTime}):</strong> ${baselineGlucose} ммоль/л (${baselineGlucoseTime}).`;
            }
        }
    }
    
    // Handle Exit Conditions
    if (baselineGlucose === null) {
        pc_status.textContent = "Недостаточно данных о глюкозе для прогноза.";
        predictedSugarSectionEl.style.display = 'block';
        lucide.createIcons();
        return;
    }

    if (recentCarbEvents.length === 0 && recentInsulinEvents.length === 0 && isToday) {
        pc_status.textContent = "Нет недавних данных о еде/инсулине для нового прогноза.";
        // pc_baseline might already be populated if there was a recent BG
        predictedSugarSectionEl.style.display = 'block';
        lucide.createIcons();
        return;
    }
    
    const iob = calculateIOB(recentInsulinEvents, currentTime, INSULIN_ACTION_DURATION_HOURS, selectedDate);
    console.log("Baseline Glucose:", baselineGlucose, "at", baselineGlucoseTime, "Recent Carb Events:", recentCarbEvents, "Recent Insulin Events:", recentInsulinEvents, "Calculated IOB:", iob);

    if (iob > 0) {
        pc_iob_element.innerHTML = `<strong>Активный инсулин (IOB):</strong> ${iob.toFixed(1)} ед.`;
    } else {
        pc_iob_element.innerHTML = ''; // Or "<strong>Активный инсулин (IOB):</strong> 0 ед."
    }

    // Get Coefficients
    const carbRatioStr = localStorage.getItem(CR_KEY);
    const sensitivityFactorStr = localStorage.getItem(SF_KEY);
    const targetSugarStr = localStorage.getItem(TS_KEY); 

    if (!carbRatioStr || !sensitivityFactorStr) {
        pc_status.textContent = "Коэффициенты УК/ФЧИ не настроены.";
        predictedSugarSectionEl.style.display = 'block';
        lucide.createIcons();
        return;
    }

    const coeffs = {
        carbRatio: parseFloat(carbRatioStr),
        sensitivityFactor: parseFloat(sensitivityFactorStr),
        targetSugar: parseFloat(targetSugarStr) 
    };

    if (isNaN(coeffs.carbRatio) || isNaN(coeffs.sensitivityFactor) || coeffs.carbRatio === 0 || coeffs.sensitivityFactor === 0) {
        pc_status.textContent = "Ошибка в сохраненных коэффициентах УК/ФЧИ.";
        predictedSugarSectionEl.style.display = 'block';
        lucide.createIcons();
        return;
    }

    // Calculate Advanced Prediction
    const finalPredictedSugar = calculateAdvancedPrediction(baselineGlucose, recentCarbEvents, iob, coeffs, selectedDate, currentTime);

    if (finalPredictedSugar !== null) {
        predictedSugarDisplayEl.innerHTML = `<span class="${getGlucoseColor(finalPredictedSugar)}">${finalPredictedSugar.toFixed(1)} ммоль/л</span> <span class="text-base font-normal text-gray-500 dark:text-gray-400">(прогноз)</span>`;
        // pc_status remains empty if prediction is successful, or could hold a general "Прогноз рассчитан"
    } else {
        // Error during calculateAdvancedPrediction (e.g. bad coeffs already handled by its return null)
        // This specific message might be redundant if calculateAdvancedPrediction handles its own errors well,
        // but kept for robustness.
        pc_status.textContent = "Не удалось рассчитать прогноз из-за ошибки в коэффициентах.";
    }
    
    predictedSugarSectionEl.style.display = 'block';
    lucide.createIcons();
}


// --- RENDER FUNCTIONS ---

function renderNavigation() {
    document.querySelectorAll('.nav-button').forEach(button => {
        const isActive = button.dataset.view === currentView;
        button.classList.remove(
            'bg-blue-500', 'text-white', 'dark:bg-blue-600',
            'bg-gray-100', 'text-gray-700', 'hover:bg-gray-200',
            'dark:bg-slate-700', 'dark:text-gray-300', 'dark:hover:bg-slate-600'
        );
        if (isActive) {
            button.classList.add('text-blue-500', 'dark:text-blue-400');
        } else {
            button.classList.add(
                'text-gray-600', 'hover:text-gray-800',
                'dark:text-gray-400', 'dark:hover:text-gray-200'
            );
        }
    });
}

function renderView() {
    viewContents.forEach(view => view.style.display = 'none');
    const currentViewEl = document.getElementById(`${currentView}View`);
    if (currentViewEl) {
         currentViewEl.style.display = (currentView === 'calendar' || currentView === 'analytics') ? 'grid' : 'block';
         if (currentView === 'calculator') { 
             currentViewEl.style.display = 'block'; 
             if (typeof loadSettingsToCalcForm === 'function') {
                 loadSettingsToCalcForm(); 
             }
         }
    }

    renderNavigation();

    switch (currentView) {
        case 'calendar':
            renderCalendarView();
            break;
        case 'analytics':
            renderAnalyticsView();
            break;
        case 'reports':
            renderReportsView();
            break;
        case 'products':
            renderProductsView();
            break;
        case 'calculator':
            // Already handled above
            break; 
    }
    lucide.createIcons(); 
}

function generateCalendarDays(year, month) { // month is 0-indexed
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; 

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
        const localDayDate = new Date(year, month, day);
        const localDateString = getLocalDateYYYYMMDD(localDayDate); // Use local YYYY-MM-DD
        days.push({ date: localDateString, day });
    }
    return days;
}

function renderCalendarGrid() {
    const currentMonth = currentCalendarDate.getMonth(); // 0-indexed
    const currentYear = currentCalendarDate.getFullYear();
    calendarHeaderEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const dayNamesContainer = calendarGridEl.previousElementSibling;
    if (dayNamesContainer.children.length === 0) {
         ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(day => {
            const div = document.createElement('div');
            div.className = "text-center text-sm font-medium text-gray-500 dark:text-gray-400 p-2";
            div.textContent = day;
            dayNamesContainer.appendChild(div);
        });
    }

    calendarGridEl.innerHTML = '';
    const days = generateCalendarDays(currentYear, currentMonth);
    days.forEach(dayObj => {
        const dayDiv = document.createElement('div');
        dayDiv.className = "aspect-square";
        if (dayObj) {
            const button = document.createElement('button');
            let baseClasses = `w-full h-full rounded-lg flex flex-col items-center justify-center text-sm transition-colors`;
            
            let stateClasses = 'hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700'; 
            if (selectedDate === dayObj.date) { // dayObj.date is now local YYYY-MM-DD
                stateClasses = 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white';
            } else if ((meals[dayObj.date]?.length > 0 || glucoseRecords[dayObj.date]?.length > 0)) {
                stateClasses = 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800/80 dark:text-green-300 dark:hover:bg-green-700/80';
            }
            button.className = `${baseClasses} ${stateClasses}`;
            
            button.innerHTML = `
                <span>${dayObj.day}</span>
                <div class="flex gap-1 mt-1">
                    ${meals[dayObj.date]?.length > 0 ? '<div class="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>' : ''}
                    ${glucoseRecords[dayObj.date]?.length > 0 ? '<div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>' : ''}
                </div>
            `;
            button.onclick = () => {
                selectedDate = dayObj.date; // Set selectedDate to local YYYY-MM-DD
                renderCalendarView(); 
            };
            dayDiv.appendChild(button);
        }
        calendarGridEl.appendChild(dayDiv);
    });
}

function renderDayMeals() {
    mealsHeaderEl.textContent = `Питание ${formatDate(selectedDate)}`; // selectedDate is local YYYY-MM-DD
    dayMealsContainerEl.innerHTML = '';
    const dayMealsData = getDayMeals(selectedDate).sort((a, b) => b.time.localeCompare(a.time)); 

    if (dayMealsData.length === 0) {
        dayMealsContainerEl.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                <i data-lucide="utensils" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
                <p>Нет записей о питании</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    dayMealsData.forEach(meal => {
        const stats = calculateMealStats(meal.products);
        const mealEl = document.createElement('div');
        mealEl.className = "border rounded-lg p-4 dark:border-slate-700";
        mealEl.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center">
                    <i data-lucide="utensils" class="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"></i>
                    <span class="font-medium dark:text-gray-200">${meal.time}</span>
                </div>
                <button data-meal-id="${meal.id}" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
            <div class="space-y-1 mb-3">
                ${meal.products.map(p => {
                    const productInfo = products.find(prod => prod.id === p.id);
                    return `<div class="text-sm text-gray-600 dark:text-gray-400">${productInfo ? productInfo.name : 'Неизвестный продукт'} - ${p.amount}г</div>`;
                }).join('')}
            </div>
            <div class="bg-gray-50 rounded p-3 text-sm dark:bg-slate-700">
                <div class="grid grid-cols-2 gap-4 mb-2">
                    <div><span class="text-gray-500 dark:text-gray-400">Углеводы:</span><div class="font-semibold dark:text-gray-200">${stats.carbs}г</div></div>
                    <div><span class="text-gray-500 dark:text-gray-400">ХЕ:</span><div class="font-semibold dark:text-gray-200">${stats.breadUnits}</div></div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div><span class="text-gray-500 dark:text-gray-400">Расчет инсулина:</span><div class="font-semibold text-blue-600 dark:text-blue-400">${stats.insulin} ед</div></div>
                    <div><span class="text-gray-500 dark:text-gray-400">Фактически:</span><div class="font-semibold text-green-600 dark:text-green-400">${meal.actualInsulin || 0} ед</div></div>
                </div>
                ${meal.notes ? `
                <div class="mt-2">
                    <div class="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">Заметки:</div>
                    <div class="text-xs text-gray-600 dark:text-gray-300 break-words whitespace-pre-wrap">${meal.notes}</div>
                </div>` : ''}
            </div>
        `;
        mealEl.querySelector('button[data-meal-id]').addEventListener('click', () => deleteMeal(meal.id));
        dayMealsContainerEl.appendChild(mealEl);
    });
    lucide.createIcons();
}

function renderDayGlucose() {
    glucoseHeaderEl.textContent = `Глюкоза ${formatDate(selectedDate)}`; // selectedDate is local YYYY-MM-DD
    dayGlucoseContainerEl.innerHTML = '';
    const dayGlucoseData = getDayGlucose(selectedDate).sort((a, b) => b.time.localeCompare(a.time));

    if (dayGlucoseData.length === 0) {
        dayGlucoseContainerEl.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                <i data-lucide="activity" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
                <p>Нет измерений глюкозы</p>
            </div>`;
        dayGlucoseChartContainerEl.style.display = 'none';
        if (dayGlucoseChartInstance) dayGlucoseChartInstance.destroy();
        lucide.createIcons();
        return;
    }

    dayGlucoseData.forEach(record => {
        const recordEl = document.createElement('div');
        recordEl.className = "border rounded-lg p-3 dark:border-slate-700";
        recordEl.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center">
                    <i data-lucide="droplets" class="w-4 h-4 mr-2 text-red-500 dark:text-red-400"></i>
                    <span class="font-medium dark:text-gray-200">${record.time}</span>
                    <span class="ml-2 text-xs bg-gray-100 px-2 py-1 rounded dark:bg-slate-600 dark:text-gray-300">${getGlucoseTypeLabel(record.type)}</span>
                </div>
                <button data-glucose-id="${record.id}" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
            <div class="text-2xl font-bold ${getGlucoseColor(record.glucose)}">${record.glucose} ммоль/л</div>
            ${record.notes ? `<div class="mt-2 text-sm text-gray-600 dark:text-gray-300">${record.notes}</div>` : ''}
        `;
        recordEl.querySelector('button[data-glucose-id]').addEventListener('click', () => deleteGlucose(record.id));
        dayGlucoseContainerEl.appendChild(recordEl);
    });
    lucide.createIcons();
    renderDayGlucoseChart(dayGlucoseData);
}

function renderDayGlucoseChart(dayGlucoseData) {
    const chartPoints = dayGlucoseData
        .sort((a, b) => a.time.localeCompare(b.time))
        .map(record => ({ time: record.time, glucose: record.glucose }));

    if (chartPoints.length === 0) {
        dayGlucoseChartContainerEl.style.display = 'none';
        if (dayGlucoseChartInstance) dayGlucoseChartInstance.destroy();
        return;
    }
    dayGlucoseChartContainerEl.style.display = 'block';

    const ctx = document.getElementById('dayGlucoseChartCanvas').getContext('2d');
    if (dayGlucoseChartInstance) dayGlucoseChartInstance.destroy();
    
    const isDark = currentTheme === 'dark';
    dayGlucoseChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartPoints.map(d => d.time),
            datasets: [{
                label: 'Глюкоза',
                data: chartPoints.map(d => d.glucose),
                borderColor: isDark ? '#f87171' : '#ef4444', 
                backgroundColor: 'transparent',
                tension: 0.1,
                pointBackgroundColor: isDark ? '#f87171' : '#ef4444',
                pointRadius: 4,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false, min: 3, max: 15, ticks: { font: { size: 10 }}}, 
                x: { ticks: { font: { size: 10 }}} 
            },
            plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
        }
    });
}

function renderCalendarView() {
    renderCalendarGrid();
    renderDayMeals();
    renderDayGlucose();
    renderPredictedCurrentSugar();
    renderDaySummary(); 
    lucide.createIcons(); 
}

function renderDaySummary() {
    const dayMealsData = getDayMeals(selectedDate);
    const dayGlucoseData = getDayGlucose(selectedDate);
    
    let totalCarbs = 0;
    let totalInsulin = 0;
    
    dayMealsData.forEach(meal => {
        const stats = calculateMealStats(meal.products);
        totalCarbs += parseFloat(stats.carbs);
        totalInsulin += meal.actualInsulin || parseFloat(stats.insulin) || 0;
    });
    
    let avgGlucose = 0;
    if (dayGlucoseData.length > 0) {
        avgGlucose = dayGlucoseData.reduce((sum, record) => sum + record.glucose, 0) / dayGlucoseData.length;
    }
    
    document.getElementById('dayTotalCarbs').textContent = `${Math.round(totalCarbs)}г`;
    document.getElementById('dayTotalInsulin').textContent = `${Math.round(totalInsulin * 10) / 10} ед`;
    document.getElementById('dayAvgGlucose').textContent = avgGlucose > 0 ? `${Math.round(avgGlucose * 10) / 10}` : '-';
    document.getElementById('dayMealsCount').textContent = dayMealsData.length;
}

// --- Products View Functions ---
function renderProductsView() {
    productsTableBodyEl.innerHTML = '';
    
    const isMobile = window.innerWidth < 640; // sm breakpoint
    
    if (isMobile) {
        // Мобильный вариант - карточки
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = "border rounded-lg p-4 mb-3 dark:border-slate-700";
            card.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div class="font-medium dark:text-gray-200">${product.name}</div>
                    <div class="flex space-x-2">
                        <button data-edit-id="${product.id}" class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button data-delete-id="${product.id}" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="text-gray-500 dark:text-gray-400">Углеводы:</div>
                    <div class="dark:text-gray-300">${product.carbs}г/100г</div>
                    <div class="text-gray-500 dark:text-gray-400">Инсулин:</div>
                    <div class="dark:text-gray-300">${product.insulinRatio} ед/ХЕ</div>
                </div>
            `;
            card.querySelector(`button[data-edit-id="${product.id}"]`).addEventListener('click', () => openEditProductModal(product.id));
            card.querySelector(`button[data-delete-id="${product.id}"]`).addEventListener('click', () => deleteProduct(product.id));
            productsTableBodyEl.appendChild(card);
        });
    } else {
        // Десктоп вариант - таблица
        const table = document.createElement('table');
        table.className = "w-full border-collapse";
        table.innerHTML = `
            <thead class="dark:text-gray-200">
                <tr class="bg-gray-50 dark:bg-slate-700">
                    <th class="border p-3 text-left dark:border-slate-600">Продукт</th>
                    <th class="border p-3 text-left dark:border-slate-600">Углеводы (г/100г)</th>
                    <th class="border p-3 text-left dark:border-slate-600">Инсулин (ед/ХЕ)</th>
                    <th class="border p-3 text-left dark:border-slate-600">Действия</th>
                </tr>
            </thead>
            <tbody class="dark:text-gray-300 dark:border-slate-600"></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        
        products.forEach(product => {
            const row = tbody.insertRow();
            row.className = "dark:border-slate-600";
            row.innerHTML = `
                <td class="border p-3 dark:border-slate-600">${product.name}</td>
                <td class="border p-3 dark:border-slate-600">${product.carbs}</td>
                <td class="border p-3 dark:border-slate-600">${product.insulinRatio}</td>
                <td class="border p-3 dark:border-slate-600">
                    <div class="flex space-x-2">
                        <button data-edit-id="${product.id}" class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button data-delete-id="${product.id}" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            `;
            row.querySelector(`button[data-edit-id="${product.id}"]`).addEventListener('click', () => openEditProductModal(product.id));
            row.querySelector(`button[data-delete-id="${product.id}"]`).addEventListener('click', () => deleteProduct(product.id));
        });
        
        productsTableBodyEl.innerHTML = '';
        productsTableBodyEl.appendChild(table);
    }
    
    lucide.createIcons();
}

// Добавляем обработчик изменения размера окна
window.addEventListener('resize', () => {
    if (currentView === 'products') {
        renderProductsView();
    }
});

// --- Analytics and Reports Data Helpers ---
function getWeekData() {
    const data = [];
    const today = new Date(); // Local 'today'
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i); // Calculate past local dates
        const dateStr = getLocalDateYYYYMMDD(date); // Use local YYYY-MM-DD
        
        const dayMealsData = getDayMeals(dateStr);
        const dayGlucoseData = getDayGlucose(dateStr);
        
        let totalCarbs = 0;
        let totalInsulin = 0;
        
        dayMealsData.forEach(meal => {
            const stats = calculateMealStats(meal.products);
            totalCarbs += parseFloat(stats.carbs);
            totalInsulin += meal.actualInsulin || parseFloat(stats.insulin) || 0;
        });
        
        let avgGlucose = 0;
        if (dayGlucoseData.length > 0) {
            avgGlucose = dayGlucoseData.reduce((sum, record) => sum + record.glucose, 0) / dayGlucoseData.length;
        }
        
        data.push({
            date: formatDate(dateStr).substring(0,5), // dd.mm for labels
            fullDate: dateStr, // local YYYY-MM-DD
            carbs: Math.round(totalCarbs),
            insulin: Math.round(totalInsulin * 10) / 10,
            glucose: avgGlucose > 0 ? Math.round(avgGlucose * 10) / 10 : 0,
            mealsCount: dayMealsData.length,
            glucoseCount: dayGlucoseData.length
        });
    }
    return data;
}

function getMonthData() {
    const data = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let dayOfMonth = 1; dayOfMonth <= daysInCurrentMonth; dayOfMonth++) {
        const date = new Date(currentYear, currentMonth, dayOfMonth);
        const dateStr = getLocalDateYYYYMMDD(date); // Local YYYY-MM-DD string
        
        const dayMealsData = getDayMeals(dateStr);
        const dayGlucoseData = getDayGlucose(dateStr);
        
        let totalCarbs = 0;
        let totalInsulin = 0;
        
        dayMealsData.forEach(meal => {
            const stats = calculateMealStats(meal.products);
            totalCarbs += parseFloat(stats.carbs);
            totalInsulin += meal.actualInsulin || parseFloat(stats.insulin) || 0;
        });
        
        let avgGlucose = 0;
        if (dayGlucoseData.length > 0) {
            avgGlucose = dayGlucoseData.reduce((sum, record) => sum + record.glucose, 0) / dayGlucoseData.length;
        }
        
        data.push({
            date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }), // dd.mm for chart labels
            fullDate: dateStr, // local YYYY-MM-DD for data keys
            carbs: Math.round(totalCarbs),
            insulin: Math.round(totalInsulin * 10) / 10,
            glucose: avgGlucose > 0 ? Math.round(avgGlucose * 10) / 10 : 0,
            mealsCount: dayMealsData.length,
            glucoseCount: dayGlucoseData.length
        });
    }
    return data;
}


// --- Analytics View Functions ---
function renderAnalyticsView() {
    const weekData = getWeekData();
    const monthData = getMonthData();
    const isDark = currentTheme === 'dark';

    // Недельные графики
    const weekGlucoseCtx = document.getElementById('weekGlucoseChartCanvas').getContext('2d');
    if (weekGlucoseChartInstance) weekGlucoseChartInstance.destroy();
    weekGlucoseChartInstance = new Chart(weekGlucoseCtx, {
        type: 'line', 
        data: {
            labels: weekData.map(d => d.date),
            datasets: [{
                label: 'Средняя глюкоза',
                data: weekData.map(d => d.glucose > 0 ? d.glucose : null), 
                borderColor: isDark ? '#f87171' : '#ef4444', 
                backgroundColor: isDark ? 'rgba(248, 113, 113, 0.3)' : '#fecaca', 
                fill: true,
                tension: 0.1,
                borderWidth: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false, min: 3, max: 15 } }, plugins: { tooltip: {callbacks: {label: (ctx) => `${ctx.raw} ммоль/л`}} }}
    });

    const carbsInsulinCtx = document.getElementById('carbsInsulinChartCanvas').getContext('2d');
    if (carbsInsulinChartInstance) carbsInsulinChartInstance.destroy();
    carbsInsulinChartInstance = new Chart(carbsInsulinCtx, {
        type: 'bar',
        data: {
            labels: weekData.map(d => d.date),
            datasets: [
                { label: 'Углеводы (г)', data: weekData.map(d => d.carbs), backgroundColor: isDark ? '#60a5fa' : '#3b82f6' }, 
                { label: 'Инсулин (ед)', data: weekData.map(d => d.insulin), backgroundColor: isDark ? '#34d399' : '#10b981' } 
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
    
    const activityCtx = document.getElementById('activityChartCanvas').getContext('2d');
    if (activityChartInstance) activityChartInstance.destroy();
    activityChartInstance = new Chart(activityCtx, {
        type: 'bar',
        data: {
            labels: weekData.map(d => d.date),
            datasets: [
                { label: 'Приемы пищи', data: weekData.map(d => d.mealsCount), backgroundColor: isDark ? '#fbbf24' : '#f59e0b' }, 
                { label: 'Измерения глюкозы', data: weekData.map(d => d.glucoseCount), backgroundColor: isDark ? '#f87171' : '#ef4444' } 
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });

    // Месячные графики
    const monthGlucoseCtx = document.getElementById('monthGlucoseChartCanvas').getContext('2d');
    if (monthGlucoseChartInstance) monthGlucoseChartInstance.destroy();
    monthGlucoseChartInstance = new Chart(monthGlucoseCtx, {
        type: 'line', 
        data: {
            labels: monthData.map(d => d.date),
            datasets: [{
                label: 'Средняя глюкоза',
                data: monthData.map(d => d.glucose > 0 ? d.glucose : null), 
                borderColor: isDark ? '#f87171' : '#ef4444', 
                backgroundColor: isDark ? 'rgba(248, 113, 113, 0.3)' : '#fecaca', 
                fill: true,
                tension: 0.1,
                borderWidth: 2
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { 
                y: { beginAtZero: false, min: 3, max: 15 },
                x: { ticks: { maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 15 } } 
            }, 
            plugins: { tooltip: {callbacks: {label: (ctx) => `${ctx.raw} ммоль/л`}} }
        }
    });

    const monthCarbsInsulinCtx = document.getElementById('monthCarbsInsulinChartCanvas').getContext('2d');
    if (monthCarbsInsulinChartInstance) monthCarbsInsulinChartInstance.destroy();
    monthCarbsInsulinChartInstance = new Chart(monthCarbsInsulinCtx, {
        type: 'bar',
        data: {
            labels: monthData.map(d => d.date),
            datasets: [
                { label: 'Углеводы (г)', data: monthData.map(d => d.carbs), backgroundColor: isDark ? '#60a5fa' : '#3b82f6' }, 
                { label: 'Инсулин (ед)', data: monthData.map(d => d.insulin), backgroundColor: isDark ? '#34d399' : '#10b981' } 
            ]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { 
                y: { beginAtZero: true },
                x: { ticks: { maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 15 } } 
            }
        }
    });
    
    const monthActivityCtx = document.getElementById('monthActivityChartCanvas').getContext('2d');
    if (monthActivityChartInstance) monthActivityChartInstance.destroy();
    monthActivityChartInstance = new Chart(monthActivityCtx, {
        type: 'bar',
        data: {
            labels: monthData.map(d => d.date),
            datasets: [
                { label: 'Приемы пищи', data: monthData.map(d => d.mealsCount), backgroundColor: isDark ? '#fbbf24' : '#f59e0b' }, 
                { label: 'Измерения глюкозы', data: monthData.map(d => d.glucoseCount), backgroundColor: isDark ? '#f87171' : '#ef4444' } 
            ]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { 
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
                x: { ticks: { maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 15 } }
            }
        }
    });
    updateChartColors(currentTheme); 

    // Недельная сводка
    const weekSummaryContainer = document.getElementById('weekSummaryContainer');
    const totalCarbs = weekData.reduce((sum, day) => sum + day.carbs, 0);
    const totalInsulin = Math.round(weekData.reduce((sum, day) => sum + day.insulin, 0) * 10) / 10;
    const validGlucoseDays = weekData.filter(d => d.glucose > 0);
    const avgGlucoseWeek = validGlucoseDays.length > 0 ? Math.round(validGlucoseDays.reduce((sum, day) => sum + day.glucose, 0) / validGlucoseDays.length * 10) / 10 : 0;
    const totalMealsWeek = weekData.reduce((sum, day) => sum + day.mealsCount, 0);

    weekSummaryContainer.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 rounded-lg p-4 dark:bg-slate-700">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${totalCarbs}г</div>
                <div class="text-sm text-blue-600 dark:text-blue-400">Общие углеводы</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 dark:bg-slate-700">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">${totalInsulin} ед</div>
                <div class="text-sm text-green-600 dark:text-green-400">Общий инсулин</div>
            </div>
            <div class="bg-red-50 rounded-lg p-4 dark:bg-slate-700">
                <div class="text-2xl font-bold text-red-600 dark:text-red-400">${avgGlucoseWeek || 0}</div>
                <div class="text-sm text-red-600 dark:text-red-400">Средняя глюкоза</div>
            </div>
            <div class="bg-yellow-50 rounded-lg p-4 dark:bg-slate-700">
                <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">${totalMealsWeek}</div>
                <div class="text-sm text-yellow-600 dark:text-yellow-400">Всего приемов пищи</div>
            </div>
        </div>
    `;

    // Месячная сводка
    const monthSummaryContainer = document.getElementById('monthSummaryContainer');
    const monthTotalCarbs = monthData.reduce((sum, day) => sum + day.carbs, 0);
    const monthTotalInsulin = Math.round(monthData.reduce((sum, day) => sum + day.insulin, 0) * 10) / 10;
    const monthValidGlucoseDays = monthData.filter(d => d.glucose > 0);
    const monthAvgGlucose = monthValidGlucoseDays.length > 0 ? Math.round(monthValidGlucoseDays.reduce((sum, day) => sum + day.glucose, 0) / monthValidGlucoseDays.length * 10) / 10 : 0;
    const monthTotalMeals = monthData.reduce((sum, day) => sum + day.mealsCount, 0);

    monthSummaryContainer.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 rounded-lg p-4 dark:bg-slate-700">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${monthTotalCarbs}г</div>
                <div class="text-sm text-blue-600 dark:text-blue-400">Общие углеводы</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 dark:bg-slate-700">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">${monthTotalInsulin} ед</div>
                <div class="text-sm text-green-600 dark:text-green-400">Общий инсулин</div>
            </div>
            <div class="bg-red-50 rounded-lg p-4 dark:bg-slate-700">
                <div class="text-2xl font-bold text-red-600 dark:text-red-400">${monthAvgGlucose || 0}</div>
                <div class="text-sm text-red-600 dark:text-red-400">Средняя глюкоза</div>
            </div>
            <div class="bg-yellow-50 rounded-lg p-4 dark:bg-slate-700">
                <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">${monthTotalMeals}</div>
                <div class="text-sm text-yellow-600 dark:text-yellow-400">Всего приемов пищи</div>
            </div>
        </div>
    `;
}

// --- Reports View Functions ---
function renderReportsView() {
    const weekData = getWeekData();
    const reportTableBody = document.getElementById('weekReportTableBody');
    reportTableBody.innerHTML = '';
    weekData.forEach(day => {
        const row = reportTableBody.insertRow();
        row.className = "dark:border-slate-600"
        row.innerHTML = `
            <td class="border p-3 dark:border-slate-600">${formatDate(day.fullDate)}</td>
            <td class="border p-3 dark:border-slate-600">${day.mealsCount}</td>
            <td class="border p-3 dark:border-slate-600">${day.carbs}г</td>
            <td class="border p-3 dark:border-slate-600">${day.insulin} ед</td>
            <td class="border p-3 dark:border-slate-600 ${getGlucoseColor(day.glucose)}">${day.glucose > 0 ? `${day.glucose} ммоль/л` : '-'}</td>
            <td class="border p-3 dark:border-slate-600">${day.glucoseCount}</td>
        `;
    });

    const analysisContainer = document.getElementById('glucoseControlAnalysisContainer');
    const allGlucose = weekData.filter(d => d.glucose > 0).map(d => d.glucose);
    const inRange = allGlucose.filter(g => g >= 4 && g <= 7).length;
    const totalMeasurements = allGlucose.length;
    const percentageInRange = totalMeasurements > 0 ? Math.round((inRange / totalMeasurements) * 100) : 0;
    analysisContainer.innerHTML = `
        <h3 class="text-lg font-semibold mb-4 dark:text-gray-100">Анализ контроля глюкозы</h3>
        <div class="space-y-3">
            <div class="flex justify-between dark:text-gray-300">
                <span>В целевом диапазоне (4-7 ммоль/л):</span>
                <span class="font-semibold">${percentageInRange}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-slate-600">
                <div class="bg-green-500 h-2 rounded-full dark:bg-green-600" style="width: ${percentageInRange}%"></div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">${inRange} из ${totalMeasurements} измерений в норме</div>
        </div>
    `;

    const recContainer = document.getElementById('recommendationsContainer');
    recContainer.innerHTML = `<h3 class="text-lg font-semibold mb-4 dark:text-gray-100">Рекомендации</h3><div class="space-y-2 text-sm"></div>`;
    const recListEl = recContainer.querySelector('.space-y-2');
    
    const validGlucoseDaysRec = weekData.filter(d => d.glucose > 0);
    const avgGlucoseRec = validGlucoseDaysRec.length > 0 ? validGlucoseDaysRec.reduce((sum, d) => sum + d.glucose, 0) / validGlucoseDaysRec.length : 0;
    const avgCarbsRec = weekData.reduce((sum, d) => sum + d.carbs, 0) / (weekData.length || 1);
    
    const recommendations = [];
    
    // Анализ уровня глюкозы
    if (avgGlucoseRec > 8) {
        recommendations.push("⚠️ Средний уровень глюкозы повышен. Проконсультируйтесь с врачом.");
    } else if (avgGlucoseRec < 4) {
        recommendations.push("⚠️ Средний уровень глюкозы ниже нормы. Возможно, стоит уменьшить дозы инсулина.");
    }
    
    // Анализ углеводов
    if (avgCarbsRec > 420) {
        recommendations.push("📊 Высокое потребление углеводов. Рассмотрите снижение порций.");
    } else if (avgCarbsRec < 200) {
        recommendations.push("📊 Низкое потребление углеводов. Убедитесь, что получаете достаточно питательных веществ.");
    }
    
    // Анализ приемов пищи
    if (weekData.some(d => d.mealsCount < 3 && d.mealsCount > 0)) {
        recommendations.push("🍽️ Некоторые дни с малым количеством приемов пищи. Старайтесь питаться регулярно.");
    }
    if (weekData.some(d => d.mealsCount > 5)) {
        recommendations.push("🍽️ Обнаружены дни с большим количеством приемов пищи. Старайтесь придерживаться 3-4 приемов пищи в день.");
    }
    
    // Анализ инсулина
    const avgInsulinPerDay = weekData.reduce((sum, day) => sum + day.totalInsulin, 0) / weekData.length;
    if (avgInsulinPerDay > 50) {
        recommendations.push("💉 Высокая суточная доза инсулина. Обсудите с врачом возможность корректировки.");
    }
    
    // Анализ стабильности глюкозы
    const glucoseVariations = weekData.map(day => {
        if (!day.glucoseRecords || day.glucoseRecords.length === 0) return 0;
        const glucoseLevels = day.glucoseRecords.map(r => r.glucose);
        return Math.max(...glucoseLevels) - Math.min(...glucoseLevels);
    }).filter(variation => variation > 0); // Фильтруем дни без измерений

    const avgVariation = glucoseVariations.length > 0 
        ? glucoseVariations.reduce((a, b) => a + b, 0) / glucoseVariations.length 
        : 0;

    if (avgVariation > 5) {
        recommendations.push("📈 Высокая вариация уровня глюкозы в течение дня. Старайтесь поддерживать более стабильный уровень.");
    }
    
    // Анализ времени приема пищи
    const mealTimes = weekData.flatMap(day => {
        if (!day.meals || day.meals.length === 0) return [];
        return day.meals.map(meal => new Date(meal.time).getHours());
    });
    
    const lateMeals = mealTimes.filter(hour => hour >= 22 || hour <= 5).length;
    if (lateMeals > 0) {
        recommendations.push("🌙 Обнаружены поздние приемы пищи. Старайтесь ужинать не позднее 20:00.");
    }
    
    // Анализ соотношения инсулин/углеводы
    const insulinCarbRatios = weekData.map(day => {
        if (!day.totalCarbs || day.totalCarbs === 0 || !day.totalInsulin) return 0;
        return day.totalInsulin / day.totalCarbs;
    }).filter(ratio => ratio > 0);
    
    if (insulinCarbRatios.length > 0) {
        const avgRatio = insulinCarbRatios.reduce((a, b) => a + b, 0) / insulinCarbRatios.length;
        if (avgRatio > 0.5) {
            recommendations.push("⚖️ Высокое соотношение инсулин/углеводы. Возможно, стоит пересмотреть углеводный коэффициент.");
        } else if (avgRatio < 0.1) {
            recommendations.push("⚖️ Низкое соотношение инсулин/углеводы. Проверьте правильность расчета доз инсулина.");
        }
    }
    
    // Положительные рекомендации
    if (recommendations.length === 0) {
        recommendations.push("✅ Отличный контроль! Продолжайте в том же духе.");
    } else if (avgGlucoseRec >= 4 && avgGlucoseRec <= 8 && avgVariation <= 5) {
        recommendations.push("✅ Хороший контроль уровня глюкозы! Старайтесь поддерживать такую же стабильность.");
    }
    
    // Добавляем общие рекомендации
    recommendations.push("💡 Регулярно консультируйтесь с врачом для корректировки терапии.");
    recommendations.push("📱 Используйте приложение для ежедневного мониторинга показателей.");
    
    recommendations.forEach(rec => {
        const div = document.createElement('div');
        div.className = "p-2 bg-gray-50 rounded dark:bg-slate-700 dark:text-gray-300";
        div.textContent = rec;
        recListEl.appendChild(div);
    });

}

// --- MODAL HANDLING ---
function openModal(modalElement) { modalElement.classList.add('show'); }
function closeModal(modalElement) { modalElement.classList.remove('show'); }

// Add Product Modal
document.getElementById('showAddProductModalBtn').addEventListener('click', () => {
    editingProductId = null;
    document.getElementById('addProductModalTitle').textContent = 'Добавить продукт';
    document.getElementById('addProductSubmitBtn').textContent = 'Добавить';
    document.getElementById('addProductForm').reset();
    openModal(addProductModalEl);
});
document.getElementById('cancelAddProductBtn').addEventListener('click', () => closeModal(addProductModalEl));
document.getElementById('addProductForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('newProductName').value;
    const carbs = parseFloat(document.getElementById('newProductCarbs').value);
    const insulinRatio = parseFloat(document.getElementById('newProductInsulinRatio').value);

    if (name && !isNaN(carbs) && !isNaN(insulinRatio)) {
        if (editingProductId) {
            products = products.map(p => p.id === editingProductId ? { id: editingProductId, name, carbs, insulinRatio } : p);
        } else {
            products.push({ id: Date.now(), name, carbs, insulinRatio });
        }
        saveData();
        if (currentView === 'products') renderProductsView();
        if (currentView === 'calendar') renderNewMealProductOptions(); 
        lucide.createIcons(); 
        closeModal(addProductModalEl);
    } else {
        showAlertPopup('Заполните все поля корректно.', 'error');
    }
});

function openEditProductModal(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        editingProductId = id;
        document.getElementById('addProductModalTitle').textContent = 'Редактировать продукт';
        document.getElementById('addProductSubmitBtn').textContent = 'Сохранить';
        document.getElementById('editingProductId').value = product.id;
        document.getElementById('newProductName').value = product.name;
        document.getElementById('newProductCarbs').value = product.carbs;
        document.getElementById('newProductInsulinRatio').value = product.insulinRatio;
        openModal(addProductModalEl);
    }
}

function deleteProduct(id) {
    showConfirmPopup('Вы уверены, что хотите удалить этот продукт?', (confirmed) => {
        if (confirmed) {
            products = products.filter(p => p.id !== id);
            saveData();
            if (currentView === 'products') renderProductsView();
            if (currentView === 'calendar') renderNewMealProductOptions(); 
            lucide.createIcons();
        }
    });
}

// Add Meal Modal
document.getElementById('showAddMealModalBtn').addEventListener('click', () => {
    newMealFormState.products = [];
    document.getElementById('addMealForm').reset();
    renderNewMealProductOptions();
    renderNewMealProductsList(); 
    openModal(addMealModalEl);
});
document.getElementById('cancelAddMealBtn').addEventListener('click', () => closeModal(addMealModalEl));

function renderNewMealProductOptions() {
    const selectEl = document.getElementById('newMealSelectedProduct');
    selectEl.innerHTML = '<option value="">Выберите продукт</option>';
    products.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.name;
        selectEl.appendChild(option);
    });
}

function renderNewMealProductsList() {
    const listContainer = document.getElementById('newMealProductsList');
    const listContainerWrapper = document.getElementById('newMealProductsListContainer');
    const calculationEl = document.getElementById('newMealCalculation');
    listContainer.innerHTML = '';

    if (newMealFormState.products.length === 0) {
        listContainerWrapper.style.display = 'none';
        calculationEl.style.display = 'none';
        return;
    }
    listContainerWrapper.style.display = 'block';

    newMealFormState.products.forEach((item, index) => {
        const productDetails = products.find(p => p.id === item.id);
        const itemEl = document.createElement('div');
        itemEl.className = "flex justify-between items-center bg-gray-50 p-2 rounded dark:bg-slate-700 dark:text-gray-300";
        itemEl.innerHTML = `
            <span>${productDetails ? productDetails.name : 'Неизвестный'} - ${item.amount}г</span>
            <button type="button" data-remove-idx="${index}" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        `;
        itemEl.querySelector('button').addEventListener('click', () => {
            newMealFormState.products.splice(index, 1);
            renderNewMealProductsList();
        });
        listContainer.appendChild(itemEl);
    });
    lucide.createIcons();
    
    const stats = calculateMealStats(newMealFormState.products);
    calculationEl.innerHTML = `
        <i data-lucide="calculator" class="w-4 h-4 inline mr-2"></i>
        <strong>Расчет:</strong> ${stats.carbs}г углеводов, ${stats.breadUnits} ХЕ, ${stats.insulin} ед инсулина
    `;
    calculationEl.style.display = 'block';
    lucide.createIcons();
}

document.getElementById('addProductToMealBtn').addEventListener('click', () => {
    const productId = parseInt(document.getElementById('newMealSelectedProduct').value);
    const amount = parseFloat(document.getElementById('newMealProductAmount').value);

    if (!productId) { 
        showAlertPopup('Пожалуйста, выберите продукт', 'error'); 
        return; 
    }
    if (isNaN(amount) || amount <= 0) { 
        showAlertPopup('Пожалуйста, укажите корректный вес продукта', 'error'); 
        return; 
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) { 
        showAlertPopup('Продукт не найден', 'error'); 
        return; 
    }

    newMealFormState.products.push({ id: product.id, amount });
    renderNewMealProductsList();
    document.getElementById('newMealSelectedProduct').value = '';
    document.getElementById('newMealProductAmount').value = '';
});

document.getElementById('addMealForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const time = document.getElementById('newMealTime').value;
    const actualInsulin = parseFloat(document.getElementById('newMealActualInsulin').value) || 0;
    const notes = document.getElementById('newMealNotes').value;

    if (!time) { showAlertPopup('Укажите время приема пищи.', 'error'); return; }
    if (newMealFormState.products.length === 0) { showAlertPopup('Добавьте хотя бы один продукт.', 'error'); return; }

    const dayMealsData = getDayMeals(selectedDate);
    const newMealEntry = {
        id: Date.now(),
        time,
        products: [...newMealFormState.products], 
        actualInsulin,
        notes
    };
    
    meals[selectedDate] = [...dayMealsData, newMealEntry].sort((a, b) => a.time.localeCompare(b.time));
    saveData();
    if (currentView === 'calendar') renderCalendarView(); 
    else if (currentView === 'analytics' || currentView === 'reports') renderView(); 
    lucide.createIcons();
    closeModal(addMealModalEl);
});

function deleteMeal(mealId) {
     showConfirmPopup('Вы уверены, что хотите удалить этот прием пищи?', (confirmed) => {
         if (confirmed) {
             const dayMealsData = getDayMeals(selectedDate);
             meals[selectedDate] = dayMealsData.filter(m => m.id !== mealId);
             if (meals[selectedDate].length === 0) delete meals[selectedDate];
             saveData();
             if (currentView === 'calendar') renderCalendarView();
             else if (currentView === 'analytics' || currentView === 'reports') renderView();
             lucide.createIcons();
         }
     });
}

// Add Glucose Modal
document.getElementById('showAddGlucoseModalBtn').addEventListener('click', () => {
    document.getElementById('addGlucoseForm').reset();
    openModal(addGlucoseModalEl);
});
document.getElementById('cancelAddGlucoseBtn').addEventListener('click', () => closeModal(addGlucoseModalEl));
document.getElementById('addGlucoseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const time = document.getElementById('newGlucoseTime').value;
    const glucoseLevel = parseFloat(document.getElementById('newGlucoseLevel').value);
    const type = document.getElementById('newGlucoseType').value;
    const notes = document.getElementById('newGlucoseNotes').value;

    if (time && !isNaN(glucoseLevel)) {
        const dayGlucoseData = getDayGlucose(selectedDate);
        glucoseRecords[selectedDate] = [
            ...dayGlucoseData, 
            { id: Date.now(), time, glucose: glucoseLevel, type, notes }
        ].sort((a, b) => a.time.localeCompare(b.time));
        saveData();
        if (currentView === 'calendar') renderCalendarView();
        else if (currentView === 'analytics' || currentView === 'reports') renderView();
        lucide.createIcons();
        closeModal(addGlucoseModalEl);
    } else {
        showAlertPopup('Укажите время и уровень глюкозы.', 'error');
    }
});

function deleteGlucose(recordId) {
    showConfirmPopup('Вы уверены, что хотите удалить это измерение глюкозы?', (confirmed) => {
        if (confirmed) {
            const dayGlucoseData = getDayGlucose(selectedDate);
            glucoseRecords[selectedDate] = dayGlucoseData.filter(r => r.id !== recordId);
            if (glucoseRecords[selectedDate].length === 0) delete glucoseRecords[selectedDate];
            saveData();
            if (currentView === 'calendar') renderCalendarView();
            else if (currentView === 'analytics' || currentView === 'reports') renderView();
            lucide.createIcons();
        }
    });
}

// --- EVENT LISTENERS ---
navigationButtons.addEventListener('click', (e) => {
    const button = e.target.closest('.nav-button');
    if (button && button.dataset.view) {
        currentView = button.dataset.view;
        renderView();
    }
});

darkModeToggleBtn.addEventListener('click', toggleTheme);

if (correctPredictionBtnEl) {
    correctPredictionBtnEl.addEventListener('click', () => {
        const nowTime = new Date().toTimeString().substring(0,5);
        document.getElementById('addGlucoseForm').reset();
        document.getElementById('newGlucoseTime').value = nowTime;
        document.getElementById('newGlucoseType').value = 'random'; 
        openModal(addGlucoseModalEl);
    });
}

// --- EXPORT/IMPORT FUNCTIONALITY ---
document.getElementById('exportDayDataBtn').addEventListener('click', () => {
    const dayMealsData = getDayMeals(selectedDate);
    const dayGlucoseData = getDayGlucose(selectedDate);

    if (dayMealsData.length === 0 && dayGlucoseData.length === 0) {
        showAlertPopup('Нет данных для экспорта за выбранный день.', 'info');
        return;
    }

    const dataToExport = {
        date: selectedDate, // selectedDate is already local YYYY-MM-DD
        meals: dayMealsData,
        glucoseRecords: dayGlucoseData
    };

    const jsonData = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary_day_data_${selectedDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.getElementById('exportAllDataBtn').addEventListener('click', () => {
    const allDataToExport = {
        allData: { 
            products: products,
            meals: meals, // meals keys are local YYYY-MM-DD
            glucoseRecords: glucoseRecords // glucoseRecords keys are local YYYY-MM-DD
        }
    };
    const jsonData = JSON.stringify(allDataToExport, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary_all_data_${getLocalDateYYYYMMDD(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showAlertPopup('Все данные экспортированы.', 'success');
});

document.getElementById('importDataBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData && importedData.allData) { 
                    showConfirmPopup("Это приведет к полной замене всех существующих данных. Продолжить?", (confirmed) => {
                        if (confirmed) {
                            if (importedData.allData.meals) meals = importedData.allData.meals; else meals = {};
                            if (importedData.allData.glucoseRecords) glucoseRecords = importedData.allData.glucoseRecords; else glucoseRecords = {};
                            if (importedData.allData.products) products = importedData.allData.products; else products = [];
                            showAlertPopup('Все данные импортированы и заменены.', 'success');
                        } else {
                            showAlertPopup('Импорт отменен.', 'info');
                            event.target.value = null; 
                            return;
                        }
                    });
                } else if (importedData && importedData.date && (importedData.meals || importedData.glucoseRecords)) { 
                    const dateToImport = importedData.date; // Assume this is local YYYY-MM-DD from export
                    if (importedData.meals) {
                        const existingMeals = meals[dateToImport] || [];
                        const newMeals = importedData.meals.filter(im => !existingMeals.some(em => em.id === im.id)); // Avoid duplicates by ID
                        meals[dateToImport] = [...existingMeals, ...newMeals].sort((a, b) => a.time.localeCompare(b.time));
                    }
                    if (importedData.glucoseRecords) {
                         const existingGlucose = glucoseRecords[dateToImport] || [];
                         const newGlucose = importedData.glucoseRecords.filter(ig => !existingGlucose.some(eg => eg.id === ig.id)); // Avoid duplicates by ID
                        glucoseRecords[dateToImport] = [...existingGlucose, ...newGlucose].sort((a, b) => a.time.localeCompare(b.time));
                    }
                    selectedDate = dateToImport; // Switch to the imported day
                    showAlertPopup(`Данные за ${formatDate(dateToImport)} импортированы и объединены.`, 'success');
                } else {
                    showAlertPopup('Неверный формат файла. Ожидается JSON с корректными полями.', 'error');
                }
                saveData();
                renderView(); 
                lucide.createIcons();
            } catch (error) {
                console.error("Error parsing imported JSON:", error);
                alert('Ошибка при чтении файла. Убедитесь, что это корректный JSON файл.');
            }
            event.target.value = null; 
        };
        reader.readAsText(file);
    }
});


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme); 
    renderView(); 
});
// --- END OF DIARY APP JavaScript ---

// Add event listeners for new calendar navigation buttons (will be added in HTML)
document.getElementById('prevMonthBtn').addEventListener('click', goToPreviousMonth);
document.getElementById('nextMonthBtn').addEventListener('click', goToNextMonth);
document.getElementById('todayBtn').addEventListener('click', goToToday);

// New functions for calendar navigation
function goToPreviousMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendarView();
}

function goToNextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendarView();
}

function goToToday() {
    currentCalendarDate = new Date(); // Set to local 'today'
    renderCalendarView();
}

// Функция для показа кастомного алерта
function showAlertPopup(message, type = 'info') {
    const alertPopup = document.createElement('div');
    alertPopup.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-xs ${
        type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-800/80 dark:text-red-300' : 
        type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800/80 dark:text-green-300' : 
        'bg-blue-100 text-blue-800 dark:bg-blue-800/80 dark:text-blue-300'
    }`;
    alertPopup.innerHTML = `
        <div class="flex items-start">
            <i data-lucide="${
                type === 'error' ? 'alert-triangle' : 
                type === 'success' ? 'check-circle' : 'info'
            }" class="w-5 h-5 mr-2 mt-0.5"></i>
            <div>${message}</div>
            <button class="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;
    document.body.appendChild(alertPopup);
    lucide.createIcons();

    // Удаление попапа через 5 секунд или по клику
    const closeBtn = alertPopup.querySelector('button');
    closeBtn.addEventListener('click', () => alertPopup.remove());
    setTimeout(() => alertPopup.remove(), 5000);
}

// Функция для показа кастомного подтверждения
function showConfirmPopup(message, callback) {
    const confirmPopup = document.createElement('div');
    confirmPopup.className = 'fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4';
    confirmPopup.innerHTML = `
        <div class="bg-white rounded-xl p-6 w-full max-w-md dark:bg-slate-800">
            <div class="flex items-start mb-4">
                <i data-lucide="alert-circle" class="w-6 h-6 mr-2 text-yellow-500 dark:text-yellow-400"></i>
                <div class="text-gray-800 dark:text-gray-200">${message}</div>
            </div>
            <div class="flex justify-end space-x-3">
                <button id="confirmNo" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500">
                    Нет
                </button>
                <button id="confirmYes" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                    Да
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmPopup);
    lucide.createIcons();

    const removePopup = () => {
        confirmPopup.remove();
    };

    confirmPopup.querySelector('#confirmYes').addEventListener('click', () => {
        callback(true);
        removePopup();
    });

    confirmPopup.querySelector('#confirmNo').addEventListener('click', () => {
        callback(false);
        removePopup();
    });
}

// --- НОВЫЙ КОД ДЛЯ НАСТРОЕК ИИ-ПОМОЩНИКА ---

// Константы для ключей в localStorage
const GEMINI_API_KEY = 'diaryApp_geminiApiKey';
const LM_STUDIO_URL = 'diaryApp_lmStudioUrl';

// Получение элементов DOM
const showAiSettingsModalBtn = document.getElementById('showAiSettingsModalBtn');
const cancelAiSettingsBtn = document.getElementById('cancelAiSettingsBtn');
const aiSettingsForm = document.getElementById('aiSettingsForm');
const geminiApiKeyInput = document.getElementById('geminiApiKey');
const lmStudioUrlInput = document.getElementById('lmStudioUrl');

// Функция открытия модального окна
function openAiSettingsModal() {
    // Загружаем сохраненные значения
    geminiApiKeyInput.value = localStorage.getItem(GEMINI_API_KEY) || '';
    lmStudioUrlInput.value = localStorage.getItem(LM_STUDIO_URL) || '';
    
    // Открываем окно
    openModal(aiSettingsModalEl);
    lucide.createIcons(); // Обновляем иконки внутри модального окна
}

// Функция сохранения настроек
function saveAiSettings(event) {
    event.preventDefault(); // Предотвращаем стандартную отправку формы

    const geminiKey = geminiApiKeyInput.value.trim();
    const lmStudioUrl = lmStudioUrlInput.value.trim();

    // Сохраняем в localStorage
    localStorage.setItem(GEMINI_API_KEY, geminiKey);
    localStorage.setItem(LM_STUDIO_URL, lmStudioUrl);

    // Закрываем окно и показываем уведомление
    closeModal(aiSettingsModalEl);
    showAlertPopup('Настройки ИИ-помощника сохранены!', 'success');
}

// Навешиваем обработчики событий
if (showAiSettingsModalBtn) {
    showAiSettingsModalBtn.addEventListener('click', openAiSettingsModal);
}

if (cancelAiSettingsBtn) {
    cancelAiSettingsBtn.addEventListener('click', () => closeModal(aiSettingsModalEl));
}

if (aiSettingsForm) {
    aiSettingsForm.addEventListener('submit', saveAiSettings);
}
if (requestAiPredictionBtn) {
    requestAiPredictionBtn.addEventListener('click', async () => {
        // 1. Показываем состояние загрузки
        aiPredictionResultText.style.display = 'block';
        aiPredictionResultText.innerHTML = `
            <div class="flex items-center justify-center">
                <i data-lucide="loader-2" class="w-5 h-5 mr-2 animate-spin"></i>
                <span>Анализирую данные и связываюсь с ИИ...</span>
            </div>
        `;
        lucide.createIcons();

        // 2. Собираем все необходимые данные для промпта
        const coeffs = {
            carbRatio: localStorage.getItem(CR_KEY),
            sensitivityFactor: localStorage.getItem(SF_KEY),
            targetSugar: localStorage.getItem(TS_KEY)
        };
        
        if (!coeffs.carbRatio || !coeffs.sensitivityFactor) {
            aiPredictionResultText.innerHTML = `Пожалуйста, сначала установите ваши индивидуальные коэффициенты в калькуляторе.`;
            return;
        }

        const dataForPrompt = {
            selectedDate,
            meals: getDayMeals(selectedDate),
            glucoseRecords: getDayGlucose(selectedDate),
            coeffs: {
                carbRatio: parseFloat(coeffs.carbRatio),
                sensitivityFactor: parseFloat(coeffs.sensitivityFactor),
                targetSugar: parseFloat(coeffs.targetSugar)
            }
        };

        // 3. Вызываем функцию из ai_predictor.js
        const result = await getAIPrediction(dataForPrompt);

        // 4. Отображаем результат
        if (result.success) {
            const { predicted_sugar, explanation, recommendation } = result.data;
            aiPredictionResultText.innerHTML = `
                <div class="mb-2">
                    <span class="font-bold text-lg ${getGlucoseColor(predicted_sugar)}">${predicted_sugar.toFixed(1)} ммоль/л</span>
                    <span class="text-gray-500 dark:text-gray-400">(прогноз ИИ)</span>
                </div>
                <p class="mb-2"><strong>Обоснование:</strong> ${explanation}</p>
                <p><strong>Рекомендация:</strong> ${recommendation}</p>
            `;
        } else {
            aiPredictionResultText.innerHTML = `<span class="text-red-500"><strong>Ошибка:</strong> ${result.error}</span>`;
        }
    });
}