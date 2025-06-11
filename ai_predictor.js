// ai_predictor.js

// Константы для ключей в localStorage
const GEMINI_API_KEY_NAME = 'diaryApp_geminiApiKey';
const LM_STUDIO_URL_NAME = 'diaryApp_lmStudioUrl';
const DEEPSEEK_API_KEY_NAME = 'diaryApp_deepseekApiKey';
const CHATGPT_API_KEY_NAME = 'diaryApp_chatgptApiKey';
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
    const geminiApiKey = localStorage.getItem(GEMINI_API_KEY_NAME);
    const lmStudioUrl = localStorage.getItem(LM_STUDIO_URL_NAME);
    const deepseekApiKey = localStorage.getItem(DEEPSEEK_API_KEY_NAME);
    const chatgptApiKey = localStorage.getItem(CHATGPT_API_KEY_NAME);
    const defaultModel = localStorage.getItem(DEFAULT_MODEL_NAME) || 'gemini';
    const selectedLocalModel = localStorage.getItem(SELECTED_LOCAL_MODEL_NAME);

    if (!geminiApiKey && !lmStudioUrl && !deepseekApiKey && !chatgptApiKey) {
        return { success: false, error: "API для ИИ-помощника не настроен. Зайдите в настройки." };
    }

    const prompt = buildAIPrompt(dataForPrompt);
    
    try {
        let response;
        
        // Сначала пробуем использовать модель по умолчанию
        if (defaultModel === 'local' && lmStudioUrl) {
            try {
                response = await fetch(lmStudioUrl + "/chat/completions", {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        model: selectedLocalModel || "local-model",
                        messages: [{ "role": "user", "content": prompt }],
                        temperature: 0.7,
                        response_format: { "type": "json_object" }
                    })
                });
            } catch (error) {
                console.error("Ошибка при подключении к локальному серверу:", error);
                throw new Error(`Ошибка подключения к локальному серверу. Убедитесь, что:
                    1. LM Studio запущен и сервер активен
                    2. URL в настройках указан верно (http://localhost:1234/v1)
                    3. В LM Studio включен CORS (Settings -> Server -> Enable CORS)
                    4. Порт 1234 не занят другим приложением`);
            }
        } else if (defaultModel === 'chatgpt' && chatgptApiKey) {
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${chatgptApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: 'Вы - медицинский ассистент, специализирующийся на диабете. Ваша задача - анализировать данные о питании, уровне глюкозы и инсулине, чтобы давать точные прогнозы и рекомендации.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                })
            });
        } else if (defaultModel === 'deepseek' && deepseekApiKey) {
            response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${deepseekApiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: 'Вы - медицинский ассистент, специализирующийся на диабете. Ваша задача - анализировать данные о питании, уровне глюкозы и инсулине, чтобы давать точные прогнозы и рекомендации.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    stream: false
                })
            });
        } else if (defaultModel === 'gemini' && geminiApiKey) {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
        } else {
            // Если модель по умолчанию недоступна, пробуем другие
            if (chatgptApiKey) {
                response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${chatgptApiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4',
                        messages: [
                            {
                                role: 'system',
                                content: 'Вы - медицинский ассистент, специализирующийся на диабете. Ваша задача - анализировать данные о питании, уровне глюкозы и инсулине, чтобы давать точные прогнозы и рекомендации.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.7,
                        response_format: { type: "json_object" }
                    })
                });
            } else if (deepseekApiKey) {
                response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${deepseekApiKey}`
                    },
                    body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages: [
                            {
                                role: 'system',
                                content: 'Вы - медицинский ассистент, специализирующийся на диабете. Ваша задача - анализировать данные о питании, уровне глюкозы и инсулине, чтобы давать точные прогнозы и рекомендации.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        stream: false
                    })
                });
            } else if (geminiApiKey) {
                response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });
            } else if (lmStudioUrl) {
                try {
                    response = await fetch(lmStudioUrl + "/chat/completions", {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            model: "local-model",
                            messages: [{ "role": "user", "content": prompt }],
                            temperature: 0.7,
                            response_format: { "type": "json_object" }
                        })
                    });
                } catch (error) {
                    console.error("Ошибка при подключении к локальному серверу:", error);
                    throw new Error(`Ошибка подключения к локальному серверу. Убедитесь, что:
                        1. LM Studio запущен и сервер активен
                        2. URL в настройках указан верно (http://localhost:1234/v1)
                        3. В LM Studio включен CORS (Settings -> Server -> Enable CORS)
                        4. Порт 1234 не занят другим приложением`);
                }
            }
        }

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ошибка сети: ${response.status}. Ответ: ${errorBody}`);
        }

        const responseData = await response.json();
        
        // Парсим ответ в зависимости от API
        let aiContent;
        if (defaultModel === 'chatgpt' || (defaultModel !== 'gemini' && chatgptApiKey)) {
            aiContent = responseData.choices[0].message.content;
        } else if (defaultModel === 'deepseek' || (defaultModel !== 'gemini' && deepseekApiKey)) {
            aiContent = responseData.choices[0].message.content;
        } else if (defaultModel === 'gemini' || (defaultModel !== 'deepseek' && geminiApiKey)) {
            if (!responseData.candidates || responseData.candidates.length === 0) {
                throw new Error("Gemini API вернул пустой ответ (no candidates). Возможно, сработал фильтр безопасности.");
            }
            aiContent = responseData.candidates[0].content.parts[0].text;
        } else {
            aiContent = responseData.choices[0].message.content;
        }
        
        // Очищаем и парсим JSON из ответа
        const jsonString = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedResult = JSON.parse(jsonString);

        return { success: true, data: parsedResult };

    } catch (error) {
        console.error("Ошибка при запросе к ИИ:", error);
        let errorMessage = `Не удалось получить ответ от ИИ. ${error.message}`;
        
        // Добавляем более подробное сообщение для CORS ошибки
        if (error instanceof TypeError && error.message.includes('CORS')) {
            errorMessage = `<b>Ошибка CORS при подключении к локальному серверу.</b><br><br>
                <strong>Пожалуйста, проверьте:</strong>
                <ul>
                    <li class="mb-1">В LM Studio включен CORS (Settings -> Server -> Enable CORS)</li>
                    <li class="mb-1">URL в настройках указан верно (http://localhost:1234/v1)</li>
                    <li class="mb-1">LM Studio запущен и сервер активен</li>
                    <li>Порт 1234 не занят другим приложением</li>
                </ul>`;
        }
        // Добавляем более подробное сообщение для сетевой ошибки
        else if (error instanceof TypeError && error.message === 'Failed to fetch') {
            errorMessage = `<b>Сетевая ошибка: не удалось подключиться к серверу.</b><br><br>
                <strong>Пожалуйста, проверьте:</strong>
                <ul>
                    <li class="mb-1">LM Studio запущен и сервер активен</li>
                    <li class="mb-1">URL в настройках указан верно (http://localhost:1234/v1)</li>
                    <li>Не блокирует ли соединение ваш файрвол?</li>
                </ul>`;
        }
        return { success: false, error: errorMessage };
    }
}