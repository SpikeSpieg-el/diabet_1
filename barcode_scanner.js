// Функция для инициализации сканера штрих-кодов
function initBarcodeScanner() {
    console.log('Инициализация сканера штрих-кодов...');
    let barcodeInput = '';
    let lastKeyTime = 0;
    const barcodeTimeout = 100; // Увеличиваем таймаут до 100мс
    const minBarcodeLength = 8; // Минимальная длина штрих-кода

    document.addEventListener('keydown', function(event) {
        const currentTime = new Date().getTime();
        
        // Если прошло больше времени чем таймаут и длина ввода больше минимальной
        if (currentTime - lastKeyTime > barcodeTimeout && barcodeInput.length >= minBarcodeLength) {
            console.log('Сброс ввода штрих-кода из-за таймаута');
            barcodeInput = '';
        }
        
        // Обновляем время последнего нажатия
        lastKeyTime = currentTime;

        // Если нажат Enter, обрабатываем штрих-код
        if (event.key === 'Enter' && barcodeInput.length >= minBarcodeLength) {
            console.log('Получен штрих-код:', barcodeInput);
            handleBarcode(barcodeInput);
            barcodeInput = '';
            return;
        }

        // Добавляем только цифры к штрих-коду
        if (event.key.length === 1 && /^\d$/.test(event.key)) {
            barcodeInput += event.key;
            console.log('Текущий ввод штрих-кода:', barcodeInput);
        }
    });
    console.log('Сканер штрих-кодов инициализирован');
}

