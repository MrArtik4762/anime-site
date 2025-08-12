// Модуль детальной страницы аниме (ИСПРАВЛЕННАЯ ВЕРСИЯ)
class AnimeDetails {
    constructor() {
        this.baseUrl = 'https://aniliberty.top';
        this.apiUrl = 'https://aniliberty.top/api/v1';
        this.animeId = this.getAnimeIdFromUrl();
        this.cache = new Map();
        
        this.init();
    }

    init() {
        if (this.animeId) {
            this.loadAnimeDetails();
        } else {
            this.showError('ID аниме не указан в URL');
        }
    }

    // Получение ID аниме из URL параметра
    getAnimeIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Загрузка деталей аниме (КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: правильный URL)
    async loadAnimeDetails() {
        this.showLoading(true);
        this.hideError();
        
        try {
            const cacheKey = `anime_${this.animeId}`;
            let anime;
            
            if (this.cache.has(cacheKey)) {
                anime = this.cache.get(cacheKey);
            } else {
                // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Правильный эндпоинт и CORS заголовки
                const response = await fetch(`${this.apiUrl}/anime/releases/${this.animeId}?include=episodes`, {
                    mode: 'cors',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                anime = await response.json();
                this.cache.set(cacheKey, anime);
            }
            
            this.renderAnimeDetails(anime);
            
            // Загружаем эпизоды отдельно если они не включены в основной ответ
            if (anime.episodes && anime.episodes.length > 0) {
                this.renderEpisodes(anime.episodes);
            } else {
                await this.loadEpisodes(this.animeId);
            }
            
        } catch (error) {
            console.error('Ошибка загрузки деталей аниме:', error);
            this.showError(`Не удалось загрузить информацию об аниме: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    // Загрузка эпизодов (ИСПРАВЛЕНО: добавлены CORS заголовки)
    async loadEpisodes(animeId) {
        try {
            const cacheKey = `episodes_${animeId}`;
            let episodesData;
            
            if (this.cache.has(cacheKey)) {
                episodesData = this.cache.get(cacheKey);
            } else {
                const response = await fetch(`${this.apiUrl}/anime/releases/${animeId}?include=episodes`, {
                    mode: 'cors',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                if (!response.ok) return;
                
                episodesData = await response.json();
                this.cache.set(cacheKey, episodesData);
            }
            
            if (episodesData.episodes && episodesData.episodes.length > 0) {
                this.renderEpisodes(episodesData.episodes);
            }
            
        } catch (error) {
            console.error('Ошибка загрузки эпизодов:', error);
            // Не показываем ошибку для эпизодов, т.к. это не критично
        }
    }

    // Рендеринг деталей аниме (ИСПРАВЛЕНО: защита от XSS)
    renderAnimeDetails(anime) {
        const detailsContainer = document.getElementById('animeDetails');
        if (!detailsContainer) return;

        // Обновляем заголовок страницы (ИСПРАВЛЕНО: защита от XSS)
        const title = anime.name?.main || 'Аниме';
        document.title = `${this.escapeHtml(title)} - AniCatalog`;

        // Постер
        const posterElement = document.getElementById('anime-poster');
        if (posterElement) {
            const posterUrl = anime.poster?.optimized?.src || anime.poster?.src;
            if (posterUrl) {
                posterElement.src = `${this.baseUrl}${posterUrl}`;
                posterElement.alt = title;
            } else {
                posterElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" fill="%23ddd"><rect width="100%" height="100%"/><text x="50%" y="50%" text-anchor="middle" dy=".3em">Нет изображения</text></svg>';
            }
        }

        // ИСПРАВЛЕНО: Безопасное обновление текстового контента
        this.updateTextContent('anime-title', title);
        this.updateTextContent('anime-year', anime.year || 'Неизвестно');
        this.updateTextContent('anime-type', anime.type?.description || anime.type?.value || 'Неизвестно');
        this.updateTextContent('anime-status', anime.is_ongoing ? 'Онгоинг' : 'Завершён');
        this.updateTextContent('anime-episodes-total', anime.episodes_total || 'Неизвестно');
        this.updateTextContent('anime-age-rating', anime.age_rating?.label || 'Не указано');
        this.updateTextContent('anime-season', anime.season?.description || 'Неизвестно');

        // Жанры (ИСПРАВЛЕНО: защита от XSS)
        const genresContainer = document.getElementById('anime-genres');
        if (genresContainer) {
            genresContainer.innerHTML = ''; // Очищаем контейнер
            if (anime.genres && anime.genres.length > 0) {
                anime.genres.forEach(genre => {
                    const span = document.createElement('span');
                    span.className = 'genre-badge';
                    span.textContent = genre.name;
                    genresContainer.appendChild(span);
                });
            } else {
                const span = document.createElement('span');
                span.className = 'genre-badge';
                span.textContent = 'Без жанра';
                genresContainer.appendChild(span);
            }
        }

        // Описание (ИСПРАВЛЕНО: безопасная обработка HTML)
        const descriptionElement = document.getElementById('anime-description-text');
        if (descriptionElement) {
            const description = anime.description || 'Описание отсутствует.';
            // Очищаем и безопасно вставляем описание
            descriptionElement.innerHTML = '';
            const p = document.createElement('p');
            p.textContent = description;
            // Заменяем переносы строк на <br>
            p.innerHTML = p.innerHTML.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
            descriptionElement.appendChild(p);
        }

        // Статистика
        this.updateTextContent('anime-favorites', this.formatNumber(anime.added_in_users_favorites || 0));
        this.updateTextContent('anime-watched', this.formatNumber(anime.added_in_watched_collection || 0));
        this.updateTextContent('anime-watching', this.formatNumber(anime.added_in_watching_collection || 0));
        this.updateTextContent('anime-planned', this.formatNumber(anime.added_in_planned_collection || 0));

        // Показываем детали
        detailsContainer.style.display = 'block';
    }

    // Рендеринг эпизодов (ИСПРАВЛЕНО)
    renderEpisodes(episodes) {
        const episodesSection = document.getElementById('anime-episodes-section');
        const episodesList = document.getElementById('anime-episodes-list');
        
        if (!episodesList || !episodes || episodes.length === 0) return;

        // ИСПРАВЛЕНО: Очищаем контейнер перед рендерингом
        episodesList.innerHTML = '';

        episodes.forEach(episode => {
            const episodeCard = document.createElement('div');
            episodeCard.className = 'episode-card';
            
            const previewUrl = episode.preview?.optimized?.src || episode.preview?.src;
            const fullPreviewUrl = previewUrl ? `${this.baseUrl}${previewUrl}` : '';
            
            const duration = episode.duration ? this.formatDuration(episode.duration) : 'Неизвестно';
            const episodeTitle = episode.name ? `${this.escapeHtml(episode.name)}` : '';
            
            episodeCard.innerHTML = `
                <div class="episode-preview">
                    ${fullPreviewUrl ? 
                        `<img src="${fullPreviewUrl}" alt="Превью эпизода ${episode.ordinal}" loading="lazy">` :
                        '<div class="no-preview">Нет превью</div>'
                    }
                </div>
                <div class="episode-info">
                    <h4 class="episode-title">
                        Эпизод ${episode.ordinal}${episodeTitle ? `: ${episodeTitle}` : ''}
                    </h4>
                    <div class="episode-meta">
                        <span class="episode-duration">Длительность: ${duration}</span>
                        ${episode.hls_720 ? '<span class="episode-available">Доступен для просмотра</span>' : ''}
                    </div>
                    ${episode.opening && episode.ending ? `
                        <div class="episode-timing">
                            <span>Опенинг: ${this.formatTime(episode.opening.start)}-${this.formatTime(episode.opening.stop)}</span>
                            <span>Эндинг: ${this.formatTime(episode.ending.start)}-${this.formatTime(episode.ending.stop)}</span>
                        </div>
                    ` : ''}
                </div>
            `;
            
            episodesList.appendChild(episodeCard);
        });

        episodesSection.style.display = 'block';
    }

    // ДОБАВЛЕНО: Защита от XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Вспомогательные функции (ИСПРАВЛЕНО: безопасное обновление)
    updateTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text.toString();
        }
    }

    formatNumber(num) {
        return new Intl.NumberFormat('ru-RU').format(num);
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    // Управление состояниями UI (УЛУЧШЕНО)
    showLoading(show) {
        const indicator = document.getElementById('loadingIndicator');
        const detailsContainer = document.getElementById('animeDetails');
        
        if (indicator) {
            indicator.style.display = show ? 'flex' : 'none';
        }
        
        if (detailsContainer) {
            detailsContainer.style.opacity = show ? '0.3' : '1';
        }
    }

    showError(message = 'Произошла ошибка') {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            const errorText = errorElement.querySelector('p');
            if (errorText) {
                errorText.textContent = message;
            }
            errorElement.style.display = 'block';
        }
        
        // Скрываем индикатор загрузки
        this.showLoading(false);
    }

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}

// Глобальная функция для перезагрузки
function loadAnimeDetails() {
    if (window.animeDetails) {
        window.animeDetails.loadAnimeDetails();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.animeDetails = new AnimeDetails();
});