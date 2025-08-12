#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PrepareCommit {
  constructor() {
    this.readmePath = path.join(__dirname, '../README.md');
    this.changelogPath = path.join(__dirname, '../CHANGELOG.md');
    this.tempReadmePath = path.join(__dirname, '../README_TEMP.md');
  }

  // Форматирование даты
  formatDate(date) {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  // Получение текущей версии из package.json
  getCurrentVersion() {
    try {
      const packagePath = path.join(__dirname, '../package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      const packageData = JSON.parse(packageContent);
      return packageData.version || '1.0.0';
    } catch (error) {
      console.warn('Не удалось получить версию из package.json:', error.message);
      return '1.0.0';
    }
  }

  // Получение списка измененных файлов
  getChangedFiles() {
    try {
      const command = 'git diff --name-only HEAD';
      const output = execSync(command, { encoding: 'utf8' }).trim();
      return output ? output.split('\n') : [];
    } catch (error) {
      console.warn('Не удалось получить список измененных файлов:', error.message);
      return [];
    }
  }

  // Проверка, есть ли изменения в README.md
  hasReadmeChanges() {
    const changedFiles = this.getChangedFiles();
    return changedFiles.includes('README.md');
  }

  // Получение информации о последних коммитах для changelog
  getRecentCommitsForChangelog(limit = 3) {
    try {
      const command = `git log --oneline --format="%h %s" -n ${limit}`;
      const output = execSync(command, { encoding: 'utf8' }).trim();
      return output.split('\n').filter(line => line.trim());
    } catch (error) {
      console.warn('Не удалось получить информацию о коммитах:', error.message);
      return [];
    }
  }

  // Создание changelog записи
  createChangelogEntry() {
    const commits = this.getRecentCommitsForChangelog(3);
    const currentDate = this.formatDate(new Date());
    const version = this.getCurrentVersion();
    
    let changelogEntry = `### v${version} (${currentDate})\n`;
    
    if (commits.length > 0) {
      changelogEntry += commits.map(commit => `- ${commit}`).join('\n');
    } else {
      changelogEntry += '- ✅ **Обновление документации** - актуализация README.md';
    }
    
    return changelogEntry;
  }

  // Обновление changelog
  updateChangelog() {
    try {
      const changelogExists = fs.existsSync(this.changelogPath);
      
      if (!changelogExists) {
        // Создание нового changelog
        const changelogContent = `# 📝 Changelog\n\n${this.createChangelogEntry()}\n`;
        fs.writeFileSync(this.changelogPath, changelogContent, 'utf8');
        console.log('✅ Создан новый CHANGELOG.md');
        return true;
      } else {
        // Обновление существующего changelog
        const currentChangelog = fs.readFileSync(this.changelogPath, 'utf8');
        const newEntry = this.createChangelogEntry();
        
        // Проверяем, есть ли уже запись для текущей версии
        const versionRegex = new RegExp(`### v${this.getCurrentVersion()}\\s*\\(`);
        if (versionRegex.test(currentChangelog)) {
          console.log('ℹ️  Запись для текущей версии уже существует в CHANGELOG.md');
          return false;
        }
        
        const updatedChangelog = `${newEntry}\n\n${currentChangelog}`;
        fs.writeFileSync(this.changelogPath, updatedChangelog, 'utf8');
        console.log('✅ Обновлен CHANGELOG.md');
        return true;
      }
    } catch (error) {
      console.error('Ошибка при обновлении CHANGELOG.md:', error);
      return false;
    }
  }

  // Проверка, является ли изменение крупным
  isMajorChange() {
    const changedFiles = this.getChangedFiles();
    const readmeChanged = changedFiles.includes('README.md');
    
    if (readmeChanged) {
      try {
        const readmeDiff = execSync('git diff HEAD~1 README.md', { encoding: 'utf8' });
        const linesAdded = (readmeDiff.match(/^\+/gm) || []).length;
        const linesRemoved = (readmeDiff(/^-/gm) || []).length;
        const totalChanges = linesAdded + linesRemoved;
        
        return totalChanges > 50; // Считаем крупным изменением более 50 строк
      } catch (error) {
        console.warn('Не удалось проанализировать изменения в README.md:', error.message);
        return false;
      }
    }
    
    return false;
  }

  // Основной метод подготовки коммита
  prepareCommit() {
    try {
      console.log('🔍 Проверка изменений перед коммитом...');
      
      // Получаем список измененных файлов
      const changedFiles = this.getChangedFiles();
      
      if (changedFiles.length === 0) {
        console.log('ℹ️  Нет изменений для коммита.');
        return false;
      }
      
      console.log('📁 Измененные файлы:');
      changedFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
      
      // Проверяем, нужно ли обновлять README
      const readmeNeedsUpdate = this.hasReadmeChanges() || this.isMajorChange();
      
      if (readmeNeedsUpdate) {
        console.log('📝 Обнаружены изменения в README.md или крупные изменения в проекте...');
        
        // Обновляем README
        const READMEUpdater = require('./update-readme');
        const readmeUpdater = new READMEUpdater();
        const readmeUpdated = readmeUpdater.updateREADME();
        
        if (readmeUpdated) {
          console.log('✅ README.md успешно обновлен');
          
          // Добавляем обновленный README в staging
          try {
            execSync('git add README.md', { stdio: 'inherit' });
            console.log('✅ README.md добавлен в staging area');
          } catch (error) {
            console.error('Ошибка при добавлении README.md в staging:', error.message);
          }
        }
        
        // Обновляем changelog
        const changelogUpdated = this.updateChangelog();
        
        if (changelogUpdated) {
          try {
            execSync('git add CHANGELOG.md', { stdio: 'inherit' });
            console.log('✅ CHANGELOG.md добавлен в staging area');
          } catch (error) {
            console.error('Ошибка при добавлении CHANGELOG.md в staging:', error.message);
          }
        }
        
        console.log('✅ Готово к коммиту! README.md и CHANGELOG.md обновлены.');
        return true;
      } else {
        console.log('ℹ️  README.md не требует обновления.');
        return false;
      }
      
    } catch (error) {
      console.error('Ошибка при подготовке коммита:', error);
      return false;
    }
  }

  // Метод для проверки статуса
  checkStatus() {
    try {
      console.log('🔍 Проверка статуса репозитория...');
      
      const changedFiles = this.getChangedFiles();
      const hasStagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim().length > 0;
      
      console.log(`📁 Измененных файлов: ${changedFiles.length}`);
      console.log(`📦 Файлов в staging: ${hasStagedFiles ? 'Да' : 'Нет'}`);
      
      if (changedFiles.length > 0) {
        console.log('📁 Измененные файлы:');
        changedFiles.forEach(file => {
          console.log(`  - ${file}`);
        });
      }
      
      return {
        hasChanges: changedFiles.length > 0,
        hasStagedFiles,
        changedFiles
      };
    } catch (error) {
      console.error('Ошибка при проверке статуса:', error);
      return {
        hasChanges: false,
        hasStagedFiles: false,
        changedFiles: []
      };
    }
  }
}

// Обработка аргументов командной строки
const args = process.argv.slice(2);
const command = args[0];

const prepareCommit = new PrepareCommit();

switch (command) {
  case 'status':
    prepareCommit.checkStatus();
    break;
  case 'update':
    const updated = prepareCommit.prepareCommit();
    process.exit(updated ? 0 : 1);
    break;
  case 'help':
  default:
    console.log(`
Использование:
  node scripts/prepare-commit.js [команда]

Команды:
  status              - Показать статус изменений
  update              - Подготовить README.md к коммиту
  help                - Показать эту справку

Примеры:
  node scripts/prepare-commit.js status
  node scripts/prepare-commit.js update
    `);
    break;
}

// Если скрипт вызван без аргументов, выполняем подготовку к коммиту
if (require.main === module && !command) {
  const updated = prepareCommit.prepareCommit();
  process.exit(updated ? 0 : 1);
}

module.exports = PrepareCommit;