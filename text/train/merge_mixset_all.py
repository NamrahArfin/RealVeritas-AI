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
    
    print("Loading ONE-Lab/MixSet from Hugging Face...")
    try:
        dataset = load_dataset("ONE-Lab/MixSet")
    except Exception as e:
        print("Error loading dataset from Hugging Face:", e)
        sys.exit(1)
        
    train_df = pd.DataFrame(dataset['train'])
    test_df = pd.DataFrame(dataset['test'])
    mixset_df = pd.concat([train_df, test_df], ignore_index=True)
    print(f"Loaded {len(mixset_df)} rows from MixSet.")
    
    # Process Category 0 (Human-Written): original text where binary == HWT
    hwt_mask = mixset_df['binary'] == 'HWT'
    hwt_texts = mixset_df.loc[hwt_mask, 'original'].dropna().tolist()
    hwt_df = pd.DataFrame({
        'text': hwt_texts,
        'label': [0] * len(hwt_texts)
    })
    print(f"Extracted {len(hwt_df)} Human-Written (Label 0) samples.")
    
    # Process Category 1 (AI-Generated): original text where binary == MGT
    mgt_mask = mixset_df['binary'] == 'MGT'
    mgt_texts = mixset_df.loc[mgt_mask, 'original'].dropna().tolist()
    mgt_df = pd.DataFrame({
        'text': mgt_texts,
        'label': [1] * len(mgt_texts)
    })
    print(f"Extracted {len(mgt_df)} AI-Generated (Label 1) samples.")
    
    # Process Category 2 (AI-Assisted): all revised texts
    rev_texts = mixset_df['revised'].dropna().tolist()
    rev_df = pd.DataFrame({
        'text': rev_texts,
        'label': [2] * len(rev_texts)
    })
    print(f"Extracted {len(rev_df)} AI-Assisted (Label 2) samples.")
    
    # Combine all extracted data
    new_data = pd.concat([hwt_df, mgt_df, rev_df], ignore_index=True)
    print("New data to merge shape:", new_data.shape)
    
    # Merge with original
    merged_df = pd.concat([orig_df, new_data], ignore_index=True)
    print("Merged dataset shape:", merged_df.shape)
    print("Merged value counts:\n", merged_df['label'].value_counts())
    
    # Save back to CSV
    print(f"Saving merged dataset to {complete_dataset_path}...")
    merged_df.to_csv(complete_dataset_path, index=False)
    print("Merge complete!")

if __name__ == "__main__":
    main()
