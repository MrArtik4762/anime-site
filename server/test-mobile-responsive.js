/**
 * Тестирование адаптивного дизайна EpisodeSources на мобильных устройствах
 * 
 * Этот тест проверяет, как компонент EpisodeSources.jsx ведет себя на разных
 * размерах экранах, особенно на мобильных устройствах.
 */

const puppeteer = require('puppeteer');
const { expect } = require('chai');

describe('EpisodeSources Mobile Responsive Testing', function() {
  this.timeout(30000); // Увеличиваем таймаут для мобильных тестов
  
  let browser;
  let page;
  
  before(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    page = await browser.newPage();
    
    // Настройка viewport для мобильных устройств
    await page.setViewport({
      width: 375,
      height: 667,
      isMobile: true,
      hasTouch: true
    });
    
    // Включаем логирование консоли
    page.on('console', msg => {
      console.log('CONSOLE:', msg.type(), msg.text());
    });
    
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
    });
  });
  
  after(async () => {
    if (browser) {
      await browser.close();
    }
  });
  
  beforeEach(async () => {
    // Переходим на страницу с демо компонента
    await page.goto('http://localhost:3000/episode-sources-demo');
    // Ждем загрузки контента
    await page.waitForSelector('[data-testid="episode-sources-container"]', { timeout: 10000 });
  });
  
  it('should display correctly on mobile (375x667)', async () => {
    // Проверяем, что контейнер отображается
    const container = await page.$('[data-testid="episode-sources-container"]');
    expect(container).to.not.be.null;
    
    // Проверяем основные элементы
    const title = await page.$('h2');
    expect(title).to.not.be.null;
    
    // Проверяем, что фильтр качества отображается корректно
    const qualityFilter = await page.$('select');
    expect(qualityFilter).to.not.be.null;
    
    // Проверяем, что карточки источников отображаются
    const sourceCards = await page.$$('.source-card');
    expect(sourceCards.length).to.be.greaterThan(0);
    
    // Проверяем адаптивные стили
    const containerStyle = await page.evaluate(() => {
      const container = document.querySelector('[data-testid="episode-sources-container"]');
      return {
        width: container.offsetWidth,
        height: container.offsetHeight,
        padding: window.getComputedStyle(container).padding
      };
    });
    
    console.log('Mobile container style:', containerStyle);
    expect(containerStyle.width).to.be.lessThan(400); // Мобильная ширина
  });
  
  it('should handle orientation change correctly', async () => {
    // Проверяем в портретной ориентации
    await page.setViewport({
      width: 375,
      height: 667,
      isMobile: true,
      hasTouch: true
    });
    
    await page.waitForTimeout(2000);
    
    const portraitHeight = await page.evaluate(() => {
      return document.querySelector('[data-testid="episode-sources-container"]').offsetHeight;
    });
    
    // Меняем на ландшафтную ориентацию
    await page.setViewport({
      width: 667,
      height: 375,
      isMobile: true,
      hasTouch: true
    });
    
    await page.waitForTimeout(2000);
    
    const landscapeHeight = await page.evaluate(() => {
      return document.querySelector('[data-testid="episode-sources-container"]').offsetHeight;
    });
    
    console.log('Portrait height:', portraitHeight, 'Landscape height:', landscapeHeight);
    
    // В ландшафтной ориентации высота должна быть меньше
    expect(landscapeHeight).to.be.lessThan(portraitHeight);
  });
  
  it('should have touch-friendly buttons on mobile', async () => {
    // Проверяем размеры кнопок
    const openButton = await page.$('button:contains("Открыть")');
    const playButton = await page.$('button:contains("Play")');
    
    if (openButton) {
      const openButtonRect = await openButton.boundingBox();
      expect(openButtonRect.width).to.be.greaterThan(80); // Минимальная ширина для touch
      expect(openButtonRect.height).to.be.greaterThan(36); // Минимальная высота для touch
    }
    
    if (playButton) {
      const playButtonRect = await playButton.boundingBox();
      expect(playButtonRect.width).to.be.greaterThan(80);
      expect(playButtonRect.height).to.be.greaterThan(36);
    }
  });
  
  it('should display responsive text sizes', async () => {
    // Проверяем размеры текста на мобильных устройствах
    const titleElement = await page.$('h2');
    const titleStyle = await page.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight
      };
    }, titleElement);
    
    console.log('Title style on mobile:', titleStyle);
    
    // Текст должен быть достаточно большим для чтения на мобильных
    const fontSize = parseFloat(titleStyle.fontSize);
    expect(fontSize).to.be.greaterThan(16); // Минимальный размер для мобильных
    
    // Проверяем размер текста в карточках
    const cardTitleElement = await page.$('.source-title');
    if (cardTitleElement) {
      const cardTitleStyle = await page.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return {
          fontSize: computedStyle.fontSize
        };
      }, cardTitleElement);
      
      const cardFontSize = parseFloat(cardTitleStyle.fontSize);
      expect(cardFontSize).to.be.greaterThan(14); // Минимальный размер для мобильных
    }
  });
  
  it('should handle responsive layout for source cards', async () => {
    // Проверяем адаптивную верстку карточек
    const sourceCards = await page.$$('.source-card');
    
    for (const card of sourceCards) {
      const cardRect = await card.boundingBox();
      const cardStyle = await page.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        return {
          padding: computedStyle.padding,
          margin: computedStyle.margin,
          gap: computedStyle.gap
        };
      }, card);
      
      console.log('Card style:', cardStyle);
      
      // Проверяем, что карточки не выходят за пределы экрана
      expect(cardRect.width).to.be.lessThan(400); // Мобильная ширина
      
      // Проверяем, что есть отступы для удобства чтения
      const padding = parseFloat(cardStyle.padding);
      expect(padding).to.be.greaterThan(8);
    }
  });
  
  it('should display status badges correctly on mobile', async () => {
    // Проверяем отображение бейджей статуса
    const statusBadges = await page.$$('.status-badge');
    
    for (const badge of statusBadges) {
      const badgeRect = await badge.boundingBox();
      const badgeText = await page.evaluate(el => el.textContent, badge);
      
      console.log('Status badge:', badgeText, 'Size:', badgeRect);
      
      // Бейдж должен быть видимым и читаемым
      expect(badgeRect.width).to.be.greaterThan(40);
      expect(badgeRect.height).to.be.greaterThan(20);
      expect(badgeText).to.include('Доступен') || expect(badgeText).to.include('Недоступен');
    }
  });
  
  it('should handle quality filter dropdown on mobile', async () => {
    // Проверяем выпадающий список качества
    const qualityFilter = await page.$('select');
    expect(qualityFilter).to.not.be.null;
    
    // Проверяем, что фильтр имеет достаточный размер для touch
    const filterRect = await qualityFilter.boundingBox();
    expect(filterRect.width).to.be.greaterThan(120);
    expect(filterRect.height).to.be.greaterThan(36);
    
    // Проверяем опции фильтра
    const options = await page.$$('select option');
    expect(options.length).to.be.greaterThan(1);
    
    // Проверяем первую опцию
    const firstOption = await page.evaluate(el => el.textContent, options[0]);
    expect(firstOption).to.include('Все качества');
  });
  
  it('should have responsive spacing on mobile', async () => {
    // Проверяем отступы на мобильных устройствах
    const container = await page.$('[data-testid="episode-sources-container"]');
    const containerStyle = await page.evaluate(el => {
      const computedStyle = window.getComputedStyle(el);
      return {
        marginTop: computedStyle.marginTop,
        marginBottom: computedStyle.marginBottom,
        paddingLeft: computedStyle.paddingLeft,
        paddingRight: computedStyle.paddingRight
      };
    }, container);
    
    console.log('Container spacing:', containerStyle);
    
    // Проверяем, что отступы адаптированы для мобильных
    const marginTop = parseFloat(containerStyle.marginTop);
    const marginBottom = parseFloat(containerStyle.marginBottom);
    const paddingLeft = parseFloat(containerStyle.paddingLeft);
    const paddingRight = parseFloat(containerStyle.paddingRight);
    
    expect(marginTop).to.be.greaterThan(0);
    expect(marginBottom).to.be.greaterThan(0);
    expect(paddingLeft).to.be.greaterThan(8);
    expect(paddingRight).to.be.greaterThan(8);
  });
  
  it('should handle source actions layout on mobile', async () => {
    // Проверяем расположение кнопок действий на мобильных
    const sourceActions = await page.$$('.source-actions');
    
    for (const actions of sourceActions) {
      const actionsRect = await actions.boundingBox();
      const buttons = await actions.$$('button');
      
      console.log('Source actions:', buttons.length, 'buttons');
      
      // Проверяем, что кнопки отображаются
      expect(buttons.length).to.be.greaterThan(0);
      
      // Проверяем расположение кнопок
      for (const button of buttons) {
        const buttonRect = await button.boundingBox();
        const buttonText = await page.evaluate(el => el.textContent, button);
        
        console.log('Button:', buttonText, 'Size:', buttonRect);
        
        // Кнопки должны быть достаточно большими для touch
        expect(buttonRect.width).to.be.greaterThan(80);
        expect(buttonRect.height).to.be.greaterThan(36);
      }
    }
  });
  
  it('should display provider icons correctly on mobile', async () => {
    // Проверяем иконки провайдеров
    const providerIcons = await page.$$('.provider-icon');
    
    for (const icon of providerIcons) {
      const iconRect = await icon.boundingBox();
      const iconStyle = await page.evaluate(el => {
        const computedStyle = window.getComputedStyle(el);
        return {
          width: computedStyle.width,
          height: computedStyle.height,
          fontSize: computedStyle.fontSize
        };
      }, icon);
      
      console.log('Provider icon style:', iconStyle);
      
      // Иконки должны быть видимыми, но не слишком большими
      expect(parseFloat(iconStyle.fontSize)).to.be.greaterThan(12);
      expect(parseFloat(iconStyle.fontSize)).to.be.lessThan(24);
    }
  });
  
  it('should handle last checked time display on mobile', async () => {
    // Проверяем отображение времени последней проверки
    const lastCheckedElements = await page.$$('.last-checked');
    
    for (const element of lastCheckedElements) {
      const elementText = await page.evaluate(el => el.textContent, element);
      const elementRect = await element.boundingBox();
      
      console.log('Last checked:', elementText, 'Size:', elementRect);
      
      // Текст должен быть видимым
      expect(elementRect.width).to.be.greaterThan(50);
      expect(elementRect.height).to.be.greaterThan(16);
      
      // Текст должен содержать информацию о времени
      expect(elementText).to.include('Проверено:');
    }
  });
  
  it('should display quality badges correctly on mobile', async () => {
    // Проверяем бейджи качества
    const qualityBadges = await page.$$('.quality-badge');
    
    for (const badge of qualityBadges) {
      const badgeRect = await badge.boundingBox();
      const badgeText = await page.evaluate(el => el.textContent, badge);
      
      console.log('Quality badge:', badgeText, 'Size:', badgeRect);
      
      // Бейджи качества должны быть видимыми
      expect(badgeRect.width).to.be.greaterThan(30);
      expect(badgeRect.height).to.be.greaterThan(16);
      
      // Текст должен содержать информацию о качестве
      expect(badgeText).to.match(/^\d+p$/); // Формат качества (например, 720p)
    }
  });
});