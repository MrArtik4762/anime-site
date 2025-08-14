import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { createSafeElement } from '../../utils/sanitizeInput';

/**
 * Компонент для безопасного отображения контента с защитой от XSS
 */
const SafeContent = ({ 
  children, 
  as: Component = 'div', 
  className,
  tagName,
  allowedTags = [],
  ...props 
}) => {
  const [sanitizedContent, setSanitizedContent] = useState('');

  useEffect(() => {
    if (typeof children === 'string') {
      // Используем DOMPurify для очистки HTML
      const clean = DOMPurify.sanitize(children, {
        ALLOWED_TAGS: allowedTags.length > 0 ? allowedTags : [
          'b', 'i', 'u', 's', 'strong', 'em', 'p', 'br', 'span', 'div',
          'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
        ],
        ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'rel', 'title'],
        FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur'],
        ALLOW_DATA_ATTR: false,
        USE_PROFILES: { html: true }
      });
      
      setSanitizedContent(clean);
    } else {
      setSanitizedContent('');
    }
  }, [children, allowedTags]);

  // Если это не строковый контент, рендерим как есть
  if (typeof children !== 'string') {
    return (
      <Component className={className} {...props}>
        {children}
      </Component>
    );
  }

  // Создаем безопасные элементы
  const safeElement = createSafeElement(sanitizedContent);
  
  // Извлекаем текстовое содержимое
  const textContent = safeElement.textContent || '';

  return (
    <Component 
      className={className} 
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      {...props}
    />
  );
};

/**
 * Компонент для безопасных ссылок
 */
const SafeLink = ({ 
  href, 
  children, 
  className,
  target = '_blank',
  rel = 'noopener noreferrer',
  ...props 
}) => {
  const isValidUrl = href && typeof href === 'string' && /^https?:\/\/.+/.test(href);
  
  if (!isValidUrl) {
    console.warn('Invalid URL provided to SafeLink:', href);
    return (
      <span className={className} {...props}>
        {children}
      </span>
    );
  }

  return (
    <a 
      href={href}
      className={className}
      target={target}
      rel={rel}
      {...props}
    >
      {children}
    </a>
  );
};

/**
 * Компонент для безопасных изображений
 */
const SafeImage = ({ 
  src, 
  alt, 
  className,
  onLoad,
  onError,
  ...props 
}) => {
  const isValidSrc = src && typeof src === 'string' && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(src);
  
  if (!isValidSrc) {
    console.warn('Invalid image source provided to SafeImage:', src);
    return (
      <div className={`${className || ''} bg-gray-200 flex items-center justify-center`} {...props}>
        <span>Invalid image</span>
      </div>
    );
  }

  return (
    <img 
      src={src}
      alt={alt || ''}
      className={className}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
};

/**
 * HOC для обертки компонентов защитой от XSS
 */
export const withXSSProtection = (WrappedComponent) => {
  return function XSSProtectedComponent(props) {
    const { children, ...restProps } = props;
    
    // Обработка строковых children
    const processedChildren = React.Children.map(children, child => {
      if (typeof child === 'string') {
        return <SafeContent>{child}</SafeContent>;
      }
      return child;
    });

    return <WrappedComponent {...restProps}>{processedChildren}</WrappedComponent>;
  };
};

export { SafeContent, SafeLink, SafeImage };