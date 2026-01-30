"""
Seefood Flask API's

Endpoints:
    POST /predict - Classify an image
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from predictor import get_predictor

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

# Config
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB (max file size)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def allowed_file(filename):
    """Check if file extension is allowed."""
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/predict", methods=["POST"])
def predict():
    """Classify an uploaded image.

    Required: multipart/form-data with 'image' file
    Returns: JSON with prediction results
    """
    # Check if image was uploaded
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]

    # Check if file was selected
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    # Validate file type
    if not allowed_file(file.filename):
        return jsonify({
            "error": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 400

    try:
        # Get predictor and run inference
        predictor = get_predictor()
        result = predictor.predict(file)

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def index():
    """Root endpoint with API info."""
    return jsonify({
        "name": "SeeFood API",
        "description": "Hot Dog or Not Hot Dog classifier",
        "endpoints": {
            "POST /predict": "Classify an image (multipart/form-data with 'image' field)"
        }
    })


if __name__ == "__main__":
    print("Loading model...")
    get_predictor()
    print("Starting server...")

    app.run(host="0.0.0.0", port=8000, debug=True)