// Функция для проверки валидности штрих-кода
function isValidBarcode(barcode) {
    console.log('Проверка валидности штрих-кода:', barcode);
    
    // Проверка на EAN-13
    if (barcode.length === 13) {
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        const isValid = checkDigit === parseInt(barcode[12]);
        console.log('Результат проверки EAN-13:', isValid);
        return isValid;
    }
    // Проверка на EAN-8
    if (barcode.length === 8) {
        let sum = 0;
        for (let i = 0; i < 7; i++) {
            sum += parseInt(barcode[i]) * (i % 2 === 0 ? 3 : 1);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        const isValid = checkDigit === parseInt(barcode[7]);
        console.log('Результат проверки EAN-8:', isValid);
        return isValid;
    }
    console.log('Штрих-код не соответствует формату EAN-8 или EAN-13');
    return false;
}

// Функция для обработки штрих-кода
async function handleBarcode(barcode) {
    console.log('Начало обработки штрих-кода:', barcode);
    try {
        // Проверка валидности штрих-кода
        if (!isValidBarcode(barcode)) {
            console.warn('Неверный формат штрих-кода');
            showAlertPopup('Неверный формат штрих-кода', 'error');
            return;
        }

        // Пробуем получить данные из локального хранилища
        const localData = localStorage.getItem(`product_barcode_${barcode}`);
        if (localData) {
            console.log('Найдены данные в локальном хранилище:', localData);
            const productData = JSON.parse(localData);
            
            // Проверяем наличие углеводов
            if (!productData.carbs || productData.carbs === 0) {
                console.log('В локальном хранилище нет данных об углеводах, ищем в онлайн базах...');
                const onlineData = await searchProductInAllSources(barcode);
                if (onlineData && onlineData.carbs > 0) {
                    // Обновляем локальное хранилище
                    productData.carbs = onlineData.carbs;
                    productData.source = onlineData.source;
                    localStorage.setItem(`product_barcode_${barcode}`, JSON.stringify(productData));
                    console.log('Обновлены данные в локальном хранилище:', productData);
                }
            }
            
            // Если источник не указан, добавляем его
            if (!productData.source) {
                productData.source = 'локальная база';
            }
            
            fillProductForm(productData);
            return;
        }

        console.log('Поиск продукта в онлайн базах данных...');
        // Пробуем получить данные из разных источников
        const productData = await searchProductInAllSources(barcode);
        if (productData) {
            console.log('Продукт найден:', productData);
            // Сохраняем в локальное хранилище только если есть данные об углеводах
            if (productData.carbs > 0) {
                localStorage.setItem(`product_barcode_${barcode}`, JSON.stringify(productData));
                console.log('Данные сохранены в локальное хранилище');
            }
            // Заполняем форму
            fillProductForm(productData);
        } else {
            console.warn('Продукт не найден в базах данных');
            showAlertPopup('Продукт не найден в базах данных', 'error');
        }
    } catch (error) {
        console.error('Ошибка при обработке штрих-кода:', error);
        showAlertPopup('Ошибка при обработке штрих-кода', 'error');
    }
}

// Функция для поиска продукта во всех источниках
async function searchProductInAllSources(barcode) {
    console.log('Поиск продукта во всех источниках:', barcode);
    try {
        // 1. Пробуем получить из Роскачества
        console.log('Поиск в Роскачестве...');
        const roskachestvoData = await searchRoskachestvo(barcode);
        if (roskachestvoData) {
            console.log('Продукт найден в Роскачестве');
            return roskachestvoData;
        }

        // 2. Пробуем получить из OpenFoodFacts
        console.log('Поиск в OpenFoodFacts...');
        const openFoodFactsData = await searchOpenFoodFacts(barcode);
        if (openFoodFactsData) {
            console.log('Продукт найден в OpenFoodFacts');
            return openFoodFactsData;
        }

        console.log('Продукт не найден ни в одном источнике');
        return null;
    } catch (error) {
        console.error('Ошибка при поиске продукта:', error);
        return null;
    }
}

// Поиск в OpenFoodFacts
async function searchOpenFoodFacts(barcode) {
    try {
        console.log('Запрос к OpenFoodFacts API...');
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await response.json();
        console.log('Ответ от OpenFoodFacts:', data);

        if (data.status === 1 && data.product) {
            // Получаем данные о питательных веществах
            const nutriments = data.product.nutriments || {};
            
            // Пробуем получить углеводы из разных полей
            let carbs = 0;
            if (nutriments.carbohydrates_100g !== undefined) {
                carbs = nutriments.carbohydrates_100g;
            } else if (nutriments.carbohydrates !== undefined) {
                carbs = nutriments.carbohydrates;
            } else if (nutriments.carbs_100g !== undefined) {
                carbs = nutriments.carbs_100g;
            }

            // Получаем название продукта
            let name = data.product.product_name;
            if (!name && data.product.generic_name) {
                name = data.product.generic_name;
            }
            if (!name && data.product.brands) {
                name = data.product.brands;
            }

            // Если есть русское название, используем его
            if (data.product.product_name_ru) {
                name = data.product.product_name_ru;
            }

            console.log('Извлеченные данные:', { name, carbs });

            return {
                name: name || 'Неизвестный продукт',
                carbs: carbs || 0,
                barcode: barcode,
                source: 'OpenFoodFacts'
            };
        }
        return null;
    } catch (error) {
        console.error('Ошибка при поиске в OpenFoodFacts:', error);
        return null;
    }
}

// Поиск в Роскачестве
async function searchRoskachestvo(barcode) {
    try {
        console.log('Запрос к API Роскачества...');
        const response = await fetch(`https://rskrf.ru/rest/1/search/barcode?barcode=${barcode}`);
        const data = await response.json();
        console.log('Ответ от Роскачества:', data);

        if (data && data.items && data.items.length > 0) {
            const product = data.items[0];
            console.log('Найден продукт в Роскачестве:', product);

            // Извлекаем данные о питательных веществах
            let carbs = 0;
            if (product.nutritionFacts && product.nutritionFacts.carbohydrates) {
                carbs = product.nutritionFacts.carbohydrates;
            }

            return {
                name: product.name || 'Неизвестный продукт',
                carbs: carbs,
                barcode: barcode,
                source: 'Роскачество'
            };
        }
        console.log('Продукт не найден в Роскачестве');
        return null;
    } catch (error) {
        console.error('Ошибка при поиске в Роскачестве:', error);
        return null;
    }
}

// Функция для заполнения формы продукта
function fillProductForm(productData) {
    console.log('Заполнение формы продукта:', productData);
    const nameInput = document.getElementById('newProductName');
    const carbsInput = document.getElementById('newProductCarbs');
    
    if (nameInput && carbsInput) {
        nameInput.value = productData.name;
        carbsInput.value = productData.carbs;
        
        // Показываем уведомление об успешном сканировании
        const source = productData.source || 'локальная база';
        console.log('Заполнение формы завершено. Источник:', source);
        showAlertPopup(`Продукт "${productData.name}" успешно добавлен (источник: ${source})`, 'success');
    } else {
        console.error('Не найдены элементы формы для заполнения');
    }
}

// Инициализация сканера при загрузке страницы
document.addEventListener('DOMContentLoaded', initBarcodeScanner); 