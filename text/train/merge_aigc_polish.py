import os
import sys
import pandas as pd
from datasets import load_dataset

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
    
    # Store existing texts in a set for quick deduplication
    existing_texts = set(orig_df['text'].dropna().str.lower().str.strip())
    
    print("\nStreaming bmbgsj/AIGC-text-bank from Hugging Face...")
    try:
        ds = load_dataset("bmbgsj/AIGC-text-bank", "ai_polish", split="train", streaming=True)
    except Exception as e:
        print("Error setting up dataset streaming:", e)
        sys.exit(1)
        
    new_texts = []
    target_count = 45000
    word_count_min = 100
    
    print(f"Collecting {target_count} AI-polished texts (word count >= {word_count_min})...")
    
    iter_ds = iter(ds)
    processed_count = 0
    duplicate_count = 0
    short_count = 0
    
    while len(new_texts) < target_count:
        try:
            item = next(iter_ds)
            processed_count += 1
        except StopIteration:
            print("Reached end of the streamed dataset stream before hitting target count.")
            break
        except Exception as e:
            print(f"Warning: error reading from stream at index {processed_count}: {e}")
            continue
            
        text_ai = item.get('text_ai', '').strip()
        if not text_ai:
            continue
            
        # Check text length
        words = text_ai.split()
        if len(words) < word_count_min:
            short_count += 1
            continue
            
        # Deduplicate
        text_lower = text_ai.lower()
        if text_lower in existing_texts:
            duplicate_count += 1
            continue
            
        new_texts.append(text_ai)
        existing_texts.add(text_lower)
        
        # Log progress
        if len(new_texts) % 5000 == 0:
            print(f"Collected {len(new_texts)}/{target_count} samples. (Processed: {processed_count}, Short filtered: {short_count}, Duplicates: {duplicate_count})")
            
    print(f"\nFinished collection. Total collected: {len(new_texts)}")
    print(f"Final counts: Short filtered: {short_count}, Duplicates: {duplicate_count}")
    
    if not new_texts:
        print("Error: No new texts were collected. Exiting.")
        sys.exit(1)
        
    # Create new DataFrame
    new_df = pd.DataFrame({
        'text': new_texts,
        'label': [2] * len(new_texts)
    })
    
    # Merge with original
    merged_df = pd.concat([orig_df, new_df], ignore_index=True)
    print("\nMerged dataset shape:", merged_df.shape)
    print("Merged value counts:\n", merged_df['label'].value_counts())
    
    # Save back to CSV
    print(f"\nSaving merged dataset to {complete_dataset_path}...")
    try:
        merged_df.to_csv(complete_dataset_path, index=False)
        print("Merge completed and dataset successfully saved!")
    except Exception as e:
        print(f"Error saving merged dataset: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
