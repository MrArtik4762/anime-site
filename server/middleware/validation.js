const Joi = require('joi');
const { HTTP_STATUS, LIMITS, REGEX } = require('../../shared/constants/constants');

// РћР±С‰Р°СЏ С„СѓРЅРєС†РёСЏ РІР°Р»РёРґР°С†РёРё
const validate = (schema) => {
  return (req, res, next) => {
    console.log('рџ”Ќ VALIDATION DEBUG - Request body:', req.body);
    console.log('рџ”Ќ VALIDATION DEBUG - Schema name:', schema._flags?.label || 'unknown');
    
    const { error } = schema.validate(req.body, {
      abortEarly: false, // РџРѕРєР°Р·Р°С‚СЊ РІСЃРµ РѕС€РёР±РєРё
      allowUnknown: true, // Р Р°Р·СЂРµС€РёС‚СЊ РЅРµРёР·РІРµСЃС‚РЅС‹Рµ РїРѕР»СЏ
      stripUnknown: true // РЈРґР°Р»РёС‚СЊ РЅРµРёР·РІРµСЃС‚РЅС‹Рµ РїРѕР»СЏ
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      console.log('рџ”Ќ VALIDATION DEBUG - Validation failed:', errors);

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'РћС€РёР±РєР° РІР°Р»РёРґР°С†РёРё РґР°РЅРЅС‹С…',
          details: errors
        }
      });
    }

    console.log('рџ”Ќ VALIDATION DEBUG - Validation passed');
    next();
  };
};

// Р’Р°Р»РёРґР°С†РёСЏ РїР°СЂР°РјРµС‚СЂРѕРІ Р·Р°РїСЂРѕСЃР°
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'РќРµРІРµСЂРЅС‹Рµ РїР°СЂР°РјРµС‚СЂС‹ Р·Р°РїСЂРѕСЃР°',
          details: error.details[0].message
        }
      });
    }

    next();
  };
};

// Р’Р°Р»РёРґР°С†РёСЏ query РїР°СЂР°РјРµС‚СЂРѕРІ
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'РќРµРІРµСЂРЅС‹Рµ РїР°СЂР°РјРµС‚СЂС‹ Р·Р°РїСЂРѕСЃР°',
          details: error.details[0].message
        }
      });
    }

    req.query = value;
    next();
  };
};

// РЎС…РµРјС‹ РІР°Р»РёРґР°С†РёРё РґР»СЏ Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёРё
const authSchemas = {
  register: Joi.object({
    username: Joi.string()
      .min(LIMITS.USERNAME_MIN_LENGTH)
      .max(LIMITS.USERNAME_MAX_LENGTH)
      .pattern(REGEX.USERNAME)
      .required()
      .messages({
        'string.min': `РРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РґРѕР»Р¶РЅРѕ СЃРѕРґРµСЂР¶Р°С‚СЊ РјРёРЅРёРјСѓРј ${LIMITS.USERNAME_MIN_LENGTH} СЃРёРјРІРѕР»Р°`,
        'string.max': `РРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РЅРµ РґРѕР»Р¶РЅРѕ РїСЂРµРІС‹С€Р°С‚СЊ ${LIMITS.USERNAME_MAX_LENGTH} СЃРёРјРІРѕР»РѕРІ`,
        'string.pattern.base': 'РРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РјРѕР¶РµС‚ СЃРѕРґРµСЂР¶Р°С‚СЊ С‚РѕР»СЊРєРѕ Р±СѓРєРІС‹, С†РёС„СЂС‹ Рё РїРѕРґС‡РµСЂРєРёРІР°РЅРёСЏ',
        'any.required': 'РРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Р’РІРµРґРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ email Р°РґСЂРµСЃ',
        'any.required': 'Email РѕР±СЏР·Р°С‚РµР»РµРЅ'
      }),
    
    password: Joi.string()
      .min(LIMITS.PASSWORD_MIN_LENGTH)
      .pattern(REGEX.PASSWORD)
      .required()
      .messages({
        'string.min': `РџР°СЂРѕР»СЊ РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ РјРёРЅРёРјСѓРј ${LIMITS.PASSWORD_MIN_LENGTH} СЃРёРјРІРѕР»РѕРІ`,
        'string.pattern.base': 'РџР°СЂРѕР»СЊ РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ Р±СѓРєРІС‹ Рё С†РёС„СЂС‹',
        'any.required': 'РџР°СЂРѕР»СЊ РѕР±СЏР·Р°С‚РµР»РµРЅ'
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'РџР°СЂРѕР»Рё РЅРµ СЃРѕРІРїР°РґР°СЋС‚',
        'any.required': 'РџРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ РїР°СЂРѕР»СЏ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Р’РІРµРґРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ email Р°РґСЂРµСЃ',
        'any.required': 'Email РѕР±СЏР·Р°С‚РµР»РµРЅ'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'РџР°СЂРѕР»СЊ РѕР±СЏР·Р°С‚РµР»РµРЅ'
      })
  }),

  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Р’РІРµРґРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ email Р°РґСЂРµСЃ',
        'any.required': 'Email РѕР±СЏР·Р°С‚РµР»РµРЅ'
      })
  }),

  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'РўРѕРєРµРЅ СЃР±СЂРѕСЃР° РїР°СЂРѕР»СЏ РѕР±СЏР·Р°С‚РµР»РµРЅ'
      }),
    
    password: Joi.string()
      .min(LIMITS.PASSWORD_MIN_LENGTH)
      .pattern(REGEX.PASSWORD)
      .required()
      .messages({
        'string.min': `РџР°СЂРѕР»СЊ РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ РјРёРЅРёРјСѓРј ${LIMITS.PASSWORD_MIN_LENGTH} СЃРёРјРІРѕР»РѕРІ`,
        'string.pattern.base': 'РџР°СЂРѕР»СЊ РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ Р±СѓРєРІС‹ Рё С†РёС„СЂС‹',
        'any.required': 'РџР°СЂРѕР»СЊ РѕР±СЏР·Р°С‚РµР»РµРЅ'
      })
  })
};

