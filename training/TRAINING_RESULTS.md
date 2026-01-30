# Training Results

## Dataset

| Split | Hot Dog | Not Hot Dog | Total |
|-------|---------|-------------|-------|
| Train | 1,200 | 1,200 | 2,400 |
| Validation | 300 | 300 | 600 |
| Test | 322 | 322 | 644 |

Source: [Kaggle - Hot Dog Not Hot Dog](https://www.kaggle.com/datasets/yashvrdnjain/hotdognothotdog)

## Model Comparison

| Model | Test Accuracy | Precision | Recall | TFLite Size |
|-------|---------------|-----------|--------|-------------|
| MobileNetV3Small | 91.8% | 97.9% | 85.4% | 1.1 MB |
| **ResNet50** | **94.5%** | **95.8%** | **93.1%** | 23 MB |

## Training Configuration

### MobileNetV3Small
- **Base model**: MobileNetV3Small (ImageNet weights)
- **Input size**: 224x224
- **Batch size**: 32
- **Epochs**: 15 (frozen) + 5 (fine-tuning)
- **Optimizer**: Adam (lr=0.001, fine-tune lr=1e-5)
- **Fine-tuned layers**: Last 20

### ResNet50
- **Base model**: ResNet50 (ImageNet weights)
- **Input size**: 224x224
- **Batch size**: 32
- **Epochs**: 20 (frozen) + 10 (fine-tuning)
- **Optimizer**: Adam (lr=0.001, fine-tune lr=1e-5)
- **Fine-tuned layers**: Last 50

## Data Augmentation

| Augmentation | MobileNetV3 | ResNet50 |
|--------------|-------------|----------|
| Horizontal Flip | Yes | Yes |
| Rotation | 10% | 15% |
| Zoom | 10% | 15% |
| Contrast | 10% | 20% |
| Brightness | No | 20% |
| Translation | No | 10% |

## Training Curves

### MobileNetV3Small
![MobileNetV3 Training](results/training_history_mobilenetv3.png)

### ResNet50
![ResNet50 Training](results/training_history_resnet50.png)

## Observations

1. **ResNet50 outperforms MobileNetV3** by ~3% accuracy due to deeper architecture
2. **Fine-tuning helps significantly** - validation accuracy jumps after unfreezing base layers
3. **ResNet50 has better recall** (93% vs 85%) - catches more actual hot dogs
4. **Trade-off**: ResNet50 is 20x larger than MobileNetV3

## Reproduce

```bash
# Install dependencies
pip install -r requirements.txt

# Download data
python extract_data.py

# Train MobileNetV3
python train/train_mobilenetv3.py

# Train ResNet50
python train/train_resenet50.py
```

