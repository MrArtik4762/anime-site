import mongoose from 'mongoose';

const watchProgressSchema = new mongoose.Schema({
  // Ссылка на аниме
  animeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime',
    required: [true, 'ID аниме обязателен'],
    index: true
  },
  
  // Номер эпизода
  episode: {
    type: Number,
    required: [true, 'Номер эпизода обязателен'],
    min: [1, 'Номер эпизода должен быть больше 0']
  },
  
  // Текущая позиция просмотра в секундах
  position: {
    type: Number,
    required: [true, 'Позиция просмотра обязательна'],
    min: [0, 'Позиция не может быть отрицательной'],
    default: 0
  },
  
  // Общая длительность эпизода в секундах
  duration: {
    type: Number,
    required: [true, 'Длительность эпизода обязательна'],
    min: [1, 'Длительность должна быть больше 0']
  },
  
  // Процент просмотра (вычисляемое поле)
  progressPercentage: {
    type: Number,
    min: [0, 'Процент не может быть меньше 0'],
    max: [100, 'Процент не может быть больше 100'],
    default: 0
  },
  
  // Ссылка на пользователя
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID пользователя обязателен'],
    index: true
  },
  
  // Статус просмотра
  status: {
    type: String,
    enum: ['not_started', 'watching', 'completed', 'paused'],
    default: 'not_started'
  },
  
  // Время последнего обновления
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Время начала просмотра
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  // Время завершения просмотра
  completedAt: {
    type: Date
  },
  
  // Качество просмотра
  quality: {
    type: String,
    enum: ['360p', '480p', '720p', '1080p', '1440p', '2160p', 'auto'],
    default: 'auto'
  },
  
  // Язык аудио
  audioLanguage: {
    type: String,
    enum: ['japanese', 'russian', 'english', 'auto'],
    default: 'japanese'
  },
  
  // Язык субтитров
  subtitleLanguage: {
    type: String,
    enum: ['off', 'russian', 'english', 'japanese', 'auto'],
    default: 'off'
  },
  
  // Устройство просмотра
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'smart_tv', 'other'],
    default: 'desktop'
  },
  
  // Сессия просмотра
  sessionId: {
    type: String,
    index: true
  },
  
  // Флаг завершенности эпизода
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  // Количество пауз
  pauseCount: {
    type: Number,
    default: 0
  },
  
  // Общее время пауз в секундах
  totalPauseTime: {
    type: Number,
    default: 0
  },
  
  // Количество перемоток
  seekCount: {
    type: Number,
    default: 0
  },
  
  // Общая перемотка вперед в секундах
  totalSeekForward: {
    type: Number,
    default: 0
  },
  
  // Общая перемотка назад в секундах
  totalSeekBackward: {
    type: Number,
    default: 0
  },
  
  // Рейтинг эпизода (1-10)
  rating: {
    type: Number,
    min: [1, 'Рейтинг не может быть меньше 1'],
    max: [10, 'Рейтинг не может быть больше 10'],
    default: null
  },
  
  // Комментарий к эпизоду
  comment: {
    type: String,
    maxlength: [1000, 'Комментарий не должен превышать 1000 символов'],
    trim: true
  },
  
  // Теги эпизода
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Тег не должен превышать 50 символов']
  }],
  
  // Флаг аномального поведения
  isSuspicious: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальные поля
watchProgressSchema.virtual('anime', {
  ref: 'Anime',
  localField: 'animeId',
  foreignField: '_id',
  justOne: true
});

watchProgressSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Вычисляемое поле для проверки завершенности
watchProgressSchema.virtual('isFinished').get(function() {
  return this.status === 'completed' || this.progressPercentage >= 90;
});

// Вычисляемое поле для оставшегося времени
watchProgressSchema.virtual('remainingTime').get(function() {
  return Math.max(0, this.duration - this.position);
});

// Индексы для оптимизации запросов
watchProgressSchema.index({ userId: 1, animeId: 1, episode: 1 }, { unique: true }); // Уникальность для каждого эпизода аниме у пользователя
watchProgressSchema.index({ userId: 1, lastUpdated: -1 });
watchProgressSchema.index({ animeId: 1, lastUpdated: -1 });
watchProgressSchema.index({ status: 1 });
watchProgressSchema.index({ isCompleted: 1 });
watchProgressSchema.index({ sessionId: 1, lastUpdated: -1 });

// Составные индексы
watchProgressSchema.index({ userId: 1, status: 1, lastUpdated: -1 });
watchProgressSchema.index({ animeId: 1, status: 1, lastUpdated: -1 });

