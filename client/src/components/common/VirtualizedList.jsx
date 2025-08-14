import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';
import Skeleton from './Skeleton';

// Базовый компонент для виртуализированного списка
const VirtualizedList = ({ 
  items, 
  height = 400, 
  itemHeight = 50, 
  renderItem, 
  overscanCount = 5,
  loading = false,
  loadingText = 'Загрузка...',
  emptyText = 'Нет данных для отображения',
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const scrollTimeout = useRef(null);
  
  // Расчет видимых элементов
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscanCount);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + height) / itemHeight) + overscanCount
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, height, itemHeight, items.length, overscanCount]);
  
  // Обработчик прокрутки
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    setScrollTop(scrollTop);
    setIsScrolling(true);
    
    // Сброс состояния прокрутки после задержки
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);
  
  // Рендеринг элементов
  const renderItems = useCallback(() => {
    if (loading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      );
    }
    
    if (items.length === 0) {
      return (
        <div className="flex items-center justify-center h-full py-8">
          <p className="text-gray-500 dark:text-gray-400">{emptyText}</p>
        </div>
      );
    }
    
    const { startIndex, endIndex } = visibleRange;
    const visibleItems = items.slice(startIndex, endIndex + 1);
    
    return visibleItems.map((item, index) => {
      const actualIndex = startIndex + index;
      return (
        <div
          key={actualIndex}
          className={renderItem(item, actualIndex, index)}
          style={{
            position: 'absolute',
            top: actualIndex * itemHeight,
            width: '100%',
            height: itemHeight,
          }}
        >
          {renderItem(item, actualIndex, index)}
        </div>
      );
    });
  }, [items, visibleRange, loading, emptyText, renderItem, itemHeight]);
  
  // Стиль контейнера
  const containerStyle = {
    height: `${height}px`,
    overflow: 'auto',
    position: 'relative',
  };
  
  return (
    <div 
      ref={containerRef}
      className={`virtualized-list ${className}`}
      style={containerStyle}
      onScroll={handleScroll}
      {...props}
    >
      {/* Обертка для элементов */}
      <div
        style={{
          height: `${items.length * itemHeight}px`,
          position: 'relative',
        }}
      >
        {renderItems()}
      </div>
      
      {/* Индикатор прокрутки */}
      {isScrolling && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {Math.round((scrollTop / (items.length * itemHeight - height)) * 100)}%
        </div>
      )}
    </div>
  );
};

VirtualizedList.propTypes = {
  items: PropTypes.array.isRequired,
  height: PropTypes.number,
  itemHeight: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  overscanCount: PropTypes.number,
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  emptyText: PropTypes.string,
  className: PropTypes.string,
};

