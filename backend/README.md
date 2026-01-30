# SeeFood API

Flask API for hot dog image classification with Redis caching.

## Endpoints

### POST `/predict`

Classify an image as hot dog or not.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` file (png, jpg, jpeg, gif, webp)

**Response:**
```json
{
  "is_hotdog": true,
  "label": "hotdog",
  "confidence": 0.9901,
  "cached": false
}
```

### GET `/stats`

View prediction statistics (requires Redis).

**Response:**
```json
{
  "total_predictions": 42,
  "hotdogs": 15,
  "not_hotdogs": 27,
  "cache_hits": 8
}
```

### GET `/`

API info.

## Features

| Feature | Description |
|---------|-------------|
| **Caching** | Predictions cached by image hash (24hr TTL) |
| **Rate Limiting** | 100 requests/hour per IP |
| **Stats** | Tracks total predictions, hotdogs, cache hits |

## Run Locally

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Server runs at `http://localhost:8000`

## Redis (Optional)

The API works without Redis but caching/stats require it.

```bash
# Install
brew install redis

# Start
brew services start redis
```

Set custom Redis URL via environment variable:
```bash
export REDIS_URL=redis://localhost:6379
```

## Test

```bash
# Predict
curl -X POST -F "image=@path/to/image.jpg" http://localhost:8000/predict

# Stats
curl http://localhost:8000/stats
```
