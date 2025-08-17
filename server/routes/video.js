import express from 'express';
import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { videoLimiter } from '../middleware/rateLimiter.js';
import videoController from '../controllers/videoController.js';

const router = Router();

// Получение видео потока
router.get('/video',
  optionalAuth,
  videoLimiter,
  videoController.getVideoStream
);

// Получение доступных качеств
router.get('/qualities',
  optionalAuth,
  videoController.getAvailableQualities
);

// Получение доступных озвучек
router.get('/voices',
  optionalAuth,
  videoController.getAvailableVoices
);

// Получение субтитров
router.get('/subtitles',
  optionalAuth,
  videoController.getSubtitles
);

// Проверка доступности видео
router.get('/video/check',
  optionalAuth,
  videoController.checkVideoAvailability
);

export default router;
