// Функция для перевода текста с помощью Google Translate API
async function translateText(text, targetLang = 'ru', sourceLang = 'en') {
    try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        const data = await response.json();
        return data[0][0][0];
    } catch (error) {
        console.error('❌ Ошибка при переводе:', error);
        return text; // Возвращаем оригинальный текст в случае ошибки
    }
}

// Функция для поиска продуктов через API Open Food Facts или FoodData Central
async function searchProducts(query) {
    console.log('🔍 Начало поиска продуктов:', query);
    
    const selectedDatabase = document.querySelector('input[name="databaseSelect"]:checked').value;
    const autoTranslate = document.getElementById('autoTranslateCheckbox').checked;
    console.log('📚 Выбрана база данных:', selectedDatabase);
    console.log('🌐 Автоперевод:', autoTranslate ? 'включен' : 'выключен');

    try {
        let data;
        if (selectedDatabase === 'openfoodfacts') {
            const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`);
            data = await response.json();
            
            if (!data.products || data.products.length === 0) {
                console.log('❌ Продукты не найдены в Open Food Facts');
                return [];
            }

            // Преобразуем данные в нужный формат
            return data.products.map(product => ({
                id: product.code || Math.random().toString(36).substr(2, 9),
                name: product.product_name || 'Без названия',
                carbs: parseFloat(product.nutriments?.carbohydrates_100g) || 0,
                brand: product.brands || 'Не указан',
                image: product.image_url || null
            }));
        } else if (selectedDatabase === 'fooddatacentral') {
            // Переводим поисковый запрос с русского на английский, если включен автоперевод
            const searchQuery = autoTranslate ? await translateText(query, 'en', 'ru') : query;
            console.log('🌐 Поисковый запрос:', searchQuery);

            const apiKey = localStorage.getItem('foodDataCentralApiKey') || 'DEMO_KEY';
            const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}`);
            data = await response.json();
            
            if (!data.foods || data.foods.length === 0) {
                console.log('❌ Продукты не найдены в FoodData Central');
                return [];
            }

            // Преобразуем данные в нужный формат с переводом, если включен автоперевод
            const products = await Promise.all(data.foods.map(async food => {
                const carbs = food.foodNutrients?.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0;
                
                let name = food.description || 'Без названия';
                let brand = food.brandOwner || 'Не указан';
                
                if (autoTranslate) {
                    name = await translateText(name);
                    brand = await translateText(brand);
                }
                
                return {
                    id: food.fdcId.toString(),
                    name: name,
                    carbs: parseFloat(carbs) || 0,
                    brand: brand,
                    image: null // FoodData Central не предоставляет изображения
                };
            }));

            return products;
        }
    } catch (error) {
        console.error('❌ Ошибка при поиске продуктов:', error);
        showAlertPopup('Ошибка при поиске продуктов', 'error');
        return [];
    }
}

// Функция для отображения результатов поиска
function displaySearchResults(results) {
    console.log('🎯 Отображение результатов поиска:', results);
    
    const resultsContainer = document.getElementById('productSearchResults');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        console.log('❌ Нет результатов для отображения');
        resultsContainer.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-4">
                Продукты не найдены
            </div>
        `;
        return;
    }

    console.log('📋 Начинаем отображение', results.length, 'продуктов');
    
    results.forEach((product, index) => {
        console.log(`📦 Отображение продукта ${index + 1}:`, product);
        
        const productElement = document.createElement('div');
        productElement.className = 'bg-gray-50 dark:bg-slate-700 rounded-lg p-4 flex justify-between items-center';
        
        const imageHtml = product.image ? 
            `<img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-contain rounded-lg mr-4">` : 
            `<div class="w-16 h-16 bg-gray-200 dark:bg-slate-600 rounded-lg mr-4 flex items-center justify-center">
                <i data-lucide="package" class="w-8 h-8 text-gray-400"></i>
            </div>`;

        // Безопасное форматирование значения углеводов
        const carbsValue = typeof product.carbs === 'number' ? product.carbs.toFixed(1) : '0.0';

        productElement.innerHTML = `
            <div class="flex items-center flex-1">
                ${imageHtml}
                <div>
                    <h3 class="font-medium text-gray-800 dark:text-gray-100">${product.name}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Бренд: ${product.brand}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Углеводы: ${carbsValue}г на 100г
                    </p>
                </div>
            </div>
            <button class="add-product-btn bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors text-sm ml-4"
                    data-product-id="${product.id}">
                Добавить в базу
            </button>
        `;
        resultsContainer.appendChild(productElement);
    });

    console.log('✅ Все продукты отображены');

    // Добавляем обработчики для кнопок "Добавить"
    document.querySelectorAll('.add-product-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            console.log('🖱️ Нажата кнопка добавления продукта с ID:', productId);
            
            const product = results.find(p => p.id === productId);
            if (product) {
                console.log('📦 Найден продукт для добавления:', product);
                addProductToLocalDatabase(product);
            } else {
                console.error('❌ Продукт не найден для ID:', productId);
            }
        });
    });

    // Инициализируем иконки Lucide
    lucide.createIcons();
    console.log('✨ Иконки инициализированы');
}

