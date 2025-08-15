import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';

// Стилизованный контейнер для временной линии
const TimelineContainer = styled.div`
  position: relative;
  padding-left: ${props => props.theme.spacing.medium};
  
  ${props => props.size === 'small' && `
    padding-left: ${props.theme.spacing.small};
  `}
  
  ${props => props.size === 'large' && `
    padding-left: ${props.theme.spacing.large};
  `}
  
  ${props => props.vertical === 'right' && `
    padding-left: 0;
    padding-right: ${props.theme.spacing.medium};
  `}
  
  ${props => props.compact && `
    padding-left: ${props.theme.spacing.xsmall};
  `}
`;

// Стилизованная линия временной шкалы
const TimelineLine = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: ${props => props.theme.colors.border};
  
  ${props => props.vertical === 'right' && `
    right: 0;
    left: auto;
  `}
  
  ${props => props.variant === 'dashed' && `
    background-image: linear-gradient(to bottom, ${props.theme.colors.border} 50%, transparent 50%);
    background-size: 8px 8px;
  `}
  
  ${props => props.variant === 'dotted' && `
    background-image: radial-gradient(circle, ${props.theme.colors.border} 1px, transparent 1px);
    background-size: 8px 8px;
  `}
  
  ${props => props.variant === 'double' && `
    width: 4px;
    background: linear-gradient(to right, ${props.theme.colors.border} 0%, ${props.theme.colors.surface} 50%, ${props.theme.colors.border} 100%);
  `}
  
  ${props => props.variant === 'gradient' && `
    background: linear-gradient(to bottom, ${props.theme.colors.primary}, ${props.theme.colors.secondary});
  `}
`;

// Стилизованная точка временной шкалы
const TimelineDot = styled.div`
  position: absolute;
  width: ${props => {
    if (props.size === 'small') return '8px';
    if (props.size === 'large') return '16px';
    return '12px';
  }};
  height: ${props => {
    if (props.size === 'small') return '8px';
    if (props.size === 'large') return '16px';
    return '12px';
  }};
  border-radius: 50%;
  background-color: ${props => {
    if (props.variant === 'primary') return props.theme.colors.primary;
    if (props.variant === 'secondary') return props.theme.colors.secondary;
    if (props.variant === 'success') return props.theme.colors.success;
    if (props.variant === 'warning') return props.theme.colors.warning;
    if (props.variant === 'error') return props.theme.colors.error;
    if (props.variant === 'info') return props.theme.colors.info;
    if (props.variant === 'dark') return props.theme.colors.dark;
    return props.theme.colors.border;
  }};
  left: ${props => {
    if (props.vertical === 'right') return 'auto';
    if (props.size === 'small') return `-${props.theme.spacing.xxsmall}`;
    if (props.size === 'large') return `-${props.theme.spacing.small}`;
    return `-${props.theme.spacing.xsmall}`;
  }};
  right: ${props => {
    if (props.vertical === 'right') {
      if (props.size === 'small') return `-${props.theme.spacing.xxsmall}`;
      if (props.size === 'large') return `-${props.theme.spacing.small}`;
      return `-${props.theme.spacing.xsmall}`;
    }
    return 'auto';
  }};
  transform: translateX(-50%);
  border: 2px solid ${props => props.theme.colors.surface};
  z-index: 1;
  
  ${props => props.variant === 'outline' && `
    background-color: transparent;
    border-color: ${props => {
      if (props.variant === 'primary') return props.theme.colors.primary;
      if (props.variant === 'secondary') return props.theme.colors.secondary;
      if (props.variant === 'success') return props.theme.colors.success;
      if (props.variant === 'warning') return props.theme.colors.warning;
      if (props.variant === 'error') return props.theme.colors.error;
      if (props.variant === 'info') return props.theme.colors.info;
      if (props.variant === 'dark') return props.theme.colors.dark;
      return props.theme.colors.border;
    }};
  `}
  
  ${props => props.variant === 'ghost' && `
    background-color: transparent;
    border-color: transparent;
    box-shadow: 0 0 0 2px ${props => {
      if (props.variant === 'primary') return props.theme.colors.primary;
      if (props.variant === 'secondary') return props.theme.colors.secondary;
      if (props.variant === 'success') return props.theme.colors.success;
      if (props.variant === 'warning') return props.theme.colors.warning;
      if (props.variant === 'error') return props.theme.colors.error;
      if (props.variant === 'info') return props.theme.colors.info;
      if (props.variant === 'dark') return props.theme.colors.dark;
      return props.theme.colors.border;
    }};
  `}
