import React, { useEffect, useRef, memo } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Button from './Button';

// Оверлей для модального окна
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
  padding: ${props => props.theme.spacing[4]};
  
  // Анимация появления
  animation: fadeIn ${props => props.theme.transitions.normal};
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Контейнер модального окна
const ModalContainer = styled.div`
  position: relative;
  background-color: ${props => props.theme.colors.surface.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadow.lg};
  max-width: ${props => props.fullWidth ? '100%' : '600px'};
  width: 100%;
  max-height: calc(100vh - ${props => props.theme.spacing[8]});
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn ${props => props.theme.transitions.normal};
  
  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

// Заголовок модального окна
const ModalHeader = styled.div`
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.medium};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

// Заголовок
const ModalTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg[0]};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

// Кнопка закрытия
const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.tertiary};
  transition: ${props => props.theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.theme.colors.border.light};
    color: ${props => props.theme.colors.text.primary};
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

// Содержимое модального окна
const ModalBody = styled.div`
  padding: ${props => props.theme.spacing[4]};
  overflow-y: auto;
  flex-grow: 1;
`;

// Нижняя часть модального окна
const ModalFooter = styled.div`
  padding: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.medium};
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing[2]};
  flex-shrink: 0;
`;

// Компонент Modal
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
  width,
  height,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  ...props
}) => {
  const modalRef = useRef(null);
  
  // Закрытие модального окна по нажатию Escape
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, closeOnEsc, onClose]);
  
  // Закрытие модального окна по клику на оверлей
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };
  
  // Закрытие модального окна по клику вне контейнера
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && closeOnOverlayClick) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeOnOverlayClick, onClose]);
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <ModalOverlay
      onClick={handleOverlayClick}
      className={`${className} modal-overlay`}
      {...props}
    >
      <ModalContainer
        ref={modalRef}
        className={`${className} modal-container`}
        style={{
          maxWidth: width,
          maxHeight: height,
        }}
      >
        {title && (
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
            {showCloseButton && (
              <CloseButton onClick={onClose} aria-label="Закрыть модальное окно">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </CloseButton>
            )}
          </ModalHeader>
        )}
        
        <ModalBody>
          {children}
        </ModalBody>
        
        {footer && (
          <ModalFooter>
            {footer}
          </ModalFooter>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

// Пропс-types для TypeScript
Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
};

// Компонент Modal для простых случаев использования
const ModalSimple = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={true}
      closeOnOverlayClick={true}
      closeOnEsc={true}
    >
      {children}
    </Modal>
  );
};

// Компонент Modal с подтверждением
const ModalConfirm = memo(({
  isOpen,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message = 'Вы уверены, что хотите выполнить это действие?',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmButtonVariant = 'primary',
  ...props
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </>
      }
      {...props}
    >
      <p>{message}</p>
    </Modal>
  );
});

// Пропс-types для ModalConfirm
ModalConfirm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmButtonVariant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
};

// Экспорт компонентов
export { Modal, ModalSimple, ModalConfirm };