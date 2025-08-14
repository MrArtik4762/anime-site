# Клиентская безопасность

## Обзор

Документ описывает клиентские компоненты безопасности, созданные для защиты веб-приложения от различных угроз, включая XSS, CSRF и другие атаки.

## Компоненты

### 1. sanitizeInput.js

**Путь:** `client/src/utils/sanitizeInput.js`

**Описание:** Утилиты для очистки и валидации пользовательского ввода.

#### Функции:

- `validateInput(fieldName, value)` - Валидация ввода по имени поля
- `sanitizeInput(input)` - Очистка ввода от XSS и SQL инъекций
- `isXSSAttempt(input)` - Проверка на попытку XSS атаки
- `isSQLInjectionAttempt(input)` - Проверка на попытку SQL инъекции
- `createSafeElement(html)` - Создание безопасного DOM элемента
- `validateEmail(email)` - Валидация email адреса
- `validateUrl(url)` - Валидация URL
- `validateUsername(username)` - Валидация имени пользователя

#### Использование:

```javascript
import { validateInput, sanitizeInput } from '../utils/sanitizeInput';

// Валидация
const validation = validateInput('email', 'test@example.com');
if (!validation.isValid) {
  console.error(validation.error);
}

// Очистка
const cleanInput = sanitizeInput('<script>alert("xss")</script>');
// Результат: '<script>alert("xss")</script>'
```

### 2. SafeContent.jsx

**Путь:** `client/src/components/common/SafeContent.jsx`

**Описание:** Компоненты для безопасного отображения контента с защитой от XSS.

#### Компоненты:

- `SafeContent` - Основной компонент для безопасного отображения контента
- `SafeLink` - Компонент для безопасных ссылок
- `SafeImage` - Компонент для безопасных изображений
- `withXSSProtection` - HOC для защиты компонентов от XSS

#### Свойства:

**SafeContent:**
- `children` - Дети для отображения
- `as` - HTML тег (по умолчанию 'div')
- `className` - CSS классы
- `allowedTags` - Разрешенные HTML теги

**SafeLink:**
- `href` - URL ссылки
- `children` - Дети ссылки
- `className` - CSS классы
- `target` - Атрибут target
- `rel` - Атрибут rel

**SafeImage:**
- `src` - URL изображения
- `alt` - Альтернативный текст
- `className` - CSS классы

#### Использование:

```jsx
import { SafeContent, SafeLink, SafeImage, withXSSProtection } from '../components/common/SafeContent';

// Безопасное отображение контента
<SafeContent>
  <p>Безопасный контент с <b>HTML</b> тегами</p>
</SafeContent>

// Безопасная ссылка
<SafeLink href="https://example.com">Безопасная ссылка</SafeLink>

// Безопасное изображение
<SafeImage src="https://example.com/image.jpg" alt="Описание" />

// Защита компонента
const ProtectedComponent = withXSSProtection(MyComponent);
```

### 3. SafeForm.jsx

**Путь:** `client/src/components/common/SafeForm.jsx`

**Описание:** Компоненты для безопасных форм с защитой от CSRF и XSS.

#### Компоненты:

- `SafeForm` - Основной компонент для безопасных форм
- `SafeInput` - Компонент для безопасных полей ввода
- `SafeTextarea` - Компонент для безопасных текстовых областей
- `withFormProtection` - HOC для защиты форм

#### Свойства:

**SafeForm:**
- `onSubmit` - Функция обработки отправки
- `children` - Дети формы
- `className` - CSS классы
- `method` - HTTP метод
- `action` - URL отправки
- `enableCSRF` - Включить CSRF защиту (по умолчанию true)
- `enableXSSProtection` - Включить XSS защиту (по умолчанию true)

**SafeInput/SafeTextarea:**
- `name` - Имя поля
- `value` - Значение поля
- `onChange` - Обработчик изменения
- `className` - CSS классы
- `validate` - Включить валидацию (по умолчанию true)
- `required` - Обязательное поле
- `pattern` - Регулярное выражение для валидации
- `minLength`/`maxLength` - Минимальная/максимальная длина

#### Использование:

```jsx
import { SafeForm, SafeInput, SafeTextarea } from '../components/common/SafeForm';

// Безопасная форма
<SafeForm onSubmit={handleSubmit}>
  <SafeInput 
    name="email" 
    label="Email" 
    type="email" 
    required 
  />
  <SafeTextarea 
    name="message" 
    label="Сообщение" 
    required 
    minLength={10}
  />
  <button type="submit">Отправить</button>
</SafeForm>
```

