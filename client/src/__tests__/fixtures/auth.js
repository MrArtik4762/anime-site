// Тестовые данные для аутентификации
export const mockAuthResponse = {
  success: true,
  token: 'mock-jwt-token',
  user: {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    avatar: null,
    role: 'user',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  expiresIn: '1h',
};

export const mockAuthResponseAdmin = {
  ...mockAuthResponse,
  user: {
    id: 'admin-123',
    username: 'admin',
    email: 'admin@example.com',
    avatar: null,
    role: 'admin',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
};

export const mockLoginRequest = {
  username: 'testuser',
  password: 'password123',
};

export const mockRegisterRequest = {
  username: 'newuser',
  email: 'newuser@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

export const mockForgotPasswordRequest = {
  email: 'test@example.com',
};

export const mockResetPasswordRequest = {
  token: 'mock-reset-token',
  password: 'newpassword123',
  confirmPassword: 'newpassword123',
};

export const mockUpdateProfileRequest = {
  username: 'updateduser',
  email: 'updated@example.com',
  bio: 'Updated bio',
};

export const mockChangePasswordRequest = {
  currentPassword: 'password123',
  newPassword: 'newpassword123',
  confirmPassword: 'newpassword123',
};

export const mockAvatarUploadRequest = {
  avatar: new File([''], 'avatar.jpg', { type: 'image/jpeg' }),
};

export const mockAuthError = {
  success: false,
  message: 'Invalid credentials',
  code: 'INVALID_CREDENTIALS',
};

export const mockAuthValidationError = {
  success: false,
  message: 'Validation error',
  errors: [
    {
      field: 'email',
      message: 'Email is required',
    },
    {
      field: 'password',
      message: 'Password must be at least 8 characters',
    },
  ],
};

export const mockAuthExpiredToken = {
  success: false,
  message: 'Token expired',
  code: 'TOKEN_EXPIRED',
};

export const mockAuthInvalidToken = {
  success: false,
  message: 'Invalid token',
  code: 'INVALID_TOKEN',
};

export const mockAuthUserNotFound = {
  success: false,
  message: 'User not found',
  code: 'USER_NOT_FOUND',
};

export const mockAuthEmailAlreadyExists = {
  success: false,
  message: 'Email already exists',
  code: 'EMAIL_ALREADY_EXISTS',
};

export const mockAuthUsernameAlreadyExists = {
  success: false,
  message: 'Username already exists',
  code: 'USERNAME_ALREADY_EXISTS',
};

export const mockAuthPasswordResetSent = {
  success: true,
  message: 'Password reset email sent',
};

export const mockAuthPasswordResetSuccess = {
  success: true,
  message: 'Password reset successfully',
};

export const mockAuthProfileUpdateSuccess = {
  success: true,
  user: {
    id: 'user-123',
    username: 'updateduser',
    email: 'updated@example.com',
    bio: 'Updated bio',
    avatar: 'https://example.com/avatar.jpg',
    role: 'user',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
};

export const mockAuthPasswordChangeSuccess = {
  success: true,
  message: 'Password changed successfully',
};

export const mockAuthAvatarUploadSuccess = {
  success: true,
  user: {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    role: 'user',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
};

export const mockAuthContext = {
  user: {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    avatar: null,
    role: 'user',
  },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  uploadAvatar: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
};

export const mockAuthContextUnauthenticated = {
  ...mockAuthContext,
  user: null,
  isAuthenticated: false,
};

export const mockAuthContextLoading = {
  ...mockAuthContext,
  isLoading: true,
};

// Пустой тест чтобы избежать ошибки "Your test suite must contain at least one test"
describe('Auth fixtures', () => {
  it('fixtures loaded', () => {
    expect(mockAuthResponse).toBeDefined();
  });
});