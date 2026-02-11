---
title: SeeFood
sdk: docker
app_port: 8000
---

# SeeFood

**The Shazam for Food** - A mobile app that classifies images as "hot dog" or "not hot dog" using deep learning.

Inspired by the Silicon Valley TV show, this project demonstrates an end-to-end ML pipeline: from training models on a Kaggle dataset, serving predictions via a Flask API, to consuming them through a React Native mobile app.

## Project Structure

```
_seefood/
├── backend/          # Flask API server with Redis caching
├── mobile/           # React Native/Expo mobile app
├── training/         # ML model training pipeline
└── data/             # Dataset (train/test splits)
```

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| **Backend** | Flask, TensorFlow/Keras, Redis, Gunicorn |
| **Mobile** | React Native, Expo, TypeScript, React Navigation |
| **ML Training** | TensorFlow, ResNet50, MobileNetV3 |

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Optional: Start Redis for caching
brew install redis && brew services start redis

# Run the server
python app.py
```

Server runs at `http://localhost:8000`

### Mobile

```bash
cd mobile
npm install
npm start
```

Set the API URL via environment variable:

```bash
cp .env.example .env
# set EXPO_PUBLIC_API_URL in mobile/.env
```

`EXPO_PUBLIC_API_URL` should point to your backend server (local or hosted).

## API Endpoints

### POST `/predict`

Classify an image as hot dog or not.

**Request:** `multipart/form-data` with image file (png, jpg, jpeg, gif, webp)

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

Get prediction statistics (requires Redis).

```json
{
  "total_predictions": 42,
  "hotdogs": 15,
  "not_hotdogs": 27,
  "cache_hits": 8
}
```

### GET `/`

Health check and API info.

## Model Performance

| Model | Accuracy | Precision | Recall | Size (TFLite) |
|-------|----------|-----------|--------|---------------|
| **ResNet50** | 94.5% | 95.8% | 93.1% | 24 MB |
| MobileNetV3 | 91.8% | - | 85.4% | 1.1 MB |

The ResNet50 model is used in production. Training was performed on the [Hot Dog Not Hot Dog](https://www.kaggle.com/datasets/yashvrdnjain/hotdognothotdog) Kaggle dataset with 2,400 training images.

## Training

```bash
cd training
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Download dataset (requires Kaggle API credentials in .env)
python extract_data.py

# Train model
python train/train_resenet50.py
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
DATA_PATH=/path/to/data
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_api_key
```

### Backend

- `REDIS_URL`: Redis connection string (default: `redis://localhost:6379`)
- Max upload size: 16 MB
- Rate limit: 100 requests/hour per IP

### Mobile

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to match your backend server address.

## Free Hosting (Hugging Face Spaces)

You can host the backend for free on Hugging Face Spaces (CPU Basic).

### Steps

1. Create a new Space (Docker type).
2. Point it at this repo.
3. Set the Space to run the included `Dockerfile` at the repo root.
4. The Space URL will look like `https://YOUR-SPACE-NAME.hf.space`.
5. Use that URL as `EXPO_PUBLIC_API_URL`.

Notes:
- Free Spaces can sleep when idle (cold start delay).
- Disk is non-persistent on free tier, so Redis stats/caching won't persist.

## Features

- Real-time camera capture with pinch-to-zoom
- Gallery image selection
- Prediction caching (24-hour TTL)
- Rate limiting for API protection
- Animated loading states
- Confidence score display

## License

MIT
