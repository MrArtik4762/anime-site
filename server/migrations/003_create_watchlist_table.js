/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('watchlist', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('anime_id').unsigned().notNullable();
    table.string('anime_title').notNullable();
    table.string('anime_image_url').nullable();
    table.string('anime_status').defaultTo('planned').notNullable();
    table.integer('current_episode').defaultTo(0).notNullable();
    table.integer('total_episodes').nullable();
    table.decimal('progress_percentage', 5, 2).defaultTo(0).notNullable();
    table.text('notes').nullable();
    table.timestamp('added_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('deleted_at').nullable();
    
    // Уникальный индекс для предотвращения дубликатов в списке
    table.unique(['user_id', 'anime_id']);
  });

  // Создадим индексы для производительности
  await knex.schema.raw('CREATE INDEX idx_watchlist_user_id ON watchlist(user_id)');
  await knex.schema.raw('CREATE INDEX idx_watchlist_anime_id ON watchlist(anime_id)');
  await knex.schema.raw('CREATE INDEX idx_watchlist_user_anime ON watchlist(user_id, anime_id)');
  await knex.schema.raw('CREATE INDEX idx_watchlist_anime_status ON watchlist(anime_status)');
  await knex.schema.raw('CREATE INDEX idx_watchlist_added_at ON watchlist(added_at)');
  await knex.schema.raw('CREATE INDEX idx_watchlist_deleted_at ON watchlist(deleted_at)');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTable('watchlist');
};