`;

// Стилизованный контейнер элемента временной шкалы
const TimelineItem = styled.div`
  position: relative;
  padding-bottom: ${props => props.theme.spacing.medium};
  margin-left: ${props => props.theme.spacing.medium};
  
  ${props => props.size === 'small' && `
    padding-bottom: ${props.theme.spacing.small};
    margin-left: ${props.theme.spacing.small};
  `}
  
  ${props => props.size === 'large' && `
    padding-bottom: ${props.theme.spacing.large};
    margin-left: ${props.theme.spacing.large};
  `}
  
  ${props => props.vertical === 'right' && `
    margin-left: 0;
    margin-right: ${props.theme.spacing.medium};
  `}
  
  ${props => props.compact && `
    padding-bottom: ${props.theme.spacing.xsmall};
    margin-left: ${props.theme.spacing.xsmall};
  `}
  
  ${props => props.alternate && `
    &:nth-child(even) {
      margin-left: 0;
      margin-right: ${props.theme.spacing.medium};
      padding-left: ${props.theme.spacing.medium};
      padding-right: 0;
      
      ${props => props.vertical === 'right' && `
        margin-left: ${props.theme.spacing.medium};
        margin-right: 0;
        padding-left: 0;
        padding-right: ${props.theme.spacing.medium};
      `}
    }
  `}
`;

// Стилизованный контент элемента временной шкалы
const TimelineContent = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.border.radius.md};
  padding: ${props => props.theme.spacing.medium};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  ${props => props.size === 'small' && `
    padding: ${props.theme.spacing.small};
  `}
  
  ${props => props.size === 'large' && `
    padding: ${props.theme.spacing.large};
  `}
  
  ${props => props.variant === 'filled' && `
    background-color: ${props.theme.colors.text};
    color: ${props.theme.colors.surface};
  `}
  
  ${props => props.variant === 'outlined' && `
    border: 1px solid ${props.theme.colors.border};
  `}
  
  ${props => props.variant === 'elevated' && `
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `}
  
  ${props => props.variant === 'ghost' && `
    background-color: transparent;
    border: 1px solid transparent;
  `}
`;

// Стилизованный заголовок элемента временной шкалы
const TimelineHeader = styled.div`
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xsmall};
  font-size: ${props => props.theme.fontSizes.base};
  
  ${props => props.size === 'small' && `
    font-size: ${props.theme.fontSizes.sm};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props.theme.fontSizes.lg};
  `}
`;

// Стилизованный подзаголовок элемента временной шкалы
const TimelineSubheader = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xsmall};
  
  ${props => props.size === 'small' && `
    font-size: ${props.theme.fontSizes.xs};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props.theme.fontSizes.base};
  `}
`;

// Стилизованный текст элемента временной шкалы
const TimelineText = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
  
  ${props => props.size === 'small' && `
    font-size: ${props.theme.fontSizes.xs};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props.theme.fontSizes.base};
  `}
  
  ${props => props.bold && `
    font-weight: ${props => props.theme.fontWeights.semibold};
    color: ${props => props.theme.colors.text};
  `}
`;

// Стилизованная метка времени элемента временной шкалы
const TimelineTime = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.xsmall};
  
  ${props => props.size === 'small' && `
    font-size: ${props.theme.fontSizes.xxs};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props.theme.fontSizes.xs};
  `}
