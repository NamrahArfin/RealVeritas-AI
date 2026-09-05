import tensorflow as tf
import numpy as np
import os
import cv2
from tensorflow.keras.preprocessing.image import img_to_array

class VideoVerifier:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.model_path = os.path.join(self.base_dir, "video", "models", "video_detector_model.keras")
        self.img_size = 128
        self.frames_per_video = 10
        
        # Mapped to match frontend UI names exactly
        self.class_names = ["Authentic", "AI-Generated", "Manipulated"]
        
        self.model = None
        self._load_model()
        
    def _load_model(self):
        if not os.path.exists(self.model_path):
            print(f"Warning: Video model not found at {self.model_path}. Video verification will run in fallback mode.")
            return
            
        try:
            self.model = tf.keras.models.load_model(self.model_path)
            print("Video Model Loaded Successfully.")
        except Exception as e:
            print(f"Warning: Failed to load Video model: {e}")
            self.model = None

    def extract_frames(self, video_path):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return None

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            cap.release()
            return None

        frame_positions = [int(i * (total_frames - 1) / (self.frames_per_video - 1)) for i in range(self.frames_per_video)]
        frames = []

        for pos in frame_positions:
            cap.set(cv2.CAP_PROP_POS_FRAMES, pos)
            success, frame = cap.read()
            if success:
                frame = cv2.resize(frame, (self.img_size, self.img_size))
                frame = img_to_array(frame) / 255.0
                frames.append(frame)

        cap.release()
        if len(frames) < self.frames_per_video:
            return None
            
        return np.array(frames)

    def verify_video(self, video_path):
        if self.model is None:
            # Fallback mode
            import random
            return {
                "classification": "Authentic",
                "score": 90.0,
                "confidence": 90.0,
                "confidence_authentic": 90.0,
                "confidence_manipulated": 5.0,
                "confidence_generated": 5.0,
                "message": "Video model not found. Mock result."
            }

        frames = self.extract_frames(video_path)
        if frames is None:
            return {
                "classification": "Error",
                "score": 0.0,
                "message": "Failed to extract required frames from video."
            }

        frames = np.expand_dims(frames, axis=0)
        predictions = self.model.predict(frames, verbose=0)[0]
        
        predicted_class_index = int(np.argmax(predictions))
        predicted_label = self.class_names[predicted_class_index]
        confidence = float(predictions[predicted_class_index] * 100)

        return {
            "classification": predicted_label,
            "score": round(confidence, 1),
            "confidence": round(confidence, 1),
            "confidence_authentic": round(float(predictions[0] * 100), 1),
            "confidence_generated": round(float(predictions[1] * 100), 1),
            "confidence_manipulated": round(float(predictions[2] * 100), 1),
            "message": "Video verified successfully."
        }

video_verifier = VideoVerifier()
