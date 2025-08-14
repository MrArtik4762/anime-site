import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер для временной линии
const TimelineContainer = styled.div`
  position: relative;
  padding-left: ${props => props.theme.spacing[6]};
  
  &::before {
    content: '';
    position: absolute;
    left: ${props => props.theme.spacing[3]};
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: ${props => props.theme.colors.border.medium};
  }
`;

// Элемент временной линии
const TimelineItem = styled.div`
  position: relative;
  padding-bottom: ${props => props.theme.spacing[4]};
  
  &:last-child {
    padding-bottom: 0;
  }
  
  .timeline-marker {
    position: absolute;
    left: ${props => props.theme.spacing[1]};
    top: ${props => props.theme.spacing[3]};
    width: ${props => props.theme.spacing[3]};
    height: ${props => props.theme.spacing[3]};
    border-radius: 50%;
    background-color: ${props => props.theme.colors.surface.primary};
    border: 2px solid ${props => props.theme.colors.border.medium};
    z-index: 1;
    
    ${props => props.variant === 'success' && `
      border-color: ${props.theme.colors.success};
      background-color: ${props.theme.colors.success};
    `}
    
    ${props => props.variant === 'danger' && `
      border-color: ${props.theme.colors.danger};
      background-color: ${props.theme.colors.danger};
    `}
    
    ${props => props.variant === 'warning' && `
      border-color: ${props.theme.colors.warning};
      background-color: ${props.theme.colors.warning};
    `}
    
    ${props => props.variant === 'info' && `
      border-color: ${props.theme.colors.info};
      background-color: ${props.theme.colors.info};
    `}
    
    ${props => props.icon && `
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${props.theme.colors.surface.primary};
      
      svg {
        width: ${props.theme.spacing[2]};
        height: ${props.theme.spacing[2]};
        stroke: ${props => props.theme.colors.text.primary};
      }
    `}
  }
  
  .timeline-content {
    margin-left: ${props => props.theme.spacing[5]};
    padding: ${props => props.theme.spacing[2]};
    background-color: ${props => props.theme.colors.surface.primary};
    border-radius: ${props => props.theme.borderRadius.md};
    box-shadow: ${props => props.theme.shadow.sm};
    
    .timeline-title {
      font-size: ${props => props.theme.typography.fontSize.base[0]};
      font-weight: ${props => props.theme.typography.fontWeight.semibold};
      color: ${props => props.theme.colors.text.primary};
      margin-bottom: ${props => props.theme.spacing[1]};
    }
    
    .timeline-subtitle {
      font-size: ${props => props.theme.typography.fontSize.sm[0]};
      color: ${props => props.theme.colors.text.tertiary};
      margin-bottom: ${props => props.theme.spacing[2]};
    }
    
    .timeline-description {
      font-size: ${props => props.theme.typography.fontSize.sm[0]};
      color: ${props => props.theme.colors.text.secondary};
      line-height: ${props => props.theme.typography.lineHeight.normal};
    }
    
    .timeline-footer {
      margin-top: ${props => props.theme.spacing[2]};
      display: flex;
      justify-content: flex-end;
      
      button {
        font-size: ${props => props.theme.typography.fontSize.sm[0]};
      }
    }
  }
  
  ${props => props.placement === 'alternate' && `
    .timeline-content {
      margin-left: 0;
      margin-right: ${props => props.theme.spacing[5]};
    }
    
    .timeline-marker {
      left: auto;
      right: ${props => props.theme.spacing[1]};
    }
  `}
`;

// Компонент Timeline
const Timeline = ({
  items,
  placement = 'default',
  className = '',
  ...props
}) => {
  return (
    <TimelineContainer
      placement={placement}
      className={`${className} timeline ${placement}`}
      {...props}
    >
      {items.map((item, index) => (
        <TimelineItem
          key={index}
          placement={placement}
          variant={item.variant}
          icon={item.icon}
        >
          <div className="timeline-marker">
            {item.icon && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
              </svg>
            )}
          </div>
          
          <div className="timeline-content">
            {item.title && (
              <div className="timeline-title">{item.title}</div>
            )}
            
            {item.subtitle && (
              <div className="timeline-subtitle">{item.subtitle}</div>
            )}
            
            {item.description && (
              <div className="timeline-description">{item.description}</div>
            )}
            
            {item.footer && (
              <div className="timeline-footer">
                {item.footer}
              </div>
            )}
          </div>
        </TimelineItem>
      ))}
    </TimelineContainer>
  );
};

