"""
Model Training Script
(Transfer learning with MobileNetV3)

Test Results:
    Loss: 0.1437
    Accuracy: 0.9457
    Precision: 0.9614
    Recall: 0.9286
"""

import os
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV3Small
from tensorflow.keras.preprocessing import image_dataset_from_directory
import matplotlib.pyplot as plt

# Get absolute paths based on script location
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent.parent

# ============================================================================
# Configuration
# ============================================================================

CONFIG = {
    "data_dir": str(PROJECT_ROOT / "data" / "train"),
    "test_dir": str(PROJECT_ROOT / "data" / "test"),
    "model_output_dir": str(PROJECT_ROOT / "backend" / "model"),
    "results_dir": str(SCRIPT_DIR.parent / "results"),
    "image_size": (224, 224),
    "batch_size": 32,
    "epochs": 15,
    "learning_rate": 0.001,
    "validation_split": 0.2,
}


# ============================================================================
# 1. Load Datasets
# ============================================================================

def load_datasets(data_dir, image_size, batch_size, validation_split):
    """Load training and validation datasets."""

    train_ds = image_dataset_from_directory(
        data_dir,
        validation_split=validation_split,
        subset="training",
        seed=42,
        image_size=image_size,
        batch_size=batch_size,
        label_mode="binary",  # Binary classification
    )

    val_ds = image_dataset_from_directory(
        data_dir,
        validation_split=validation_split,
        subset="validation",
        seed=42,
        image_size=image_size,
        batch_size=batch_size,
        label_mode="binary",
    )

    # Get class names
    class_names = train_ds.class_names
    print(f"Classes: {class_names}")

    # Optimize dataset performance
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    return train_ds, val_ds, class_names


def load_test_dataset(test_dir, image_size, batch_size):
    """Load test dataset."""

    test_ds = image_dataset_from_directory(
        test_dir,
        image_size=image_size,
        batch_size=batch_size,
        label_mode="binary",
    )

    return test_ds


# ============================================================================
# 2. Data Augmentation
# ============================================================================

def create_augmentation_layer():
    """Create data augmentation pipeline."""

    return keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
        layers.RandomContrast(0.1),
    ], name="data_augmentation")


# ============================================================================
# 3. Build Model
# ============================================================================

def create_model(image_size, augmentation_layer):
    """Create model using transfer learning with MobileNetV3."""

    # Input layer
    inputs = keras.Input(shape=(*image_size, 3))

    # Data augmentation (only during training)
    x = augmentation_layer(inputs)

    # Preprocessing for MobileNetV3
    x = keras.applications.mobilenet_v3.preprocess_input(x)

    # Base model - MobileNetV3Small (pretrained on ImageNet)
    base_model = MobileNetV3Small(
        input_shape=(*image_size, 3),
        include_top=False,
        weights="imagenet",
        pooling="avg",
    )

    # Freeze base model
    base_model.trainable = False

    x = base_model(x, training=False)

    # Classification head
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.2)(x)

    # Output layer (sigmoid for binary classification)
    outputs = layers.Dense(1, activation="sigmoid")(x)

    model = keras.Model(inputs, outputs)

    return model, base_model


def compile_model(model, learning_rate):
    """Compile the model with optimizer and loss."""

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
        loss=keras.losses.BinaryCrossentropy(),
        metrics=[
            keras.metrics.BinaryAccuracy(name="accuracy"),
            keras.metrics.Precision(name="precision"),
            keras.metrics.Recall(name="recall"),
        ],
    )

    return model


# ============================================================================
# 4. Train Model
# ============================================================================

def train_model(model, train_ds, val_ds, epochs):
    """Train the model with callbacks."""

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=3,
            restore_best_weights=True,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-6,
        ),
        keras.callbacks.ModelCheckpoint(
            filepath="best_model.keras",
            monitor="val_accuracy",
            save_best_only=True,
        ),
    ]

    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=callbacks,
    )

    return history


# ============================================================================
# 5. Fine-tune Model
# ============================================================================
def fine_tune_model(model, base_model, train_ds, val_ds, epochs=5):
    """Fine-tune the model by unfreezing some base layers."""

    # Unfreeze the last 20 layers of the base model
    base_model.trainable = True
    for layer in base_model.layers[:-20]:
        layer.trainable = False

    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-5),
        loss=keras.losses.BinaryCrossentropy(),
        metrics=[
            keras.metrics.BinaryAccuracy(name="accuracy"),
            keras.metrics.Precision(name="precision"),
            keras.metrics.Recall(name="recall"),
        ],
    )

    # Continue training
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=[
            keras.callbacks.EarlyStopping(
                monitor="val_loss",
                patience=2,
                restore_best_weights=True,
            ),
        ],
    )

    return history


