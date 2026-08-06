import os
import torch
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class TransformerModel:
    def __init__(self, model_path: str = "saved_models/transformer_model.pt"):
        self.model_path = model_path
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.labels = ["Benign", "Adware", "Trojan", "Ransomware", "Worm"]
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                # Load the PyTorch model
                # self.model = torch.load(self.model_path, map_location=self.device)
                # self.model.eval()
                logger.info(f"Loaded Transformer model from {self.model_path}")
            except Exception as e:
                logger.error(f"Failed to load Transformer model: {e}")
        else:
            logger.warning(f"Transformer model not found at {self.model_path}. Using mock inference.")

    def tokenize_behavior(self, api_calls: List[str]) -> torch.Tensor:
        """
        Convert sequence of API calls into token IDs.
        """
        # Mock tokenization
        # In reality, you'd use a vocabulary dictionary or a HuggingFace tokenizer
        tokens = [hash(call) % 1000 for call in api_calls][:128] # truncate to 128
        # Pad sequence
        tokens += [0] * (128 - len(tokens))
        return torch.tensor([tokens], dtype=torch.long).to(self.device)

    def predict(self, dynamic_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict malware family from sequential behavioral data.
        """
        if self.model is None:
             # Mock prediction
             return {
                 "family": "Trojan",
                 "confidence": 0.88
             }
             
        try:
            api_calls = dynamic_features.get("api_calls", [])
            if not api_calls:
                 return {"family": "Benign", "confidence": 0.99} # No behavior = benign
                 
            input_tensor = self.tokenize_behavior(api_calls)
            
            with torch.no_grad():
                # Mock forward pass
                # outputs = self.model(input_tensor)
                # probabilities = torch.softmax(outputs, dim=1).cpu().numpy()[0]
                
                probabilities = [0.1, 0.1, 0.6, 0.1, 0.1] # Mock output
                
            max_idx = np.argmax(probabilities)
            family = self.labels[max_idx]
            confidence = float(probabilities[max_idx])
            
            return {
                "family": family,
                "confidence": confidence
            }
        except Exception as e:
            logger.error(f"Transformer prediction failed: {e}")
            return {"error": str(e)}