// Пропс-types для TypeScript
Timeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subtitle: PropTypes.string,
      description: PropTypes.string,
      variant: PropTypes.oneOf(['default', 'success', 'danger', 'warning', 'info']),
      icon: PropTypes.node,
      footer: PropTypes.node,
    })
  ).isRequired,
  placement: PropTypes.oneOf(['default', 'alternate']),
  className: PropTypes.string,
};

// Компонент TimelineVertical для вертикальной временной линии
const TimelineVerticalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
  
  .timeline-item {
    display: flex;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[3]};
    
    .timeline-marker {
      flex-shrink: 0;
      width: ${props => props.theme.spacing[4]};
      height: ${props => props.theme.spacing[4]};
      border-radius: 50%;
      background-color: ${props => props.theme.colors.surface.primary};
      border: 2px solid ${props => props.theme.colors.border.medium};
      display: flex;
      align-items: center;
      justify-content: center;
      
      ${props => props.variant === 'success' && `
        border-color: ${props.theme.colors.success};
        background-color: ${props.theme.colors.success};
      `}
      
      ${props => props.variant === 'danger' && `
        border-color: ${props.theme.colors.danger};
        background-color: ${props.theme.colors.danger};
      `}
      
      ${props => props.variant === 'warning' && `
        border-color: ${props.theme.colors.warning};
        background-color: ${props.theme.colors.warning};
      `}
      
      ${props => props.variant === 'info' && `
        border-color: ${props.theme.colors.info};
        background-color: ${props.theme.colors.info};
      `}
      
      ${props => props.icon && `
        background-color: ${props.theme.colors.surface.primary};
        
        svg {
          width: ${props.theme.spacing[2]};
          height: ${props.theme.spacing[2]};
          stroke: ${props => props.theme.colors.text.primary};
        }
      `}
    }
    
    .timeline-content {
      flex: 1;
      padding: ${props => props.theme.spacing[3]};
      background-color: ${props => props.theme.colors.surface.primary};
      border-radius: ${props => props.theme.borderRadius.md};
      box-shadow: ${props => props.theme.shadow.sm};
      
      .timeline-title {
        font-size: ${props => props.theme.typography.fontSize.base[0]};
        font-weight: ${props => props.theme.typography.fontWeight.semibold};
        color: ${props => props.theme.colors.text.primary};
        margin-bottom: ${props => props.theme.spacing[1]};
      }
      
      .timeline-subtitle {
        font-size: ${props => props.theme.typography.fontSize.sm[0]};
        color: ${props => props.theme.colors.text.tertiary};
        margin-bottom: ${props => props.theme.spacing[2]};
      }
      
      .timeline-description {
        font-size: ${props => props.theme.typography.fontSize.sm[0]};
        color: ${props => props.theme.colors.text.secondary};
        line-height: ${props => props.theme.typography.lineHeight.normal};
      }
      
      .timeline-footer {
        margin-top: ${props => props.theme.spacing[2]};
        display: flex;
        justify-content: flex-end;
        
        button {
          font-size: ${props => props.theme.typography.fontSize.sm[0]};
        }
      }
    }
    
    ${props => props.placement === 'right' && `
      flex-direction: row-reverse;
      
      .timeline-content {
        text-align: right;
      }
    `}
  }
