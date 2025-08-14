import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Основной контейнер карточки
const CardContainer = styled.div`
  background-color: ${props => props.theme.colors.surface.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadow.sm};
  overflow: hidden;
  transition: ${props => props.theme.transitions.normal};
  display: flex;
  flex-direction: column;
  height: ${props => props.fullHeight ? '100%' : 'auto'};
  width: 100%;
  
  &:hover {
    box-shadow: ${props => props.theme.shadow.md};
    transform: translateY(-2px);
  }
  
  ${props => props.clickable && `
    cursor: pointer;
  `}
`;

// Заголовок карточки
const CardHeader = styled.div`
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.medium};
  background-color: ${props => props.variant === 'elevated' ? 'rgba(0, 0, 0, 0.02)' : 'transparent'};
  
  ${props => props.variant === 'outlined' && `
    border-bottom: 1px solid ${props.theme.colors.border.medium};
  `}
`;

// Заголовок карточки
const CardTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg[0]};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

// Описание карточки
const CardDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing[1]};
  line-height: ${props => props.theme.typography.lineHeight.normal};
`;

// Содержимое карточки
const CardBody = styled.div`
  padding: ${props => props.theme.spacing[4]};
  flex-grow: 1;
`;

// Нижняя часть карточки
const CardFooter = styled.div`
  padding: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.medium};
  background-color: ${props => props.variant === 'elevated' ? 'rgba(0, 0, 0, 0.02)' : 'transparent'};
  display: flex;
  justify-content: ${props => props.align || 'flex-start'};
  gap: ${props => props.theme.spacing[2]};
`;

// Изображение в карточке
const CardImage = styled.img`
  width: 100%;
  height: ${props => props.height || '200px'};
  object-fit: cover;
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

// Бейдж в карточке
const CardBadge = styled.span`
  position: absolute;
  top: ${props => props.theme.spacing[3]};
  right: ${props => props.theme.spacing[3]};
  background-color: ${props => props.color ? props.theme.colors[props.color] : props.theme.colors.danger};
  color: white;
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.full};
  box-shadow: ${props => props.theme.shadow.sm};
`;

// Обертка для изображения с бейджом
const CardImageWrapper = styled.div`
  position: relative;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

// Компонент Card
const Card = ({
  title,
  description,
  children,
  footer,
  image,
  imageHeight,
  badge,
  badgeColor,
  className = '',
  variant = 'default',
  clickable = false,
  fullHeight = false,
  onClick,
  ...props
}) => {
  return (
    <CardContainer
      className={`${className} card ${variant}`}
      variant={variant}
      clickable={clickable}
      fullHeight={fullHeight}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {image && (
        <CardImageWrapper>
          <CardImage src={image} alt={title} height={imageHeight} />
          {badge && (
            <CardBadge color={badgeColor}>
              {badge}
            </CardBadge>
          )}
        </CardImageWrapper>
      )}
      
      {(title || description) && (
        <CardHeader variant={variant}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
      {children && (
        <CardBody>
          {children}
        </CardBody>
      )}
      
      {footer && (
        <CardFooter align={footer.props?.align}>
          {footer}
        </CardFooter>
      )}
    </CardContainer>
  );
};

// Пропс-types для TypeScript
Card.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  image: PropTypes.string,
  imageHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  badge: PropTypes.node,
  badgeColor: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated']),
  clickable: PropTypes.bool,
  fullHeight: PropTypes.bool,
  onClick: PropTypes.func,
};

// Компонент CardGroup для группы карточек
const CardGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${props => props.minWidth || '300px'}, 1fr));
  gap: ${props => props.theme.spacing[4]};
  
  ${props => props.gap && `
    gap: ${props.gap};
  `}
  
  ${props => props.responsive && `
    @media (max-width: ${props => props.theme.breakpoints.md}) {
      grid-template-columns: repeat(auto-fill, minmax(${props => props.responsive.md || '250px'}, 1fr));
    }
    
    @media (max-width: ${props => props.theme.breakpoints.sm}) {
      grid-template-columns: 1fr;
    }
  `}
`;

// Компонент CardGroup
const CardGroupComponent = ({
  children,
  className = '',
  gap,
  responsive,
  minWidth,
  ...props
}) => {
  return (
    <CardGroup
      className={`${className} card-group`}
      gap={gap}
      responsive={responsive}
      minWidth={minWidth}
      {...props}
    >
      {children}
    </CardGroup>
  );
};

// Пропс-types для CardGroup
CardGroupComponent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  gap: PropTypes.string,
  responsive: PropTypes.shape({
    md: PropTypes.string,
    sm: PropTypes.string,
  }),
  minWidth: PropTypes.string,
};

// Компонент Card для сетки
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 3}, 1fr);
  gap: ${props => props.theme.spacing[4]};
  
  ${props => props.gap && `
    gap: ${props.gap};
  `}
  
  ${props => props.responsive && `
    @media (max-width: ${props => props.theme.breakpoints.md}) {
      grid-template-columns: repeat(${props => props.responsive.md || 2}, 1fr);
    }
    
    @media (max-width: ${props => props.theme.breakpoints.sm}) {
      grid-template-columns: 1fr;
    }
  `}
`;

// Компонент CardGrid
const CardGridComponent = ({
  children,
  className = '',
  columns,
  gap,
  responsive,
  ...props
}) => {
  return (
    <CardGrid
      className={`${className} card-grid`}
      columns={columns}
      gap={gap}
      responsive={responsive}
      {...props}
    >
      {children}
    </CardGrid>
  );
};

// Пропс-types для CardGrid
CardGridComponent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  columns: PropTypes.number,
  gap: PropTypes.string,
  responsive: PropTypes.shape({
    md: PropTypes.number,
    sm: PropTypes.number,
  }),
};

// Компонент CardList для списка карточек
const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
  
  ${props => props.gap && `
    gap: ${props.gap};
  `}
`;

// Компонент CardList
const CardListComponent = ({
  children,
  className = '',
  gap,
  ...props
}) => {
  return (
    <CardList
      className={`${className} card-list`}
      gap={gap}
      {...props}
    >
      {children}
    </CardList>
  );
};

// Пропс-types для CardList
CardListComponent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  gap: PropTypes.string,
};

// Экспорт компонентов
export { Card, CardGroup as CardGroupComponent, CardGrid as CardGridComponent, CardList as CardListComponent };