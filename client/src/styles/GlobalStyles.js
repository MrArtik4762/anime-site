import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${props => props.theme?.colors?.background?.primary || '#FFFFFF'};
    color: ${props => props.theme?.colors?.text?.primary || '#000000'};
    line-height: 1.6;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
  }

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  a:hover {
    color: ${props => props.theme?.colors?.primary || '#FF4D4D'};
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.3s ease;
  }

  input, textarea, select {
    font-family: inherit;
    border: none;
    outline: none;
    background: transparent;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  ul, ol {
    list-style: none;
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme?.colors?.surface?.primary || '#FAFAFA'};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.colors?.primary || '#FF4D4D'};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme?.colors?.primaryDark || '#E55555'};
  }

  /* Loading animation */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes fadeInDown {
    from {
      transform: translateY(-30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes fadeInLeft {
    from {
      transform: translateX(-30px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeInRight {
    from {
      transform: translateX(30px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideInDown {
    from {
      transform: translateY(-30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes zoomIn {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes flipInX {
    from {
      transform: perspective(400px) rotateX(90deg);
      opacity: 0;
    }
    to {
      transform: perspective(400px) rotateX(0deg);
      opacity: 1;
    }
  }

  @keyframes flipInY {
    from {
      transform: perspective(400px) rotateY(90deg);
      opacity: 0;
    }
    to {
      transform: perspective(400px) rotateY(0deg);
      opacity: 1;
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-5px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(5px);
    }
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* Utility classes */
  .fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }

  .fade-in-up {
    animation: fadeInUp 0.5s ease-out;
  }

  .fade-in-down {
    animation: fadeInDown 0.5s ease-out;
  }

  .fade-in-left {
    animation: fadeInLeft 0.5s ease-out;
  }

  .fade-in-right {
    animation: fadeInRight 0.5s ease-out;
  }

  .scale-in {
    animation: scaleIn 0.5s ease-out;
  }

  .bounce {
    animation: bounce 1s ease infinite;
  }

  .pulse {
    animation: pulse 2s ease infinite;
  }

  .slide-in-up {
    animation: slideInUp 0.5s ease-out;
  }

  .slide-in-down {
    animation: slideInDown 0.5s ease-out;
  }

  .slide-in-left {
    animation: slideInLeft 0.5s ease-out;
  }

  .slide-in-right {
    animation: slideInRight 0.5s ease-out;
  }

  .zoom-in {
    animation: zoomIn 0.5s ease-out;
  }

  .flip-in-x {
    animation: flipInX 0.6s ease-out;
  }

  .flip-in-y {
    animation: flipInY 0.6s ease-out;
  }

  .shake {
    animation: shake 0.5s ease-in-out;
  }

  .gradient-bg {
    background: linear-gradient(-45deg, ${props => props.theme?.colors?.primary || '#FF4D4D'}, ${props => props.theme?.colors?.secondary || '#4D79FF'}, ${props => props.theme?.colors?.accent || '#FFD54D'}, ${props => props.theme?.colors?.primary || '#FF4D4D'});
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
  }

  .loading {
    animation: spin 1s linear infinite;
  }

  /* Animation delays */
  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }
  .delay-400 { animation-delay: 400ms; }
  .delay-500 { animation-delay: 500ms; }
  .delay-600 { animation-delay: 600ms; }
  .delay-700 { animation-delay: 700ms; }
  .delay-800 { animation-delay: 800ms; }
  .delay-900 { animation-delay: 900ms; }
  .delay-1000 { animation-delay: 1000ms; }

  /* Animation durations */
  .duration-100 { animation-duration: 100ms; }
  .duration-200 { animation-duration: 200ms; }
  .duration-300 { animation-duration: 300ms; }
  .duration-500 { animation-duration: 500ms; }
  .duration-700 { animation-duration: 700ms; }
  .duration-1000 { animation-duration: 1000ms; }

  /* Animation easing functions */
  .ease-linear { animation-timing-function: linear; }
  .ease-in { animation-timing-function: ease-in; }
  .ease-out { animation-timing-function: ease-out; }
  .ease-in-out { animation-timing-function: ease-in-out; }
  .ease-bounce { animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  .ease-elastic { animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55); }

  /* Responsive breakpoints */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 16px;
    }
  }
`;

// Общие стилизованные компоненты
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

export const Card = styled.div`
  background: ${props => props.theme?.colors?.surface || '#FFFFFF'};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

export const Button = styled.button`
  background: ${props => props.variant === 'outline'
    ? 'transparent'
    : props.theme?.colors?.primary || '#FF4D4D'};
  color: ${props => props.variant === 'outline'
    ? props.theme?.colors?.primary || '#FF4D4D'
    : 'white'};
  border: ${props => props.variant === 'outline'
    ? `2px solid ${props.theme?.colors?.primary || '#FF4D4D'}`
    : 'none'};
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;

  &:hover {
    background: ${props => props.variant === 'outline'
    ? props.theme?.colors?.primary || '#FF4D4D'
    : props.theme?.colors?.primaryDark || '#E55555'};
    color: white;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  ${props => props.size === 'small' && `
    padding: 8px 16px;
    font-size: 12px;
    min-height: 36px;
  `}

  ${props => props.size === 'large' && `
    padding: 16px 32px;
    font-size: 16px;
    min-height: 52px;
  `}

  ${props => props.fullWidth && `
    width: 100%;
  `}
`;

export const Input = styled.input`
  background: ${props => props.theme?.colors?.surface || '#FFFFFF'};
  border: 2px solid ${props => props.theme?.colors?.border || '#E0E0E0'};
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: ${props => props.theme?.colors?.text || '#000000'};
  transition: border-color 0.3s ease;
  width: 100%;

  &:focus {
    border-color: ${props => props.theme?.colors?.primary || '#FF4D4D'};
  }

  &::placeholder {
    color: ${props => props.theme?.colors?.textSecondary || '#666666'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Textarea = styled.textarea`
  background: ${props => props.theme?.colors?.surface || '#FFFFFF'};
  border: 2px solid ${props => props.theme?.colors?.border || '#E0E0E0'};
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: ${props => props.theme?.colors?.text || '#000000'};
  transition: border-color 0.3s ease;
  width: 100%;
  min-height: 120px;
  resize: vertical;

  &:focus {
    border-color: ${props => props.theme?.colors?.primary || '#FF4D4D'};
  }

  &::placeholder {
    color: ${props => props.theme?.colors?.textSecondary || '#666666'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const LoadingSpinner = styled.div`
  width: ${props => props.size || '24px'};
  height: ${props => props.size || '24px'};
  border: 2px solid ${props => props.theme?.colors?.border || '#E0E0E0'};
  border-top: 2px solid ${props => props.theme?.colors?.primary || '#FF4D4D'};
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${props => props.minWidth || '300px'}, 1fr));
  gap: ${props => props.gap || '24px'};
  width: 100%;
`;

export const Flex = styled.div`
  display: flex;
  align-items: ${props => props.align || 'center'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || '16px'};
  flex-direction: ${props => props.direction || 'row'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
`;