`;

// Компонент TimelineVertical
const TimelineVertical = ({
  items,
  placement = 'left',
  className = '',
  ...props
}) => {
  return (
    <TimelineVerticalContainer
      placement={placement}
      className={`${className} timeline-vertical ${placement}`}
      {...props}
    >
      {items.map((item, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-marker">
            {item.icon && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
              </svg>
            )}
          </div>
          
          <div className="timeline-content">
            {item.title && (
              <div className="timeline-title">{item.title}</div>
            )}
            
            {item.subtitle && (
              <div className="timeline-subtitle">{item.subtitle}</div>
            )}
            
            {item.description && (
              <div className="timeline-description">{item.description}</div>
            )}
            
            {item.footer && (
              <div className="timeline-footer">
                {item.footer}
              </div>
            )}
          </div>
        </div>
      ))}
    </TimelineVerticalContainer>
  );
};

// Пропп-types для TimelineVertical
TimelineVertical.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subtitle: PropTypes.string,
      description: PropTypes.string,
      variant: PropTypes.oneOf(['default', 'success', 'danger', 'warning', 'info']),
      icon: PropTypes.node,
      footer: PropTypes.node,
    })
  ).isRequired,
  placement: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
};

// Компонент TimelineHorizontal для горизонтальной временной линии
const TimelineHorizontalContainer = styled.div`
  display: flex;
  overflow-x: auto;
  padding: ${props => props.theme.spacing[4]} 0;
  gap: ${props => props.theme.spacing[4]};
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.border.light};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.medium};
    border-radius: 2px;
  }
  
  .timeline-item {
    flex: 0 0 auto;
    width: ${props => props.itemWidth || '250px'};
    text-align: center;
    
    .timeline-marker {
      width: ${props => props.theme.spacing[5]};
      height: ${props => props.theme.spacing[5]};
      border-radius: 50%;
      background-color: ${props => props.theme.colors.surface.primary};
      border: 2px solid ${props => props.theme.colors.border.medium};
      margin: 0 auto ${props => props.theme.spacing[2]};
      display: flex;
      align-items: center;
      justify-content: center;
      
      ${props => props.variant === 'success' && `
        border-color: ${props.theme.colors.success};
        background-color: ${props.theme.colors.success};
      `}
      
      ${props => props.variant === 'danger' && `
        border-color: ${props.theme.colors.danger};
        background-color: ${props.theme.colors.danger};
      `}
      
      ${props => props.variant === 'warning' && `
        border-color: ${props.theme.colors.warning};
        background-color: ${props.theme.colors.warning};
      `}
      
      ${props => props.variant === 'info' && `
        border-color: ${props.theme.colors.info};
        background-color: ${props.theme.colors.info};
      `}
      
      ${props => props.icon && `
        background-color: ${props.theme.colors.surface.primary};
        
        svg {
          width: ${props.theme.spacing[2]};
          height: ${props.theme.spacing[2]};
          stroke: ${props => props.theme.colors.text.primary};
        }
      `}
    }
    
    .timeline-content {
      padding: ${props => props.theme.spacing[3]};
      background-color: ${props => props.theme.colors.surface.primary};
      border-radius: ${props => props.theme.borderRadius.md};
      box-shadow: ${props => props.theme.shadow.sm};
      
      .timeline-title {
        font-size: ${props => props.theme.typography.fontSize.base[0]};
        font-weight: ${props => props.theme.typography.fontWeight.semibold};
        color: ${props => props.theme.colors.text.primary};
        margin-bottom: ${props => props.theme.spacing[1]};
      }
      
      .timeline-subtitle {
        font-size: ${props => props.theme.typography.fontSize.sm[0]};
        color: ${props => props.theme.colors.text.tertiary};
        margin-bottom: ${props => props.theme.spacing[2]};
      }
      
      .timeline-description {
        font-size: ${props => props.theme.typography.fontSize.sm[0]};
        color: ${props => props.theme.colors.text.secondary};
        line-height: ${props => props.theme.typography.lineHeight.normal};
      }
      
      .timeline-footer {
        margin-top: ${props => props.theme.spacing[2]};
        display: flex;
        justify-content: center;
        
        button {
          font-size: ${props => props.theme.typography.fontSize.sm[0]};
        }
      }
    }
  }
