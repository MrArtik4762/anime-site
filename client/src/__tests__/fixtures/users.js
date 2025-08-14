// Тестовые данные для пользователей
export const mockUser = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  avatar: null,
  role: 'user',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
};

export const mockAdminUser = {
  id: 'admin-123',
  username: 'admin',
  email: 'admin@example.com',
  avatar: null,
  role: 'admin',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
};

export const mockUserWithAvatar = {
  ...mockUser,
  avatar: 'https://example.com/avatar.jpg',
};

export const mockUserList = [
  mockUser,
  {
    ...mockAdminUser,
    id: 'admin-456',
    username: 'admin2',
    email: 'admin2@example.com',
  },
  {
    id: 'user-789',
    username: 'user2',
    email: 'user2@example.com',
    avatar: 'https://example.com/avatar2.jpg',
    role: 'user',
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
];

export const mockUserCredentials = {
  username: 'testuser',
  password: 'password123',
  email: 'test@example.com',
};

export const mockUserLoginCredentials = {
  username: 'testuser',
  password: 'password123',
};

export const mockUserRegistrationData = {
  username: 'newuser',
  email: 'newuser@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

// Пустой тест чтобы избежать ошибки "Your test suite must contain at least one test"
describe('Users fixtures', () => {
  it('fixtures loaded', () => {
    expect(mockUser).toBeDefined();
  });
});