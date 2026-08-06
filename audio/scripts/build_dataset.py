import os
os.environ["HF_HOME"] = r"n:\RealVeritas AI\.cache"
import soundfile as sf
from datasets import load_dataset
from gtts import gTTS
import time

# Target directories
authentic_dir = os.path.join("audio", "dataset", "authentic")
ai_generated_dir = os.path.join("audio", "dataset", "ai_generated")
os.makedirs(authentic_dir, exist_ok=True)
os.makedirs(ai_generated_dir, exist_ok=True)

import io
import soundfile as sf
from datasets import load_dataset, Audio

print("Loading LibriSpeech dataset (English)...")
ds = load_dataset('librispeech_asr', 'clean', split='validation[:200]', trust_remote_code=True)
ds = ds.cast_column("audio", Audio(decode=False))

print(f"Loaded {len(ds)} English samples. Processing...")
generated_count = 0

for i, item in enumerate(ds):
    audio_bytes = item['audio']['bytes']
    audio_data, sample_rate = sf.read(io.BytesIO(audio_bytes))
    text = item['text']
    speaker_id = item['speaker_id']
    chapter_id = item['chapter_id']
    id_ = item['id']
    
    # Filename format: librispeech_speakerId_chapterId_id.wav
    base_filename = f"librispeech_{speaker_id}_{chapter_id}_{id_}"
    auth_filename = base_filename + ".wav"
    ai_filename = base_filename + ".wav"
    
    auth_path = os.path.join(authentic_dir, auth_filename)
    ai_path = os.path.join(ai_generated_dir, ai_filename)
    
    # 1. Save Authentic Audio
    if not os.path.exists(auth_path):
        sf.write(auth_path, audio_data, sample_rate)
        
    # 2. Generate AI Audio using gTTS
    if not os.path.exists(ai_path):
        try:
            # We save as wav to match, but gTTS outputs mp3 format internally.
            # We can save with .wav extension, it might still be encoded as mp3, 
            # but standard audio libraries usually handle it, or we can use .mp3.
            # To be safe and consistent with standard, we'll save as .mp3.
            ai_path_mp3 = os.path.join(ai_generated_dir, base_filename + ".mp3")
            auth_path_mp3 = os.path.join(authentic_dir, base_filename + ".mp3")
            
            # Since LibriSpeech gives us numpy arrays, we saved them as WAV for authentic.
            # Let's save AI as mp3
            if not os.path.exists(ai_path_mp3):
                tts = gTTS(text=text, lang='en', slow=False)
                tts.save(ai_path_mp3)
                
                # Sleep a tiny bit to avoid hitting Google's rate limits too aggressively
                time.sleep(1.0)
            
            generated_count += 1
            if generated_count % 20 == 0:
                print(f"Processed {generated_count}/{len(ds)} English clips...")
        except Exception as e:
            print(f"Error generating TTS for {base_filename}: {e}")

print(f"Finished processing English dataset. {generated_count} clips successfully processed.")
