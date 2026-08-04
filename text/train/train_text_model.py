import os
import argparse
import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from torch.utils.data import Dataset

class TextDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

def generate_synthetic_data(file_path):
    print("Generating synthetic training dataset for test run...")
    data = {
        "text": [
            # Human examples
            "I went to the store today and bought some apples. They were fresh and delicious.",
            "Yesterday it rained heavily, so we stayed inside and played board games all afternoon.",
            "Honestly, I'm not sure if this is the right way to do it, but we can try and see.",
            "The movie was alright, but the ending felt a bit rushed and unsatisfying.",
            "My grandmother cooks the best pasta in the world, nothing else comes close.",
            "I forgot my keys on the counter this morning and had to go back to get them.",
            "Let's meet up at the cafe around 5 PM to discuss the new project details.",
            "I'm feeling so tired today, I think I'll go to sleep early tonight.",
            "The dog barked loudly at the mailman, but he is actually very friendly.",
            "I've been learning to play the guitar recently, and it's quite challenging but fun.",
            # AI-Generated examples
            "Furthermore, it is essential to consider the implications of global climate policy.",
            "In conclusion, the optimization of smart grid structures represents a key technical lever.",
            "Moreover, the implementation of automated processes significantly reduces operational latency.",
            "Consequently, the data indicates a substantial correlation between the variables in question.",
            "To summarize, the core methodology relies on deep neural networks for feature extraction.",
            "It is important to emphasize that sustainable resource utilization yields long-term benefits.",
            "Not only does this algorithm enhance computational efficiency, but it also minimizes memory usage.",
            "Therefore, the utilization of carbon capture technologies is vital for mitigating greenhouse gases.",
            "Overall, the findings demonstrate the absolute necessity of transition markers in writing.",
            "Additionally, the system utilizes advanced preprocessing parameters to ensure high accuracy.",
            # AI-Assisted examples
            "Although the initial draft was written by me, I decided to polish the syntax and flow with an automated grammar assistant to make it sound more formal.",
            "The core research was gathered from my observations, but I used an AI tool to rewrite the introduction and improve the transitions between sections.",
            "I prepared the list of project specifications and then polished the wording using an AI writing tool to enhance readability.",
            "The text was drafted manually, but I ran it through an editing tool to fix the awkward phrasing and repetitive vocabulary.",
            "I wrote the basic outline of the article, and then used a language model to expand the bullet points into full sentences.",
            "We compiled the laboratory results, and then utilized a writing assistant to format and polish the description of the experiment.",
            "While I developed the main arguments in this essay, I polished the vocabulary and adjusted the tone using an editor.",
            "I wrote a rough draft of the cover letter and used a text assistant to improve the sentence structures and eliminate wordiness.",
            "The feedback was written by hand, but the final email was polished using an AI grammar tool for a more professional tone.",
            "I drafted the initial response, and then used a text generator to suggest improvements for clarity and flow."
        ],
        "label": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
    }
    df = pd.DataFrame(data)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    df.to_csv(file_path, index=False)
    print(f"Synthetic dataset saved to {file_path}")

def download_and_cache_model(model_name, save_dir):
    print(f"Downloading pre-trained model '{model_name}'...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    
    os.makedirs(save_dir, exist_ok=True)
    tokenizer.save_pretrained(save_dir)
    model.save_pretrained(save_dir)
    print(f"Model and tokenizer successfully saved to {save_dir}")

def train_model(dataset_path, base_model, save_dir, epochs=3, batch_size=4, limit_samples=None):
    print(f"Loading training dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)
    
    # Normalize column names to lowercase
    df.columns = df.columns.str.lower()
    
    # Map alternative column names if needed
    if 'generated' in df.columns and 'label' not in df.columns:
        df = df.rename(columns={'generated': 'label'})
        
    if 'text' not in df.columns or 'label' not in df.columns:
        raise ValueError("Dataset CSV must contain 'text' and 'label' columns")
    
    if limit_samples and limit_samples > 0:
        print(f"Limiting dataset to the first {limit_samples} samples for faster training (CPU-friendly)...")
        df = df.head(limit_samples)
        
    texts = df['text'].tolist()
    labels = df['label'].tolist()
    
    print(f"Loaded {len(texts)} samples. Initializing tokenizer '{base_model}'...")
    tokenizer = AutoTokenizer.from_pretrained(base_model)
    
    print("Tokenizing texts...")
    encodings = tokenizer(texts, truncation=True, padding=True, max_length=128)
    
    dataset = TextDataset(encodings, labels)
    
    print("Initializing model...")
    id2label = {0: "Authentic", 1: "AI-Generated", 2: "AI-Assisted"}
    label2id = {"Authentic": 0, "AI-Generated": 1, "AI-Assisted": 2}
    model = AutoModelForSequenceClassification.from_pretrained(
        base_model,
        num_labels=3,
        id2label=id2label,
        label2id=label2id,
        ignore_mismatched_sizes=True
    )
    
    # Auto-detect GPU/CPU
    device = "cuda" if torch.cuda.is_available() else "cpu"
    use_cpu = (device == "cpu")
    print(f"Using device: {device.upper()} for training (use_cpu={use_cpu})")
    
    training_args = TrainingArguments(
        output_dir='./results_temp',
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        warmup_steps=5,
        weight_decay=0.01,
        logging_dir='./logs_temp',
        logging_steps=2,
        save_strategy='no',
        use_cpu=use_cpu
    )
    
    print("Starting training...")
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
    )
    
    trainer.train()
    
    os.makedirs(save_dir, exist_ok=True)
    tokenizer.save_pretrained(save_dir)
    model.save_pretrained(save_dir)
    print(f"Model fine-tuning complete and saved to {save_dir}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="RealVeritas AI - Text Model Trainer & Downloader")
    parser.add_argument("--model_name", type=str, default="ahmediqbal/ai-text-detector-model", help="Base HF model name")
    parser.add_argument("--save_dir", type=str, default="../models/text", help="Directory to save the trained model")
    parser.add_argument("--dataset_path", type=str, default="", help="Path to training CSV file")
    parser.add_argument("--train_synthetic", action="store_true", help="Generate synthetic data and train")
    parser.add_argument("--download_only", action="store_true", help="Only download and cache the model")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=4, help="Batch size for training")
    parser.add_argument("--limit_samples", type=int, default=0, help="Limit number of samples to train on (useful for CPU/debugging)")
    
    args = parser.parse_args()
    
    # Resolve directory paths relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    save_dir = os.path.abspath(os.path.join(script_dir, args.save_dir))
    
    if args.download_only:
        download_and_cache_model(args.model_name, save_dir)
    elif args.train_synthetic:
        dataset_path = os.path.join(script_dir, "synthetic_dataset.csv")
        generate_synthetic_data(dataset_path)
        train_model(dataset_path, "distilbert-base-uncased", save_dir, epochs=2)
    elif args.dataset_path:
        dataset_path = os.path.abspath(args.dataset_path)
        train_model(
            dataset_path, 
            args.model_name, 
            save_dir, 
            epochs=args.epochs, 
            batch_size=args.batch_size, 
            limit_samples=args.limit_samples
        )
    else:
        # Default fallback: download pre-trained detector for high performance out-of-the-box
        print("No training parameters supplied. Defaulting to downloading pre-trained detector model...")
        download_and_cache_model(args.model_name, save_dir)
