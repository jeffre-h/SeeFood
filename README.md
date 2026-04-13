---
title: SeeFood
emoji: 🌭
colorFrom: red
colorTo: green
sdk: docker
pinned: false
---

# SeeFood

Inspired by the Silicon Valley TV show, this mobile app recreates the iconic “Not Hotdog” app that analyzes images and classifies them as “hot dog” or “not hot dog.”

This project brings that concept to life by building a real end-to-end machine learning system. It includes training a deep learning model on a [Kaggle dataset](https://www.kaggle.com/datasets/yashvrdnjain/hotdognothotdog), serving predictions through a Flask API, and integrating the model into a React Native mobile app that captures or uploads images and returns real-time classification results.

## Project Structure

```
Seefood/
├── backend/          # Flask API server
├── mobile/           # React Native/Expo mobile app
└── training/         # ML model training pipeline
```

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| **Backend** | Flask, TensorFlow/Keras, Docker, Gunicorn |
| **Mobile** | React Native, Expo, TypeScript, React Navigation |
| **ML Training** | TensorFlow, ResNet50, MobileNetV3 |

## How to Run

```bash
cd mobile
npm install
npm start
```

Scan the QR code with Expo Go (iOS/Android) to run on your device.

## Deployment

The backend is deployed on [Hugging Face Spaces](https://huggingface.co/spaces/jeff1709/seefood) using Docker. The `Dockerfile` builds a container with all dependencies and the trained model, then runs Gunicorn as the production WSGI server to handle concurrent requests. On the free tier, Spaces sleep after inactivity and wake up on the next request (cold start ~30s).
