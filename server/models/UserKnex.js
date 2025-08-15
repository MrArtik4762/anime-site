const knex = require('knex');
const { db } = require('../db/knex');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User {
  constructor(user = {}) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
    this.password_hash = user.password_hash;
    this.role = user.role || 'user';
    this.avatar = user.avatar;
    this.bio = user.bio;
    this.preferences = user.preferences || {};
    this.is_email_verified = user.is_email_verified || false;
    this.email_verified_at = user.email_verified_at;
    this.email_verification_token = user.email_verification_token;
    this.email_verification_expires = user.email_verification_expires;
    this.password_reset_token = user.password_reset_token;
    this.password_reset_expires = user.password_reset_expires;
    this.refresh_token = user.refresh_token;
    this.last_login = user.last_login;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
    this.deleted_at = user.deleted_at;
    // Поля для 2FA
    this.is_2fa_enabled = user.is_2fa_enabled || false;
    this.secret_2fa = user.secret_2fa;
    this.backup_codes_2fa = user.backup_codes_2fa;
  }

  // Создание пользователя
  static async create(userData) {
    try {
      const [user] = await db('users')
        .insert({
          username: userData.username,
          email: userData.email,
          password_hash: userData.password_hash,
          role: userData.role || 'user',
          avatar: userData.avatar,
          bio: userData.bio,
          preferences: JSON.stringify(userData.preferences || {}),
          is_email_verified: userData.is_email_verified || false,
          email_verified_at: userData.email_verified_at,
          email_verification_token: userData.email_verification_token,
          email_verification_expires: userData.email_verification_expires,
          password_reset_token: userData.password_reset_token,
          password_reset_expires: userData.password_reset_expires,
          refresh_token: userData.refresh_token,
          last_login: userData.last_login,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      
      return new User(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Поиск пользователя по ID
  static async findById(id, selectFields = []) {
    try {
      const fieldMap = {
        id: 'id',
        username: 'username',
        email: 'email',
        password: 'password_hash',
        role: 'role',
        avatar: 'avatar',
        bio: 'bio',
        preferences: 'preferences',
        isEmailVerified: 'is_email_verified',
        emailVerifiedAt: 'email_verified_at',
        emailVerificationToken: 'email_verification_token',
        emailVerificationExpires: 'email_verification_expires',
        passwordResetToken: 'password_reset_token',
        passwordResetExpires: 'password_reset_expires',
        refreshToken: 'refresh_token',
        lastLogin: 'last_login',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
      };

      const fields = selectFields.length > 0 
        ? selectFields.map(field => fieldMap[field] || field)
        : ['*'];

      const user = await db('users')
        .select(...fields)
        .where({ id })
        .whereNull('deleted_at')
        .first();

      return user ? new User(user) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Поиск пользователя по email или username
  static async findByEmailOrUsername(identifier, selectFields = []) {
    try {
      const fieldMap = {
        id: 'id',
        username: 'username',
        email: 'email',
        password: 'password_hash',
        role: 'role',
        avatar: 'avatar',
        bio: 'bio',
        preferences: 'preferences',
        isEmailVerified: 'is_email_verified',
        emailVerifiedAt: 'email_verified_at',
        emailVerificationToken: 'email_verification_token',
        emailVerificationExpires: 'email_verification_expires',
        passwordResetToken: 'password_reset_token',
        passwordResetExpires: 'password_reset_expires',
        refreshToken: 'refresh_token',
        lastLogin: 'last_login',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
      };

      const fields = selectFields.length > 0 
        ? selectFields.map(field => fieldMap[field] || field)
        : ['*'];

      const user = await db('users')
        .select(...fields)
        .where(function() {
          this.where('email', identifier.toLowerCase())
              .orWhere('username', identifier);
        })
        .whereNull('deleted_at')
        .first();

      return user ? new User(user) : null;
    } catch (error) {
      console.error('Error finding user by email or username:', error);
      throw error;
    }
  }

  // Обновление пользователя
  async update(data) {
    try {
      const [updatedUser] = await db('users')
        .update({
          ...data,
          preferences: data.preferences ? JSON.stringify(data.preferences) : this.preferences,
          updated_at: new Date()
        })
        .where({ id: this.id })
        .whereNull('deleted_at')
        .returning('*');

      Object.assign(this, updatedUser);
      return this;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Сохранение пользователя
  async save() {
    try {
      const [updatedUser] = await db('users')
        .update({
          username: this.username,
          email: this.email,
          password_hash: this.password_hash,
          role: this.role,
          avatar: this.avatar,
          bio: this.bio,
          preferences: JSON.stringify(this.preferences),
          is_email_verified: this.is_email_verified,
          email_verified_at: this.email_verified_at,
          email_verification_token: this.email_verification_token,
          email_verification_expires: this.email_verification_expires,
          password_reset_token: this.password_reset_token,
          password_reset_expires: this.password_reset_expires,
          refresh_token: this.refresh_token,
          last_login: this.last_login,
          updated_at: new Date()
        })
        .where({ id: this.id })
        .whereNull('deleted_at')
        .returning('*');

      Object.assign(this, updatedUser);
      return this;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  // Удаление пользователя (мягкое удаление)
  async delete() {
    try {
      await db('users')
        .update({ deleted_at: new Date() })
        .where({ id: this.id });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Сравнение паролей
  async comparePassword(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password_hash);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw new Error('Ошибка при сравнении паролей');
    }
  }

  // Создание токена сброса пароля
  createPasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.password_reset_token = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    this.password_reset_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
    
    return resetToken;
  }

  // Создание токена верификации email
  createEmailVerificationToken() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    this.email_verification_token = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    
    this.email_verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа
    
    return verificationToken;
  }

  // Проверка активности пользователя
  isUserActive() {
    if (this.deleted_at) return false;
    if (this.banned_until && this.banned_until > new Date()) return false;
    return true;
  }

  // Получение публичного профиля
  getPublicProfile() {
    const userObject = { ...this };
    
    // Удаляем приватные поля
    delete userObject.password_hash;
    delete userObject.email_verification_token;
    delete userObject.email_verification_expires;
    delete userObject.password_reset_token;
    delete userObject.password_reset_expires;
    delete userObject.refresh_token;
    delete userObject.deleted_at;
    
    return userObject;
  }

  // Генерация аватара из первой буквы никнейма
  generateDefaultAvatar() {
    const firstLetter = this.username ? this.username.charAt(0).toUpperCase() : 'U';
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const colorIndex = this.username ? this.username.charCodeAt(0) % colors.length : 0;
    const backgroundColor = colors[colorIndex];
    
    return `https://ui-avatars.com/api/?name=${firstLetter}&background=${backgroundColor.slice(1)}&color=fff&size=200&bold=true`;
  }

  // Получение аватара
  getAvatarUrl() {
    if (this.avatar && !this.avatar.includes('ui-avatars.com')) {
      return this.avatar.startsWith('http') ? this.avatar : `/uploads/avatars/${this.avatar}`;
    }
    return this.generateDefaultAvatar();
  }

  // Проверка уникальности username
  static async isUsernameUnique(username, excludeId = null) {
    try {
      const query = { username };
      if (excludeId) {
        query.id = { '!=': excludeId };
      }
      
      const existingUser = await db('users')
        .where(query)
        .whereNull('deleted_at')
        .first();
      
      return !existingUser;
    } catch (error) {
      console.error('Error checking username uniqueness:', error);
      throw error;
    }
  }

  // Проверка активности пользователя
  isUserActive() {
    if (this.deleted_at) return false;
    return true;
  }

  // Статический метод для поиска пользователя по refresh токену
  static async findByRefreshToken(refreshToken) {
    try {
      const user = await db('users')
        .select('*')
        .where({ refresh_token: refreshToken })
        .whereNull('deleted_at')
        .first();
      
      return user ? new User(user) : null;
    } catch (error) {
      console.error('Error finding user by refresh token:', error);
      throw error;
    }
  }

  // Статический метод для поиска пользователя по email
  static async findByEmail(email, selectFields = []) {
    try {
      const fieldMap = {
        id: 'id',
        username: 'username',
        email: 'email',
        password_hash: 'password_hash',
        role: 'role',
        avatar: 'avatar',
        bio: 'bio',
        preferences: 'preferences',
        isEmailVerified: 'is_email_verified',
        emailVerifiedAt: 'email_verified_at',
        emailVerificationToken: 'email_verification_token',
        emailVerificationExpires: 'email_verification_expires',
        passwordResetToken: 'password_reset_token',
        passwordResetExpires: 'password_reset_expires',
        refreshToken: 'refresh_token',
        lastLogin: 'last_login',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        is2faEnabled: 'is_2fa_enabled',
        secret2fa: 'secret_2fa',
        backupCodes2fa: 'backup_codes_2fa'
      };

      const fields = selectFields.length > 0
        ? selectFields.map(field => fieldMap[field] || field)
        : ['*'];

      const user = await db('users')
        .select(...fields)
        .where({ email: email.toLowerCase() })
        .whereNull('deleted_at')
        .first();

      return user ? new User(user) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Статический метод для обновления пользователя по ID
  static async findByIdAndUpdate(id, updateData) {
    try {
      const [updatedUser] = await db('users')
        .update({
          ...updateData,
          updated_at: new Date()
        })
        .where({ id })
        .whereNull('deleted_at')
        .returning('*');

      return updatedUser ? new User(updatedUser) : null;
    } catch (error) {
      console.error('Error updating user by ID:', error);
      throw error;
    }
  }

  // Статический метод для поиска пользователя по условию
  static async findOne(conditions) {
    try {
      let query = db('users').select('*').whereNull('deleted_at');
      
      // Добавляем условия поиска
      if (conditions.password_reset_token) {
        query = query.where('password_reset_token', conditions.password_reset_token);
      }
      
      if (conditions.password_reset_expires) {
        query = query.where('password_reset_expires', '>', conditions.password_reset_expires);
      }
      
      if (conditions.email_verification_token) {
        query = query.where('email_verification_token', conditions.email_verification_token);
      }
      
      if (conditions.email_verification_expires) {
        query = query.where('email_verification_expires', '>', conditions.email_verification_expires);
      }

      const user = await query.first();
      return user ? new User(user) : null;
    } catch (error) {
      console.error('Error finding user by conditions:', error);
      throw error;
    }
  }
}

module.exports = User;