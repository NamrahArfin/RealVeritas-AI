# 🖼️ Image Verification Module

**Team Member**: Image Specialist

## Overview
This module handles real-time deepfake image detection, multi-class classification (Authentic, AI-Generated, AI-Manipulated), and OCR text density verification.

## Module Structure
* `image_train.py` - Script for dataset loading, CNN model architecture, and training.
* `predict.py` - CLI inference tool for evaluating image files against the trained model weights.
* `merge_datasets.py` - Dataset preprocessing & merging helper.
* `image_detector_model.h5` - Trained TensorFlow / Keras weights file.
