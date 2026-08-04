import os
import sys
import zipfile
import requests
import json
import pandas as pd

def apply_delta(current_text, delta):
    ops = delta.get("ops", [])
    new_text = []
    text_index = 0
    for op in ops:
        if "retain" in op:
            retain_len = op["retain"]
            new_text.append(current_text[text_index:text_index+retain_len])
            text_index += retain_len
        elif "insert" in op:
            insert_val = op["insert"]
            if isinstance(insert_val, str):
                new_text.append(insert_val)
        elif "delete" in op:
            delete_len = op["delete"]
            text_index += delete_len
    
    # Append remaining text
    if text_index < len(current_text):
        new_text.append(current_text[text_index:])
        
    return "".join(new_text)

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    complete_dataset_path = os.path.join(script_dir, "complete_dataset.csv")
    
    if not os.path.exists(complete_dataset_path):
        print(f"Error: complete_dataset.csv not found at {complete_dataset_path}")
        sys.exit(1)
        
    print(f"Loading existing dataset from {complete_dataset_path}...")
    orig_df = pd.read_csv(complete_dataset_path)
    print("Original dataset shape:", orig_df.shape)
    print("Original value counts:\n", orig_df['label'].value_counts())
    
    # Define paths for CoAuthor zip
    # Check if we have a pre-downloaded copy in scratch directory
    scratch_zip = r"C:\Users\namra\AppData\Roaming\antigravity-ide\brain\569d8491-83c3-4a50-9353-478b1bf99111\scratch\coauthor.zip"
    # Fallback to local app data under .gemini
    gemini_scratch_zip = r"C:\Users\namra\.gemini\antigravity-ide\brain\569d8491-83c3-4a50-9353-478b1bf99111\scratch\coauthor.zip"
    
    zip_path = None
    if os.path.exists(gemini_scratch_zip):
        zip_path = gemini_scratch_zip
    elif os.path.exists(scratch_zip):
        zip_path = scratch_zip
    else:
        # Otherwise, download to a temporary directory in backend/train
        zip_path = os.path.join(script_dir, "coauthor.zip")
        if not os.path.exists(zip_path):
            url = "https://cs.stanford.edu/~minalee/zip/chi2022-coauthor-v1.0.zip"
            print(f"Downloading CoAuthor dataset from {url}...")
            r = requests.get(url, stream=True)
            with open(zip_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=1024*1024):
                    if chunk:
                        f.write(chunk)
            print("Download finished.")
            
    print(f"Using zip file at {zip_path}")
    
    reconstructed_texts = []
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        namelist = zip_ref.namelist()
        jsonl_files = [f for f in namelist if f.endswith('.jsonl')]
        print(f"Found {len(jsonl_files)} session files in zip.")
        
        for idx, filename in enumerate(jsonl_files):
            if (idx + 1) % 100 == 0 or (idx + 1) == len(jsonl_files):
                print(f"Processing session {idx + 1}/{len(jsonl_files)}...")
                
            try:
                # Read content directly from zip
                with zip_ref.open(filename) as f:
                    # Parse line-by-line
                    lines = f.read().decode('utf-8').splitlines()
                    if not lines:
                        continue
                        
                    events = [json.loads(line) for line in lines]
                    
                    # Reconstruct doc
                    doc = events[0].get("currentDoc", "")
                    
                    for ev in events[1:]:
                        delta = ev.get("textDelta")
                        if delta:
                            doc = apply_delta(doc, delta)
                            
                    # Clean up reconstructed text
                    doc = doc.strip()
                    if doc:
                        reconstructed_texts.append(doc)
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                
    print(f"Successfully reconstructed {len(reconstructed_texts)} texts.")
    
    # Create new DataFrame for CoAuthor data (Label 2)
    coauthor_df = pd.DataFrame({
        'text': reconstructed_texts,
        'label': 2
    })
    
    # Merge datasets
    merged_df = pd.concat([orig_df, coauthor_df], ignore_index=True)
    print("Merged dataset shape:", merged_df.shape)
    print("Merged value counts:\n", merged_df['label'].value_counts())
    
    # Save back to CSV
    print(f"Saving merged dataset to {complete_dataset_path}...")
    merged_df.to_csv(complete_dataset_path, index=False)
    print("Merge complete!")

if __name__ == "__main__":
    main()