# ============================================================================
# 6. Evaluation
# ============================================================================

def evaluate_model(model, test_ds):
    """Evaluate model on test dataset."""

    results = model.evaluate(test_ds)
    print("\nTest Results:")
    print(f"  Loss: {results[0]:.4f}")
    print(f"  Accuracy: {results[1]:.4f}")
    print(f"  Precision: {results[2]:.4f}")
    print(f"  Recall: {results[3]:.4f}")

    return results


def plot_training_history(history, save_path=None):
    """Plot training metrics."""
    if save_path is None:
        save_path = os.path.join(CONFIG["results_dir"], "training_history_mobilenetv3.png")
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    # Accuracy
    axes[0].plot(history.history["accuracy"], label="Train")
    axes[0].plot(history.history["val_accuracy"], label="Validation")
    axes[0].set_title("Model Accuracy")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Accuracy")
    axes[0].legend()

    # Loss
    axes[1].plot(history.history["loss"], label="Train")
    axes[1].plot(history.history["val_loss"], label="Validation")
    axes[1].set_title("Model Loss")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Loss")
    axes[1].legend()

    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    print(f"Training history plot saved to {save_path}")


def export_model(model, output_dir, class_names):
    """Export model in multiple formats."""

    os.makedirs(output_dir, exist_ok=True)

    # Save Keras model
    keras_path = os.path.join(output_dir, "hotdog_model.keras")
    model.save(keras_path)
    print(f"Keras model saved to {keras_path}")

    # Save as TensorFlow Lite (for mobile)
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()

    tflite_path = os.path.join(output_dir, "hotdog_model.tflite")
    with open(tflite_path, "wb") as f:
        f.write(tflite_model)
    print(f"TFLite model saved to {tflite_path}")

    # Save class names
    classes_path = os.path.join(output_dir, "classes.txt")
    with open(classes_path, "w") as f:
        for name in class_names:
            f.write(f"{name}\n")
    print(f"Class names saved to {classes_path}")

    # Print model size
    keras_size = os.path.getsize(keras_path) / (1024 * 1024)
    tflite_size = os.path.getsize(tflite_path) / (1024 * 1024)
    print(f"\nModel sizes:")
    print(f"  Keras: {keras_size:.2f} MB")
    print(f"  TFLite: {tflite_size:.2f} MB")


# ============================================================================
# Main
# ============================================================================

def main():
    print("=" * 60)
    print("Hot Dog or Not Hot Dog - Model Training")
    print("=" * 60)

    # Check for GPU
    gpus = tf.config.list_physical_devices("GPU")
    print(f"\nGPUs available: {len(gpus)}")
    if gpus:
        for gpu in gpus:
            print(f"  {gpu}")

    # Load data
    print("\n[1/6] Loading datasets...")
    train_ds, val_ds, class_names = load_datasets(
        CONFIG["data_dir"],
        CONFIG["image_size"],
        CONFIG["batch_size"],
        CONFIG["validation_split"],
    )

    # Create augmentation
    print("\n[2/6] Creating data augmentation...")
    augmentation = create_augmentation_layer()

    # Build model
    print("\n[3/6] Building model...")
    model, base_model = create_model(CONFIG["image_size"], augmentation)
    model = compile_model(model, CONFIG["learning_rate"])
    model.summary()

    # Train
    print("\n[4/6] Training model (frozen base)...")
    history = train_model(model, train_ds, val_ds, CONFIG["epochs"])

    # Fine-tune
    print("\n[5/6] Fine-tuning model...")
    fine_tune_history = fine_tune_model(model, base_model, train_ds, val_ds, epochs=5)

    # Evaluate
    print("\n[6/6] Evaluating model...")
    if os.path.exists(CONFIG["test_dir"]):
        test_ds = load_test_dataset(
            CONFIG["test_dir"],
            CONFIG["image_size"],
            CONFIG["batch_size"],
        )
        evaluate_model(model, test_ds)
    else:
        print("Test directory not found, using validation set for evaluation")
        evaluate_model(model, val_ds)

    # Plot and export
    plot_training_history(history)
    export_model(model, CONFIG["model_output_dir"], class_names)

    print("\n" + "=" * 60)
    print("Training complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
