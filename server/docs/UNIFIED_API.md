# Unified Anime API Documentation

## Overview

The Unified Anime API provides a standardized interface for accessing anime data from multiple sources (AniList, AniLibria, AniLiberty) through a consistent data model. This API enables seamless integration and data aggregation while maintaining source-specific metadata.

## Data Model

### UnifiedAnime Schema

The `UnifiedAnime` model serves as the central data structure that normalizes anime information from different sources.

#### Core Fields

- **id**: Unique identifier (MongoDB ObjectId)
- **source**: Data source ('anilist', 'anilibria', 'aniliberty')
- **names**: Object containing localized names
  - `ru`: Russian name
  - `en`: English name
  - `alternative`: Alternative name
- **description**: Anime description
- **type**: Anime type information
  - `string`: Type string (TV, Movie, etc.)
  - `episodes`: Number of episodes
- **status**: Current status
  - `string`: Status string
- **genres**: Array of genre names
- **year**: Release year
- **season**: Season information
  - `string`: Season name
- **posters**: Poster images in different sizes
  - `small`: Small thumbnail
  - `medium`: Medium-sized image
  - `original`: Full-size image
- **player**: Player information (for AniLibria)
  - `episodes`: Episode information
  - `list`: Episode list
- **popularity**: Popularity score
- **updatedAt**: Last update timestamp
- **createdAt**: Creation timestamp

#### Source-Specific Fields

- **anilist**: AniList-specific data
- **anilibria**: AniLibria-specific data
- **aniliberty**: AniLiberty-specific data

#### Virtual Fields

- **title**: Default title (prioritizes Russian, then English)
- **posterUrl**: Default poster URL (medium size)

## API Endpoints

### Search Endpoints

#### Unified Search
```
GET /api/anime/search
```
Search across all data sources with deduplication.

**Query Parameters:**
- `query`: Search string (required)
- `limit`: Maximum results (default: 20)
- `page`: Page number (default: 1)
- `source`: Filter by source (optional: 'anilist', 'anilibria', 'aniliberty')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "64f8b3c8e1d4f8a3b8c8d4f1",
      "source": "anilist",
      "title": "Attack on Titan",
      "description": "Humanity fights for survival...",
      "genres": ["Action", "Drama"],
      "type": { "string": "TV", "episodes": 75 },
      "status": { "string": "Finished" },
      "year": 2013,
      "season": { "string": "Spring" },
      "posters": {
        "medium": { "url": "https://example.com/poster.jpg" }
      },
      "popularity": 95,
      "updatedAt": "2023-09-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### Source-Specific Endpoints

#### AniList
```
GET /api/anilist/popular
GET /api/anilist/trending
GET /api/anilist/search
GET /api/anilist/:id
```

#### AniLibria
```
GET /api/anilibria/popular
GET /api/anilibria/updates
GET /api/anilibria/search
GET /api/anilibria/:id
GET /api/anilibria/random
GET /api/anilibria/genres
GET /api/anilibria/schedule
GET /api/anilibria/youtube
```

#### AniLiberty
```
GET /api/aniliberty/popular
GET /api/aniliberty/updates
GET /api/aniliberty/search
GET /api/aniliberty/:id
GET /api/aniliberty/random
GET /api/aniliberty/genres
GET /api/aniliberty/schedule
GET /api/aniliberty/youtube
```

## Data Conversion Service

The Data Conversion Service (`DataConversionService`) provides methods for converting data from different sources into the unified format.

### Methods

#### convertToUnifiedFormat
Converts data from any source to the unified format.

```javascript
const unifiedData = await DataConversionService.convertToUnifiedFormat({
  data: sourceData,
  source: 'anilist' // or 'anilibria', 'aniliberty'
});
```

#### searchAcrossSources
Searches across all sources with deduplication.

```javascript
const results = await DataConversionService.searchAcrossSources(query, {
  limit: 20,
  sources: ['anilist', 'anilibria', 'aniliberty']
});
```

#### getAndConvertAnilist
Fetches and converts data from AniList.

```javascript
const data = await DataConversionService.getAndConvertAnilist({
  page: 1,
  perPage: 20
});
```

#### getAndConvertAnilibria
Fetches and converts data from AniLibria.

```javascript
const data = await DataConversionService.getAndConvertAnilibria({
  items_per_page: 20,
  page: 1
});
```

#### getAndConvertAniliberty
Fetches and converts data from AniLiberty.

```javascript
const data = await DataConversionService.getAndConvertAniliberty({
  limit: 20,
  page: 1
});
```

## Caching Strategy

The API implements a cache-first approach:

1. **Local Cache**: First checks the UnifiedAnime collection for cached data
2. **API Fallback**: If no cached data is found, fetches from the source API
3. **Cache Update**: New data is saved to the UnifiedAnime collection for future requests

### Cache Fields

- **source**: Identifies the data source
- **updatedAt**: Timestamp of last update
- **popularity**: Popularity score for sorting

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": "Additional error information"
  }
}
```

Common HTTP status codes:
- `200 OK`: Successful request
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

API endpoints are subject to rate limiting to ensure fair usage. Rate limits vary by endpoint and source.

## Data Freshness

Data is refreshed based on source update schedules:
- **AniList**: Updated daily
- **AniLibria**: Updated multiple times per day
- **AniLiberty**: Updated daily

## Examples

### Getting Popular Anime

```javascript
// Request popular anime from all sources
const response = await fetch('/api/anime/popular');
const data = await response.json();

// Filter by source
const anilistPopular = data.data.filter(item => item.source === 'anilist');
```

### Searching Anime

```javascript
// Search across all sources
const response = await fetch('/api/anime/search?query=attack+on+titan');
const data = await response.json();

// Search specific source
const response = await fetch('/api/anilist/search?query=attack+on+titan');
```

### Getting Anime by ID

```javascript
// Get anime by ID from specific source
const response = await fetch('/api/anilist/21'); // AniList ID
const data = await response.json();

// Get anime by unified ID
const response = await fetch('/api/anime/64f8b3c8e1d4f8a3b8c8d4f1');
const data = await response.json();
```

## Integration Guide

### Using the Unified Model in Controllers

```javascript
const UnifiedAnime = require('../models/UnifiedAnime');
const DataConversionService = require('../services/dataConversionService');

// Check cache first
const cachedAnime = await UnifiedAnime.findOne({
  source: 'anilist',
  'anilist.id': animeId
});

if (cachedAnime) {
  return res.json({ success: true, data: cachedAnime, source: 'cache' });
}

// Fallback to API
const data = await DataConversionService.getAndConvertAnilist({ id: animeId });
return res.json({ success: true, data, source: 'api' });
```

### Using the Data Conversion Service

```javascript
const DataConversionService = require('../services/dataConversionService');

// Search across all sources
const results = await DataConversionService.searchAcrossSources(query, {
  limit: 20,
  sources: ['anilist', 'anilibria', 'aniliberty']
});

// Convert source data to unified format
const unifiedData = await DataConversionService.convertToUnifiedFormat({
  data: sourceData,
  source: 'anilist'
});
```

## Performance Considerations

- **Indexing**: The UnifiedAnime model is indexed on frequently queried fields
- **Pagination**: Use pagination for large result sets
- **Caching**: Leverage the cache-first approach to reduce API calls
- **Field Selection**: Request only needed fields to minimize data transfer

## Future Enhancements

- Support for additional anime data sources
- Advanced filtering and sorting options
- Real-time updates for anime status changes
- Recommendation engine based on unified data
- User preferences and watch history integration