// РЎС…РµРјС‹ РІР°Р»РёРґР°С†РёРё РґР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№
const userSchemas = {
  updateProfile: Joi.object({
    username: Joi.string()
      .min(LIMITS.USERNAME_MIN_LENGTH)
      .max(LIMITS.USERNAME_MAX_LENGTH)
      .pattern(REGEX.USERNAME)
      .messages({
        'string.min': `РРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РґРѕР»Р¶РЅРѕ СЃРѕРґРµСЂР¶Р°С‚СЊ РјРёРЅРёРјСѓРј ${LIMITS.USERNAME_MIN_LENGTH} СЃРёРјРІРѕР»Р°`,
        'string.max': `РРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РЅРµ РґРѕР»Р¶РЅРѕ РїСЂРµРІС‹С€Р°С‚СЊ ${LIMITS.USERNAME_MAX_LENGTH} СЃРёРјРІРѕР»РѕРІ`,
        'string.pattern.base': 'РРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РјРѕР¶РµС‚ СЃРѕРґРµСЂР¶Р°С‚СЊ С‚РѕР»СЊРєРѕ Р±СѓРєРІС‹, С†РёС„СЂС‹ Рё РїРѕРґС‡РµСЂРєРёРІР°РЅРёСЏ'
      }),
    
    bio: Joi.string()
      .max(LIMITS.BIO_MAX_LENGTH)
      .allow('')
      .messages({
        'string.max': `Р‘РёРѕРіСЂР°С„РёСЏ РЅРµ РґРѕР»Р¶РЅР° РїСЂРµРІС‹С€Р°С‚СЊ ${LIMITS.BIO_MAX_LENGTH} СЃРёРјРІРѕР»РѕРІ`
      }),
    
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark', 'auto'),
      language: Joi.string().valid('ru', 'en'),
      emailNotifications: Joi.boolean(),
      publicProfile: Joi.boolean()
    })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'РўРµРєСѓС‰РёР№ РїР°СЂРѕР»СЊ РѕР±СЏР·Р°С‚РµР»РµРЅ'
      }),
    
    newPassword: Joi.string()
      .min(LIMITS.PASSWORD_MIN_LENGTH)
      .pattern(REGEX.PASSWORD)
      .required()
      .messages({
        'string.min': `РќРѕРІС‹Р№ РїР°СЂРѕР»СЊ РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ РјРёРЅРёРјСѓРј ${LIMITS.PASSWORD_MIN_LENGTH} СЃРёРјРІРѕР»РѕРІ`,
        'string.pattern.base': 'РќРѕРІС‹Р№ РїР°СЂРѕР»СЊ РґРѕР»Р¶РµРЅ СЃРѕРґРµСЂР¶Р°С‚СЊ Р±СѓРєРІС‹ Рё С†РёС„СЂС‹',
        'any.required': 'РќРѕРІС‹Р№ РїР°СЂРѕР»СЊ РѕР±СЏР·Р°С‚РµР»РµРЅ'
      })
  })
};

