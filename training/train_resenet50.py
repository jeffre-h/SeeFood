"""
Model Training Script 
(Transfer learning with ResNet50) 

Results:
    Loss: 0.1899
    Accuracy: 0.9161
    Precision: 0.9752
    Recall: 0.8540
"""

import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing import image_dataset_from_directory
import matplotlib.pyplot as plt


CONFIG = {
    "data_dir": "../data/train",
    "test_dir": "../data/test",
    "model_output_dir": "../backend/model",
    "image_size": (224, 224),
    "batch_size": 32,
    "epochs": 20,
    "fine_tune_epochs": 10,
    "learning_rate": 0.001,
    "fine_tune_lr": 1e-5,
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
        label_mode="binary",
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

    class_names = train_ds.class_names
    print(f"Classes: {class_names}")

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
    """Create stronger data augmentation pipeline."""

    return keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.15),
        layers.RandomContrast(0.2),
        layers.RandomBrightness(0.2),
        layers.RandomTranslation(0.1, 0.1),
    ], name="data_augmentation")


# ============================================================================
# 3. Build Model
# ============================================================================
def create_model(image_size, augmentation_layer):
    """Create model using transfer learning with ResNet50."""

    inputs = keras.Input(shape=(*image_size, 3))

    # Data augmentation (only during training)
    x = augmentation_layer(inputs)

    # Preprocessing for ResNet50
    x = keras.applications.resnet50.preprocess_input(x)

    # Base model - ResNet50 (pretrained on ImageNet)
    base_model = ResNet50(
        input_shape=(*image_size, 3),
        include_top=False,
        weights="imagenet",
        pooling="avg",
    )

    # Freeze base model initially
    base_model.trainable = False

    x = base_model(x, training=False)

    # Classification head
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(64, activation="relu")(x)
    x = layers.Dropout(0.2)(x)

    # Output layer
    outputs = layers.Dense(1, activation="sigmoid")(x)

    model = keras.Model(inputs, outputs)

    return model, base_model


def compile_model(model, learning_rate):
    """Compile the model."""

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
    """Train the model with frozen base."""

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=3,
            min_lr=1e-7,
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
# 5. Fine-tuning Model
# ============================================================================
def fine_tune_model(model, base_model, train_ds, val_ds, epochs, learning_rate):
    """Fine-tune by unfreezing top layers of base model."""

    # Unfreeze the base model
    base_model.trainable = True

    # Freeze early layers, keep last 50 layers trainable
    # ResNet50 has 175 layers total
    for layer in base_model.layers[:-50]:
        layer.trainable = False

    trainable_layers = sum(1 for layer in base_model.layers if layer.trainable)
    print(f"Fine-tuning {trainable_layers} layers of ResNet50")

    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
        loss=keras.losses.BinaryCrossentropy(),
        metrics=[
            keras.metrics.BinaryAccuracy(name="accuracy"),
            keras.metrics.Precision(name="precision"),
            keras.metrics.Recall(name="recall"),
        ],
    )

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-8,
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


def plot_training_history(history, fine_tune_history, save_path="training_history_resnet50.png"):
    """Plot training metrics."""

    # Combine histories
    acc = history.history["accuracy"] + fine_tune_history.history["accuracy"]
    val_acc = history.history["val_accuracy"] + fine_tune_history.history["val_accuracy"]
    loss = history.history["loss"] + fine_tune_history.history["loss"]
    val_loss = history.history["val_loss"] + fine_tune_history.history["val_loss"]

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Mark fine-tuning start
    fine_tune_start = len(history.history["accuracy"])

    # Accuracy
    axes[0].plot(acc, label="Train")
    axes[0].plot(val_acc, label="Validation")
    axes[0].axvline(x=fine_tune_start, color="gray", linestyle="--", label="Fine-tuning Start")
    axes[0].set_title("Model Accuracy (ResNet50)")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Accuracy")
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # Loss
    axes[1].plot(loss, label="Train")
    axes[1].plot(val_loss, label="Validation")
    axes[1].axvline(x=fine_tune_start, color="gray", linestyle="--", label="Fine-tuning Start")
    axes[1].set_title("Model Loss (ResNet50)")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Loss")
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(save_path, dpi=150)
    plt.close()
    print(f"Training history plot saved to {save_path}")


def export_model(model, output_dir, class_names):
    """Export model in multiple formats."""

    os.makedirs(output_dir, exist_ok=True)

    # Save Keras model
    keras_path = os.path.join(output_dir, "hotdog_model_resnet50.keras")
    model.save(keras_path)
    print(f"Keras model saved to {keras_path}")

    # Save as TensorFlow Lite
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()

    tflite_path = os.path.join(output_dir, "hotdog_model_resnet50.tflite")
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
    print("Hot Dog or Not Hot Dog - Model Training v2 (ResNet50)")
    print("=" * 60)

    gpus = tf.config.list_physical_devices("GPU")
    print(f"\nGPUs available: {len(gpus)}")

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
    print("\n[3/6] Building ResNet50 model...")
    model, base_model = create_model(CONFIG["image_size"], augmentation)
    model = compile_model(model, CONFIG["learning_rate"])
    model.summary()

    # Train with frozen base
    print("\n[4/6] Training model (frozen base)...")
    history = train_model(model, train_ds, val_ds, CONFIG["epochs"])

    # Fine-tune
    print("\n[5/6] Fine-tuning model...")
    fine_tune_history = fine_tune_model(
        model, base_model, train_ds, val_ds,
        CONFIG["fine_tune_epochs"],
        CONFIG["fine_tune_lr"]
    )

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
        print("Test directory not found, using validation set")
        evaluate_model(model, val_ds)

    # Plot and export
    plot_training_history(history, fine_tune_history)
    export_model(model, CONFIG["model_output_dir"], class_names)

    print("\n" + "=" * 60)
    print("Training complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
