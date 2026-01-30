"""
Seefood Flask API's

Endpoints:
    POST /predict - Classify an image
    GET /stats - View prediction statistics
"""

import os
import hashlib
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import redis
from predictor import get_predictor

app = Flask(__name__)
CORS(app)

# Config
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB (max file size)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

# Redis connection
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
try:
    r = redis.from_url(REDIS_URL, decode_responses=True)
    r.ping()
    REDIS_AVAILABLE = True
    print(f"Redis connected: {REDIS_URL}")
except redis.ConnectionError:
    r = None
    REDIS_AVAILABLE = False
    print("Redis not available, running without caching")

# Rate limiting (uses Redis if available, otherwise in-memory)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    storage_uri=REDIS_URL if REDIS_AVAILABLE else "memory://",
    default_limits=["200 per day", "50 per hour"],
    headers_enabled=True
)


def allowed_file(filename):
    """Check if file extension is allowed."""
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_image_hash(image_bytes):
    """Generate MD5 hash of image for caching."""
    return hashlib.md5(image_bytes).hexdigest()


def get_cached_prediction(image_hash):
    """Get prediction from cache."""
    if not REDIS_AVAILABLE:
        return None
    cached = r.get(f"prediction:{image_hash}")
    if cached:
        r.incr("stats:cache_hits")
        return json.loads(cached)
    return None


def cache_prediction(image_hash, result):
    """Cache prediction result for 24 hours."""
    if not REDIS_AVAILABLE:
        return
    r.setex(f"prediction:{image_hash}", 86400, json.dumps(result))


def update_stats(is_hotdog):
    """Update prediction statistics."""
    if not REDIS_AVAILABLE:
        return
    r.incr("stats:total_predictions")
    if is_hotdog:
        r.incr("stats:hotdog_count")
    else:
        r.incr("stats:not_hotdog_count")


@app.route("/predict", methods=["POST"])
@limiter.limit("100 per hour")
def predict():
    """Classify an uploaded image.

    Required: multipart/form-data with 'image' file
    Returns: JSON with prediction results
    """
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 400

    try:
        # Read image bytes for hashing
        image_bytes = file.read()
        image_hash = get_image_hash(image_bytes)

        # Check cache first
        cached_result = get_cached_prediction(image_hash)
        if cached_result:
            cached_result["cached"] = True
            return jsonify(cached_result)

        # Reset file pointer for prediction
        file.seek(0)

        # Run prediction
        predictor = get_predictor()
        result = predictor.predict(file)

        # Cache result and update stats
        cache_prediction(image_hash, result)
        update_stats(result["is_hotdog"])

        result["cached"] = False
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/stats", methods=["GET"])
def stats():
    """Get prediction statistics."""
    if not REDIS_AVAILABLE:
        return jsonify({"error": "Redis not available"}), 503

    return jsonify({
        "total_predictions": int(r.get("stats:total_predictions") or 0),
        "hotdogs": int(r.get("stats:hotdog_count") or 0),
        "not_hotdogs": int(r.get("stats:not_hotdog_count") or 0),
        "cache_hits": int(r.get("stats:cache_hits") or 0),
    })


@app.route("/", methods=["GET"])
def index():
    """Root endpoint"""
    return jsonify({
        "name": "SeeFood API",
        "description": "Hot Dog or Not Hot Dog classifier",
        "redis": REDIS_AVAILABLE,
        "endpoints": {
            "POST /predict": "Classify an image",
            "GET /stats": "View prediction statistics"
        }
    })


if __name__ == "__main__":
    print("Loading model...")
    get_predictor()
    print("Starting server...")

    app.run(host="0.0.0.0", port=8000, debug=True)