`;

// Компонент TimelineHorizontal
const TimelineHorizontal = ({
  items,
  itemWidth,
  className = '',
  ...props
}) => {
  return (
    <TimelineHorizontalContainer
      itemWidth={itemWidth}
      className={`${className} timeline-horizontal`}
      {...props}
    >
      {items.map((item, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-marker">
            {item.icon && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
              </svg>
            )}
          </div>
          
          <div className="timeline-content">
            {item.title && (
              <div className="timeline-title">{item.title}</div>
            )}
            
            {item.subtitle && (
              <div className="timeline-subtitle">{item.subtitle}</div>
            )}
            
            {item.description && (
              <div className="timeline-description">{item.description}</div>
            )}
            
            {item.footer && (
              <div className="timeline-footer">
                {item.footer}
              </div>
            )}
          </div>
        </div>
      ))}
    </TimelineHorizontalContainer>
  );
};

// Пропп-types для TimelineHorizontal
TimelineHorizontal.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subtitle: PropTypes.string,
      description: PropTypes.string,
      variant: PropTypes.oneOf(['default', 'success', 'danger', 'warning', 'info']),
      icon: PropTypes.node,
      footer: PropTypes.node,
    })
  ).isRequired,
  itemWidth: PropTypes.string,
  className: PropTypes.string,
};

// Компонент TimelineStep для шаговой временной линии
const TimelineStepContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .timeline-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    
    .timeline-marker {
      width: ${props => props.theme.spacing[5]};
      height: ${props => props.theme.spacing[5]};
      border-radius: 50%;
      background-color: ${props => props.theme.colors.surface.primary};
      border: 2px solid ${props => props.theme.colors.border.medium};
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: ${props => props.theme.spacing[2]};
      z-index: 1;
      
      ${props => props.variant === 'success' && `
        border-color: ${props.theme.colors.success};
        background-color: ${props.theme.colors.success};
      `}
      
      ${props => props.variant === 'danger' && `
        border-color: ${props.theme.colors.danger};
        background-color: ${props.theme.colors.danger};
      `}
      
      ${props => props.variant === 'warning' && `
        border-color: ${props.theme.colors.warning};
        background-color: ${props.theme.colors.warning};
      `}
      
      ${props => props.variant === 'info' && `
        border-color: ${props.theme.colors.info};
        background-color: ${props.theme.colors.info};
      `}
      
      ${props => props.active && `
        border-color: ${props.theme.colors.primary};
        background-color: ${props.theme.colors.primary};
      }
      
      ${props => props.completed && `
        border-color: ${props.theme.colors.success};
        background-color: ${props.theme.colors.success};
      }
      
      ${props => props.icon && `
        background-color: ${props.theme.colors.surface.primary};
        
        svg {
          width: ${props.theme.spacing[2]};
          height: ${props.theme.spacing[2]};
          stroke: ${props => props.theme.colors.text.primary};
        }
      `}
    }
    
    .timeline-content {
      text-align: center;
      
      .timeline-title {
        font-size: ${props => props.theme.typography.fontSize.base[0]};
        font-weight: ${props => props.theme.typography.fontWeight.semibold};
        color: ${props => props.active ? props.theme.colors.text.primary : props.theme.colors.text.tertiary};
        margin-bottom: ${props => props.theme.spacing[0.5]};
      }
      
      .timeline-subtitle {
        font-size: ${props => props.theme.typography.fontSize.sm[0]};
        color: ${props => props.theme.colors.text.tertiary};
      }
    }
  }
  
  .timeline-connector {
    flex: 1;
    height: 2px;
    background-color: ${props => props.theme.colors.border.medium};
    margin: 0 ${props => props.theme.spacing[2]};
    
    ${props => props.active && `
      background-color: ${props.theme.colors.primary};
    `}
  }
`;

// Компонент TimelineStep
const TimelineStep = ({
  steps,
  activeStep = 0,
  className = '',
  ...props
}) => {
  return (
    <TimelineStepContainer
      activeStep={activeStep}
      className={`${className} timeline-step`}
      {...props}
    >
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="timeline-step">
            <div
              className={`timeline-marker ${activeStep >= index ? 'active' : ''} ${activeStep > index ? 'completed' : ''}`}
              variant={step.variant}
              icon={step.icon}
            >
              {activeStep > index && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              )}
            </div>
            
            <div className="timeline-content">
              {step.title && (
                <div className="timeline-title">{step.title}</div>
              )}
              
              {step.subtitle && (
                <div className="timeline-subtitle">{step.subtitle}</div>
              )}
            </div>
          </div>
          
          {index < steps.length - 1 && (
            <div className={`timeline-connector ${activeStep > index ? 'active' : ''}`}></div>
          )}
        </React.Fragment>
      ))}
    </TimelineStepContainer>
  );
};

// Пропп-types для TimelineStep
TimelineStep.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subtitle: PropTypes.string,
      variant: PropTypes.oneOf(['default', 'success', 'danger', 'warning', 'info']),
      icon: PropTypes.node,
    })
  ).isRequired,
  activeStep: PropTypes.number,
  className: PropTypes.string,
};

// Экспорт компонентов
export {
  Timeline,
  TimelineVertical as TimelineVerticalComponent,
  TimelineHorizontal as TimelineHorizontalComponent,
  TimelineStep as TimelineStepComponent,
};