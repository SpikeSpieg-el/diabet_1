// ai_predictor.js

// Константы для ключей в localStorage
const GEMINI_API_KEY_NAME = 'diaryApp_geminiApiKey';
const LM_STUDIO_URL_NAME = 'diaryApp_lmStudioUrl';

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

    if (!geminiApiKey && !lmStudioUrl) {
        return { success: false, error: "API для ИИ-помощника не настроен. Зайдите в настройки." };
    }

    const prompt = buildAIPrompt(dataForPrompt);
    
    try {
        let response;
        if (geminiApiKey) {
            // Используем Google Gemini API (стабильная версия v1)
            // ИСПРАВЛЕНИЕ: Имя модели изменено на 'gemini-2.0-flash' для корректной работы с API.
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
        } else {
            // Используем локальный сервер LM Studio (OpenAI-совместимый)
            response = await fetch(lmStudioUrl + "/chat/completions", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "local-model", // Это поле часто игнорируется, но может быть полезным
                    messages: [{ "role": "user", "content": prompt }],
                    temperature: 0.7,
                    // Примечание: для работы этого параметра загруженная в LM Studio модель должна поддерживать JSON-режим.
                    response_format: { "type": "json_object" } 
                })
            });
        }

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ошибка сети: ${response.status}. Ответ: ${errorBody}`);
        }

        const responseData = await response.json();
        
        // Парсим ответ в зависимости от API
        let aiContent;
        if (geminiApiKey) {
            // Handle potential empty candidates array
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
        // Добавляем более подробное сообщение для самой частой сетевой ошибки
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            errorMessage = `<b>Сетевая ошибка: не удалось подключиться к серверу.</b><br><br><strong>Пожалуйста, проверьте:</strong><ul><li class="mb-1">Запущен ли сервер в LM Studio?</li><li class="mb-1">Правильно ли указан URL в настройках? (Стандартный: <code>http://localhost:1234/v1</code>)</li><li>Не блокирует ли соединение ваш файрвол?</li></ul>`;
        }
        return { success: false, error: errorMessage };
    }
}