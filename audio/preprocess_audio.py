import os
import numpy as np
import librosa
from tqdm import tqdm

DATASET_PATH = "dataset"
OUTPUT_PATH = "dataset_npy"
N_MELS = 128
MAX_TIME_STEPS = 128

def process_file(file_path):
    try:
        y, sr = librosa.load(file_path, sr=None)
        if len(y.shape) > 1:
            y = np.mean(y, axis=1)
        if len(y) > sr * 5:
            y = y[:sr * 5]
        if sr != 16000:
            y = librosa.resample(y, orig_sr=sr, target_sr=16000)
            sr = 16000
            
        S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=N_MELS, fmax=8000)
        S_dB = librosa.power_to_db(S, ref=np.max)
        S_normalized = (S_dB - S_dB.min()) / (S_dB.max() - S_dB.min() + 1e-9)
        
        if S_normalized.shape[1] < MAX_TIME_STEPS:
            pad_width = MAX_TIME_STEPS - S_normalized.shape[1]
            S_normalized = np.pad(S_normalized, pad_width=((0, 0), (0, pad_width)), mode='constant')
        else:
            S_normalized = S_normalized[:, :MAX_TIME_STEPS]
            
        return S_normalized
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def main():
    os.makedirs(OUTPUT_PATH, exist_ok=True)
    
    categories = ["authentic", "ai_generated"]
    for category in categories:
        in_dir = os.path.join(DATASET_PATH, category)
        out_dir = os.path.join(OUTPUT_PATH, category)
        
        if not os.path.exists(in_dir):
            print(f"Skipping {in_dir} as it does not exist.")
            continue
            
        os.makedirs(out_dir, exist_ok=True)
        
        files = [f for f in os.listdir(in_dir) if f.endswith(('.wav', '.mp3'))]
        print(f"Processing {len(files)} files in {category}...")
        
        for f in tqdm(files):
            in_path = os.path.join(in_dir, f)
            out_filename = os.path.splitext(f)[0] + ".npy"
            out_path = os.path.join(out_dir, out_filename)
            
            # Skip if already exists
            if os.path.exists(out_path):
                continue
                
            S = process_file(in_path)
            if S is not None:
                np.save(out_path, S)

if __name__ == "__main__":
    main()
