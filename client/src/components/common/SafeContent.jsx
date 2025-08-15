import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { styled } from 'styled-components';

// Стилизованный компонент для безопасного контента
const SafeContentContainer = styled.div`
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  /* Стили для различных тегов */
  p {
    margin: ${props => props.theme.spacing.medium} 0;
    line-height: 1.6;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: ${props => props.theme.spacing.large} 0 ${props => props.theme.spacing.medium};
    font-weight: 600;
    line-height: 1.3;
  }
  
  h1 {
    font-size: ${props => props.theme.fontSizes.xxxl};
  }
  
  h2 {
    font-size: ${props => props.theme.fontSizes.xxl};
  }
  
  h3 {
    font-size: ${props => props.theme.fontSizes.xl};
  }
  
  h4 {
    font-size: ${props => props.theme.fontSizes.lg};
  }
  
  h5 {
    font-size: ${props => props.theme.fontSizes.md};
  }
  
  h6 {
    font-size: ${props => props.theme.fontSizes.sm};
  }
  
  ul, ol {
    margin: ${props => props.theme.spacing.medium} 0;
    padding-left: ${props => props.theme.spacing.large};
  }
  
  li {
    margin: ${props => props.theme.spacing.xsmall} 0;
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: color ${props => props.theme.transitions.medium};
    
    &:hover {
      color: ${props => props.theme.colors.primaryHover};
      text-decoration: underline;
    }
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: ${props => props.theme.borderRadius.md};
    margin: ${props => props.theme.spacing.medium} 0;
  }
  
  blockquote {
    margin: ${props => props.theme.spacing.large} 0;
    padding: ${props => props.theme.spacing.medium} ${props => props.theme.spacing.large};
    border-left: 4px solid ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.backgroundSecondary};
    border-radius: 0 ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md} 0;
  }
  
  code {
    background-color: ${props => props.theme.colors.backgroundSecondary};
    padding: 2px 4px;
    border-radius: ${props => props.theme.borderRadius.sm};
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
  }
  
  pre {
    background-color: ${props => props.theme.colors.backgroundSecondary};
    padding: ${props => props.theme.spacing.medium};
    border-radius: ${props => props.theme.borderRadius.md};
    overflow-x: auto;
    margin: ${props => props.theme.spacing.medium} 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: ${props => props.theme.spacing.medium} 0;
  }
  
  th, td {
    border: 1px solid ${props => props.theme.colors.border};
    padding: ${props => props.theme.spacing.small};
    text-align: left;
  }
  
  th {
    background-color: ${props => props.theme.colors.backgroundSecondary};
    font-weight: 600;
  }
  
  hr {
    border: none;
    height: 1px;
    background-color: ${props => props.theme.colors.border};
    margin: ${props => props.theme.spacing.large} 0;
  }
  
  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    h1 {
      font-size: ${props => props.theme.fontSizes.xl};
    }
    
    h2 {
      font-size: ${props => props.theme.fontSizes.lg};
    }
    
    h3 {
      font-size: ${props => props.theme.fontSizes.md};
    }
    
    blockquote {
      padding: ${props => props.theme.spacing.medium};
    }
  }
`;

// Конфигурация для DOMPurify
const createSanitizeConfig = (options = {}) => ({
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
    'ul', 'ol', 'li',
    'a', 'img', 'blockquote', 'code', 'pre',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'div', 'span'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'style',
    'target', 'rel', 'width', 'height', 'align',
    'border', 'cellpadding', 'cellspacing', 'colspan', 'rowspan'
  ],
  ALLOWED_STYLE: [
    'color', 'background-color', 'font-size', 'font-family',
    'font-weight', 'font-style', 'text-align', 'text-decoration',
    'line-height', 'letter-spacing', 'word-spacing',
    'margin', 'padding', 'border', 'border-radius',
    'display', 'float', 'clear', 'width', 'height',
    'max-width', 'min-width', 'max-height', 'min-height'
  ],
  FORBID_ATTR: [
    'onerror', 'onclick', 'onload', 'onmouseover', 'onfocus',
    'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect',
    'onabort', 'onkeydown', 'onkeyup', 'onkeypress',
    'ondblclick', 'onmousedown', 'onmouseup', 'onmousemove',
    'onmouseout', 'onmouseenter', 'onmouseleave',
    'data', 'datasrc', 'datafld', 'datapagesize', 'dataformatas'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ...options
});

