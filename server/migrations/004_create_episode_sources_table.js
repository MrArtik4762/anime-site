/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('episode_sources', function(table) {
    table.increments('id').primary();
    table.integer('episode_number').notNullable();
    table.string('source_url', 2048).notNullable();
    table.string('quality', 10).notNullable();
    table.string('title', 255).notNullable();
    table.string('provider', 50).notNullable();
    table.integer('anime_id').unsigned().notNullable();
    table.timestamp('last_checked').nullable();
    table.boolean('is_active').defaultTo(true).notNullable();
    table.integer('priority').defaultTo(1).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    
    // Внешний ключ на таблицу anime
    table.foreign('anime_id').references('id').inTable('anime').onDelete('CASCADE');
  });

  // Создадим индексы для производительности
  await knex.schema.raw('CREATE INDEX idx_episode_sources_anime_id ON episode_sources(anime_id)');
  await knex.schema.raw('CREATE INDEX idx_episode_sources_episode_number ON episode_sources(episode_number)');
  await knex.schema.raw('CREATE INDEX idx_episode_sources_provider ON episode_sources(provider)');
  await knex.schema.raw('CREATE INDEX idx_episode_sources_quality ON episode_sources(quality)');
  await knex.schema.raw('CREATE INDEX idx_episode_sources_is_active ON episode_sources(is_active)');
  await knex.schema.raw('CREATE INDEX idx_episode_sources_priority ON episode_sources(priority)');
  await knex.schema.raw('CREATE INDEX idx_episode_sources_last_checked ON episode_sources(last_checked)');
  await knex.schema.raw('CREATE INDEX idx_episode_sources_created_at ON episode_sources(created_at)');
  await knex.schema.raw('CREATE INDEX idx_episode_sources_updated_at ON episode_sources(updated_at)');
  
  // Составные индексы для сложных запросов
  await knex.schema.raw('CREATE INDEX idx_episode_sources_anime_episode ON episode_sources(anime_id, episode_number)');
  await knex.schema.raw('CREATE INDEX idx_episode_sources_anime_episode_priority ON episode_sources(anime_id, episode_number, priority)');
  await knex.schema.raw('CREATE INDEX idx_episode_sources_provider_quality ON episode_sources(provider, quality)');
  await knex.schema.raw('CREATE INDEX idx_episode_sources_anime_active_priority ON episode_sources(anime_id, is_active, priority)');
  await knex.schema.raw('CREATE INDEX idx_episode_sources_quality_active ON episode_sources(quality, is_active)');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTable('episode_sources');
};