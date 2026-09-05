import os
import urllib.request
import zipfile

def download_sample_audio_data():
    """
    This is a helper script to set up your dataset folder structure
    and download a few dummy sample files to test the training pipeline.
    
    For your real training, you should download a large dataset (like ASVspoof 
    or Mozilla Common Voice) from Kaggle or HuggingFace and extract it into these folders.
    """
    base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset")
    authentic_dir = os.path.join(base_dir, "authentic")
    ai_dir = os.path.join(base_dir, "ai_generated")
    
    os.makedirs(authentic_dir, exist_ok=True)
    os.makedirs(ai_dir, exist_ok=True)
    
    print(f"Created dataset directories at:\n - {authentic_dir}\n - {ai_dir}")
    print("\n--- INSTRUCTIONS FOR REAL DATA ---")
    print("1. Download human speech (English & Hindi) from Mozilla Common Voice or similar.")
    print("2. Place those .wav files inside the 'authentic' folder.")
    print("3. Generate or download AI speech (ElevenLabs, TTS) in both languages.")
    print("4. Place those .wav files inside the 'ai_generated' folder.")
    print("5. Run train_audio_model.py to train your 1 single model!")
    
if __name__ == "__main__":
    download_sample_audio_data()