// РЎС…РµРјС‹ РІР°Р»РёРґР°С†РёРё РґР»СЏ РєРѕРјРјРµРЅС‚Р°СЂРёРµРІ
const commentSchemas = {
  create: Joi.object({
    content: Joi.string()
      .min(1)
      .max(LIMITS.COMMENT_MAX_LENGTH)
      .required()
      .messages({
        'string.min': 'РљРѕРјРјРµРЅС‚Р°СЂРёР№ РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РїСѓСЃС‚С‹Рј',
        'string.max': `РљРѕРјРјРµРЅС‚Р°СЂРёР№ РЅРµ РґРѕР»Р¶РµРЅ РїСЂРµРІС‹С€Р°С‚СЊ ${LIMITS.COMMENT_MAX_LENGTH} СЃРёРјРІРѕР»РѕРІ`,
        'any.required': 'РЎРѕРґРµСЂР¶РёРјРѕРµ РєРѕРјРјРµРЅС‚Р°СЂРёСЏ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ'
      }),
    
    rating: Joi.number()
      .integer()
      .min(LIMITS.MIN_RATING)
      .max(LIMITS.MAX_RATING)
      .messages({
        'number.integer': 'Р РµР№С‚РёРЅРі РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С†РµР»С‹Рј С‡РёСЃР»РѕРј',
        'number.min': `Р РµР№С‚РёРЅРі РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РѕС‚ ${LIMITS.MIN_RATING} РґРѕ ${LIMITS.MAX_RATING}`,
        'number.max': `Р РµР№С‚РёРЅРі РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РѕС‚ ${LIMITS.MIN_RATING} РґРѕ ${LIMITS.MAX_RATING}`
      }),
    
    parentId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.pattern.base': 'РќРµРІРµСЂРЅС‹Р№ ID СЂРѕРґРёС‚РµР»СЊСЃРєРѕРіРѕ РєРѕРјРјРµРЅС‚Р°СЂРёСЏ'
      }),
    
    episodeNumber: Joi.number()
      .integer()
      .min(1)
      .messages({
        'number.integer': 'РќРѕРјРµСЂ СЌРїРёР·РѕРґР° РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С†РµР»С‹Рј С‡РёСЃР»РѕРј',
        'number.min': 'РќРѕРјРµСЂ СЌРїРёР·РѕРґР° РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ 0'
      }),
    
    tags: Joi.array()
      .items(Joi.string().valid('spoiler', 'review', 'recommendation', 'discussion'))
  }),

  update: Joi.object({
    content: Joi.string()
      .min(1)
      .max(LIMITS.COMMENT_MAX_LENGTH)
      .required()
      .messages({
        'string.min': 'РљРѕРјРјРµРЅС‚Р°СЂРёР№ РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РїСѓСЃС‚С‹Рј',
        'string.max': `РљРѕРјРјРµРЅС‚Р°СЂРёР№ РЅРµ РґРѕР»Р¶РµРЅ РїСЂРµРІС‹С€Р°С‚СЊ ${LIMITS.COMMENT_MAX_LENGTH} СЃРёРјРІРѕР»РѕРІ`,
        'any.required': 'РЎРѕРґРµСЂР¶РёРјРѕРµ РєРѕРјРјРµРЅС‚Р°СЂРёСЏ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ'
      })
  }),

  report: Joi.object({
    reason: Joi.string()
      .valid('spam', 'inappropriate', 'harassment', 'spoiler', 'other')
      .required()
      .messages({
        'any.only': 'РќРµРІРµСЂРЅР°СЏ РїСЂРёС‡РёРЅР° Р¶Р°Р»РѕР±С‹',
        'any.required': 'РџСЂРёС‡РёРЅР° Р¶Р°Р»РѕР±С‹ РѕР±СЏР·Р°С‚РµР»СЊРЅР°'
      }),
    
    description: Joi.string()
      .max(LIMITS.REPORT_DESCRIPTION_MAX_LENGTH)
      .allow('')
      .messages({
        'string.max': `РћРїРёСЃР°РЅРёРµ Р¶Р°Р»РѕР±С‹ РЅРµ РґРѕР»Р¶РЅРѕ РїСЂРµРІС‹С€Р°С‚СЊ ${LIMITS.REPORT_DESCRIPTION_MAX_LENGTH} СЃРёРјРІРѕР»РѕРІ`
      })
  })
};

