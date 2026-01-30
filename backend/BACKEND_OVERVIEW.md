# SeeFood API

Flask API 

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
  "confidence": 0.9901
}
```

### GET `/`

API info.

## Run Locally

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Server runs at `http://localhost:8000`

## Test

```bash
curl -X POST -F "image=@path/to/image.jpg" http://localhost:8000/predict
```
