/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username', 50).unique().notNullable();
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('role').defaultTo('user').notNullable();
    table.string('avatar').nullable();
    table.text('bio').nullable();
    table.json('preferences').nullable();
    table.boolean('is_email_verified').defaultTo(false).notNullable();
    table.timestamp('email_verified_at').nullable();
    table.string('email_verification_token').nullable();
    table.timestamp('email_verification_expires').nullable();
    table.string('password_reset_token').nullable();
    table.timestamp('password_reset_expires').nullable();
    table.string('refresh_token').nullable();
    table.timestamp('last_login').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('deleted_at').nullable();
  });

  // Создадим индексы для производительности
  await knex.schema.raw('CREATE INDEX idx_users_email ON users(email)');
  await knex.schema.raw('CREATE INDEX idx_users_username ON users(username)');
  await knex.schema.raw('CREATE INDEX idx_users_created_at ON users(created_at)');
  await knex.schema.raw('CREATE INDEX idx_users_deleted_at ON users(deleted_at)');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTable('users');
};