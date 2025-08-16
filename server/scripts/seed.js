const { logger } = require('../utils/logger');
const knex = require('knex');
const { db } = require('../db/knex');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  try {
    logger.info('Starting database seed...');
    
    // Читаем данные из JSON файла
    const seedDataPath = path.join(__dirname, 'seed-data.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
    
    if (!seedData.anime || !Array.isArray(seedData.anime)) {
      throw new Error('Invalid seed data format. Expected anime array.');
    }
    
    logger.info(`Loading ${seedData.anime.length} anime entries from seed data...`);
    
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
    
    // Подготавливаем данные для вставки
    const animeData = seedData.anime.map(anime => ({
      title: anime.name,
      english_title: anime.altNames?.[1] || anime.altNames?.[0] || anime.name,
      japanese_title: anime.altNames?.[2] || anime.altNames?.[0] || anime.name,
      romaji_title: anime.altNames?.[0] || anime.name,
      synopsis: anime.description,
      type: anime.type || 'TV',
      status: 'Finished Airing',
      episodes: anime.type === 'Movie' ? 1 : Math.floor(Math.random() * 24) + 12,
      season: getSeasonFromMonth(anime.type === 'Movie' ? 1 : Math.floor(Math.random() * 12) + 1),
      year: anime.year,
      genres: JSON.stringify(['аниме', getGenreFromType(anime.type)]),
      rating_score: anime.rating,
      rating_votes: anime.votes,
      popularity: Math.floor(Math.random() * 40) + 60,
      is_active: true,
      is_approved: true,
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    // Вставляем тестовые данные
    logger.info('Inserting test anime data...');
    const insertedAnime = await db('animes').insert(animeData).returning('*');
    logger.info(`Successfully inserted ${insertedAnime.length} anime entries`);
    
    logger.info('Database seed completed successfully');
    // Не выходим из процесса, чтобы сервер мог продолжить работу
  } catch (error) {
    logger.error('Error seeding database:', error);
    // Не выходим из процесса, чтобы сервер мог продолжить работу
  }
}

// Вспомогательные функции
function getSeasonFromMonth(month) {
  if (month >= 3 && month <= 5) return 'весна';
  if (month >= 6 && month <= 8) return 'лето';
  if (month >= 9 && month <= 11) return 'осень';
  return 'зима';
}

function getGenreFromType(type) {
  switch (type) {
    case 'Movie': return 'фильм';
    case 'OVA': return 'OVA';
    case 'ONA': return 'ONA';
    default: return 'ТВ';
  }
}

// Запускаем сидирование
seedDatabase();