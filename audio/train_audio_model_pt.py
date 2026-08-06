import os
import random
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import librosa
from tqdm import tqdm
from services.audio_model import AudioCNN

# ==========================================
# CONFIGURATION
# ==========================================
DATASET_PATH = "dataset_npy"
MODEL_SAVE_PATH = "models/audio_model.pth"

N_MELS = 128
MAX_TIME_STEPS = 128
EPOCHS = 10
BATCH_SIZE = 32
SUBSET_SIZE_PER_CLASS = 1000 # Use 1000 authentic and 1000 AI for fast training

# Automatically use an NVIDIA GPU (CUDA) if one is available tomorrow, otherwise fallback to CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Training on device: {device}")

class AudioDataset(Dataset):
    def __init__(self, file_paths, labels, n_mels=N_MELS, max_time_steps=MAX_TIME_STEPS):
        self.file_paths = file_paths
        self.labels = labels
        self.n_mels = n_mels
        self.max_time_steps = max_time_steps

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx):
        file_path = self.file_paths[idx]
        label = self.labels[idx]

        try:
            # Load pre-computed .npy file directly
            S_normalized = np.load(file_path)
            
            # PyTorch expects shape (Channels, Height, Width) -> (1, 128, 128)
            img_tensor = torch.tensor(S_normalized, dtype=torch.float32).unsqueeze(0)
            label_tensor = torch.tensor([label], dtype=torch.float32)
            
            return img_tensor, label_tensor
            
        except Exception as e:
            # Return a zero tensor if file fails (to avoid crashing dataloader)
            print(f"Error processing {file_path}: {e}")
            return torch.zeros((1, self.n_mels, self.max_time_steps)), torch.tensor([label], dtype=torch.float32)

def prepare_data(dataset_path):
    authentic_dir = os.path.join(dataset_path, "authentic")
    ai_dir = os.path.join(dataset_path, "ai_generated")
    
    authentic_files = [os.path.join(authentic_dir, f) for f in os.listdir(authentic_dir) if f.endswith('.npy')]
    ai_files = [os.path.join(ai_dir, f) for f in os.listdir(ai_dir) if f.endswith('.npy')]
    
    print(f"Found {len(authentic_files)} authentic files and {len(ai_files)} AI files.")
    
    # Oversample the minority class to balance the dataset perfectly
    max_len = max(len(authentic_files), len(ai_files))
    
    if len(authentic_files) < max_len:
        authentic_files = (authentic_files * (max_len // len(authentic_files) + 1))[:max_len]
    if len(ai_files) < max_len:
        ai_files = (ai_files * (max_len // len(ai_files) + 1))[:max_len]
        
    print(f"Oversampled to {len(authentic_files)} authentic and {len(ai_files)} AI files for balanced training.")
    
    all_files = authentic_files + ai_files
    # Label 0 for Authentic, Label 1 for AI
    all_labels = [0] * len(authentic_files) + [1] * len(ai_files)
    
    # Shuffle together
    combined = list(zip(all_files, all_labels))
    random.shuffle(combined)
    
    all_files[:], all_labels[:] = zip(*combined)
    return all_files, all_labels

if __name__ == "__main__":
    print("Starting PyTorch Training Pipeline...")
    
    files, labels = prepare_data(DATASET_PATH)
    
    if len(files) == 0:
        print("No valid audio files found. Exiting.")
        exit(1)
        
    print(f"Successfully loaded {len(files)} audio paths for subset training.")
    
    # 80-20 Split
    split_idx = int(0.8 * len(files))
    train_files, val_files = files[:split_idx], files[split_idx:]
    train_labels, val_labels = labels[:split_idx], labels[split_idx:]
    
    train_dataset = AudioDataset(train_files, train_labels)
    val_dataset = AudioDataset(val_files, val_labels)
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    
    model = AudioCNN().to(device)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    print("Training model...")
    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for i, (inputs, targets) in enumerate(tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS} [Train]")):
            inputs, targets = inputs.to(device), targets.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            
            # Calculate accuracy
            predicted = (torch.sigmoid(outputs) > 0.5).float()
            total += targets.size(0)
            correct += (predicted == targets).sum().item()
            
        train_acc = 100. * correct / total
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for inputs, targets in tqdm(val_loader, desc=f"Epoch {epoch+1}/{EPOCHS} [Val]"):
                inputs, targets = inputs.to(device), targets.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, targets)
                val_loss += loss.item()
                
                predicted = (torch.sigmoid(outputs) > 0.5).float()
                val_total += targets.size(0)
                val_correct += (predicted == targets).sum().item()
                
        val_acc = 100. * val_correct / val_total
        print(f"Epoch {epoch+1}/{EPOCHS} | Train Loss: {running_loss/len(train_loader):.4f} | Train Acc: {train_acc:.2f}% | Val Loss: {val_loss/len(val_loader):.4f} | Val Acc: {val_acc:.2f}%")
        
        # Save a checkpoint after every epoch so progress is never lost
        os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
        checkpoint_path = MODEL_SAVE_PATH.replace('.pth', f'_epoch_{epoch+1}.pth')
        torch.save(model.state_dict(), checkpoint_path)
        
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"Training Complete! Final model saved to {MODEL_SAVE_PATH}")
