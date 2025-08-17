import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  return (
    <header style={{
      background: '#1a1a1a',
      color: 'white',
      padding: '1rem',
      borderBottom: '2px solid #333'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem' }}>
          Аниме Сайт
        </Link>
        
        <nav>
          <Link 
            to="/" 
            style={{ 
              marginRight: '1rem',
              color: location.pathname === '/' ? '#4CAF50' : 'white',
              textDecoration: 'none'
            }}
          >
            Главная
          </Link>
          <Link 
            to="/login" 
            style={{ 
              color: location.pathname === '/login' ? '#4CAF50' : 'white',
              textDecoration: 'none'
            }}
          >
            Вход
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;