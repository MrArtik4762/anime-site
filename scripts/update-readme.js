#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class READMEUpdater {
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

  // Получение информации о последних коммитах
  getRecentCommits(limit = 5) {
    try {
      const command = `git log --oneline --format="%h %s" -n ${limit}`;
      const output = execSync(command, { encoding: 'utf8' }).trim();
      return output.split('\n').filter(line => line.trim());
    } catch (error) {
      console.warn('Не удалось получить информацию о коммитах:', error.message);
      return [];
    }
  }

  // Получение статистики проекта
  getProjectStats() {
    try {
      const stats = {};
      
      // Количество файлов
      const filesCommand = 'git ls-files | wc -l';
      stats.files = parseInt(execSync(filesCommand, { encoding: 'utf8' }).trim());
      
      // Количество строк кода
      const linesCommand = 'git ls-files | xargs wc -l | tail -1 | awk \'{print $1}\'';
      stats.lines = parseInt(execSync(linesCommand, { encoding: 'utf8' }).trim());
      
      // Размер репозитория
      const sizeCommand = 'git count-objects -vH | grep "size-pack" | awk \'{print $2}\'';
      stats.size = parseInt(execSync(sizeCommand, { encoding: 'utf8' }).trim());
      
      // Количество коммитов
      const commitsCommand = 'git rev-list --count HEAD';
      stats.commits = parseInt(execSync(commitsCommand, { encoding: 'utf8' }).trim());
      
      return stats;
    } catch (error) {
      console.warn('Не удалось получить статистику проекта:', error.message);
      return {
        files: 0,
        lines: 0,
        size: 0,
        commits: 0
      };
    }
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

  // Обновление раздела "Недавние обновления"
  updateRecentUpdates() {
    const commits = this.getRecentCommits(5);
    const currentDate = this.formatDate(new Date());
    const version = this.getCurrentVersion();
    
    let updatesSection = `## 📅 Недавние обновления\n\n`;
    updatesSection += `### v${version} (${currentDate})\n`;
    
    if (commits.length > 0) {
      updatesSection += `- ✅ **Обновление README.md** - автоматическое обновление документации\n`;
      updatesSection += `- ✅ **Синхронизация с Git** - последние коммиты:\n`;
      
      commits.forEach((commit, index) => {
        updatesSection += `  - ${commit}\n`;
      });
    } else {
      updatesSection += `- ✅ **Обновление документации** - актуализация README.md\n`;
    }
    
    updatesSection += `\n### Важные замечания\n`;
    updatesSection += `README.md автоматически обновляется после крупных изменений в проекте.\n`;
    
    return updatesSection;
  }

  // Обновление статистики проекта
  updateProjectStats() {
    const stats = this.getProjectStats();
    const sizeInMB = Math.round(stats.size / 1024 / 1024 * 100) / 100;
    
    let statsSection = `## 📊 Статистика проекта\n\n`;
    statsSection += `- **Версия проекта**: ${this.getCurrentVersion()}\n`;
    statsSection += `- **Файлов в репозитории**: ${stats.files.toLocaleString()}\n`;
    statsSection += `- **Строк кода**: ${stats.lines.toLocaleString()}\n`;
    statsSection += `- **Размер репозитория**: ~${sizeInMB} МБ\n`;
    statsSection += `- **Всего коммитов**: ${stats.commits.toLocaleString()}\n`;
    statsSection += `- **Последнее обновление**: ${this.formatDate(new Date())}\n`;
    
    return statsSection;
  }

  // Обновление раздела "Требования к хранению"
  updateStorageRequirements() {
    const stats = this.getProjectStats();
    const sizeInMB = Math.round(stats.size / 1024 / 1024 * 100) / 100;
    
    let requirementsSection = `### Требования к хранению\n\n`;
    requirementsSection += `- **Текущий размер проекта**: ~${sizeInMB} МБ\n`;
    requirementsSection += `- **Доступное дисковое пространство**: минимум 2 ГБ для установки зависимостей\n`;
    requirementsSection += `- **Оперативная память**: минимум 4 ГБ для разработки\n`;
    
    return requirementsSection;
  }

  // Основной метод обновления README
  updateREADME() {
    try {
      console.log('Начинаю обновление README.md...');
      
      // Чтение текущего README
      const currentReadme = fs.readFileSync(this.readmePath, 'utf8');
      
      // Генерация новых секций
      const recentUpdates = this.updateRecentUpdates();
      const projectStats = this.updateProjectStats();
      const storageRequirements = this.updateStorageRequirements();
      
      // Замена секций в README
      let updatedReadme = currentReadme;
      
      // Обновление раздела "Недавние обновления"
      const updatesStart = updatedReadme.indexOf('## 📅 Недавние обновления');
      const updatesEnd = updatedReadme.indexOf('## 🛠 Технологический стек', updatesStart);
      if (updatesStart !== -1 && updatesEnd !== -1) {
        updatedReadme = updatedReadme.substring(0, updatesStart) + 
                       recentUpdates + '\n\n' + 
                       updatedReadme.substring(updatesEnd);
      }
      
      // Обновление раздела "Требования к хранению"
      const storageStart = updatedReadme.indexOf('### Требования к хранению');
      const storageEnd = updatedReadme.indexOf('### Восстановление зависимостей после очистки', storageStart);
      if (storageStart !== -1 && storageEnd !== -1) {
        updatedReadme = updatedReadme.substring(0, storageStart) + 
                       storageRequirements + '\n\n' + 
                       updatedReadme.substring(storageEnd);
      }
      
      // Добавление раздела статистики (если его нет)
      if (!updatedReadme.includes('## 📊 Статистика проекта')) {
        const techStackStart = updatedReadme.indexOf('## 🛠 Технологический стек');
        if (techStackStart !== -1) {
          updatedReadme = updatedReadme.substring(0, techStackStart) + 
                         projectStats + '\n\n' + 
                         updatedReadme.substring(techStackStart);
        }
      }
      
      // Запись обновленного README
      fs.writeFileSync(this.tempReadmePath, updatedReadme, 'utf8');
      
      // Проверка, были ли изменения
      const originalContent = fs.readFileSync(this.readmePath, 'utf8');
      const newContent = fs.readFileSync(this.tempReadmePath, 'utf8');
      
      if (originalContent === newContent) {
        console.log('README.md не требует обновления.');
        fs.unlinkSync(this.tempReadmePath);
        return false;
      }
      
      // Замена оригинального файла
      fs.renameSync(this.tempReadmePath, this.readmePath);
      console.log('README.md успешно обновлен!');
      return true;
      
    } catch (error) {
      console.error('Ошибка при обновлении README.md:', error);
      return false;
    }
  }

  // Метод для проверки, нужно ли обновлять README
  needsUpdate() {
    try {
      const currentReadme = fs.readFileSync(this.readmePath, 'utf8');
      const lastUpdateMatch = currentReadme.match(/Последнее обновление: (\d{2}\.\d{2}\.\d{4})/);
      
      if (!lastUpdateMatch) return true;
      
      const lastUpdate = new Date(lastUpdateMatch[1]);
      const today = new Date();
      const daysSinceUpdate = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));
      
      // Обновляем, если прошло больше 7 дней или есть новые коммиты
      return daysSinceUpdate > 7;
    } catch (error) {
      console.error('Ошибка при проверке необходимости обновления:', error);
      return true;
    }
  }
}

// Использование скрипта
if (require.main === module) {
  const updater = new READMEUpdater();
  
  // Проверяем, нужно ли обновление
  if (updater.needsUpdate()) {
    const updated = updater.updateREADME();
    if (updated) {
      console.log('✅ README.md успешно обновлен!');
      process.exit(0);
    } else {
      console.log('ℹ️  README.md не требует обновления.');
      process.exit(0);
    }
  } else {
    console.log('ℹ️  Обновление README.md пока не требуется.');
    process.exit(0);
  }
}

module.exports = READMEUpdater;