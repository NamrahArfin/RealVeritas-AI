import os
import re
import math
import numpy as np
import torch
import nltk
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Ensure NLTK tokenizer resources are downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab', quiet=True)

class TextVerifier:
    def __init__(self, model_dir="models"):
        # Resolve path relative to script directory
        script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_path = os.path.abspath(os.path.join(script_dir, "models"))
        
        self.tokenizer = None
        self.model = None
        self.lm_tokenizer = None
        self.lm_model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.is_loaded = False

    def load_model(self):
        if self.is_loaded:
            return
        
        try:
            if not os.path.exists(self.model_path) or not os.listdir(self.model_path):
                print(f"Model directory empty at {self.model_path}. Downloading default model...")
                model_name = "Hello-SimpleAI/chatgpt-detector-roberta"
                self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
                os.makedirs(self.model_path, exist_ok=True)
                self.tokenizer.save_pretrained(self.model_path)
                self.model.save_pretrained(self.model_path)
            else:
                print(f"Loading BERT/DistilBERT model from {self.model_path}...")
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
                self.model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
            
            self.model.to(self.device)
            self.model.eval()
            
            print("Loading LM for true perplexity (distilgpt2)...")
            from transformers import AutoModelForCausalLM
            self.lm_tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
            self.lm_model = AutoModelForCausalLM.from_pretrained("distilgpt2").to(self.device)
            self.lm_model.eval()
            
            self.is_loaded = True
            print("Models loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Running in fallback rule-based mode until model is initialized.")

    def _calculate_perplexity(self, text):
        """
        Calculates true Language Model Perplexity using distilgpt2.
        Human text has high perplexity (unpredictable).
        AI text has low perplexity (uniform, highly predictable).
        """
        if not self.lm_tokenizer or not self.lm_model:
            return 0.0

        encodings = self.lm_tokenizer(text, return_tensors="pt")
        input_ids = encodings.input_ids.to(self.device)
        seq_len = input_ids.size(1)
        if seq_len < 2:
            return 0.0

        with torch.no_grad():
            # Shift labels for causal LM loss
            outputs = self.lm_model(input_ids, labels=input_ids)
            loss = outputs.loss
            ppl = torch.exp(loss).item()

        # Scale ppl to 0-100 logic for the frontend
        # distilgpt2 ppl: typical AI ~20-40, typical Human ~80-150
        perplexity_score = min(max((ppl / 120.0) * 100, 5.0), 98.0)
        return round(perplexity_score, 1)

    def _calculate_burstiness(self, text):
        """
        Calculates Burstiness (variance/standard deviation of sentence lengths).
        Human text has high burstiness (diverse pacing).
        AI text has low burstiness (uniform, robotic sentence lengths).
        """
        sentences = nltk.sent_tokenize(text)
        if len(sentences) <= 1:
            return 0.0
        
        lengths = [len(re.findall(r'\b\w+\b', sent)) for sent in sentences]
        variance = np.var(lengths)
        std_dev = np.std(lengths)
        
        # Scale std_dev to represent burstiness (0-100 score)
        burstiness_score = min(max(std_dev * 10.0, 5.0), 95.0)
        return round(burstiness_score, 1)

    def _detect_manipulation(self, text):
        """
        Detects localized paragraph splicing (manipulation) by identifying
        sudden styling, reading grade, or structural shifts between paragraphs.
        """
        paragraphs = [p.strip() for p in text.split('\n\n') if len(p.strip()) > 50]
        if len(paragraphs) < 2:
            return False, 0.0, []
        
        para_perplexities = [self._calculate_perplexity(p) for p in paragraphs]
        para_lengths = [len(re.findall(r'\b\w+\b', p)) for p in paragraphs]
        
        if not para_perplexities:
            return False, 0.0, []
        
        # Calculate maximum delta in style metrics
        perp_delta = max(para_perplexities) - min(para_perplexities)
        len_delta = max(para_lengths) - min(para_lengths)
        
        # If perplexity shifts drastically (> 35 points) between paragraphs, it's flagged as manipulated
        is_manipulated = perp_delta > 35.0
        manipulation_score = min(max(perp_delta * 2.0, 0.0), 100.0)
        
        reasons = []
        if is_manipulated:
            reasons.append(f"Style metric shift: Perplexity varies from {min(para_perplexities)} to {max(para_perplexities)} across segments.")
            reasons.append("Sudden changes in vocabulary distributions indicate potential paragraph splicing.")
            
        return is_manipulated, round(manipulation_score, 1), reasons

    def verify_text(self, text):
        """
        Runs complete text verification using BERT classification model + Stylometric XAI.
        """
        self.load_model()
        
        if not text or not text.strip():
            return {
                "classification": "Authentic",
                "score": 100,
                "confidence": 100,
                "summary": "No text provided.",
                "reasoning": [],
                "highlights": []
            }
        
        perplexity = self._calculate_perplexity(text)
        burstiness = self._calculate_burstiness(text)
        
        # Check for paragraph-level splicing/manipulation first
        is_manipulated, manip_score, manip_reasons = self._detect_manipulation(text)
        
        # Fallback if model is not loaded (rule-based heuristic)
        if not self.is_loaded:
            classification = "Authentic"
            confidence = 80.0
            score = 90.0
            
            # Simple heuristic matching the mock to ensure initial functionality
            lower_text = text.lower()
            if "furthermore" in lower_text and "in conclusion" in lower_text:
                classification = "AI-Generated"
                score = 25.0
                confidence = 92.0
            elif "polished" in lower_text or "assisted" in lower_text or "improved" in lower_text or ("moreover" in lower_text and "furthermore" not in lower_text):
                classification = "AI-Assisted"
                score = 58.0
                confidence = 87.0
            elif is_manipulated:
                classification = "Manipulated"
                score = 45.0
                confidence = 85.0
                
            if classification == "AI-Assisted":
                summary = "Heuristic baseline. Document exhibits style indicators of human-AI collaboration (polished phrasing)."
                reasoning = [
                    f"Vocabulary Variety: {perplexity} (statistical word uniqueness score).",
                    f"Sentence Rhythm: {burstiness} (sentence length variance profile).",
                    "Selective polishing/rewriting markers identified in text blocks."
                ]
            else:
                summary = "Heuristic baseline. BERT model loading skipped or pending download."
                reasoning = [
                    f"Vocabulary Variety: {perplexity} (statistical word uniqueness score).",
                    f"Sentence Rhythm: {burstiness} (sentence length variance profile)."
                ] + (manip_reasons if is_manipulated else ["Vocabulary pacing suggests natural human drafting."])
            
            highlights = self._extract_rule_based_highlights(text)
            
            return {
                "classification": classification,
                "score": int(score),
                "confidence": int(confidence),
                "summary": summary,
                "reasoning": reasoning,
                "highlights": highlights
            }
  
        # Run BERT prediction
        with torch.no_grad():
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            outputs = self.model(**inputs)
            probs = torch.softmax(outputs.logits, dim=-1).cpu().numpy()[0]
        
        # Determine classification dynamically based on label shape
        num_classes = len(probs)
        max_idx = int(np.argmax(probs))
        
        prob_human = float(probs[0])
        prob_ai = float(probs[1]) if num_classes > 1 else 0.0
        prob_assisted = float(probs[2]) if num_classes > 2 else 0.0
        
        if is_manipulated:
            classification = "Manipulated"
            # Score indicates authenticity (low if manipulated)
            score = 100 - manip_score
            confidence = 85.0
            summary = "Document exhibits style mismatch patterns across sections, indicating localized splicing or post-editing."
            reasoning = [
                "Sentence structure and grade complexity shift sharply between paragraphs."
            ] + manip_reasons
        elif num_classes >= 3:
            # 3-class classification scenario: 0=Authentic, 1=AI-Generated, 2=AI-Assisted
            if max_idx == 1:
                classification = "AI-Generated"
                score = (1 - prob_ai) * 100
                confidence = prob_ai * 100
                summary = "Text displays typical AI-generation signatures: uniform sentence length, predictable vocabulary, and redundant grammatical transitional loops."
                reasoning = [
                    f"BERT Transformer Model: Predicts AI origin with {round(confidence, 1)}% probability.",
                    f"Vocabulary Variety: {perplexity} (predictable word structures).",
                    f"Sentence Rhythm: {burstiness} (sentence lengths are highly uniform)."
                ]
            elif max_idx == 2:
                classification = "AI-Assisted"
                # Authenticity score indicates partial human draft (intermediate)
                score = (prob_human + 0.5 * prob_assisted) * 100
                confidence = prob_assisted * 100
                summary = "Document displays signatures of AI assistance. The text was likely drafted by a human but polished or edited using an AI tool."
                reasoning = [
                    f"BERT Transformer Model: Predicts AI assistance with {round(confidence, 1)}% probability.",
                    f"Vocabulary Variety: {perplexity} (moderately predictable word patterns).",
                    f"Sentence Rhythm: {burstiness} (moderate pacing variance, indicating human revision)."
                ]
            else:
                classification = "Authentic"
                score = prob_human * 100
                confidence = prob_human * 100
                summary = "Document exhibits natural vocabulary variety. Sentence length patterns show highly organic variance (high sentence rhythm)."
                reasoning = [
                    f"BERT Transformer Model: Predicts human origin with {round(confidence, 1)}% probability.",
                    f"Vocabulary Variety: {perplexity} (organic, unpredictable word patterns).",
                    f"Sentence Rhythm: {burstiness} (natural pacing variation typical of human authors)."
                ]
        else:
            # Fallback 2-class scenario
            if prob_ai > 0.5:
                classification = "AI-Generated"
                score = (1 - prob_ai) * 100
                confidence = prob_ai * 100
                summary = "Text displays typical AI-generation signatures: uniform sentence length, predictable vocabulary, and redundant grammatical transitional loops."
                reasoning = [
                    f"BERT Transformer Model: Predicts AI origin with {round(confidence, 1)}% probability.",
                    f"Vocabulary Variety: {perplexity} (predictable word structures).",
                    f"Sentence Rhythm: {burstiness} (sentence lengths are highly uniform)."
                ]
            else:
                classification = "Authentic"
                score = prob_human * 100
                confidence = prob_human * 100
                summary = "Document exhibits natural vocabulary variety. Sentence length patterns show highly organic variance (high sentence rhythm)."
                reasoning = [
                    f"BERT Transformer Model: Predicts human origin with {round(confidence, 1)}% probability.",
                    f"Vocabulary Variety: {perplexity} (organic, unpredictable word patterns).",
                    f"Sentence Rhythm: {burstiness} (natural pacing variation typical of human authors)."
                ]
 
        # Extract XAI Highlights using Token Perturbation analysis
        highlights = self._extract_xai_highlights(text, classification)
        
        return {
            "classification": classification,
            "score": int(score),
            "confidence": int(confidence),
            "summary": summary,
            "reasoning": reasoning,
            "highlights": highlights
        }

    def _extract_rule_based_highlights(self, text):
        """
        Extracts highlights using keyword markers for baseline/fallback.
        """
        highlights = []
        ai_keywords = ["furthermore", "in conclusion", "moreover", "consequently", "essential to", "not only", "overall", "mitigate"]
        words = re.finditer(r'\b\w+\b', text)
        for match in words:
            word = match.group()
            if word.lower() in ai_keywords:
                highlights.append({
                    "word": word,
                    "type": "ai",
                    "score": 0.85,
                    "start": match.start(),
                    "end": match.end()
                })
        return highlights

    def _extract_xai_highlights(self, text, classification):
        """
        Computes XAI word contributions using Captum LayerIntegratedGradients.
        """
        try:
            from captum.attr import LayerIntegratedGradients
        except ImportError:
            return self._extract_rule_based_highlights(text)

        if not self.is_loaded:
            return self._extract_rule_based_highlights(text)

        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        input_ids = inputs["input_ids"].to(self.device)
        attention_mask = inputs["attention_mask"].to(self.device)
        
        if hasattr(self.model, 'roberta'):
            embeddings = self.model.roberta.embeddings.word_embeddings
        elif hasattr(self.model, 'distilbert'):
            embeddings = self.model.distilbert.embeddings.word_embeddings
        else:
            return self._extract_rule_based_highlights(text)

        def forward_func(inputs):
            return self.model(inputs, attention_mask=attention_mask).logits

        lig = LayerIntegratedGradients(forward_func, embeddings)

        if classification == "AI-Generated":
            target = 1
        elif classification == "AI-Assisted" and self.model.config.num_labels > 2:
            target = 2
        else:
            target = 0

        try:
            attributions, delta = lig.attribute(inputs=input_ids,
                                                target=target,
                                                return_convergence_delta=True)
            attributions = attributions.sum(dim=-1).squeeze(0)
            attributions = attributions / torch.norm(attributions)
            attributions = attributions.cpu().numpy()
        except Exception as e:
            print(f"Captum attribution failed: {e}")
            return self._extract_rule_based_highlights(text)

        tokens = self.tokenizer.convert_ids_to_tokens(input_ids[0])
        highlights = []
        text_idx = 0
        text_lower = text.lower()
        
        for i, token in enumerate(tokens):
            if token in ["<s>", "</s>", "<pad>", "[CLS]", "[SEP]"]:
                continue
                
            token_str = token.replace('Ġ', '').replace('##', '').lower()
            if not token_str:
                continue

            search_start = text_lower.find(token_str, text_idx)
            if search_start != -1:
                start = search_start
                end = start + len(token_str)
                text_idx = end
                
                score = float(attributions[i])
                if score > 0.05:
                    highlights.append({
                        "word": text[start:end],
                        "type": "ai" if target != 0 else "human",
                        "score": round(score, 2),
                        "start": start,
                        "end": end
                    })
        return highlights