### 4. apiClient.js

**Путь:** `client/src/services/apiClient.js`

**Описание:** Безопасный API клиент с защитой от CSRF, CORS и других угроз.

#### Функции:

- `get(url, config)` - GET запрос
- `post(url, data, config)` - POST запрос
- `put(url, data, config)` - PUT запрос
- `patch(url, data, config)` - PATCH запрос
- `delete(url, config)` - DELETE запрос
- `uploadFile(url, file, onProgress, config)` - Загрузка файла

#### Особенности:

- Автоматическая обработка CSRF токенов
- Очистка параметров и данных запроса
- Проверка на подозрительные ответы
- Перехватчики запросов и ответов
- Обработка ошибок аутентификации

#### Использование:

```javascript
import apiClient from '../services/apiClient';

// GET запрос
apiClient.get('/api/users')
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

// POST запрос
apiClient.post('/api/users', { name: 'John', email: 'john@example.com' })
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

// Загрузка файла
apiClient.uploadFile('/api/upload', file, (progress) => {
  console.log(`Загрузка: ${progress}%`);
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

## Безопасные практики

### 1. Защита от XSS

- Всегда используйте компоненты `SafeContent`, `SafeLink`, `SafeImage` для отображения пользовательского контента
- Валидируйте и очищайте ввод с помощью `sanitizeInput.js`
- Используйте `dangerouslySetInnerHTML` только с очищенным контентом
- Включайте CSP заголовки на сервере

### 2. Защита от CSRF

- Всегда используйте `SafeForm` для форм
- Включайте CSRF токены в скрытые поля
- Используйте `apiClient` для всех запросов к API
- Проверяйте CSRF токены на сервере

### 3. Валидация ввода

- Валидируйте ввод на клиенте и сервере
- Используйте регулярные выражения для проверки форматов
- Ограничивайте длину ввода
- Проверяйте типы данных

### 4. Безопасные запросы

- Используйте `apiClient` для всех запросов
- Обрабатывайте ошибки запросов
- Проверяйте ответы на подозрительность
- Используйте HTTPS для всех запросов

## Интеграция

### 1. Существующие компоненты

Для существующих компонентов:

1. Замените прямые использования `dangerouslySetInnerHTML` на `SafeContent`
2. Замените обычные формы на `SafeForm`
3. Замените прямые вызовы `fetch`/`axios` на `apiClient`

### 2. Новые компоненты

При создании новых компонентов:

1. Используйте `SafeContent` для отображения контента
2. Используйте `SafeForm` для форм
3. Используйте `apiClient` для запросов к API
4. Валидируйте ввод с помощью `sanitizeInput.js`

## Тестирование

### 1. Тестирование XSS

```javascript
// Тестирование XSS уязвимостей
const testInput = '<script>alert("xss")</script>';
const sanitized = sanitizeInput(testInput);
console.log(sanitized); // Должно быть очищено
```

### 2. Тестирование CSRF

```javascript
// Тестирование CSRF защиты
testSafeFormSubmit({
  username: 'test',
  password: 'test123'
}).then(() => {
  console.log('Форма отправлена безопасно');
});
```

### 3. Тестирование API

```javascript
// Тестирование безопасности API
apiClient.post('/api/login', {
  username: 'admin',
  password: 'password'
}).catch(error => {
  console.log('Ошибка:', error.response?.data);
});
```

## Дополнительные рекомендации

1. **Регулярные обновления** - Следите за обновлениями зависимостей
2. **Code review** - Вводите обязательный code review для клиентского кода
3. **Тестирование** - Пишите тесты для всех компонентов безопасности
4. **Документация** - Обновляйте документацию при изменениях
5. **Обучение** - Обучайте команду безопасности клиентских практик

## Отладка

### 1. Проблемы с очисткой

Если очистка слишком строгая:

1. Проверьте правила в `sanitizeInput.js`
2. Настройте `allowedTags` в `SafeContent`
3. Отключите очистку для доверенных источников

### 2. Проблемы с CSRF

Если возникают проблемы с CSRF:

1. Проверьте наличие CSRF токена в cookie
2. Убедитесь, что токен отправляется в заголовках
3. Проверьте конфигурацию CORS

### 3. Проблемы с API

Если API запросы не работают:

1. Проверьте консоль на ошибки
2. Убедитесь, что используются правильные заголовки
3. Проверьте конфигурацию прокси (в разработке)