import os
import joblib
import numpy as np
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class ZeroDayDetector:
    def __init__(self, model_path: str = "saved_models/isolation_forest.pkl"):
        self.model_path = model_path
        self.model = None
        self.load_model()
        self.confidence_threshold = 0.60 # If ensemble confidence is below this, check for zero-day

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                logger.info(f"Loaded Isolation Forest model from {self.model_path}")
            except Exception as e:
                logger.error(f"Failed to load Isolation Forest model: {e}")
        else:
            logger.warning(f"Isolation Forest model not found at {self.model_path}. Using mock inference.")

    def is_anomaly(self, feature_vector: np.ndarray) -> bool:
        """
        Predict if a sample is an anomaly (potential zero-day) using Isolation Forest.
        """
        if self.model is None:
             # Mock behavior: randomly flag as anomaly 5% of the time for testing if no model is present
             return np.random.rand() < 0.05
             
        try:
             # IsolationForest returns -1 for anomalies, 1 for normal
             prediction = self.model.predict(feature_vector)
             return bool(prediction[0] == -1)
        except Exception as e:
             logger.error(f"Anomaly detection failed: {e}")
             return False

    def detect(self, ensemble_result: Dict[str, Any], static_features: Dict[str, Any]) -> bool:
        """
        Main logic for zero-day detection.
        Combines low confidence classification with unsupervised anomaly detection.
        """
        # 1. Check if classification confidence is suspiciously low for a malicious classification
        confidence = ensemble_result.get("overall_confidence", 1.0)
        
        if confidence < self.confidence_threshold:
             # 2. Extract features for unsupervised model
             feature_vector = np.array([[
                 static_features.get("entropy", 0.0),
                 len(static_features.get("suspicious_strings", [])),
                 static_features.get("num_imported_dlls", 0)
             ]])
             
             # 3. Check for anomaly
             is_anomalous = self.is_anomaly(feature_vector)
             return is_anomalous
             
        return False
