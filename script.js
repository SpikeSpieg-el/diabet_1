// --- START OF CALCULATOR JavaScript (copied from code (5).html, window.onload removed) ---
const CR_KEY = 'diabetesCalcAdvPop_carbRatio'; 
const SF_KEY = 'diabetesCalcAdvPop_sensitivityFactor';
const TS_KEY = 'diabetesCalcAdvPop_targetSugar';

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
        alert('Коэффициенты сохранены!');
        loadSettingsToCalcForm(); 
    } else {
        alert('Пожалуйста, исправьте ошибки в значениях коэффициентов.');
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

// Theme Toggle
const darkModeToggleBtn = document.getElementById('darkModeToggle');

// --- DOM Elements for Prediction (New) ---
const predictedSugarSectionEl = document.getElementById('predictedSugarSection');
const predictedSugarDisplayEl = document.getElementById('predictedSugarDisplay');
const predictionContextEl = document.getElementById('predictionContext');
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
        carbs: totalCarbs.toFixed(1),
        breadUnits: (totalCarbs / 12).toFixed(1),
        insulin: totalInsulin.toFixed(1)
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
            return latestGlucoseBeforeMeal.glucose;
        }
    }
    return null;
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
    if (!predictedSugarSectionEl || !predictedSugarDisplayEl || !predictionContextEl) {
        console.error("Prediction UI elements not found.");
        return;
    }

    predictedSugarSectionEl.style.display = 'none'; 

    const todayLocalStr = getLocalDateYYYYMMDD(new Date());
    if (selectedDate !== todayLocalStr) { // Compare with local 'today'
        return; 
    }

    const dayMealsData = getDayMeals(selectedDate).sort((a, b) => b.time.localeCompare(a.time)); 
    if (dayMealsData.length === 0) {
        return; 
    }
    const latestMeal = dayMealsData[0];

    const mealDateTime = new Date(`${selectedDate}T${latestMeal.time}`); // selectedDate is local YYYY-MM-DD
    const currentTime = new Date();
    const hoursSinceMeal = (currentTime - mealDateTime) / (1000 * 60 * 60);

    if (hoursSinceMeal < 0 || hoursSinceMeal > 4) { 
        return;
    }
    
    if (isPredictionSuperseded(selectedDate, latestMeal.time)) {
        return; 
    }

    const sugarBeforeMeal = findSugarBeforeMeal(selectedDate, latestMeal.time);
    if (sugarBeforeMeal === null) {
        predictionContextEl.textContent = `Для прогноза нужно измерение сахара не более чем за 1.5ч до еды (${latestMeal.time}).`;
        predictedSugarDisplayEl.textContent = '---';
        predictedSugarSectionEl.style.display = 'block';
        lucide.createIcons();
        return;
    }

    const mealStats = calculateMealStats(latestMeal.products);
    const totalCarbs = parseFloat(mealStats.carbs);
    const actualInsulin = latestMeal.actualInsulin || 0; 

    const carbRatio = parseFloat(localStorage.getItem(CR_KEY));
    const sensitivityFactor = parseFloat(localStorage.getItem(SF_KEY));

    if (isNaN(carbRatio) || isNaN(sensitivityFactor)) {
        predictionContextEl.textContent = "Коэффициенты УК и ФЧИ не настроены в Калькуляторе.";
        predictedSugarDisplayEl.textContent = '---';
        predictedSugarSectionEl.style.display = 'block';
        lucide.createIcons();
        return;
    }
    
    const predictedSugar = calculateSugarPredictionLogic(sugarBeforeMeal, totalCarbs, actualInsulin, carbRatio, sensitivityFactor);

    if (predictedSugar !== null) {
        predictedSugarDisplayEl.innerHTML = `<span class="${getGlucoseColor(predictedSugar)}">${predictedSugar.toFixed(1)} ммоль/л</span> <span class="text-base font-normal text-gray-500 dark:text-gray-400">(прогноз)</span>`;
        const predictionValidUntil = new Date(mealDateTime.getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        predictionContextEl.textContent = `На основе: ${latestMeal.time} (до: ${sugarBeforeMeal} ммоль/л, ${totalCarbs.toFixed(0)}г У, ${actualInsulin.toFixed(1)} ед И). Актуально до ~${predictionValidUntil}.`;
        predictedSugarSectionEl.style.display = 'block';
    } else {
        predictionContextEl.textContent = "Недостаточно данных для прогноза.";
        predictedSugarDisplayEl.textContent = '---';
        predictedSugarSectionEl.style.display = 'block';
    }
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

function generateCalendarDays() {
    const today = new Date(); 
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; 

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
        const localDayDate = new Date(currentYear, currentMonth, day);
        const localDateString = getLocalDateYYYYMMDD(localDayDate); // Use local YYYY-MM-DD
        days.push({ date: localDateString, day });
    }
    return days;
}