`;

// Основной компонент Timeline
export const Timeline = memo(({
  items,
  size = 'medium',
  variant = 'default',
  lineVariant = 'default',
  vertical = 'left',
  alternate = false,
  compact = false,
  className,
  style,
  ...props
}) => {
  return (
    <TimelineContainer
      size={size}
      variant={variant}
      vertical={vertical}
      alternate={alternate}
      compact={compact}
      className={className}
      style={style}
      {...props}
    >
      <TimelineLine
        variant={lineVariant}
        vertical={vertical}
      />
      
      {items.map((item, index) => (
        <TimelineItem
          key={index}
          size={size}
          variant={item.variant}
          vertical={vertical}
          alternate={alternate}
          compact={compact}
        >
          <TimelineDot
            size={size}
            variant={item.dotVariant || 'primary'}
            vertical={vertical}
          />
          
          <TimelineContent
            size={size}
            variant={item.contentVariant}
          >
            {item.title && (
              <TimelineHeader size={size}>
                {item.title}
              </TimelineHeader>
            )}
            
            {item.subtitle && (
              <TimelineSubheader size={size}>
                {item.subtitle}
              </TimelineSubheader>
            )}
            
            {item.text && (
              <TimelineText size={size} bold={item.bold}>
                {item.text}
              </TimelineText>
            )}
            
            {item.time && (
              <TimelineTime size={size}>
                {item.time}
              </TimelineTime>
            )}
            
            {item.children}
          </TimelineContent>
        </TimelineItem>
      ))}
    </TimelineContainer>
  );
});

Timeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subtitle: PropTypes.string,
      text: PropTypes.string,
      time: PropTypes.string,
      dotVariant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info', 'dark']),
      contentVariant: PropTypes.oneOf(['default', 'filled', 'outlined', 'elevated', 'ghost']),
      bold: PropTypes.bool,
      children: PropTypes.node,
    })
  ).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'alternate']),
  lineVariant: PropTypes.oneOf(['default', 'dashed', 'dotted', 'double', 'gradient']),
  vertical: PropTypes.oneOf(['left', 'right']),
  alternate: PropTypes.bool,
  compact: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для горизонтальной временной шкалы
export const HorizontalTimeline = memo(({
  items,
  size = 'medium',
  variant = 'default',
  lineVariant = 'default',
  className,
  style,
  ...props
}) => {
  return (
    <div className={className} style={{ display: 'flex', overflowX: 'auto', ...style }} {...props}>
      <div style={{ display: 'flex', minWidth: '100%' }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              flex: '0 0 auto',
              width: size === 'small' ? '200px' : size === 'large' ? '300px' : '250px',
              margin: '0 8px',
              position: 'relative',
            }}
          >
            <TimelineDot
              size={size}
              variant={item.dotVariant || 'primary'}
              vertical="right"
            />
            
            <TimelineContent
              size={size}
              variant={item.contentVariant}
              style={{ marginLeft: size === 'small' ? '16px' : size === 'large' ? '24px' : '20px' }}
            >
              {item.title && (
                <TimelineHeader size={size}>
                  {item.title}
                </TimelineHeader>
              )}
              
              {item.subtitle && (
                <TimelineSubheader size={size}>
                  {item.subtitle}
                </TimelineSubheader>
              )}
              
              {item.text && (
                <TimelineText size={size} bold={item.bold}>
                  {item.text}
                </TimelineText>
              )}
              
              {item.time && (
                <TimelineTime size={size}>
                  {item.time}
                </TimelineTime>
              )}
              
              {item.children}
            </TimelineContent>
            
            {index < items.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-16px',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '2px',
                  backgroundColor: variant === 'dashed' ? 'transparent' : 'currentColor',
                  backgroundImage: variant === 'dashed' ? 
                    'linear-gradient(to right, currentColor 50%, transparent 50%)' : 'none',
                  backgroundSize: '8px 8px',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

HorizontalTimeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subtitle: PropTypes.string,
      text: PropTypes.string,
      time: PropTypes.string,
      dotVariant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info', 'dark']),
      contentVariant: PropTypes.oneOf(['default', 'filled', 'outlined', 'elevated', 'ghost']),
      bold: PropTypes.bool,
      children: PropTypes.node,
    })
  ).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'dashed']),
  lineVariant: PropTypes.oneOf(['default', 'dashed']),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для временной шкалы с иконками
export const IconTimeline = memo(({
  items,
  size = 'medium',
  variant = 'default',
  lineVariant = 'default',
  vertical = 'left',
  alternate = false,
  compact = false,
  className,
  style,
  ...props
}) => {
  return (
    <TimelineContainer
      size={size}
      variant={variant}
      vertical={vertical}
      alternate={alternate}
      compact={compact}
      className={className}
      style={style}
      {...props}
    >
      <TimelineLine
        variant={lineVariant}
        vertical={vertical}
      />
      
      {items.map((item, index) => (
        <TimelineItem
          key={index}
          size={size}
          variant={item.variant}
          vertical={vertical}
          alternate={alternate}
          compact={compact}
        >
          <div
            style={{
              position: 'absolute',
              left: vertical === 'right' ? 'auto' : 
                (size === 'small' ? `-${props.theme.spacing.xxsmall}` : 
                 size === 'large' ? `-${props.theme.spacing.small}` : `-${props.theme.spacing.xsmall}`),
              right: vertical === 'right' ? 
                (size === 'small' ? `-${props.theme.spacing.xxsmall}` : 
                 size === 'large' ? `-${props.theme.spacing.small}` : `-${props.theme.spacing.xsmall}`) : 'auto',
              transform: 'translateX(-50%)',
              width: size === 'small' ? '24px' : size === 'large' ? '32px' : '28px',
              height: size === 'small' ? '24px' : size === 'large' ? '32px' : '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: item.dotVariant ? 
                (item.dotVariant === 'primary' ? props.theme.colors.primary :
                 item.dotVariant === 'secondary' ? props.theme.colors.secondary :
                 item.dotVariant === 'success' ? props.theme.colors.success :
                 item.dotVariant === 'warning' ? props.theme.colors.warning :
                 item.dotVariant === 'error' ? props.theme.colors.error :
                 item.dotVariant === 'info' ? props.theme.colors.info :
                 item.dotVariant === 'dark' ? props.theme.colors.dark : props.theme.colors.border) :
                props.theme.colors.border,
              borderRadius: '50%',
              border: '2px solid ' + props.theme.colors.surface,
              zIndex: 1,
            }}
          >
            {item.icon}
          </div>
          
          <TimelineContent
            size={size}
            variant={item.contentVariant}
          >
            {item.title && (
              <TimelineHeader size={size}>
                {item.title}
              </TimelineHeader>
            )}
            
            {item.subtitle && (
              <TimelineSubheader size={size}>
                {item.subtitle}
              </TimelineSubheader>
            )}
            
            {item.text && (
              <TimelineText size={size} bold={item.bold}>
                {item.text}
              </TimelineText>
            )}
            
            {item.time && (
              <TimelineTime size={size}>
                {item.time}
              </TimelineTime>
            )}
            
            {item.children}
          </TimelineContent>
        </TimelineItem>
      ))}
    </TimelineContainer>
  );
});

IconTimeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subtitle: PropTypes.string,
      text: PropTypes.string,
      time: PropTypes.string,
      icon: PropTypes.node.isRequired,
      dotVariant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info', 'dark']),
      contentVariant: PropTypes.oneOf(['default', 'filled', 'outlined', 'elevated', 'ghost']),
      bold: PropTypes.bool,
      children: PropTypes.node,
    })
  ).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'alternate']),
  lineVariant: PropTypes.oneOf(['default', 'dashed', 'dotted', 'double', 'gradient']),
  vertical: PropTypes.oneOf(['left', 'right']),
  alternate: PropTypes.bool,
  compact: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Timeline;