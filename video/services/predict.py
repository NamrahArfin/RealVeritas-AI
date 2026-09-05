import tensorflow as tf
import numpy as np
import os
import cv2
from tensorflow.keras.preprocessing.image import load_img, img_to_array

# =========================
# SETTINGS
# =========================

MODEL_PATH = r"C:\Users\HP\Desktop\RealVeritas-AI\video\video_detector_model.keras"

IMG_SIZE = 128
FRAMES_PER_VIDEO = 10

CLASS_NAMES = [
    "Authentic",
    "AI_Generated",
    "AI_Manipulated"
]

# =========================
# LOAD MODEL
# =========================

print("Loading video model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully!")


# =========================
# EXTRACT FRAMES
# =========================

def extract_frames(video_path):

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print("Could not open video:", video_path)
        return None

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if total_frames <= 0:
        cap.release()
        return None

    frame_positions = [
        int(i * (total_frames - 1) / (FRAMES_PER_VIDEO - 1))
        for i in range(FRAMES_PER_VIDEO)
    ]

    frames = []

    for pos in frame_positions:

        cap.set(cv2.CAP_PROP_POS_FRAMES, pos)

        success, frame = cap.read()

        if success:
            frame = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))

            frame = img_to_array(frame) / 255.0

            frames.append(frame)

    cap.release()

    if len(frames) < FRAMES_PER_VIDEO:
        return None

    return np.array(frames)


# =========================
# PREDICT FUNCTION
# =========================

def predict_video(video_path):

    if not os.path.exists(video_path):
        print("Video file not found!")
        return

    print("\nProcessing video...")

    frames = extract_frames(video_path)

    if frames is None:
        print("Failed to extract 10 frames from video.")
        return

    frames = np.expand_dims(frames, axis=0)

    predictions = model.predict(frames)

    predicted_class_index = np.argmax(predictions[0])

    predicted_label = CLASS_NAMES[predicted_class_index]

    confidence = predictions[0][predicted_class_index] * 100

    print("\n================================")
    print("PREDICTION RESULT")
    print("================================")

    print("Video Path    :", video_path)
    print("Prediction    :", predicted_label)
    print(f"Confidence    : {confidence:.2f}%")

    print("\nAll Probabilities:")

    for i, name in enumerate(CLASS_NAMES):
        print(f" - {name:15s}: {predictions[0][i] * 100:.2f}%")

    print("================================")


# =========================
# TEST PREDICTION
# =========================

if __name__ == "__main__":

    test_video_path = r"C:\Users\HP\Desktop\RealVeritas-AI\video_dataset\Authentic\authentic_0001.mp4"

    predict_video(test_video_path)