// Компонент для безопасного отображения HTML контента
export const SafeContent = ({ 
  html, 
  as = 'div',
  className,
  sanitizeOptions = {},
  dangerouslySetInnerHTML = false,
  ...props 
}) => {
  const sanitizedHtml = useMemo(() => {
    if (!html) return '';
    
    const config = createSanitizeConfig(sanitizeOptions);
    
    try {
      return DOMPurify.sanitize(html, config);
    } catch (error) {
      console.error('Ошибка при очистке HTML:', error);
      return '';
    }
  }, [html, sanitizeOptions]);
  
  if (dangerouslySetInnerHTML) {
    return (
      <SafeContentContainer
        as={as}
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        {...props}
      />
    );
  }
  
  return (
    <SafeContentContainer
      as={as}
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      {...props}
    />
  );
};

SafeContent.propTypes = {
  html: PropTypes.string,
  as: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType
  ]),
  className: PropTypes.string,
  sanitizeOptions: PropTypes.object,
  dangerouslySetInnerHTML: PropTypes.bool,
};

// Компонент для безопасного отображения текста с поддержкой Markdown
export const SafeMarkdown = ({ 
  content, 
  as = 'div',
  className,
  sanitizeOptions = {},
  ...props 
}) => {
  // Простая реализация Markdown-to-HTML
  const markdownToHtml = (text) => {
    if (!text) return '';
    
    let html = text
      // Заголовки
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Жирный и курсив
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      
      // Ссылки
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Изображения
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" />')
      
      // Неупорядоченные списки
      .replace(/^[\s]*-[\s]+(.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      
      // Упорядоченные списки
      .replace(/^[\s]*\d+\.[\s]+(.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')
      
      // Цитаты
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      
      // Код
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      
      // Горизонтальные линии
      .replace(/^---$/gim, '<hr />')
      
      // Абзацы
      .replace(/\n\n/gim, '</p><p>')
      .replace(/^(?!<[h|u|o|b|p|l|i|a|img|blockquote|code|pre|table|th|td|hr])(.+)$/gim, '<p>$1</p>');
    
    return html;
  };
  
  const htmlContent = markdownToHtml(content);
  const sanitizedHtml = useMemo(() => {
    if (!htmlContent) return '';
    
    const config = createSanitizeConfig(sanitizeOptions);
    
    try {
      return DOMPurify.sanitize(htmlContent, config);
    } catch (error) {
      console.error('Ошибка при очистке HTML:', error);
      return '';
    }
  }, [htmlContent, sanitizeOptions]);
  
  return (
    <SafeContentContainer
      as={as}
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      {...props}
    />
  );
};

SafeMarkdown.propTypes = {
  content: PropTypes.string,
  as: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType
  ]),
  className: PropTypes.string,
  sanitizeOptions: PropTypes.object,
};

// Компонент для безопасного отображения JSON
export const SafeJson = ({ 
  data, 
  as = 'pre',
  className,
  indent = 2,
  ...props 
}) => {
  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, indent);
    } catch (error) {
      console.error('Ошибка при сериализации JSON:', error);
      return '';
    }
  }, [data, indent]);
  
  return (
    <SafeContentContainer
      as={as}
      className={className}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(jsonString) }}
      {...props}
    />
  );
};

SafeJson.propTypes = {
  data: PropTypes.any,
  as: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType
  ]),
  className: PropTypes.string,
  indent: PropTypes.number,
};

export default SafeContent;