// Функция для добавления продукта в базу данных
function addProductToLocalDatabase(product) {
    console.log('📝 Начало добавления продукта в базу:', product);
    
    // Получаем текущую базу продуктов
    const products = JSON.parse(localStorage.getItem('diabetesAppProducts') || '[]');
    console.log('📚 Текущее количество продуктов в базе:', products.length);
    
    // Проверяем, существует ли уже продукт с таким названием
    const existingProduct = products.find(p => p.name.toLowerCase() === product.name.toLowerCase());
    
    if (existingProduct) {
        console.log('⚠️ Продукт уже существует в базе:', existingProduct);
        showAlertPopup('Этот продукт уже есть в базе', 'warning');
        return existingProduct;
    }

    // Открываем модальное окно добавления продукта
    const modal = document.getElementById('addProductModal');
    const modalTitle = document.getElementById('addProductModalTitle');
    const productNameInput = document.getElementById('newProductName');
    const productCarbsInput = document.getElementById('newProductCarbs');
    const productInsulinRatioInput = document.getElementById('newProductInsulinRatio');
    const productBarcodeInput = document.getElementById('productBarcode');
    const addProductForm = document.getElementById('addProductForm');

    // Заполняем данные в форме
    modalTitle.textContent = 'Добавить продукт из поиска';
    productNameInput.value = product.name;
    productCarbsInput.value = product.carbs;
    productInsulinRatioInput.value = '1.0'; // Значение по умолчанию
    productBarcodeInput.value = product.id;

    // Показываем модальное окно
    modal.style.display = 'flex';

    // Обработчик отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Создаем новый продукт
        const newProduct = {
            id: Date.now(), // Используем timestamp как уникальный ID
            name: productNameInput.value,
            carbs: parseFloat(productCarbsInput.value),
            insulinRatio: parseFloat(productInsulinRatioInput.value),
            brand: product.brand,
            image: product.image,
            dateAdded: new Date().toISOString()
        };

        console.log('➕ Добавляем новый продукт:', newProduct);
        
        // Добавляем продукт в массив
        products.push(newProduct);
        
        // Сохраняем обновленный массив в localStorage
        localStorage.setItem('diabetesAppProducts', JSON.stringify(products));
        
        console.log('✅ Продукт успешно добавлен в базу');
        console.log('📚 Обновленное количество продуктов в базе:', products.length);
        
        // Закрываем модальное окно
        modal.style.display = 'none';
        
        // Очищаем форму
        addProductForm.reset();
        
        // Удаляем обработчик
        addProductForm.removeEventListener('submit', handleSubmit);
        
        // Обновляем отображение списка продуктов
        if (typeof renderProductsView === 'function') {
            renderProductsView();
        }
        
        showAlertPopup('Продукт добавлен в базу данных', 'success');
    };

    // Добавляем обработчик отправки формы
    addProductForm.addEventListener('submit', handleSubmit);

    // Обработчик кнопки отмены
    const cancelButton = document.getElementById('cancelAddProductBtn');
    const handleCancel = () => {
        modal.style.display = 'none';
        addProductForm.reset();
        addProductForm.removeEventListener('submit', handleSubmit);
        cancelButton.removeEventListener('click', handleCancel);
    };
    cancelButton.addEventListener('click', handleCancel);

    return null;
}

// Инициализация поиска
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('productSearchInput');
    const searchButton = document.getElementById('productSearchBtn');
    let searchTimeout;
    let isSearching = false;

    // Функция для выполнения поиска
    const performSearch = async () => {
        if (isSearching) return;
        
        const query = searchInput.value.trim();
        if (query) {
            isSearching = true;
            searchButton.disabled = true;
            searchButton.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>';
            lucide.createIcons();
            
            try {
                const results = await searchProducts(query);
                displaySearchResults(results);
            } finally {
                isSearching = false;
                searchButton.disabled = false;
                searchButton.innerHTML = '<i data-lucide="search" class="w-5 h-5"></i>';
                lucide.createIcons();
            }
        }
    };

    // Поиск при нажатии кнопки
    searchButton.addEventListener('click', performSearch);

    // Поиск при вводе с задержкой
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 500);
    });

    // Поиск при нажатии Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}); 