function renderCalendarGrid() {
    const today = new Date();
    calendarHeaderEl.textContent = `${monthNames[today.getMonth()]} ${today.getFullYear()}`;
    
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
    const days = generateCalendarDays();
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
                ${meal.notes ? `<div class="mt-2 text-xs text-gray-600 dark:text-gray-300"><strong>Заметки:</strong> ${meal.notes}</div>` : ''}
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
    products.forEach(product => {
        const row = productsTableBodyEl.insertRow();
        row.className = "dark:border-slate-600"
        row.innerHTML = `
            <td class="border p-3 dark:border-slate-600">${product.name}</td>
            <td class="border p-3 dark:border-slate-600">${product.carbs}</td>
            <td class="border p-3 dark:border-slate-600">${product.insulinRatio}</td>
            <td class="border p-3 dark:border-slate-600">
                <div class="flex space-x-2">
                    <button data-edit-id="${product.id}" class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"><i data-lucide="edit" class="w-4 h-4"></i></button>
                    <button data-delete-id="${product.id}" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </td>
        `;
        row.querySelector(`button[data-edit-id="${product.id}"]`).addEventListener('click', () => openEditProductModal(product.id));
        row.querySelector(`button[data-delete-id="${product.id}"]`).addEventListener('click', () => deleteProduct(product.id));
    });
    lucide.createIcons();
}

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
    if (avgGlucoseRec > 8) recommendations.push("⚠️ Средний уровень глюкозы повышен. Проконсультируйтесь с врачом.");
    if (avgCarbsRec > 200) recommendations.push("📊 Высокое потребление углеводов. Рассмотрите снижение порций.");
    if (weekData.some(d => d.mealsCount < 3 && d.mealsCount > 0)) recommendations.push("🍽️ Некоторые дни с малым количеством приемов пищи. Старайтесь питаться регулярно.");
    if (recommendations.length === 0) recommendations.push("✅ Хороший контроль! Продолжайте в том же духе.");
    
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
        alert('Пожалуйста, заполните все поля корректно.');
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
    if (confirm('Вы уверены, что хотите удалить этот продукт?')) {
        products = products.filter(p => p.id !== id);
        saveData();
        if (currentView === 'products') renderProductsView();
        if (currentView === 'calendar') renderNewMealProductOptions(); 
        lucide.createIcons();
    }
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

    if (!productId) { alert('Пожалуйста, выберите продукт'); return; }
    if (isNaN(amount) || amount <= 0) { alert('Пожалуйста, укажите корректный вес продукта'); return; }
    
    const product = products.find(p => p.id === productId);
    if (!product) { alert('Продукт не найден'); return; }

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

    if (!time) { alert('Пожалуйста, укажите время приема пищи'); return; }
    if (newMealFormState.products.length === 0) { alert('Пожалуйста, добавьте хотя бы один продукт'); return; }

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
     if (confirm('Вы уверены, что хотите удалить этот прием пищи?')) {
        const dayMealsData = getDayMeals(selectedDate);
        meals[selectedDate] = dayMealsData.filter(m => m.id !== mealId);
        if (meals[selectedDate].length === 0) delete meals[selectedDate];
        saveData();
        if (currentView === 'calendar') renderCalendarView();
        else if (currentView === 'analytics' || currentView === 'reports') renderView();
        lucide.createIcons();
    }
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
        alert('Пожалуйста, укажите время и уровень глюкозы.');
    }
});

function deleteGlucose(recordId) {
    if (confirm('Вы уверены, что хотите удалить это измерение глюкозы?')) {
        const dayGlucoseData = getDayGlucose(selectedDate);
        glucoseRecords[selectedDate] = dayGlucoseData.filter(r => r.id !== recordId);
        if (glucoseRecords[selectedDate].length === 0) delete glucoseRecords[selectedDate];
        saveData();
        if (currentView === 'calendar') renderCalendarView();
        else if (currentView === 'analytics' || currentView === 'reports') renderView();
        lucide.createIcons();
    }
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
        alert('Нет данных для экспорта за выбранный день.');
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
    alert('Все данные экспортированы.');
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
                    if (confirm("Это приведет к полной замене всех существующих данных. Продолжить?")) {
                        if (importedData.allData.meals) meals = importedData.allData.meals; else meals = {};
                        if (importedData.allData.glucoseRecords) glucoseRecords = importedData.allData.glucoseRecords; else glucoseRecords = {};
                        if (importedData.allData.products) products = importedData.allData.products; else products = [];
                        alert('Все данные импортированы и заменены.');
                    } else {
                        alert('Импорт отменен.');
                        event.target.value = null; 
                        return;
                    }
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
                    alert(`Данные за ${formatDate(dateToImport)} импортированы и объединены.`);
                } else {
                    alert('Неверный формат файла. Ожидается JSON с полями "date", "meals", "glucoseRecords" для однодневного импорта, или "allData" для полного импорта.');
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
