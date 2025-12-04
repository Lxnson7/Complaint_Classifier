"""
Advanced Transformer-based Complaint Classifier using HuggingFace
Models: DistilBERT for better accuracy than traditional ML
"""

import os
import pickle
import torch
import numpy as np
from typing import Tuple, List, Dict
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
    pipeline
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import re

from training_data import TRAINING_DATA, CATEGORIES, PRIORITY_MAP


class TransformerComplaintClassifier:
    """
    Transformer-based Complaint Classifier using DistilBERT
    
    Much more accurate than traditional ML models:
    - Uses contextual embeddings
    - Better at understanding nuanced language
    - Pre-trained on massive datasets
    """
    
    def __init__(self, model_name: str = "distilbert-base-uncased"):
        """
        Initialize the transformer classifier
        
        Args:
            model_name: HuggingFace model name (default: distilbert-base-uncased)
        """
        self.model_name = model_name
        self.model = None
        self.tokenizer = None
        self.classifier_pipeline = None
        self.categories = CATEGORIES
        self.id2label = {i: cat for i, cat in enumerate(CATEGORIES)}
        self.label2id = {cat: i for i, cat in enumerate(CATEGORIES)}
        self.model_path = "models/transformer_classifier"
        self.is_trained = False
        
        # Try to load existing model or train new one
        if os.path.exists(self.model_path) and os.path.exists(os.path.join(self.model_path, 'config.json')):
            self.load_model()
        else:
            self.train()
    
    def preprocess(self, text: str) -> str:
        """Preprocess the text"""
        text = text.lower().strip()
        text = re.sub(r'http\S+', '', text)  # Remove URLs
        text = re.sub(r'\s+', ' ', text)
        return text
    
    def prepare_dataset(self):
        """Prepare dataset for training"""
        texts = [self.preprocess(text) for text, _ in TRAINING_DATA]
        labels = [self.label2id[label] for _, label in TRAINING_DATA]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=0.2, random_state=42, stratify=labels
        )
        
        return X_train, X_test, y_train, y_test
    
    def train(self):
        """Train the transformer model"""
        print(f"🚀 Training {self.model_name} model...")
        print("⚠️  This may take 2-5 minutes for first time...")
        
        # Prepare data
        X_train, X_test, y_train, y_test = self.prepare_dataset()
        
        # Initialize tokenizer and model
        print("📥 Downloading pre-trained model...")
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            self.model_name,
            num_labels=len(CATEGORIES),
            id2label=self.id2label,
            label2id=self.label2id
        )
        
        # Tokenize data
        print("🔄 Tokenizing data...")
        train_encodings = self.tokenizer(X_train, truncation=True, padding=True, max_length=128)
        test_encodings = self.tokenizer(X_test, truncation=True, padding=True, max_length=128)
        
        # Create PyTorch datasets
        class ComplaintDataset(torch.utils.data.Dataset):
            def __init__(self, encodings, labels):
                self.encodings = encodings
                self.labels = labels
            
            def __getitem__(self, idx):
                item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
                item['labels'] = torch.tensor(self.labels[idx])
                return item
            
            def __len__(self):
                return len(self.labels)
        
        train_dataset = ComplaintDataset(train_encodings, y_train)
        test_dataset = ComplaintDataset(test_encodings, y_test)
        
        # Training arguments - FIXED VERSION
        training_args = TrainingArguments(
            output_dir='./results',
            num_train_epochs=3,
            per_device_train_batch_size=8,
            per_device_eval_batch_size=8,
            warmup_steps=50,
            weight_decay=0.01,
            logging_dir='./logs',
            logging_steps=10,
            eval_strategy="epoch",  # FIXED: Changed from evaluation_strategy
            save_strategy="epoch",
            load_best_model_at_end=True,
            report_to="none",  # Disable wandb/tensorboard
        )
        
        # Compute metrics function
        def compute_metrics(pred):
            labels = pred.label_ids
            preds = pred.predictions.argmax(-1)
            acc = accuracy_score(labels, preds)
            return {'accuracy': acc}
        
        # Initialize Trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=test_dataset,
            compute_metrics=compute_metrics
        )
        
        # Train
        print("🔥 Training started...")
        trainer.train()
        
        # Evaluate
        print("\n📊 Model Evaluation:")
        predictions = trainer.predict(test_dataset)
        y_pred = predictions.predictions.argmax(-1)
        
        print(classification_report(
            y_test, 
            y_pred, 
            target_names=CATEGORIES
        ))
        
        accuracy = accuracy_score(y_test, y_pred)
        print(f"✅ Model trained with {accuracy*100:.2f}% accuracy")
        
        # Save model
        self.save_model()
        self.is_trained = True
        
        # Create pipeline for inference
        self.classifier_pipeline = pipeline(
            "text-classification",
            model=self.model,
            tokenizer=self.tokenizer,
            top_k=None  # Return all scores
        )
        
        return accuracy
    
    def save_model(self):
        """Save the trained model"""
        os.makedirs(self.model_path, exist_ok=True)
        self.model.save_pretrained(self.model_path)
        self.tokenizer.save_pretrained(self.model_path)
        
        # Save mappings
        with open(os.path.join(self.model_path, 'mappings.pkl'), 'wb') as f:
            pickle.dump({
                'id2label': self.id2label,
                'label2id': self.label2id,
                'categories': self.categories
            }, f)
        
        print(f"💾 Model saved to {self.model_path}")
    
    def load_model(self):
        """Load a trained model"""
        print(f"📂 Loading model from {self.model_path}...")
        
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
        
        # Load mappings
        with open(os.path.join(self.model_path, 'mappings.pkl'), 'rb') as f:
            mappings = pickle.load(f)
            self.id2label = mappings['id2label']
            self.label2id = mappings['label2id']
            self.categories = mappings['categories']
        
        # Create pipeline
        self.classifier_pipeline = pipeline(
            "text-classification",
            model=self.model,
            tokenizer=self.tokenizer,
            top_k=None
        )
        
        self.is_trained = True
        print(f"✅ Model loaded successfully!")
    
    def classify(self, complaint: str) -> Tuple[str, float, List[str], str]:
        """
        Classify a complaint
        
        Returns:
            - category: Predicted category
            - confidence: Confidence score (0-1)
            - keywords: Top keywords extracted
            - priority: Priority level
        """
        if not self.is_trained:
            raise RuntimeError("Model not trained. Call train() first.")
        
        processed_text = self.preprocess(complaint)
        
        # Get predictions
        results = self.classifier_pipeline(processed_text)[0]
        
        # Sort by score
        results = sorted(results, key=lambda x: x['score'], reverse=True)
        
        # Get top prediction
        category = results[0]['label']
        confidence = float(results[0]['score'])
        
        # Extract keywords (simple word frequency for now)
        words = processed_text.split()
        keywords = [w for w in words if len(w) > 3][:5]
        
        # Get priority
        priority = PRIORITY_MAP.get(category, "Medium")
        
        return category, round(confidence, 2), keywords, priority
    
    def get_all_probabilities(self, complaint: str) -> Dict[str, float]:
        """Get probabilities for all categories"""
        if not self.is_trained:
            raise RuntimeError("Model not trained.")
        
        processed_text = self.preprocess(complaint)
        results = self.classifier_pipeline(processed_text)[0]
        
        # Convert to dictionary
        probs = {item['label']: float(item['score']) for item in results}
        
        return probs


# Alias for backward compatibility
MLComplaintClassifier = TransformerComplaintClassifier
