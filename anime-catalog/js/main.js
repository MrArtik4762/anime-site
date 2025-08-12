// Главный модуль каталога аниме (РАСШИРЕННАЯ ВЕРСИЯ)
class AniCatalog {
    constructor() {
        this.currentPage = 1;
        this.perPage = 10;
        this.baseUrl = 'https://aniliberty.top';
        this.apiUrl = 'https://aniliberty.top/api/v1';
        this.cache = new Map();
        this.searchQuery = '';
        this.searchTimeout = null;
        this.suggestionTimeout = null;
        
        // Расширенные фильтры
        this.filters = {
            sortBy: 'latest',
            year: '',
            type: '',
            status: '',
            genres: []
        };
        
        // История поиска
        this.searchHistory = JSON.parse(localStorage.getItem('animeSearchHistory') || '[]');
        this.availableGenres = [];
        this.availableYears = [];
        
        this.init();
    }

    async init() {
        await this.loadGenres();
        this.populateYears();
        this.setupEventListeners();
        this.renderGenresFilter();
        this.loadAnime();
    }

    // Загрузка доступных жанров из API
    async loadGenres() {
        try {
            const response = await fetch(`${this.apiUrl}/anime/releases/latest?limit=100`, {
                mode: 'cors',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            const genresSet = new Set();
            
            data.forEach(anime => {
                if (anime.genres) {
                    anime.genres.forEach(genre => {
                        genresSet.add(JSON.stringify({name: genre.name, id: genre.id}));
                    });
                }
            });
            
            this.availableGenres = Array.from(genresSet).map(g => JSON.parse(g));
            this.availableGenres.sort((a, b) => a.name.localeCompare(b.name));
            
        } catch (error) {
            console.error('Ошибка загрузки жанров:', error);
            // Fallback жанры
            this.availableGenres = [
                {name: 'Экшен', id: 'action'},
                {name: 'Приключения', id: 'adventure'},
                {name: 'Комедия', id: 'comedy'},
                {name: 'Драма', id: 'drama'},
                {name: 'Фантастика', id: 'sci-fi'},
                {name: 'Романтика', id: 'romance'},
                {name: 'Слайс оф лайф', id: 'slice-of-life'},
                {name: 'Сверхъестественное', id: 'supernatural'}
            ];
        }
    }

    // Заполнение списка лет
    populateYears() {
        const currentYear = new Date().getFullYear();
        const yearSelect = document.getElementById('filterYear');
        if (yearSelect) {
            for (let year = currentYear; year >= 1990; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            }
        }
    }

    // Рендер фильтра жанров
    renderGenresFilter() {
        const genresContainer = document.getElementById('genresContainer');
        if (!genresContainer) return;
        
        genresContainer.innerHTML = '';
        
        this.availableGenres.forEach(genre => {
            const label = document.createElement('label');
            label.className = 'genre-checkbox';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = genre.name;
            checkbox.id = `genre-${genre.id}`;
            
            const span = document.createElement('span');
            span.textContent = genre.name;
            
            label.appendChild(checkbox);
            label.appendChild(span);
            
            // Обработчик изменения
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    label.classList.add('selected');
                    if (!this.filters.genres.includes(genre.name)) {
                        this.filters.genres.push(genre.name);
                    }
                } else {
                    label.classList.remove('selected');
                    this.filters.genres = this.filters.genres.filter(g => g !== genre.name);
                }
                this.updateActiveFiltersCount();
            });
            
            genresContainer.appendChild(label);
        });
    }

    setupEventListeners() {
        // Поиск с автозаполнением
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (this.searchTimeout) clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => this.handleSearch(), 300);
                
                // Автозаполнение
                if (this.suggestionTimeout) clearTimeout(this.suggestionTimeout);
                this.suggestionTimeout = setTimeout(() => this.showSuggestions(e.target.value), 200);
            });
            
            searchInput.addEventListener('focus', () => {
                if (searchInput.value === '') {
                    this.showSearchHistory();
                }
            });
            
            searchInput.addEventListener('blur', () => {
                // Задержка для обработки кликов по подсказкам
                setTimeout(() => {
                    this.hideSuggestions();
                    this.hideSearchHistory();
                }, 200);
            });
        }
        
        // Обработчики фильтров
        ['sortBy', 'filterYear', 'filterType', 'filterStatus'].forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', (e) => {
                    const key = filterId.replace('filter', '').toLowerCase();
                    const actualKey = filterId === 'sortBy' ? 'sortBy' : key;
                    this.filters[actualKey] = e.target.value;
                    this.updateActiveFiltersCount();
                });
            }
        });
        
        // Закрытие подсказок при клике вне
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-wrapper')) {
                this.hideSuggestions();
                this.hideSearchHistory();
            }
        });
    }

    // Показ подсказок поиска
    async showSuggestions(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        try {
            const data = await this.searchAnime(query, true); // true для подсказок
            const suggestions = data.slice(0, 5); // Показываем только первые 5
            
            const suggestionsContainer = document.getElementById('searchSuggestions');
            if (!suggestionsContainer || suggestions.length === 0) {
                this.hideSuggestions();
                return;
            }
            
            suggestionsContainer.innerHTML = '';
            
            suggestions.forEach(anime => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.onclick = () => {
                    document.getElementById('searchInput').value = anime.name?.main || 'Без названия';
                    this.searchQuery = anime.name?.main || '';
                    this.hideSuggestions();
                    this.addToSearchHistory(this.searchQuery);
                    this.loadAnime();
                };
                
                const posterUrl = anime.poster?.optimized?.src || anime.poster?.src;
                const fullPosterUrl = posterUrl ? `${this.baseUrl}${posterUrl}` : '';
                
                item.innerHTML = `
                    ${fullPosterUrl ? `<img src="${fullPosterUrl}" alt="" class="suggestion-poster" loading="lazy">` : ''}
                    <div class="suggestion-info">
                        <div class="suggestion-title">${this.escapeHtml(anime.name?.main || 'Без названия')}</div>
                        <div class="suggestion-year">${anime.year || 'Год неизвестен'} • ${anime.type?.description || 'Тип неизвестен'}</div>
                    </div>
                `;
                
                suggestionsContainer.appendChild(item);
            });
            
            suggestionsContainer.style.display = 'block';
            
        } catch (error) {
            console.error('Ошибка загрузки подсказок:', error);
            this.hideSuggestions();
        }
    }

    // История поиска
    showSearchHistory() {
        if (this.searchHistory.length === 0) return;
        
        const historyContainer = document.getElementById('searchHistory');
        if (!historyContainer) return;
        
        historyContainer.innerHTML = '';
        
        this.searchHistory.slice(0, 5).forEach(query => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.onclick = () => {
                document.getElementById('searchInput').value = query;
                this.searchQuery = query;
                this.hideSearchHistory();
                this.loadAnime();
            };
            
            item.innerHTML = `
                <span class="history-icon">🕐</span>
                <span>${this.escapeHtml(query)}</span>
            `;
            
            historyContainer.appendChild(item);
        });
        
        historyContainer.style.display = 'block';
    }

    addToSearchHistory(query) {
        if (!query || query.length < 2) return;
        
        // Удаляем дубликат если есть
        this.searchHistory = this.searchHistory.filter(h => h !== query);
        // Добавляем в начало
        this.searchHistory.unshift(query);
        // Ограничиваем размер
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        localStorage.setItem('animeSearchHistory', JSON.stringify(this.searchHistory));
    }

    hideSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    hideSearchHistory() {
        const historyContainer = document.getElementById('searchHistory');
        if (historyContainer) {
            historyContainer.style.display = 'none';
        }
    }

    // Переключение панели фильтров
    toggleFilters() {
        const panel = document.getElementById('filtersPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Применение фильтров
    applyFilters() {
        this.currentPage = 1;
        this.cache.clear();
        this.loadAnime();
    }

    // Сброс фильтров
    clearFilters() {
        this.filters = {
            sortBy: 'latest',
            year: '',
            type: '',
            status: '',
            genres: []
        };
        
        // Сброс UI
        document.getElementById('sortBy').value = 'latest';
        document.getElementById('filterYear').value = '';
        document.getElementById('filterType').value = '';
        document.getElementById('filterStatus').value = '';
        
        // Сброс жанров
        document.querySelectorAll('.genre-checkbox input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            cb.parentElement.classList.remove('selected');
        });
        
        this.updateActiveFiltersCount();
        this.applyFilters();
    }

    // Обновление счетчика активных фильтров
    updateActiveFiltersCount() {
        let count = 0;
        if (this.filters.year) count++;
        if (this.filters.type) count++;
        if (this.filters.status) count++;
        if (this.filters.genres.length > 0) count++;
        if (this.filters.sortBy !== 'latest') count++;
        
        const countElement = document.getElementById('activeFiltersCount');
        if (countElement) {
            if (count > 0) {
                countElement.textContent = `Активных фильтров: ${count}`;
                countElement.style.opacity = '1';
            } else {
                countElement.textContent = '';
                countElement.style.opacity = '0.6';
            }
        }
    }

    // Основная функция загрузки аниме с фильтрацией (РАСШИРЕННАЯ)
    async loadAnime() {
        this.showLoading(true);
        this.hideError();
        
        try {
            let data;
            
            if (this.searchQuery) {
                data = await this.searchAnime(this.searchQuery);
            } else {
                const limit = this.perPage;
                const offset = (this.currentPage - 1) * this.perPage;
                const cacheKey = `latest_${this.currentPage}_${this.perPage}_${JSON.stringify(this.filters)}`;
                
                if (this.cache.has(cacheKey)) {
                    data = this.cache.get(cacheKey);
                } else {
                    const response = await fetch(`${this.apiUrl}/anime/releases/latest?limit=${limit}&offset=${offset}`, {
                        mode: 'cors',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    
                    data = await response.json();
                    this.cache.set(cacheKey, data);
                }
            }
            
            // Применяем фильтры к полученным данным
            const filteredData = this.applyLocalFilters(data);
            
            this.renderAnime(filteredData);
            this.updatePagination();
            
        } catch (error) {
            console.error('Ошибка загрузки аниме:', error);
            this.showError(`Ошибка загрузки: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    // Применение локальных фильтров
    applyLocalFilters(animeList) {
        let filtered = [...animeList];
        
        // Фильтр по году
        if (this.filters.year) {
            filtered = filtered.filter(anime => anime.year == this.filters.year);
        }
        
        // Фильтр по типу
        if (this.filters.type) {
            filtered = filtered.filter(anime => 
                anime.type?.value === this.filters.type || 
                anime.type?.description === this.filters.type
            );
        }
        
        // Фильтр по статусу
        if (this.filters.status) {
            if (this.filters.status === 'ongoing') {
                filtered = filtered.filter(anime => anime.is_ongoing === true);
            } else if (this.filters.status === 'completed') {
                filtered = filtered.filter(anime => anime.is_ongoing === false);
            }
        }
        
        // Фильтр по жанрам
        if (this.filters.genres.length > 0) {
            filtered = filtered.filter(anime => {
                if (!anime.genres) return false;
                return this.filters.genres.some(filterGenre => 
                    anime.genres.some(animeGenre => animeGenre.name === filterGenre)
                );
            });
        }
        
        // Сортировка
        filtered = this.applySorting(filtered);
        
        return filtered;
    }

    // Применение сортировки
    applySorting(animeList) {
        const sorted = [...animeList];
        
        switch (this.filters.sortBy) {
            case 'popular':
                return sorted.sort((a, b) => {
                    const aPopularity = (a.added_in_users_favorites || 0) + 
                                       (a.added_in_watched_collection || 0) + 
                                       (a.added_in_watching_collection || 0);
                    const bPopularity = (b.added_in_users_favorites || 0) + 
                                       (b.added_in_watched_collection || 0) + 
                                       (b.added_in_watching_collection || 0);
                    return bPopularity - aPopularity;
                });
                
            case 'rating':
                return sorted.sort((a, b) => {
                    // Если есть рейтинг, сортируем по нему, иначе используем популярность
                    const aRating = a.rating || 0;
                    const bRating = b.rating || 0;
                    return bRating - aRating;
                });
                
            case 'alphabetical':
                return sorted.sort((a, b) => {
                    const aName = (a.name?.main || '').toLowerCase();
                    const bName = (b.name?.main || '').toLowerCase();
                    return aName.localeCompare(bName, 'ru');
                });
                
            case 'year':
                return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
                
            case 'latest':
            default:
                // Уже отсортировано по умолчанию от API
                return sorted;
        }
    }

    // Поиск аниме (обновленный)
    async searchAnime(query, forSuggestions = false) {
        const cacheKey = `search_${query}_${forSuggestions}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const response = await fetch(`${this.apiUrl}/app/search/releases?search=${encodeURIComponent(query)}`, {
            mode: 'cors',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        this.cache.set(cacheKey, data);
        return data;
    }

    // Рендеринг карточек аниме (ИСПРАВЛЕНО: обязательная очистка контейнера)
    renderAnime(animeList) {
        const container = document.getElementById('anime-container');
        if (!container) return;
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Очистка контейнера перед рендерингом
        container.innerHTML = '';
        
        if (!animeList || animeList.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>Аниме не найдено</h3>
                    <p>Попробуйте изменить поисковый запрос или очистить фильтры.</p>
                </div>
            `;
            return;
        }

        // ИСПРАВЛЕНО: Эффективное создание элементов вместо innerHTML +=
        animeList.forEach(anime => {
            const card = this.createAnimeCard(anime);
            container.appendChild(card);
        });

        // Добавляем обработчики событий после рендера
        this.attachCardEventListeners();
    }

    // Создание карточки аниме (УЛУЧШЕНО: защита от XSS)
    createAnimeCard(anime) {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.dataset.id = anime.id;
        
        const posterUrl = anime.poster?.optimized?.src || anime.poster?.src;
        const fullPosterUrl = posterUrl ? `${this.baseUrl}${posterUrl}` : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" fill="%23ddd"><rect width="100%" height="100%"/><text x="50%" y="50%" text-anchor="middle" dy=".3em">Нет изображения</text></svg>';
        
        // ИСПРАВЛЕНО: Защита от XSS через textContent
        const title = anime.name?.main || 'Без названия';
        const year = anime.year || 'Неизвестно';
        const type = anime.type?.description || anime.type?.value || '';
        const status = anime.is_ongoing ? 'Онгоинг' : 'Завершён';
        const episodesTotal = anime.episodes_total || 'Неизвестно';
        
        // Жанры
        const genresHtml = anime.genres && anime.genres.length > 0 
            ? anime.genres.slice(0, 3).map(genre => `<span class="genre-tag">${this.escapeHtml(genre.name)}</span>`).join('')
            : '<span class="genre-tag">Без жанра</span>';

        card.innerHTML = `
            <div class="card-image">
                <img src="${fullPosterUrl}" alt="${this.escapeHtml(title)}" loading="lazy" 
                     onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"200\\" height=\\"300\\" fill=\\"%23ddd\\"><rect width=\\"100%\\" height=\\"100%\\"/><text x=\\"50%\\" y=\\"50%\\" text-anchor=\\"middle\\" dy=\\".3em\\">Нет изображения</text></svg>'">
                <div class="card-overlay">
                    <div class="card-status ${anime.is_ongoing ? 'ongoing' : 'completed'}">${status}</div>
                </div>
            </div>
            <div class="card-content">
                <h3 class="card-title" title="${this.escapeHtml(title)}">${this.escapeHtml(title)}</h3>
                <div class="card-meta">
                    <span class="card-year">${year}</span>
                    ${type ? `<span class="card-type">${this.escapeHtml(type)}</span>` : ''}
                </div>
                <div class="card-genres">
                    ${genresHtml}
                </div>
                <div class="card-episodes">
                    Эпизодов: ${episodesTotal}
                </div>
            </div>
        `;

        return card;
    }

    // ДОБАВЛЕНО: Защита от XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Добавление обработчиков кликов на карточки
    attachCardEventListeners() {
        document.querySelectorAll('.anime-card').forEach(card => {
            card.addEventListener('click', () => {
                const animeId = card.dataset.id;
                if (animeId) {
                    window.location.href = `anime-details.html?id=${animeId}`;
                }
            });
        });
    }

    // Обработка изменения количества элементов на странице
    updatePerPage(value) {
        this.perPage = parseInt(value);
        this.currentPage = 1;
        // ИСПРАВЛЕНО: Очистка кэша при изменении параметров
        this.cache.clear();
        this.loadAnime();
    }

    // Обработка изменения страницы (УЛУЧШЕНО)
    changePage(direction) {
        const newPage = this.currentPage + direction;
        if (newPage >= 1) {
            this.currentPage = newPage;
            this.loadAnime();
        }
    }

    // Обновление пагинации (ИСПРАВЛЕНО)
    updatePagination() {
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');
        const pageInfo = document.getElementById('currentPageInfo');

        if (prevButton) {
            prevButton.disabled = this.currentPage <= 1;
        }

        if (pageInfo) {
            pageInfo.textContent = `Страница ${this.currentPage}`;
        }

        // Для поиска отключаем пагинацию
        if (this.searchQuery) {
            if (nextButton) nextButton.style.display = 'none';
            if (prevButton) prevButton.style.display = 'none';
        } else {
            if (nextButton) nextButton.style.display = 'block';
            if (prevButton) prevButton.style.display = 'block';
        }
    }

    // Обработка поиска (УЛУЧШЕНО: с историей и автозаполнением)
    async handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const newQuery = searchInput.value.trim();
            
            // Если запрос изменился
            if (this.searchQuery !== newQuery) {
                this.searchQuery = newQuery;
                this.currentPage = 1;
                
                // Добавляем в историю только если есть результаты
                if (newQuery.length >= 2) {
                    this.addToSearchHistory(newQuery);
                }
                
                try {
                    await this.loadAnime();
                } catch (error) {
                    console.error('Ошибка поиска:', error);
                    this.showError(`Ошибка поиска: ${error.message}`);
                }
            }
        }
    }

    // Очистка поиска
    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            this.searchQuery = '';
            this.currentPage = 1;
            this.hideSuggestions();
            this.hideSearchHistory();
            this.loadAnime();
        }
    }
}

// Глобальные функции для HTML (РАСШИРЕННЫЕ)
let catalog = null;

function updatePerPage(value) {
    if (catalog) catalog.updatePerPage(value);
}

function changePage(direction) {
    if (catalog) catalog.changePage(direction);
}

function handleSearch() {
    if (catalog) catalog.handleSearch();
}

function clearSearch() {
    if (catalog) catalog.clearSearch();
}

function loadAnime() {
    if (catalog) catalog.loadAnime();
}

function toggleFilters() {
    if (catalog) catalog.toggleFilters();
}

function applyFilters() {
    if (catalog) catalog.applyFilters();
}

function clearFilters() {
    if (catalog) catalog.clearFilters();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    catalog = new AniCatalog();
});