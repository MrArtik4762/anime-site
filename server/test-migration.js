const knex = require('knex');
const config = require('./knexfile');

const environment = process.env.NODE_ENV || 'test';
const db = knex(config[environment]);

async function runMigrations() {
  try {
    console.log('Running migrations...');
    await db.migrate.latest();
    console.log('Migrations completed successfully');
    
    // Проверим, что таблицы создались
    try {
      const users = await db('users').select(1).first();
      console.log('- Users table: ✓');
    } catch (error) {
      console.log('- Users table: ✗');
    }
    
    try {
      const watchProgress = await db('watch_progress').select(1).first();
      console.log('- Watch progress table: ✓');
    } catch (error) {
      console.log('- Watch progress table: ✗');
    }
    
    try {
      const watchlist = await db('watchlist').select(1).first();
      console.log('- Watchlist table: ✓');
    } catch (error) {
      console.log('- Watchlist table: ✗');
    }
    
    // Закроем соединение
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    await db.destroy();
    process.exit(1);
  }
}

runMigrations();