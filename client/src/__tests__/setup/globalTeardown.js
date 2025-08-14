const fs = require('fs');
const path = require('path');

// Получаем путь к директории coverage
const coverageDir = path.join(__dirname, '..', '..', '..', 'coverage');

// Создаем отчет о завершении тестов
const testReport = {
  timestamp: new Date().toISOString(),
  status: 'completed',
  coverage: {
    totalLines: 0,
    coveredLines: 0,
    percentage: 0,
  },
  tests: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  },
};

// Сохраняем отчет о завершении тестов
const testReportPath = path.join(coverageDir, 'test-report.json');
fs.writeFileSync(testReportPath, JSON.stringify(testReport, null, 2));

// Очищаем временные файлы, если они есть
const tempFiles = [
  path.join(__dirname, 'temp'),
  path.join(__dirname, 'cache'),
];

tempFiles.forEach(tempFile => {
  if (fs.existsSync(tempFile)) {
    try {
      fs.rmSync(tempFile, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to clean temp file:', tempFile, error.message);
    }
  }
});

console.log('Global test teardown completed');

// Пустой тест, чтобы Jest не считал этот файл тестовым набором без тестов
test('global teardown configuration', () => {
  expect(true).toBe(true);
});