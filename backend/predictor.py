"""
Predictor - Loads model and runs inference.
"""

import os
from pathlib import Path
import numpy as np
from PIL import Image, ImageOps
import tensorflow as tf


class HotDogPredictor:
    """Handles model loading and image classification."""

    def __init__(self, model_path=None):
        """Initialize predictor with model."""
        if model_path is None:
            model_dir = Path(__file__).parent / "model"
            model_path = model_dir / "hotdog_model_resnet50.keras"

        self.model_path = Path(model_path)
        self.model = None
        self.image_size = (224, 224)
        self.class_names = ["hotdog", "nothotdog"]

        self._load_model()
        self._load_class_names()

    def _load_model(self):
        """Load the Keras model."""
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model not found: {self.model_path}")

        print(f"Loading model from {self.model_path}")
        self.model = tf.keras.models.load_model(self.model_path)
        print("Model loaded successfully")

    def _load_class_names(self):
        """Load class names from file."""
        classes_path = self.model_path.parent / "classes.txt"
        if classes_path.exists():
            with open(classes_path, "r") as f:
                self.class_names = [line.strip() for line in f.readlines()]
            print(f"Classes: {self.class_names}")

    def preprocess_image(self, image):
        """Preprocess image for model input.

        Params: image: PIL Image or file-like object
        Returns: Preprocessed numpy array
        """
        # Convert to PIL Image if needed
        if not isinstance(image, Image.Image):
            image = Image.open(image)

        # Apply EXIF orientation (phone cameras embed rotation metadata)
        image = ImageOps.exif_transpose(image)

        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Resize to model input size
        image = image.resize(self.image_size)

        # Convert to numpy array and add batch dimension

        # Bug fix: Do NOT apply resnet50.preprocess_input here
        # Model already has it as an internal layer (see train_resenet50.py:118).
        # Double-preprocessing was causing ~48% hotdog accuracy at inference.
        img_array = np.expand_dims(np.array(image, dtype=np.float32), axis=0)

        return img_array

    def predict(self, image):
        """Classify an image as hot dog or not.

        Params: image: PIL Image, file path, or file-like object
        Returns: dict with prediction results
        """
        # Load image if path provided
        if isinstance(image, (str, Path)):
            image = Image.open(image)

        # Preprocess
        img_array = self.preprocess_image(image)

        # Run inference
        prediction = self.model.predict(img_array, verbose=0)
        confidence = float(prediction[0][0])

        # Interpret result (sigmoid output)
        # class_names[0] = "hotdog", class_names[1] = "nothotdog"
        # Model outputs probability of class at index 1 (alphabetical order)
        is_hotdog = confidence < 0.5

        if is_hotdog:
            label = "hotdog"
            score = 1 - confidence
        else:
            label = "nothotdog"
            score = confidence

        return {
            "is_hotdog": is_hotdog,
            "label": label,
            "confidence": round(score, 4),
        }


# Singleton instance 
_predictor = None


def get_predictor():
    """Get or create predictor instance."""
    global _predictor
    if _predictor is None:
        _predictor = HotDogPredictor()
    return _predictor


if __name__ == "__main__":
    predictor = HotDogPredictor()
    print("\nPredictor ready for inference")
    print(f"Model: {predictor.model_path}")
    print(f"Classes: {predictor.class_names}")