// РЎС…РµРјС‹ РІР°Р»РёРґР°С†РёРё РґР»СЏ СЃРїРёСЃРєРѕРІ РїСЂРѕСЃРјРѕС‚СЂР°
const watchListSchemas = {
  addToList: Joi.object({
    status: Joi.string()
      .valid('watching', 'completed', 'planToWatch', 'dropped', 'onHold')
      .required()
      .messages({
        'any.only': 'РќРµРІРµСЂРЅС‹Р№ СЃС‚Р°С‚СѓСЃ РїСЂРѕСЃРјРѕС‚СЂР°',
        'any.required': 'РЎС‚Р°С‚СѓСЃ РїСЂРѕСЃРјРѕС‚СЂР° РѕР±СЏР·Р°С‚РµР»РµРЅ'
      }),
    
    rating: Joi.number()
      .integer()
      .min(LIMITS.MIN_RATING)
      .max(LIMITS.MAX_RATING)
      .messages({
        'number.integer': 'Р РµР№С‚РёРЅРі РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С†РµР»С‹Рј С‡РёСЃР»РѕРј',
        'number.min': `Р РµР№С‚РёРЅРі РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РѕС‚ ${LIMITS.MIN_RATING} РґРѕ ${LIMITS.MAX_RATING}`,
        'number.max': `Р РµР№С‚РёРЅРі РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РѕС‚ ${LIMITS.MIN_RATING} РґРѕ ${LIMITS.MAX_RATING}`
      }),
    
    notes: Joi.string()
      .max(LIMITS.NOTES_MAX_LENGTH)
      .allow('')
      .messages({
        'string.max': `Р—Р°РјРµС‚РєРё РЅРµ РґРѕР»Р¶РЅС‹ РїСЂРµРІС‹С€Р°С‚СЊ ${LIMITS.NOTES_MAX_LENGTH} СЃРёРјРІРѕР»РѕРІ`
      }),
    
    priority: Joi.string()
      .valid('low', 'medium', 'high')
      .messages({
        'any.only': 'РќРµРІРµСЂРЅС‹Р№ РїСЂРёРѕСЂРёС‚РµС‚'
      }),
    
    isPrivate: Joi.boolean()
  }),

  updateProgress: Joi.object({
    episodesWatched: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.integer': 'РљРѕР»РёС‡РµСЃС‚РІРѕ РїСЂРѕСЃРјРѕС‚СЂРµРЅРЅС‹С… СЌРїРёР·РѕРґРѕРІ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ С†РµР»С‹Рј С‡РёСЃР»РѕРј',
        'number.min': 'РљРѕР»РёС‡РµСЃС‚РІРѕ РїСЂРѕСЃРјРѕС‚СЂРµРЅРЅС‹С… СЌРїРёР·РѕРґРѕРІ РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РѕС‚СЂРёС†Р°С‚РµР»СЊРЅС‹Рј',
        'any.required': 'РљРѕР»РёС‡РµСЃС‚РІРѕ РїСЂРѕСЃРјРѕС‚СЂРµРЅРЅС‹С… СЌРїРёР·РѕРґРѕРІ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ'
      }),
    
    timeWatched: Joi.number()
      .min(0)
      .messages({
        'number.min': 'Р’СЂРµРјСЏ РїСЂРѕСЃРјРѕС‚СЂР° РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РѕС‚СЂРёС†Р°С‚РµР»СЊРЅС‹Рј'
      })
  })
};

// РЎС…РµРјС‹ РІР°Р»РёРґР°С†РёРё РїР°СЂР°РјРµС‚СЂРѕРІ
const paramSchemas = {
  objectId: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'РќРµРІРµСЂРЅС‹Р№ С„РѕСЂРјР°С‚ ID',
        'any.required': 'ID РѕР±СЏР·Р°С‚РµР»РµРЅ'
      })
  }),

  userId: Joi.object({
    userId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'РќРµРІРµСЂРЅС‹Р№ С„РѕСЂРјР°С‚ ID РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ',
        'any.required': 'ID РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РѕР±СЏР·Р°С‚РµР»РµРЅ'
      })
  }),

  animeEpisode: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'РќРµРІРµСЂРЅС‹Р№ С„РѕСЂРјР°С‚ ID Р°РЅРёРјРµ',
        'any.required': 'ID Р°РЅРёРјРµ РѕР±СЏР·Р°С‚РµР»РµРЅ'
      }),
    episodeId: Joi.string()
      .pattern(/^\d+$/)
      .required()
      .messages({
        'string.pattern.base': 'РќРµРІРµСЂРЅС‹Р№ С„РѕСЂРјР°С‚ РЅРѕРјРµСЂР° СЌРїРёР·РѕРґР°',
        'any.required': 'РќРѕРјРµСЂ СЌРїРёР·РѕРґР° РѕР±СЏР·Р°С‚РµР»РµРЅ'
      })
  })
};

