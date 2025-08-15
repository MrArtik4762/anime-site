const mongoose = require('mongoose');

const episodeSourceSchema = new mongoose.Schema({
  // Номер эпизода
  episodeNumber: {
    type: Number,
    required: [true, 'Номер эпизода обязателен'],
    min: [1, 'Номер эпизода должен быть больше 0'],
    index: true
  },
  
  // URL источника видео
  sourceUrl: {
    type: String,
    required: [true, 'URL источника обязателен'],
    trim: true,
    validate: {
      validator: function(v) {
        // Базовая валидация URL
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Некорректный формат URL'
    }
  },
  
  // Качество видео
  quality: {
    type: String,
    required: [true, 'Качество видео обязательно'],
    enum: ['360p', '480p', '720p', '1080p', '1440p', '2160p'],
    index: true
  },
  
  // Название источника/провайдера
  title: {
    type: String,
    required: [true, 'Название источника обязательно'],
    trim: true,
    maxlength: [255, 'Название не должно превышать 255 символов']
  },
  
  // Название API/сервиса
  provider: {
    type: String,
    required: [true, 'Провайдер обязателен'],
    enum: ['aniliberty', 'anilibria', 'shikimori', 'jikan'],
    index: true
  },
  
  // ID аниме (внешний ключ)
  animeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime',
    required: [true, 'ID аниме обязателен'],
    index: true
  },
  
  // Дата последней проверки доступности
  lastChecked: {
    type: Date,
    default: null,
    index: true
  },
  
  // Флаг активности источника
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Приоритет источника (для сортировки)
  priority: {
    type: Number,
    required: [true, 'Приоритет обязателен'],
    min: [1, 'Приоритет должен быть больше 0'],
    default: 1,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальные поля
episodeSourceSchema.virtual('anime', {
  ref: 'Anime',
  localField: 'animeId',
  foreignField: '_id',
  justOne: true
});

// Индексы для оптимизации поиска
episodeSourceSchema.index({ animeId: 1, episodeNumber: 1, priority: 1 });
episodeSourceSchema.index({ provider: 1, isActive: 1 });
episodeSourceSchema.index({ quality: 1, isActive: 1 });
episodeSourceSchema.index({ lastChecked: 1 });
episodeSourceSchema.index({ createdAt: -1 });
episodeSourceSchema.index({ updatedAt: -1 });

// Составные индексы
episodeSourceSchema.index({ animeId: 1, episodeNumber: 1, quality: 1 });
episodeSourceSchema.index({ provider: 1, quality: 1, isActive: 1 });
episodeSourceSchema.index({ animeId: 1, isActive: 1, priority: 1 });

// Middleware для обновления lastChecked
episodeSourceSchema.pre('save', function(next) {
  if (this.isModified('isActive') && this.isActive) {
    // При активации источника обновляем дату проверки
    this.lastChecked = new Date();
  }
  next();
});

// Статические методы
episodeSourceSchema.statics.findByAnimeAndEpisode = function(animeId, episodeNumber) {
  return this.find({ animeId, episodeNumber })
    .sort({ priority: 1, quality: -1 })
    .populate('anime', 'title images episodes year')
    .lean();
};

episodeSourceSchema.statics.getActiveSources = function(animeId, episodeNumber) {
  return this.find({ 
    animeId, 
    episodeNumber, 
    isActive: true 
  })
    .sort({ priority: 1, quality: -1 })
    .populate('anime', 'title images episodes year')
    .lean();
};

episodeSourceSchema.statics.getByProvider = function(provider, limit = 100) {
  return this.find({ provider, isActive: true })
    .sort({ lastChecked: -1 })
    .limit(limit)
    .populate('anime', 'title images episodes year')
    .lean();
};

episodeSourceSchema.statics.getSourcesByQuality = function(quality, limit = 100) {
  return this.find({ quality, isActive: true })
    .sort({ priority: 1, lastChecked: -1 })
    .limit(limit)
    .populate('anime', 'title images episodes year')
    .lean();
};

episodeSourceSchema.statics.getInactiveSources = function(days = 30) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  
  return this.find({ 
    isActive: false,
    lastChecked: { $lt: threshold }
  })
    .sort({ lastChecked: 1 })
    .populate('anime', 'title images episodes year')
    .lean();
};

episodeSourceSchema.statics.updateLastChecked = function(id) {
  return this.findByIdAndUpdate(
    id,
    { 
      lastChecked: new Date(),
      isActive: true 
    },
    { new: true }
  );
};

episodeSourceSchema.statics.deactivateOldSources = function(animeId, episodeNumber, days = 7) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  
  return this.updateMany(
    { 
      animeId, 
      episodeNumber,
      lastChecked: { $lt: threshold },
      isActive: true 
    },
    { 
      isActive: false,
      updatedAt: new Date()
    }
  );
};

// Методы экземпляра
episodeSourceSchema.methods.markAsChecked = function() {
  this.lastChecked = new Date();
  this.isActive = true;
  return this.save();
};

episodeSourceSchema.methods.markAsInactive = function(reason = 'Source unavailable') {
  this.isActive = false;
  this.lastChecked = new Date();
  return this.save();
};

episodeSourceSchema.methods.updatePriority = function(newPriority) {
  if (newPriority >= 1) {
    this.priority = newPriority;
    return this.save();
  }
  throw new Error('Приоритет должен быть больше или равен 1');
};

episodeSourceSchema.methods.getSourceInfo = function() {
  return {
    id: this._id,
    episodeNumber: this.episodeNumber,
    sourceUrl: this.sourceUrl,
    quality: this.quality,
    title: this.title,
    provider: this.provider,
    isActive: this.isActive,
    priority: this.priority,
    lastChecked: this.lastChecked,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

episodeSourceSchema.methods.isAvailable = function() {
  // Проверка доступности источника (можно расширить)
  return this.isActive && this.lastChecked && 
         (new Date() - this.lastChecked) < (7 * 24 * 60 * 60 * 1000); // 7 дней
};

episodeSourceSchema.methods.getAgeInDays = function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
};

// Метод для получения безопасного объекта (без лишних данных)
episodeSourceSchema.methods.getSafeObject = function() {
  const obj = this.toObject();
  
  // Удаляем внутренние поля
  delete obj.__v;
  delete obj._id;
  
  return obj;
};

module.exports = mongoose.model('EpisodeSource', episodeSourceSchema);