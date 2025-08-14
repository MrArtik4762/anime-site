/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('watch_progress', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('anime_id').unsigned().notNullable();
    table.string('anime_title').notNullable();
    table.integer('episode_number').notNullable();
    table.integer('total_episodes').nullable();
    table.decimal('progress_percentage', 5, 2).defaultTo(0).notNullable();
    table.timestamp('watched_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('deleted_at').nullable();
    
    // Уникальный индекс для предотвращения дубликатов прогресса
    table.unique(['user_id', 'anime_id', 'episode_number']);
  });

  // Создадим индексы для производительности
  await knex.schema.raw('CREATE INDEX idx_watch_progress_user_id ON watch_progress(user_id)');
  await knex.schema.raw('CREATE INDEX idx_watch_progress_anime_id ON watch_progress(anime_id)');
  await knex.schema.raw('CREATE INDEX idx_watch_progress_user_anime ON watch_progress(user_id, anime_id)');
  await knex.schema.raw('CREATE INDEX idx_watch_progress_watched_at ON watch_progress(watched_at)');
  await knex.schema.raw('CREATE INDEX idx_watch_progress_deleted_at ON watch_progress(deleted_at)');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTable('watch_progress');
};