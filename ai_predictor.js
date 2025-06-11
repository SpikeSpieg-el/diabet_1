// ai_predictor.js

// Константы для ключей в localStorage
const GEMINI_API_KEY_NAME = 'diaryApp_geminiApiKey';
const LM_STUDIO_URL_NAME = 'diaryApp_lmStudioUrl';
const DEEPSEEK_API_KEY_NAME = 'diaryApp_deepseekApiKey';
const CHATGPT_API_KEY_NAME = 'diaryApp_chatgptApiKey';
const OPENROUTER_API_KEY_NAME = 'diaryApp_openrouterApiKey';
const OPENROUTER_MODEL_NAME = 'diaryApp_openrouterModel';
const DEFAULT_MODEL_NAME = 'diaryApp_defaultAiModel';
const SELECTED_LOCAL_MODEL_NAME = 'diaryApp_selectedLocalModel';

/**
 * Получает список доступных моделей с локального сервера
 * @param {string} baseUrl - Базовый URL сервера
 * @returns {Promise<string[]>} - Список доступных моделей
 */
async function getAvailableModels(baseUrl) {
    try {
        // Убираем /v1 из URL для запроса моделей
        const modelsUrl = baseUrl.replace('/v1', '') + '/models';
        console.log('Запрос моделей по URL:', modelsUrl);

        const response = await fetch(modelsUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            throw new Error(`Ошибка получения списка моделей: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Полученные модели:', data);
        
        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Неверный формат ответа от сервера');
        }

        return data.data.map(model => model.id);
    } catch (error) {
        console.error('Ошибка при получении списка моделей:', error);
        // Возвращаем список с вашей моделью по умолчанию
        return ['gemma-3-4b-it'];
    }
}

/**
 * Обновляет список доступных моделей в селекте
 * @param {string} baseUrl - Базовый URL сервера
 */
async function updateLocalModelsList(baseUrl) {
    const modelSelect = document.getElementById('localModelSelect');
    if (!modelSelect) return;

    try {
        modelSelect.innerHTML = '<option value="">Загрузка моделей...</option>';
        const models = await getAvailableModels(baseUrl);
        
        if (models.length === 0) {
            modelSelect.innerHTML = '<option value="">Нет доступных моделей</option>';
            return;
        }

        const selectedModel = localStorage.getItem(SELECTED_LOCAL_MODEL_NAME) || 'gemma-3-4b-it';
        
        modelSelect.innerHTML = models.map(model => 
            `<option value="${model}" ${model === selectedModel ? 'selected' : ''}>${model}</option>`
        ).join('');

        // Если выбранная модель не найдена в списке, выбираем первую доступную
        if (!models.includes(selectedModel)) {
            modelSelect.value = models[0];
            localStorage.setItem(SELECTED_LOCAL_MODEL_NAME, models[0]);
        }
    } catch (error) {
        console.error('Ошибка при обновлении списка моделей:', error);
        // В случае ошибки показываем вашу модель по умолчанию
        modelSelect.innerHTML = '<option value="gemma-3-4b-it" selected>gemma-3-4b-it</option>';
        localStorage.setItem(SELECTED_LOCAL_MODEL_NAME, 'gemma-3-4b-it');
    }
}

/**
 * Формирует промпт для языковой модели.
 * @param {object} data - Данные пользователя и дневника.
 * @returns {string} - Готовый промпт.
 */
function buildAIPrompt(data) {
    // Собираем события за последние 5 часов в хронологическом порядке
    const now = new Date();
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
    
    let timelineEvents = [];

    // Глюкоза
    if (data.glucoseRecords && data.glucoseRecords.length > 0) {
        data.glucoseRecords.forEach(record => {
            const recordTime = new Date(`${data.selectedDate}T${record.time}`);
            if (recordTime >= fiveHoursAgo) {
                timelineEvents.push({
                    time: record.time,
                    type: 'Измерение глюкозы',
                    details: `${record.glucose} ммоль/л. (${record.type === 'before' ? 'до еды' : record.type === 'after' ? 'после еды' : 'случайно'})`
                });
            }
        });
    }

    // Приемы пищи и инсулин
    if (data.meals && data.meals.length > 0) {
        data.meals.forEach(meal => {
            const mealTime = new Date(`${data.selectedDate}T${meal.time}`);
            if (mealTime >= fiveHoursAgo) {
                const mealStats = calculateMealStats(meal.products); // Эта функция должна быть доступна
                let mealDetails = `Съедено ${mealStats.carbs} г. углеводов.`;
                if (meal.actualInsulin && meal.actualInsulin > 0) {
                    mealDetails += ` Введено ${meal.actualInsulin} ед. инсулина.`;
                }
                timelineEvents.push({
                    time: meal.time,
                    type: 'Прием пищи',
                    details: mealDetails
                });
            }
        });
    }

    timelineEvents.sort((a, b) => a.time.localeCompare(b.time));

    const timelineString = timelineEvents.map(e => `- ${e.time}: ${e.type} - ${e.details}`).join('\n');

    const prompt = `
Ты — эксперт-ассистент эндокринолога, специализирующийся на управлении сахарным диабетом 1 типа. Твоя задача — проанализировать данные пациента и дать **приблизительный прогноз** уровня сахара в крови на **2 часа вперед** от текущего времени.

**ВАЖНО**: Всегда подчеркивай, что твой прогноз является оценочным и не заменяет реальное измерение глюкометром.

**Данные пациента:**
- Углеводный коэффициент (УК): ${data.coeffs.carbRatio} (ед. инсулина на 10г углеводов)
- Фактор чувствительности к инсулину (ФЧИ): ${data.coeffs.sensitivityFactor} (на сколько ммоль/л 1 ед. инсулина снижает сахар)
- Целевой сахар: ${data.coeffs.targetSugar} ммоль/л

**Хронология событий за последние 5 часов:**
Текущее время: ${now.toTimeString().substring(0, 5)}
${timelineString}

**Твоя задача:**
1.  **Проанализируй** предоставленные данные: учти время и количество съеденных углеводов, введенный инсулин, и как он должен действовать со временем (эффект ультракороткого инсулина длится около 4 часов). Учти "активный инсулин" (IOB) от недавних инъекций.
2.  **Сделай прогноз**: Рассчитай наиболее вероятный уровень сахара в крови через 2 часа от текущего времени.
3.  **Объясни свой прогноз**: Опиши логику своих рассуждений шаг за шагом. Например: "Учитывая съеденные углеводы, сахар должен был повыситься. Однако была введена доза инсулина, часть которой все еще активна. Мой прогноз основан на балансе этих факторов...".
4.  **Дай краткие рекомендации**: Например, "Рекомендуется измерить сахар через час для контроля" или "Риск гипогликемии низкий, но будьте внимательны".

**Формат ответа:**
Предоставь ответ строго в формате JSON. Не добавляй никаких других слов или форматирования до или после JSON.

\`\`\`json
{
  "predicted_sugar": (число),
  "explanation": "(текстовое объяснение твоей логики)",
  "recommendation": "(краткая рекомендация)"
}
\`\`\`
`;
    return prompt;
}


/**
 * Основная функция для получения прогноза от ИИ.
 * @param {object} dataForPrompt - Данные для формирования промпта.
 * @returns {Promise<object>} - Объект с результатом или ошибкой.
 */
async function getAIPrediction(dataForPrompt) {
    console.log('=== Отладка: Настройки ИИ ===');
    const defaultModel = localStorage.getItem('diaryApp_defaultAiModel') || '';
    const selectedLocalModel = localStorage.getItem('diaryApp_selectedLocalModel') || '';
    const lmStudioUrl = localStorage.getItem('diaryApp_lmStudioUrl') || '';
    const hasGeminiKey = !!localStorage.getItem('diaryApp_geminiApiKey');
    const hasDeepseekKey = !!localStorage.getItem('diaryApp_deepseekApiKey');
    const hasChatgptKey = !!localStorage.getItem('diaryApp_chatgptApiKey');
    const hasOpenrouterKey = !!localStorage.getItem('diaryApp_openrouterApiKey');
    
    console.log('Модель по умолчанию:', defaultModel);
    console.log('Выбранная локальная модель:', selectedLocalModel);
    console.log('URL LM Studio:', lmStudioUrl);
    console.log('Доступные API:', {
        gemini: hasGeminiKey,
        deepseek: hasDeepseekKey,
        chatgpt: hasChatgptKey,
        openrouter: hasOpenrouterKey,
        local: !!lmStudioUrl
    });

    // Строим промпт
    const prompt = buildAIPrompt(dataForPrompt);
    console.log('=== Отладка: Сформированный промпт ===');
    console.log(prompt);

    // Пробуем использовать модель по умолчанию
    if (defaultModel) {
        try {
            switch (defaultModel) {
                case 'gemini':
                    if (hasGeminiKey) {
                        return await getGeminiPrediction(prompt);
                    }
                    break;
                case 'deepseek':
                    if (hasDeepseekKey) {
                        return await getDeepseekPrediction(prompt);
                    }
                    break;
                case 'chatgpt':
                    if (hasChatgptKey) {
                        return await getChatgptPrediction(prompt);
                    }
                    break;
                case 'openrouter':
                    if (hasOpenrouterKey) {
                        return await getOpenrouterPrediction(prompt);
                    }
                    break;
                case 'local':
                    if (lmStudioUrl) {
                        return await getLocalPrediction(prompt, lmStudioUrl, selectedLocalModel);
                    }
                    break;
            }
        } catch (error) {
            console.error(`Ошибка при использовании модели по умолчанию (${defaultModel}):`, error);
        }
    }

    // Если модель по умолчанию недоступна или произошла ошибка,
    // пробуем использовать другие доступные модели
    const availableModels = [
        { name: 'openrouter', hasKey: hasOpenrouterKey, func: getOpenrouterPrediction },
        { name: 'deepseek', hasKey: hasDeepseekKey, func: getDeepseekPrediction },
        { name: 'chatgpt', hasKey: hasChatgptKey, func: getChatgptPrediction },
        { name: 'gemini', hasKey: hasGeminiKey, func: getGeminiPrediction },
        { name: 'local', hasKey: !!lmStudioUrl, func: () => getLocalPrediction(prompt, lmStudioUrl, selectedLocalModel) }
    ];

    for (const model of availableModels) {
        if (model.hasKey) {
            try {
                return await model.func(prompt);
            } catch (error) {
                console.error(`Ошибка при использовании модели ${model.name}:`, error);
            }
        }
    }

    throw new Error('Нет доступных моделей для прогноза');
}

/**
 * Основная функция для получения прогноза от модели Gemini.
 * @param {string} prompt - Готовый промпт для модели Gemini.
 * @returns {Promise<object>} - Объект с результатом или ошибкой.
 */
async function getGeminiPrediction(prompt) {
    const geminiApiKey = localStorage.getItem(GEMINI_API_KEY_NAME);
    if (!geminiApiKey) {
        return { success: false, error: "API для модели Gemini не настроен. Зайдите в настройки." };
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(content);

        return {
            success: true,
            data: {
                predicted_sugar: result.predicted_sugar,
                explanation: result.explanation || "Нет объяснения",
                recommendation: result.recommendation || "Нет рекомендаций"
            }
        };
    } catch (error) {
        console.error("Ошибка при запросе к Gemini API:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Основная функция для получения прогноза от модели DeepSeek.
 * @param {string} prompt - Готовый промпт для модели DeepSeek.
 * @returns {Promise<object>} - Объект с результатом или ошибкой.
 */
async function getDeepseekPrediction(prompt) {
    const deepseekApiKey = localStorage.getItem(DEEPSEEK_API_KEY_NAME);
    if (!deepseekApiKey) {
        return { success: false, error: "API для модели DeepSeek не настроен. Зайдите в настройки." };
    }

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepseekApiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const result = JSON.parse(content);

        return {
            success: true,
            data: {
                predicted_sugar: result.predicted_sugar,
                explanation: result.explanation || "Нет объяснения",
                recommendation: result.recommendation || "Нет рекомендаций"
            }
        };
    } catch (error) {
        console.error("Ошибка при запросе к DeepSeek API:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Основная функция для получения прогноза от модели ChatGPT.
 * @param {string} prompt - Готовый промпт для модели ChatGPT.
 * @returns {Promise<object>} - Объект с результатом или ошибкой.
 */
async function getChatgptPrediction(prompt) {
    const chatgptApiKey = localStorage.getItem(CHATGPT_API_KEY_NAME);
    if (!chatgptApiKey) {
        return { success: false, error: "API для модели ChatGPT не настроен. Зайдите в настройки." };
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${chatgptApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const result = JSON.parse(content);

        return {
            success: true,
            data: {
                predicted_sugar: result.predicted_sugar,
                explanation: result.explanation || "Нет объяснения",
                recommendation: result.recommendation || "Нет рекомендаций"
            }
        };
    } catch (error) {
        console.error("Ошибка при запросе к ChatGPT API:", error);
        return { success: false, error: error.message };
    }
}

async function getOpenrouterPrediction(prompt) {
    const openrouterApiKey = localStorage.getItem(OPENROUTER_API_KEY_NAME);
    const openrouterModel = localStorage.getItem(OPENROUTER_MODEL_NAME) || 'deepseek/deepseek-r1-0528-qwen3-8b:free';
    
    if (!openrouterApiKey) {
        return { success: false, error: "API для OpenRouter не настроен. Зайдите в настройки." };
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openrouterApiKey}`,
                'HTTP-Referer': window.location.origin
            },
            body: JSON.stringify({
                model: openrouterModel,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Извлекаем JSON из ответа, удаляя markdown форматирование
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (!jsonMatch) {
            throw new Error('Не удалось найти JSON в ответе');
        }
        
        const result = JSON.parse(jsonMatch[1]);

        return {
            success: true,
            data: {
                predicted_sugar: result.predicted_sugar,
                explanation: result.explanation || "Нет объяснения",
                recommendation: result.recommendation || "Нет рекомендаций"
            }
        };
    } catch (error) {
        console.error("Ошибка при запросе к OpenRouter API:", error);
        return { success: false, error: error.message };
    }
}

async function getLocalPrediction(prompt, baseUrl, modelName) {
    if (!baseUrl) {
        return { success: false, error: "URL локального сервера не настроен. Зайдите в настройки." };
    }

    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: modelName || 'local-model',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const result = JSON.parse(content);

        return {
            success: true,
            data: {
                predicted_sugar: result.predicted_sugar,
                explanation: result.explanation || "Нет объяснения",
                recommendation: result.recommendation || "Нет рекомендаций"
            }
        };
    } catch (error) {
        console.error("Ошибка при запросе к локальному серверу:", error);
        return { success: false, error: error.message };
    }
}