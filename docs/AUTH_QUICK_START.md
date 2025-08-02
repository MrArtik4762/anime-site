# Быстрое руководство по диагностике проблем с входом
## Anime-Site Authentication Quick Start Guide

---

## 🚀 ЭКСТРЕННАЯ ПОМОЩЬ (2 минуты)

### Если не можете войти в аккаунт:

1. **Откройте консоль браузера** (F12 → Console)
2. **Вставьте и выполните:**

```javascript
// Быстрая диагностика
(async function quickCheck() {
    console.log('🔍 БЫСТРАЯ ДИАГНОСТИКА');
    
    // Проверка сервера
    try {
        const serverOk = await fetch('http://localhost:5000/api/auth/test');
        console.log(serverOk.ok ? '✅ Сервер работает' : '❌ Сервер недоступен');
    } catch (e) {
        console.log('❌ Сервер недоступен:', e.message);
    }
    
    // Проверка токена
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expired = payload.exp * 1000 < Date.now();
            console.log(expired ? '❌ Токен истек' : '✅ Токен действителен');
        } catch (e) {
            console.log('❌ Поврежденный токен');
        }
    } else {
        console.log('ℹ️ Токен отсутствует');
    }
})();
```

3. **Если есть ошибки - очистите данные:**

```javascript
// Очистка аутентификационных данных
localStorage.removeItem('token');
localStorage.removeItem('refreshToken');
sessionStorage.clear();
location.reload();
```

---

## 🛠️ АВТОМАТИЧЕСКОЕ ВОССТАНОВЛЕНИЕ

### Windows:
```cmd
scripts\auth-recovery.bat
```

### Linux/Mac:
```bash
chmod +x scripts/auth-recovery.sh
./scripts/auth-recovery.sh
```

### Node.js (любая ОС):
```bash
node scripts/auth-diagnostics.js
```

---

## 📋 ЧЕКЛИСТ ПРОБЛЕМ

### ✅ Проверьте по порядку:

- [ ] **Сервер запущен**: `http://localhost:5000/api/auth/test` открывается
- [ ] **Клиент запущен**: `http://localhost:3000` загружается  
- [ ] **Правильные данные**: Email и пароль введены корректно
- [ ] **Очищен кэш**: Ctrl+Shift+R в браузере
- [ ] **Нет ошибок в консоли**: F12 → Console (нет красных ошибок)
- [ ] **MongoDB запущен**: Порт 27017 доступен

---

## 🚨 ЧАСТЫЕ ОШИБКИ И РЕШЕНИЯ

| Ошибка | Быстрое решение |
|--------|----------------|
| "Сервер недоступен" | `cd server && npm run dev` |
| "Неверные учетные данные" | Проверьте email/пароль, попробуйте username |
| "Токен истек" | Очистите localStorage и войдите заново |
| "CORS error" | Перезапустите сервер с правильными настройками |
| Белый экран | Очистите кэш браузера (Ctrl+Shift+Del) |
| "Cannot connect to MongoDB" | Запустите MongoDB: `mongod` |

---

## 🔧 КОМАНДЫ ДЛЯ РАЗРАБОТЧИКОВ

```bash
# Полная перезагрузка системы
./scripts/auth-recovery.sh full

# Только диагностика
node scripts/auth-diagnostics.js

# Создать тестового пользователя
./scripts/auth-recovery.sh user
# Email: test@anime-site.local
# Password: TestPassword123

# Проверка логов
tail -f server.log | grep "AUTH\|LOGIN"
```

---

## 📞 КОГДА ОБРАЩАТЬСЯ ЗА ПОМОЩЬЮ

Если после выполнения всех шагов проблема не решена:

1. **Соберите диагностику:**
```javascript
// В консоли браузера
collectDiagnosticInfo();
```

2. **Сохраните логи:**
- Скриншот консоли браузера (F12)
- Содержимое файлов `server.log` и `client.log`

3. **Опишите проблему:**
- Что делали когда возникла ошибка
- Какие сообщения видите
- Когда проблема началась

---

## 📚 ПОЛНАЯ ДОКУМЕНТАЦИЯ

Подробное руководство: [`docs/AUTH_TROUBLESHOOTING_GUIDE.md`](AUTH_TROUBLESHOOTING_GUIDE.md)

---

**💡 Совет:** Добавьте эту страницу в закладки для быстрого доступа при проблемах с входом.