// Экспорт всех fixtures
export * from './users';
export * from './anime';
export * from './episodes';
export * from './videoProgress';
export * from './auth';

// Пустой тест чтобы избежать ошибки "Your test suite must contain at least one test"
describe('All fixtures', () => {
  it('all fixtures loaded', () => {
    expect(true).toBe(true);
  });
});