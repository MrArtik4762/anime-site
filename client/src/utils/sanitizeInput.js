/**
 * Утилиты для очистки пользовательского ввода и защиты от XSS атак
 */

/**
 * Очистка строки от потенциально опасных символов
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Удаляем HTML теги
  const withoutTags = input.replace(/<[^>]*>/g, '');
  
  // Кодируем HTML сущности
  const encoded = withoutTags
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return encoded;
}

/**
 * Очистка HTML контента
 */
export function sanitizeHTML(input, allowedTags = []) {
  if (typeof input !== 'string') {
    return '';
  }

  // Создаем регулярное выражение для удаления запрещенных тегов
  const disallowedTags = /<\/?(?!br|p|div|span|strong|em|u|s|ul|ol|li|h[1-6]|blockquote|code|pre)([^>]+)>/gi;
  
  let sanitized = input.replace(disallowedTags, '');
  
  // Очищаем атрибуты
  sanitized = sanitized.replace(/on\w+="[^"]*"/g, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/g, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  
  return sanitized;
}

/**
 * Валидация email адреса
 */
export function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Валидация URL
 */
export function isValidURL(url) {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Очистка имени пользователя
 */
export function sanitizeUsername(username) {
  if (typeof username !== 'string') {
    return '';
  }

  // Разрешаем только буквы, цифры и подчеркивания
  return username.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20);
}

/**
 * Очистка пароля
 */
export function sanitizePassword(password) {
  if (typeof password !== 'string') {
    return '';
  }

  // Удаляем потенциально опасные символы, но оставляем спецсимволы
  return password.replace(/[>&"'/]/g, '');
}

/**
 * Очистка текстовых комментариев
 */
export function sanitizeComment(comment) {
  if (typeof comment !== 'string') {
    return '';
  }

  // Очищаем от HTML тегов
  const withoutTags = comment.replace(/<[^>]*>/g, '');
  
  // Ограничиваем длину
  const maxLength = 2000;
  if (withoutTags.length > maxLength) {
    return withoutTags.substring(0, maxLength) + '...';
  }
  
  return withoutTags;
}

/**
 * Создание безопасного DOM элемента из строки
 */
export function createSafeElement(htmlString) {
  const div = document.createElement('div');
  div.textContent = htmlString; // Используем textContent вместо innerHTML
  return div;
}

/**
 * Проверка на XSS атаку
 */
export function containsXSS(input) {
  if (typeof input !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<applet[^>]*>.*?<\/applet>/gi,
    /<meta[^>]*>.*?<\/meta>/gi,
    /<link[^>]*>.*?<\/link>/gi,
    /<style[^>]*>.*?<\/style>/gi,
    /<form[^>]*>.*?<\/form>/gi,
    /<input[^>]*>.*?<\/input>/gi,
    /<textarea[^>]*>.*?<\/textarea>/gi,
    /<select[^>]*>.*?<\/select>/gi,
    /<button[^>]*>.*?<\/button>/gi,
    /<img[^>]*on\w+[^>]*>/gi,
    /<svg[^>]*>.*?<\/svg>/gi,
    /<math[^>]*>.*?<\/math>/gi,
    /data:text\/html/i,
    /vbscript:/gi,
    /about:/gi,
    /data:/gi
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Экранирование специальных символов для атрибутов
 */
export function escapeAttribute(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Экранирование специальных символов для текстового контента
 */
export function escapeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>');
}

/**
 * Проверка на SQL инъекцию
 */
export function containsSQLInjection(input) {
  if (typeof input !== 'string') {
    return false;
  }

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|EXECUTE|CREATE|ALTER|TRUNCATE)\b)/gi,
    /(;|'|"|--|\/\*|\*\/|@@|xp_|sp_|;)/g,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\b(WHERE|HAVING|GROUP BY|ORDER BY)\s+.*?[=<>])/gi,
    /(\b(UNION\s+ALL\s+SELECT)\b)/gi,
    /(\b(OR\s+1\s*=\s*1)\b)/gi,
    /(\b(AND\s+1\s*=\s*1)\b)/gi,
    /(\b(OR\s+1\s*=\s*'1)\b)/gi,
    /(\b(AND\s+1\s*=\s*'1)\b)/gi
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Ограничение длины строки
 */
export function truncateString(str, maxLength, suffix = '...') {
  if (typeof str !== 'string') {
    return '';
  }

  if (str.length <= maxLength) {
    return str;
  }

  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Нормализация строки
 */
export function normalizeString(str) {
  if (typeof str !== 'string') {
    return '';
  }

  return str
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}