// client/src/services/animeApi.js
import { httpGet } from './http';

export const fetchPopular = (limit = 12) =>
  httpGet(`/api/anime/popular?limit=${limit}`);

export const fetchNewEpisodes = (limit = 12) =>
  httpGet(`/api/anime/new-episodes?limit=${limit}`);

export const fetchCatalog = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return httpGet(`/api/anime/catalog?${qs}`);
};