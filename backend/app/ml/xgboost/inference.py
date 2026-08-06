import os
import joblib
import numpy as np
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class XGBoostModel:
    def __init__(self, model_path: str = "saved_models/xgboost_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.feature_names = [
            "entropy", "num_imported_dlls", "has_pe_signature",
            "suspicious_strings_count", "api_calls_count"
        ]
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                logger.info(f"Loaded XGBoost model from {self.model_path}")
            except Exception as e:
                logger.error(f"Failed to load XGBoost model: {e}")
        else:
            logger.warning(f"XGBoost model not found at {self.model_path}. Using mock inference.")

    def prepare_features(self, static_features: Dict[str, Any], dynamic_features: Dict[str, Any]) -> np.ndarray:
        """
        Flatten extracted features into a numerical vector.
        """
        feature_vector = [
            static_features.get("entropy", 0.0),
            static_features.get("num_imported_dlls", 0),
            1 if static_features.get("has_pe_signature") else 0,
            len(static_features.get("suspicious_strings", [])),
            len(dynamic_features.get("api_calls", []))
        ]
        return np.array([feature_vector])

    def predict(self, static_features: Dict[str, Any], dynamic_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict malware probability from tabular features.
        """
        if self.model is None:
             # Mock prediction
             return {
                 "is_malware": True,
                 "confidence": 0.92
             }
             
        try:
            X = self.prepare_features(static_features, dynamic_features)
            # XGBoost predict_proba returns [prob_benign, prob_malicious]
            probabilities = self.model.predict_proba(X)[0]
            
            is_malware = bool(probabilities[1] > 0.5)
            confidence = float(max(probabilities))
            
            return {
                "is_malware": is_malware,
                "confidence": confidence
            }
        except Exception as e:
            logger.error(f"XGBoost prediction failed: {e}")
            return {"error": str(e)}