// Middleware для автоматического обновления прогресса
watchProgressSchema.pre('save', function(next) {
  // Вычисляем процент прогресса
  if (this.duration > 0) {
    this.progressPercentage = Math.round((this.position / this.duration) * 100);
  }
  
  // Обновляем статус на основе прогресса
  if (this.progressPercentage >= 90) {
    this.status = 'completed';
    this.isCompleted = true;
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else if (this.progressPercentage > 0) {
    this.status = 'watching';
    this.isCompleted = false;
  }
  
  // Обновляем время последнего обновления
  this.lastUpdated = new Date();
  
  next();
});

// Middleware для проверки аномального поведения
watchProgressSchema.pre('save', function(next) {
  // Проверка на слишком быстрый просмотр (> 10x speed)
  if (this.duration > 0 && this.position > 0) {
    const watchTime = (this.position / this.progressPercentage) * 100; // Приблизительное время просмотра
    const videoDuration = this.duration;
    
    if (watchTime < videoDuration * 0.1 && this.progressPercentage > 80) {
      this.isSuspicious = true;
    }
  }
  
  next();
});

// Статические методы
watchProgressSchema.statics.findByUserAndAnime = function(userId, animeId) {
  return this.find({ userId, animeId })
    .sort({ episode: 1 })
    .populate('anime', 'title images episodes year')
    .lean();
};

watchProgressSchema.statics.getRecentProgress = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ lastUpdated: -1 })
    .limit(limit)
    .populate('anime', 'title images episodes year')
    .lean();
};

watchProgressSchema.statics.getContinueWatching = function(userId, limit = 10) {
  return this.find({ 
    userId, 
    status: 'watching',
    progressPercentage: { $lt: 90 }
  })
    .sort({ lastUpdated: -1 })
    .limit(limit)
    .populate('anime', 'title images episodes year')
    .lean();
};

watchProgressSchema.statics.getCompletedEpisodes = function(userId, animeId) {
  return this.find({ 
    userId, 
    animeId, 
    isCompleted: true 
  })
    .sort({ episode: 1 })
    .lean();
};

watchProgressSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalEpisodes: { $sum: 1 },
        completedEpisodes: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        totalWatchTime: { $sum: '$position' },
        totalDuration: { $sum: '$duration' },
        averageProgress: { $avg: '$progressPercentage' },
        averageRating: { 
          $avg: { 
            $cond: ['$rating', { $ifNull: ['$rating', 0] }, 0] 
          } 
        },
        uniqueAnimeCount: { $addToSet: '$animeId' },
        lastWatched: { $max: '$lastUpdated' }
      }
    },
    {
      $project: {
        _id: 0,
        totalEpisodes: 1,
        completedEpisodes: 1,
        totalWatchTime: 1,
        totalDuration: 1,
        averageProgress: { $round: ['$averageProgress', 2] },
        averageRating: { $round: ['$averageRating', 2] },
        uniqueAnimeCount: { $size: '$uniqueAnimeCount' },
        lastWatched: 1
      }
    }
  ]);
};

watchProgressSchema.statics.getAnimeProgress = function(userId, animeId) {
  return this.findOne({ userId, animeId })
    .populate('anime', 'title images episodes year')
    .lean();
};

// Методы экземпляра
watchProgressSchema.methods.updateProgress = function(newPosition, newDuration = null) {
  this.position = Math.max(0, newPosition);
  if (newDuration) {
    this.duration = Math.max(1, newDuration);
  }
  return this.save();
};

watchProgressSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.isCompleted = true;
  this.progressPercentage = 100;
  this.completedAt = new Date();
  this.lastUpdated = new Date();
  return this.save();
};

watchProgressSchema.methods.markAsPaused = function() {
  this.status = 'paused';
  this.lastUpdated = new Date();
  return this.save();
};

watchProgressSchema.methods.markAsWatching = function() {
  this.status = 'watching';
  this.lastUpdated = new Date();
  return this.save();
};

watchProgressSchema.methods.setRating = function(rating) {
  if (rating >= 1 && rating <= 10) {
    this.rating = rating;
    return this.save();
  }
  throw new Error('Рейтинг должен быть от 1 до 10');
};

watchProgressSchema.methods.addPause = function() {
  this.pauseCount = (this.pauseCount || 0) + 1;
  this.lastUpdated = new Date();
  return this.save();
};

watchProgressSchema.methods.addSeek = function(direction = 'forward', amount = 10) {
  if (direction === 'forward') {
    this.seekCount = (this.seekCount || 0) + 1;
    this.totalSeekForward = (this.totalSeekForward || 0) + amount;
  } else {
    this.seekCount = (this.seekCount || 0) + 1;
    this.totalSeekBackward = (this.totalSeekBackward || 0) + amount;
  }
  this.lastUpdated = new Date();
  return this.save();
};

watchProgressSchema.methods.getWatchTimePercentage = function() {
  if (this.duration === 0) return 0;
  return Math.round((this.position / this.duration) * 100);
};

watchProgressSchema.methods.isEpisodeCompleted = function() {
  return this.isCompleted || this.progressPercentage >= 90;
};

// Метод для получения безопасного объекта (без чувствительных данных)
watchProgressSchema.methods.getSafeObject = function() {
  const obj = this.toObject();
  
  // Удаляем внутренние поля
  delete obj.__v;
  delete obj._id;
  
  return obj;
};

// Метод для форматирования времени
watchProgressSchema.methods.formatTime = function(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Метод для форматирования длительности
watchProgressSchema.methods.formatDuration = function() {
  return this.formatTime(this.duration);
};

// Метод для форматирования текущей позиции
watchProgressSchema.methods.formatPosition = function() {
  return this.formatTime(this.position);
};

export default mongoose.model('WatchProgress', watchProgressSchema);