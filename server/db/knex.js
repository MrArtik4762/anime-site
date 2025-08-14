const knex = require('knex');
const knexConfig = require('../knexfile');
const { NODE_ENV } = process.env;

// Определяем текущую среду
const environment = NODE_ENV || 'development';
const config = knexConfig[environment];

// Инициализируем knex с конфигурацией
const db = knex(config);

// Функция для проверки соединения с базой данных
const checkConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Подключение к базе данных успешно установлено');
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error.message);
    return false;
  }
};

// Функция для закрытия соединения
const closeConnection = async () => {
  try {
    await db.destroy();
    console.log('🔌 Соединение с базой данных закрыто');
    return true;
  } catch (error) {
    console.error('❌ Ошибка при закрытии соединения:', error.message);
    return false;
  }
};

// Функция для выполнения миграций
const runMigrations = async () => {
  try {
    console.log('🔄 Запуск миграций базы данных...');
    await db.migrate.latest();
    console.log('✅ Миграции успешно выполнены');
    return true;
  } catch (error) {
    console.error('❌ Ошибка выполнения миграций:', error.message);
    return false;
  }
};

// Функция для отката миграций
const rollbackMigrations = async () => {
  try {
    console.log('🔄 Откат последних миграций...');
    await db.migrate.rollback();
    console.log('✅ Миграции успешно откатаны');
    return true;
  } catch (error) {
    console.error('❌ Ошибка отката миграций:', error.message);
    return false;
  }
};

// Функция для создания сидов
const runSeeds = async () => {
  try {
    console.log('🌱 Запуск сидов...');
    await db.seed.run();
    console.log('✅ Сиды успешно выполнены');
    return true;
  } catch (error) {
    console.error('❌ Ошибка выполнения сидов:', error.message);
    return false;
  }
};

// Функция для получения информации о соединении
const getConnectionInfo = () => {
  return {
    client: config.client,
    host: config.connection.host,
    port: config.connection.port,
    database: config.connection.database,
    user: config.connection.user,
    pool: {
      min: config.pool?.min || 2,
      max: config.pool?.max || 10
    }
  };
};

// Обработка событий подключения
db.on('query', (query) => {
  // Включаем логирование запросов в режиме разработки
  if (NODE_ENV === 'development') {
    console.log('🔍 SQL Query:', {
      sql: query.sql,
      bindings: query.bindings,
      __knexQueryUid: query.__knexQueryUid
    });
  }
});

db.on('query-response', (response, query) => {
  // Логируем время выполнения запросов в режиме разработки
  if (NODE_ENV === 'development') {
    console.log('⏱️ Query executed in:', query.responseTime, 'ms');
  }
});

db.on('error', (error) => {
  console.error('❌ Ошибка базы данных:', error);
});

module.exports = {
  db,
  checkConnection,
  closeConnection,
  runMigrations,
  rollbackMigrations,
  runSeeds,
  getConnectionInfo,
  environment
};