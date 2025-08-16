const knex = require('knex');
const knexfile = require('../knexfile');

// Инициализация Knex
const db = knex(knexfile.development);

async function verifySeed() {
  try {
    console.log('🔍 Проверка сидинга базы данных...');
    
    // Проверяем общее количество записей
    const countResult = await db('animes').count('id as count');
    const totalCount = countResult[0].count;
    console.log(`📊 Всего записей аниме: ${totalCount}`);
    
    // Проверяем количество записей по типам
    const typeCounts = await db('animes')
      .select('type')
      .count('id as count')
      .groupBy('type');
    
    console.log('\n📋 Распределение по типам:');
    typeCounts.forEach(item => {
      console.log(`  ${item.type}: ${item.count}`);
    });
    
    // Проверяем количество записей по годам
    const yearCounts = await db('animes')
      .select('year')
      .count('id as count')
      .groupBy('year')
      .orderBy('year', 'desc');
    
    console.log('\n📅 Распределение по годам:');
    yearCounts.forEach(item => {
      console.log(`  ${item.year}: ${item.count}`);
    });
    
    // Показываем первые 5 записей
    const recentAnimes = await db('animes')
      .select('title', 'type', 'year', 'rating_score', 'episodes')
      .orderBy('created_at', 'desc')
      .limit(5);
    
    console.log('\n🎬 Последние добавленные аниме:');
    recentAnimes.forEach((anime, index) => {
      console.log(`  ${index + 1}. ${anime.title} (${anime.type}, ${anime.year}) - Рейтинг: ${anime.rating_score}, Серий: ${anime.episodes}`);
    });
    
    // Показываем аниме с самым высоким рейтингом
    const topRated = await db('animes')
      .select('title', 'type', 'year', 'rating_score')
      .where('rating_score', '>', 8.5)
      .orderBy('rating_score', 'desc')
      .limit(5);
    
    if (topRated.length > 0) {
      console.log('\n⭐ Аниме с высоким рейтингом (>8.5):');
      topRated.forEach((anime, index) => {
        console.log(`  ${index + 1}. ${anime.title} (${anime.type}, ${anime.year}) - ${anime.rating_score}`);
      });
    }
    
    console.log('\n✅ Проверка сидинга завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при проверке сидинга:', error);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

// Запускаем проверку
verifySeed();