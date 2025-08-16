const { logger } = require('./utils/logger');
const knex = require('knex');
const { db } = require('./db/knex');

const animeData = [
  {
    title: 'Твое имя',
    english_title: 'Your Name',
    japanese_title: '君の名は。',
    romaji_title: 'Kimi no Na wa',
    synopsis: 'Двое подростков, живущих в разных частях Японии, обнаруживают, что они могут обмениваться телами во время сна.',
    type: 'фильм',
    status: 'выпущен',
    episodes: 1,
    season: 'лето',
    year: 2016,
    genres: JSON.stringify(['драма', 'романтика', 'фэнтези']),
    rating_score: 8.4,
    rating_votes: 1000000,
    popularity: 95,
    is_active: true,
    is_approved: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    title: 'Атака Титанов',
    english_title: 'Attack on Titan',
    japanese_title: '進撃の巨人',
    romaji_title: 'Shingeki no Kyojin',
    synopsis: 'Человечество на грани исчезновения из-за существ под названием Титаны.',
    type: 'ТВ',
    status: 'онгоинг',
    episodes: 75,
    season: 'весна',
    year: 2013,
    genres: JSON.stringify(['экшен', 'фэнтези', 'драма', 'ужасы', 'триллер']),
    rating_score: 9.0,
    rating_votes: 2000000,
    popularity: 98,
    is_active: true,
    is_approved: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    title: 'Токийские мстители',
    english_title: 'Tokyo Revengers',
    japanese_title: '東京リベンジャーズ',
    romaji_title: 'Tōkyō Ribenjāzu',
    synopsis: 'Такемити Ханагаки узнает, что его бывшая девушка была убита бандой Токийских мстителей.',
    type: 'ТВ',
    status: 'онгоинг',
    episodes: 37,
    season: 'весна',
    year: 2021,
    genres: JSON.stringify(['экшен', 'драма', 'сэйнэн', 'научная фантастика']),
    rating_score: 8.2,
    rating_votes: 1500000,
    popularity: 85,
    is_active: true,
    is_approved: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    title: 'Клинок, рассекающий демонов',
    english_title: 'Demon Slayer',
    japanese_title: '鬼滅の刃',
    romaji_title: 'Kimetsu no Yaiba',
    synopsis: 'Танjiro Камадо становится охотником на демонов после того, как его семья была убита, а его младшая сестра Нэзуко превращена в демона.',
    type: 'ТВ',
    status: 'онгоинг',
    episodes: 45,
    season: 'весна',
    year: 2019,
    genres: JSON.stringify(['экшен', 'супер сила', 'исторический', 'драма']),
    rating_score: 8.7,
    rating_votes: 2500000,
    popularity: 92,
    is_active: true,
    is_approved: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    title: 'Магическая битва',
    english_title: 'Jujutsu Kaisen',
    japanese_title: '呪術廻戦',
    romaji_title: 'Jujutsu Kaisen',
    synopsis: 'Юдзи Итадори поглощает могущественную проклятую сущность, чтобы спасти своих друзей, и становится учеником школы магии.',
    type: 'ТВ',
    status: 'онгоинг',
    episodes: 24,
    season: 'осень',
    year: 2020,
    genres: JSON.stringify(['экшен', 'супер сила', 'школа', 'ужасы']),
    rating_score: 8.5,
    rating_votes: 1800000,
    popularity: 90,
    is_active: true,
    is_approved: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function seedDatabase() {
  try {
    logger.info('Starting database seed...');
    
    // Проверяем, существует ли таблица animes
    const tableExists = await db.schema.hasTable('animes');
    
    if (!tableExists) {
      logger.info('Creating animes table...');
      await db.schema.createTable('animes', table => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.string('english_title');
        table.string('japanese_title');
        table.string('romaji_title');
        table.text('synopsis');
        table.string('type').defaultTo('TV');
        table.string('status').defaultTo('Finished Airing');
        table.integer('episodes').defaultTo(1);
        table.string('season');
        table.integer('year');
        table.text('genres');
        table.decimal('rating_score', 3, 1).defaultTo(0);
        table.integer('rating_votes').defaultTo(0);
        table.integer('popularity').defaultTo(0);
        table.boolean('is_active').defaultTo(true);
        table.boolean('is_approved').defaultTo(false);
        table.timestamps(true, true);
      });
    }
    
    // Удаляем существующие данные
    logger.info('Clearing existing anime data...');
    await db('animes').del();
    
    // Вставляем тестовые данные
    logger.info('Inserting test anime data...');
    const insertedAnime = await db('animes').insert(animeData).returning('*');
    logger.info(`Successfully inserted ${insertedAnime.length} anime entries`);
    
    logger.info('Database seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Запускаем сидирование
seedDatabase();