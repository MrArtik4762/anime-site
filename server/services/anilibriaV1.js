const axios = require('axios');
const LRU = require('lru-cache');

const V1 = process.env.ANILIBRIA_V1_BASE || 'https://anilibria.top/api/v1';
const V3 = process.env.ANILIBRIA_V3_BASE || 'https://api.anilibria.tv/v3';

const cache = new LRU({
  ttl: 1000 * 60 * 2,
  max: 1000,
});

function cacheKey(url, params) {
  return `${url}?${Object.entries(params || {})
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
}

async function getJson(url, params = {}, { useV3 = false } = {}) {
  const base = useV3 ? V3 : V1;
  const key = cacheKey(base + url, params);
  const cached = cache.get(key);
  if (cached) return cached;
  try {
    const { data } = await axios.get(base + url, { params, timeout: 15000 });
    cache.set(key, data);
    return data;
  } catch (e) {
    if (!useV3) {
      return getJson(url.replace(/^\/title/, '/title'), params, { useV3: true });
    }
    throw e;
  }
}

function normalizeTitleV1(t) {
  return {
    id: t?.id ?? t?.data?.id,
    code: t?.code || t?.data?.code,
    names: {
      ru: t?.names?.ru || t?.data?.names?.ru || t?.names?.ru_title,
      en: t?.names?.en || t?.data?.names?.en,
      alt: t?.names?.alternative ?? [],
    },
    description: t?.description || t?.data?.description,
    genres: t?.genres || t?.data?.genres || [],
    season: t?.season?.string || t?.data?.season?.string,
    year: t?.season?.year || t?.data?.season?.year,
    posters: t?.posters || t?.data?.posters || {},
    type: t?.type || t?.data?.type,
    status: t?.status || t?.data?.status,
    episodes: t?.player?.episodes?.last || t?.player?.episodes?.count || 0,
    rating: t?.rating?.mpaa || null,
  };
}

async function searchTitles({ query = '', limit = 20, page = 1, sort = 'updated' } = {}) {
  const params = {
    search: query,
    page, limit,
    sort,
  };
  const data = await getJson('/title/search', params);
  const list = (data?.list || data?.data || []).map(normalizeTitleV1);
  return { list, pagination: data?.pagination || { page, limit } };
}

async function getCatalog({ limit = 24, page = 1, genres = [], year, season, order = 'updated' } = {}) {
  const params = { limit, page, genres: genres.join(','), year, season, sort: order };
  const data = await getJson('/title/catalog', params);
  const list = (data?.list || data?.data || []).map(normalizeTitleV1);
  return { list, pagination: data?.pagination || { page, limit } };
}

async function getTitleById(id) {
  const data = await getJson('/title', { id });
  return normalizeTitleV1(data);
}

module.exports = {
  searchTitles,
  getCatalog,
  getTitleById,
};