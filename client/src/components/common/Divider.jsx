import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Горизонтальный разделитель
const HorizontalDivider = styled.hr`
  border: none;
  border-top: ${props => {
    switch (props.variant) {
      case 'solid':
        return `1px solid ${props.theme.colors.border.medium}`;
      case 'dashed':
        return `1px dashed ${props.theme.colors.border.medium}`;
      case 'dotted':
        return `1px dotted ${props.theme.colors.border.medium}`;
      case 'double':
        return `2px double ${props.theme.colors.border.medium}`;
      default:
        return `1px solid ${props.theme.colors.border.medium}`;
    }
  }};
  margin: ${props => {
    if (props.margin) return props.margin;
    if (props.noMargin) return '0';
    return `${props.theme.spacing[3]} 0`;
  }};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  ${props => props.inset && `
    margin-left: ${props.inset === 'left' ? props.theme.spacing[4] : 'auto'};
    margin-right: ${props.inset === 'right' ? props.theme.spacing[4] : 'auto'};
  `}
`;

// Вертикальный разделитель
const VerticalDivider = styled.div`
  width: ${props => {
    switch (props.variant) {
      case 'solid':
        return `1px solid ${props.theme.colors.border.medium}`;
      case 'dashed':
        return `1px dashed ${props.theme.colors.border.medium}`;
      case 'dotted':
        return `1px dotted ${props.theme.colors.border.medium}`;
      case 'double':
        return `2px double ${props.theme.colors.border.medium}`;
      default:
        return `1px solid ${props.theme.colors.border.medium}`;
    }
  }};
  height: ${props => props.fullHeight ? '100%' : 'auto'};
  margin: ${props => {
    if (props.margin) return props.margin;
    if (props.noMargin) return '0';
    return `0 ${props.theme.spacing[3]}`;
  }};
  
  ${props => props.inset && `
    margin-top: ${props.inset === 'top' ? props.theme.spacing[4] : 'auto'};
    margin-bottom: ${props.inset === 'bottom' ? props.theme.spacing[4] : 'auto'};
  `}
`;

// Текстовый разделитель
const TextDividerContainer = styled.div`
  display: flex;
  align-items: center;
  margin: ${props => {
    if (props.margin) return props.margin;
    if (props.noMargin) return '0';
    return `${props.theme.spacing[3]} 0`;
  }};
  color: ${props => props.theme.colors.text.tertiary};
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${props => props.theme.colors.border.medium};
  }
  
  span {
    padding: 0 ${props => props.theme.spacing[2]};
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
    white-space: nowrap;
  }
`;

// Компонент Divider
const Divider = ({
  direction = 'horizontal',
  variant = 'solid',
  fullWidth = false,
  fullHeight = false,
  margin,
  noMargin = false,
  inset,
  text,
  className = '',
  ...props
}) => {
  if (text) {
    return (
      <TextDividerContainer
        margin={margin}
        noMargin={noMargin}
        className={`${className} divider-text`}
        {...props}
      >
        <span>{text}</span>
      </TextDividerContainer>
    );
  }
  
  if (direction === 'horizontal') {
    return (
      <HorizontalDivider
        variant={variant}
        fullWidth={fullWidth}
        margin={margin}
        noMargin={noMargin}
        inset={inset}
        className={`${className} divider-horizontal`}
        {...props}
      />
    );
  }
  
  return (
    <VerticalDivider
      variant={variant}
      fullHeight={fullHeight}
      margin={margin}
      noMargin={noMargin}
      inset={inset}
      className={`${className} divider-vertical`}
      {...props}
    />
  );
};

// Пропс-types для TypeScript
Divider.propTypes = {
  direction: PropTypes.oneOf(['horizontal', 'vertical']),
  variant: PropTypes.oneOf(['solid', 'dashed', 'dotted', 'double']),
  fullWidth: PropTypes.bool,
  fullHeight: PropTypes.bool,
  margin: PropTypes.string,
  noMargin: PropTypes.bool,
  inset: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
  text: PropTypes.string,
  className: PropTypes.string,
};

// Компонент DividerList для разделения элементов списка
const DividerListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    padding: ${props => props.theme.spacing[2]} 0;
    
    &:not(:last-child) {
      position: relative;
      padding-bottom: ${props => props.theme.spacing[3]};
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background-color: ${props => props.theme.colors.border.medium};
      }
    }
  }
`;

// Компонент DividerList
const DividerList = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <DividerListContainer className={`${className} divider-list`} {...props}>
      {React.Children.map(children, (child, index) => (
        <li key={index}>{child}</li>
      ))}
    </DividerListContainer>
  );
};

// Пропс-types для DividerList
DividerList.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Компонент DividerGroup для разделения элементов группы
const DividerGroupContainer = styled.div`
  display: flex;
  align-items: center;
  
  & > * {
    flex: 1;
    
    &:not(:first-child) {
      margin-left: ${props => props.theme.spacing[2]};
      
      ${props => props.vertical && `
        margin-left: 0;
        margin-top: ${props => props.theme.spacing[2]};
      `}
    }
  }
  
  .divider {
    flex: 0 0 auto;
    margin: 0 ${props => props.theme.spacing[2]};
    
    ${props => props.vertical && `
      margin: ${props => props.theme.spacing[2]} 0;
      width: 1px;
      height: auto;
    `}
  }
`;

// Компонент DividerGroup
const DividerGroup = ({
  children,
  vertical = false,
  className = '',
  ...props
}) => {
  return (
    <DividerGroupContainer
      vertical={vertical}
      className={`${className} divider-group`}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (index === 0) return child;
        
        return (
          <React.Fragment key={index}>
            <Divider className="divider" direction={vertical ? 'vertical' : 'horizontal'} />
            {child}
          </React.Fragment>
        );
      })}
    </DividerGroupContainer>
  );
};

// Пропс-types для DividerGroup
DividerGroup.propTypes = {
  children: PropTypes.node.isRequired,
  vertical: PropTypes.bool,
  className: PropTypes.string,
};

// Компонент DividerWithContent для разделителя с контентом
const DividerWithContentContainer = styled.div`
  display: flex;
  align-items: center;
  margin: ${props => {
    if (props.margin) return props.margin;
    return `${props.theme.spacing[4]} 0`;
  }};
  
  .divider-left,
  .divider-right {
    flex: 1;
    height: 1px;
    background-color: ${props => props.theme.colors.border.medium};
  }
  
  .content {
    padding: 0 ${props => props.theme.spacing[3]};
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
    color: ${props => props.theme.colors.text.tertiary};
    white-space: nowrap;
  }
`;

// Компонент DividerWithContent
const DividerWithContent = ({
  content,
  margin,
  className = '',
  ...props
}) => {
  return (
    <DividerWithContentContainer
      margin={margin}
      className={`${className} divider-with-content`}
      {...props}
    >
      <div className="divider-left"></div>
      <div className="content">{content}</div>
      <div className="divider-right"></div>
    </DividerWithContentContainer>
  );
};

// Пропс-types для DividerWithContent
DividerWithContent.propTypes = {
  content: PropTypes.string.isRequired,
  margin: PropTypes.string,
  className: PropTypes.string,
};

// Экспорт компонентов
export {
  Divider,
  DividerList as DividerListComponent,
  DividerGroup as DividerGroupComponent,
  DividerWithContent,
};