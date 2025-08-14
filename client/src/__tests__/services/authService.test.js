import { authService } from '../../services/authService';
import { mockAuthResponse, mockAuthError, mockAuthValidationError } from '../fixtures/auth';

// Mock API
jest.mock('../../services/api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
}));

const mockApi = require('../../services/api');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Очищаем localStorage
    localStorage.clear();
  });

  describe('login', () => {
    it('успешно авторизует пользователя', async () => {
      const credentials = {
        username: 'testuser',
        password: 'password123',
      };

      mockApi.post.mockResolvedValueOnce({
        data: mockAuthResponse,
      });

      const result = await authService.login(credentials);

      expect(result).toEqual(mockAuthResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/login', credentials);
    });

    it('обрабатывает ошибку авторизации', async () => {
      const credentials = {
        username: 'wronguser',
        password: 'wrongpassword',
      };

      mockApi.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      });

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/login', credentials);
    });

    it('обрабатывает ошибку без ответа от сервера', async () => {
      const credentials = {
        username: 'testuser',
        password: 'password123',
      };

      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(authService.login(credentials)).rejects.toThrow('Ошибка входа');
      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/login', credentials);
    });
  });

  describe('register', () => {
    it('успешно регистрирует пользователя', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      mockApi.post.mockResolvedValueOnce({
        data: mockAuthResponse,
      });

      const result = await authService.register(userData);

      expect(result).toEqual(mockAuthResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/register', userData);
    });

    it('обрабатывает ошибку регистрации', async () => {
      const userData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      mockApi.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Username already exists',
          },
        },
      });

      await expect(authService.register(userData)).rejects.toThrow('Username already exists');
      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/register', userData);
    });
  });

  describe('getCurrentUser', () => {
    it('успешно получает данные текущего пользователя', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: mockAuthResponse.user,
      });

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockAuthResponse.user);
      expect(mockApi.get).toHaveBeenCalledWith('/api/auth/me');
    });

    it('обрабатывает ошибку при получении данных пользователя', async () => {
      mockApi.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'User not found',
          },
        },
      });

      await expect(authService.getCurrentUser()).rejects.toThrow('User not found');
      expect(mockApi.get).toHaveBeenCalledWith('/api/auth/me');
    });
  });

  describe('updateProfile', () => {
    it('успешно обновляет профиль пользователя', async () => {
      const profileData = {
        username: 'updateduser',
        email: 'updated@example.com',
        bio: 'Updated bio',
      };

      mockApi.put.mockResolvedValueOnce({
        data: {
          ...mockAuthResponse.user,
          ...profileData,
        },
      });

      const result = await authService.updateProfile(profileData);

      expect(result).toEqual(expect.objectContaining(profileData));
      expect(mockApi.put).toHaveBeenCalledWith('/api/users/profile', profileData);
    });

    it('обрабатывает ошибку при обновлении профиля', async () => {
      const profileData = {
        username: 'invaliduser',
        email: 'invalid@example.com',
      };

      mockApi.put.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Invalid profile data',
          },
        },
      });

      await expect(authService.updateProfile(profileData)).rejects.toThrow('Invalid profile data');
      expect(mockApi.put).toHaveBeenCalledWith('/api/users/profile', profileData);
    });
  });

  describe('changePassword', () => {
    it('успешно меняет пароль', async () => {
      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      mockApi.put.mockResolvedValueOnce({
        data: {
          message: 'Password changed successfully',
        },
      });

      const result = await authService.changePassword(passwordData);

      expect(result).toEqual(expect.objectContaining({
        message: 'Password changed successfully',
      }));
      expect(mockApi.put).toHaveBeenCalledWith('/api/users/change-password', passwordData);
    });

    it('обрабатывает ошибку при смене пароля', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      mockApi.put.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Current password is incorrect',
          },
        },
      });

      await expect(authService.changePassword(passwordData)).rejects.toThrow('Current password is incorrect');
      expect(mockApi.put).toHaveBeenCalledWith('/api/users/change-password', passwordData);
    });
  });

  describe('uploadAvatar', () => {
    it('успешно загружает аватар', async () => {
      const formData = new FormData();
      formData.append('avatar', new File([''], 'avatar.jpg', { type: 'image/jpeg' }));

      mockApi.post.mockResolvedValueOnce({
        data: {
          ...mockAuthResponse.user,
          avatar: 'https://example.com/avatar.jpg',
        },
      });

      const result = await authService.uploadAvatar(formData);

      expect(result).toEqual(expect.objectContaining({
        avatar: 'https://example.com/avatar.jpg',
      }));
      expect(mockApi.post).toHaveBeenCalledWith('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    });

    it('обрабатывает ошибку при загрузке аватара', async () => {
      const formData = new FormData();
      formData.append('avatar', new File([''], 'avatar.jpg', { type: 'image/jpeg' }));

      mockApi.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Invalid file format',
          },
        },
      });

      await expect(authService.uploadAvatar(formData)).rejects.toThrow('Invalid file format');
      expect(mockApi.post).toHaveBeenCalledWith('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    });
  });

  describe('forgotPassword', () => {
    it('успешно отправляет запрос на восстановление пароля', async () => {
      const email = 'test@example.com';

      mockApi.post.mockResolvedValueOnce({
        data: {
          message: 'Password reset email sent',
        },
      });

      const result = await authService.forgotPassword(email);

      expect(result).toEqual(expect.objectContaining({
        message: 'Password reset email sent',
      }));
      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/forgot-password', { email });
    });

    it('обрабатывает ошибку при запросе восстановления пароля', async () => {
      const email = 'nonexistent@example.com';

      mockApi.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Email not found',
          },
        },
      });

      await expect(authService.forgotPassword(email)).rejects.toThrow('Email not found');
      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/forgot-password', { email });
    });
  });

  describe('resetPassword', () => {
    it('успешно сбрасывает пароль', async () => {
      const token = 'reset-token';
      const newPassword = 'newpassword123';

      mockApi.post.mockResolvedValueOnce({
        data: {
          message: 'Password reset successfully',
        },
      });

      const result = await authService.resetPassword(token, newPassword);

      expect(result).toEqual(expect.objectContaining({
        message: 'Password reset successfully',
      }));
      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/reset-password', {
        token,
        password: newPassword,
      });
    });

    it('обрабатывает ошибку при сбросе пароля', async () => {
      const token = 'invalid-token';
      const newPassword = 'newpassword123';

      mockApi.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Invalid or expired token',
          },
        },
      });

      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Invalid or expired token');
      expect(mockApi.post).toHaveBeenCalledWith('/api/auth/reset-password', {
        token,
        password: newPassword,
      });
    });
  });

  describe('обработка ошибок', () => {
    it('корректно обрабатывает ошибки сети', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(authService.login({ username: 'test', password: 'test' }))
        .rejects.toThrow('Ошибка входа');
    });

    it('корректно обрабатывает ошибки сервера', async () => {
      mockApi.post.mockRejectedValueOnce({
        response: undefined,
      });

      await expect(authService.login({ username: 'test', password: 'test' }))
        .rejects.toThrow('Ошибка входа');
    });

    it('корректно обрабатывает ошибки с пустым сообщением', async () => {
      mockApi.post.mockRejectedValueOnce({
        response: {
          data: {},
        },
      });

      await expect(authService.login({ username: 'test', password: 'test' }))
        .rejects.toThrow('Ошибка входа');
    });
  });

  describe('валидация данных', () => {
    it('проверяет валидность данных при регистрации', async () => {
      const invalidUserData = {
        username: '',
        email: 'invalid-email',
        password: 'short',
        confirmPassword: 'short',
      };

      mockApi.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Validation error',
            errors: [
              { field: 'username', message: 'Username is required' },
              { field: 'email', message: 'Invalid email format' },
              { field: 'password', message: 'Password must be at least 8 characters' },
            ],
          },
        },
      });

      await expect(authService.register(invalidUserData))
        .rejects.toThrow('Validation error');
    });
  });
});