// Компонент для виртуализированной таблицы
const VirtualizedTable = ({ 
  columns, 
  data, 
  height = 400, 
  rowHeight = 50,
  overscanCount = 5,
  loading = false,
  emptyText = 'Нет данных для отображения',
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const scrollTimeout = useRef(null);
  
  // Расчет видимых строк
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscanCount);
    const endIndex = Math.min(
      data.length - 1,
      Math.ceil((scrollTop + height) / rowHeight) + overscanCount
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, height, rowHeight, data.length, overscanCount]);
  
  // Обработчик прокрутки
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    setScrollTop(scrollTop);
    setIsScrolling(true);
    
    // Сброс состояния прокрутки после задержки
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);
  
  // Рендеринг заголовка
  const renderHeader = () => (
    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
      <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
        {columns.map((column, index) => (
          <div key={index} className="col-span-1">
            {column.title}
          </div>
        ))}
      </div>
    </div>
  );
  
  // Рендеринг строк
  const renderRows = () => {
    if (loading) {
      return Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
          {columns.map((_, colIndex) => (
            <div key={colIndex} className="col-span-1">
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ));
    }
    
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full py-8">
          <p className="text-gray-500 dark:text-gray-400">{emptyText}</p>
        </div>
      );
    }
    
    const { startIndex, endIndex } = visibleRange;
    const visibleData = data.slice(startIndex, endIndex + 1);
    
    return visibleData.map((row, index) => {
      const actualIndex = startIndex + index;
      return (
        <div
          key={actualIndex}
          className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
            isScrolling ? 'opacity-75' : 'opacity-100'
          }`}
          style={{
            position: 'absolute',
            top: actualIndex * rowHeight,
            width: '100%',
            height: rowHeight,
          }}
        >
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="col-span-1">
              {column.render ? column.render(row[column.key], row, actualIndex) : row[column.key]}
            </div>
          ))}
        </div>
      );
    });
  };
  
  return (
    <div className={`virtualized-table ${className}`} {...props}>
      {/* Заголовок */}
      {renderHeader()}
      
      {/* Тело таблицы */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: `${height}px`, position: 'relative' }}
        onScroll={handleScroll}
      >
        <div
          style={{
            height: `${data.length * rowHeight}px`,
            position: 'relative',
          }}
        >
          {renderRows()}
        </div>
        
        {/* Индикатор прокрутки */}
        {isScrolling && data.length > 0 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {Math.round((scrollTop / (data.length * rowHeight - height)) * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};

VirtualizedTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    render: PropTypes.func,
  })).isRequired,
  data: PropTypes.array.isRequired,
  height: PropTypes.number,
  rowHeight: PropTypes.number,
  overscanCount: PropTypes.number,
  loading: PropTypes.bool,
  emptyText: PropTypes.string,
  className: PropTypes.string,
};

// Компонент для виртуализированной сетки
const VirtualizedGrid = ({ 
  items, 
  columns = 3, 
  height = 400, 
  itemHeight = 200,
  overscanCount = 5,
  renderItem,
  loading = false,
  loadingText = 'Загрузка...',
  emptyText = 'Нет данных для отображения',
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const scrollTimeout = useRef(null);
  
  // Расчет видимых элементов
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscanCount);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + height) / itemHeight) + overscanCount
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, height, itemHeight, items.length, overscanCount]);
  
  // Обработчик прокрутки
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    setScrollTop(scrollTop);
    setIsScrolling(true);
    
    // Сброс состояния прокрутки после задержки
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);
  
  // Рендеринг элементов
  const renderItems = () => {
    if (loading) {
      return Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="p-4">
          <Skeleton className="h-48 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ));
    }
    
    if (items.length === 0) {
      return (
        <div className="flex items-center justify-center h-full py-8 col-span-full">
          <p className="text-gray-500 dark:text-gray-400">{emptyText}</p>
        </div>
      );
    }
    
    const { startIndex, endIndex } = visibleRange;
    const visibleItems = items.slice(startIndex, endIndex + 1);
    
    return visibleItems.map((item, index) => {
      const actualIndex = startIndex + index;
      return (
        <div
          key={actualIndex}
          className={isScrolling ? 'opacity-75' : 'opacity-100'}
          style={{
            position: 'absolute',
            top: Math.floor(actualIndex / columns) * itemHeight,
            left: (actualIndex % columns) * (100 / columns) + '%',
            width: `${100 / columns}%`,
            height: itemHeight,
          }}
        >
          {renderItem(item, actualIndex, index)}
        </div>
      );
    });
  };
  
  return (
    <div 
      ref={containerRef}
      className={`virtualized-grid ${className}`}
      style={{
        height: `${height}px`,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Обертка для элементов */}
      <div
        style={{
          height: `${Math.ceil(items.length / columns) * itemHeight}px`,
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {renderItems()}
      </div>
      
      {/* Индикатор прокрутки */}
      {isScrolling && items.length > 0 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {Math.round((scrollTop / (Math.ceil(items.length / columns) * itemHeight - height)) * 100)}%
        </div>
      )}
    </div>
  );
};

VirtualizedGrid.propTypes = {
  items: PropTypes.array.isRequired,
  columns: PropTypes.number,
  height: PropTypes.number,
  itemHeight: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  overscanCount: PropTypes.number,
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  emptyText: PropTypes.string,
  className: PropTypes.string,
};

// Компонент для виртуализированного дерева
const VirtualizedTree = ({ 
  data, 
  height = 400, 
  rowHeight = 50,
  overscanCount = 5,
  renderNode,
  loading = false,
  emptyText = 'Нет данных для отображения',
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const scrollTimeout = useRef(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  
  // Расчет видимых узлов
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscanCount);
    const endIndex = Math.min(
      data.length - 1,
      Math.ceil((scrollTop + height) / rowHeight) + overscanCount
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, height, rowHeight, data.length, overscanCount]);
  
  // Обработчик прокрутки
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    setScrollTop(scrollTop);
    setIsScrolling(true);
    
    // Сброс состояния прокрутки после задержки
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);
  
  // Переключение состояния узла
  const toggleNode = useCallback((nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);
  
  // Рендеринг узлов
  const renderNodes = () => {
    if (loading) {
      return Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ));
    }
    
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full py-8">
          <p className="text-gray-500 dark:text-gray-400">{emptyText}</p>
        </div>
      );
    }
    
    const { startIndex, endIndex } = visibleRange;
    const visibleData = data.slice(startIndex, endIndex + 1);
    
    return visibleData.map((node, index) => {
      const actualIndex = startIndex + index;
      const isExpanded = expandedNodes.has(node.id);
      const hasChildren = node.children && node.children.length > 0;
      
      return (
        <div
          key={actualIndex}
          className={`border-b border-gray-200 dark:border-gray-700 ${
            isScrolling ? 'opacity-75' : 'opacity-100'
          }`}
          style={{
            position: 'absolute',
            top: actualIndex * rowHeight,
            width: '100%',
            height: rowHeight,
          }}
        >
          {renderNode(node, actualIndex, isExpanded, hasChildren, toggleNode)}
        </div>
      );
    });
  };
  
  return (
    <div 
      ref={containerRef}
      className={`virtualized-tree ${className}`}
      style={{
        height: `${height}px`,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Обертка для узлов */}
      <div
        style={{
          height: `${data.length * rowHeight}px`,
          position: 'relative',
        }}
      >
        {renderNodes()}
      </div>
      
      {/* Индикатор прокрутки */}
      {isScrolling && data.length > 0 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {Math.round((scrollTop / (data.length * rowHeight - height)) * 100)}%
        </div>
      )}
    </div>
  );
};

VirtualizedTree.propTypes = {
  data: PropTypes.array.isRequired,
  height: PropTypes.number,
  rowHeight: PropTypes.number,
  overscanCount: PropTypes.number,
  renderNode: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  emptyText: PropTypes.string,
  className: PropTypes.string,
};

export default VirtualizedList;
export { VirtualizedTable, VirtualizedGrid, VirtualizedTree };