import React from 'react';
import AnimePage from '../../AnimePage';

// Это компонент страницы для Next.js, который будет использовать существующий компонент AnimePage
const AnimeDetailPage = ({ anime }) => {
  // Если данные об аниме не загружены, показываем загрузку
  if (!anime) {
    return <div>Загрузка...</div>;
  }

  // Передаем данные об аниме в существующий компонент AnimePage
  return <AnimePage anime={anime} />;
};

// Добавляем getServerSideProps для загрузки данных на сервере
export async function getServerSideProps({ params }) {
  try {
    // Загружаем данные об аниме с API
    const res = await fetch(`https://aniliberty.top/api/v1/titles/${params.id}`);
    const data = await res.json();
    
    // Если аниме не найдено, возвращаем 404
    if (!data) {
      return {
        notFound: true,
      };
    }
    
    return { 
      props: { 
        anime: data 
      } 
    };
  } catch (error) {
    console.error('Ошибка загрузки данных аниме:', error);
    return {
      props: { 
        anime: null 
      }
    };
  }
}

export default AnimeDetailPage;