// РЎС…РµРјР° РїР°РіРёРЅР°С†РёРё (РѕР±СЉСЏРІР»СЏРµРј РѕС‚РґРµР»СЊРЅРѕ РґР»СЏ РёР·Р±РµР¶Р°РЅРёСЏ С†РёРєР»РёС‡РµСЃРєРёС… СЃСЃС‹Р»РѕРє)
const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.integer': 'РќРѕРјРµСЂ СЃС‚СЂР°РЅРёС†С‹ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С†РµР»С‹Рј С‡РёСЃР»РѕРј',
      'number.min': 'РќРѕРјРµСЂ СЃС‚СЂР°РЅРёС†С‹ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ 0'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(LIMITS.MAX_PAGE_SIZE)
    .default(LIMITS.DEFAULT_PAGE_SIZE)
    .messages({
      'number.integer': 'Р›РёРјРёС‚ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С†РµР»С‹Рј С‡РёСЃР»РѕРј',
      'number.min': 'Р›РёРјРёС‚ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ 0',
      'number.max': `Р›РёРјРёС‚ РЅРµ РґРѕР»Р¶РµРЅ РїСЂРµРІС‹С€Р°С‚СЊ ${LIMITS.MAX_PAGE_SIZE}`
    })
});

// РЎС…РµРјС‹ РІР°Р»РёРґР°С†РёРё query РїР°СЂР°РјРµС‚СЂРѕРІ
const querySchemas = {
  pagination: paginationSchema,

  animeSearch: Joi.object({
    q: Joi.string()
      .min(1)
      .max(100)
      .messages({
        'string.min': 'РџРѕРёСЃРєРѕРІС‹Р№ Р·Р°РїСЂРѕСЃ РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РїСѓСЃС‚С‹Рј',
        'string.max': 'РџРѕРёСЃРєРѕРІС‹Р№ Р·Р°РїСЂРѕСЃ РЅРµ РґРѕР»Р¶РµРЅ РїСЂРµРІС‹С€Р°С‚СЊ 100 СЃРёРјРІРѕР»РѕРІ'
      }),
    
    search: Joi.string()
      .min(0)
      .max(100)
      .allow('')
      .optional()
      .messages({
        'string.max': 'РџРѕРёСЃРєРѕРІС‹Р№ Р·Р°РїСЂРѕСЃ РЅРµ РґРѕР»Р¶РµРЅ РїСЂРµРІС‹С€Р°С‚СЊ 100 СЃРёРјРІРѕР»РѕРІ'
      }),
    
    sortBy: Joi.string()
      .valid('title', 'year', 'rating', 'rating.score', 'popularity', 'createdAt')
      .default('rating'),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc'),
    
    rating: Joi.string()
      .allow(''),
    
    genres: Joi.alternatives()
      .try(
        Joi.string(),
        Joi.array().items(Joi.string())
      ),
    
    year: Joi.alternatives()
      .try(
        Joi.number().integer().min(1900).max(new Date().getFullYear() + 5),
        Joi.string().allow('')
      )
      .messages({
        'number.integer': 'Р“РѕРґ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С†РµР»С‹Рј С‡РёСЃР»РѕРј',
        'number.min': 'Р“РѕРґ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ 1900',
        'number.max': 'Р“РѕРґ РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ СЃР»РёС€РєРѕРј РґР°Р»РµРєРѕ РІ Р±СѓРґСѓС‰РµРј'
      }),
    
    status: Joi.string()
      .valid('Finished Airing', 'Currently Airing', 'Not yet aired')
      .allow(''),
    
    type: Joi.string()
      .valid('TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music')
      .allow(''),
    
    sort: Joi.string()
      .valid('title', 'year', 'rating', 'rating.score', 'popularity', 'createdAt')
      .default('rating'),
    
    order: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
  }).concat(paginationSchema)
};

module.exports = {
  validate,
  validateParams,
  validateQuery,
  authSchemas,
  userSchemas,
  commentSchemas,
  watchListSchemas,
  paramSchemas,
  querySchemas
};
