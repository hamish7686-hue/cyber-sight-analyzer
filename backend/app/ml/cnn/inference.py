import os
import numpy as np
import cv2
from typing import Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class CNNModel:
    def __init__(self, model_path: str = "saved_models/cnn_model.h5"):
        self.model_path = model_path
        self.model = None
        self.labels = ["Benign", "Adware", "Trojan", "Ransomware", "Worm"]
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(self.model_path)
                logger.info(f"Loaded CNN model from {self.model_path}")
            except Exception as e:
                logger.error(f"Failed to load CNN model: {e}")
        else:
            logger.warning(f"CNN model not found at {self.model_path}. Using mock inference.")

    def preprocess_image(self, image_path: str) -> np.ndarray:
        # Load grayscale image
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
             raise ValueError(f"Could not read image at {image_path}")
             
        # Resize to expected input size (e.g., 224x224)
        img = cv2.resize(img, (224, 224))
        # Normalize
        img = img.astype('float32') / 255.0
        # Expand dims for batch and channel (1, 224, 224, 1)
        img = np.expand_dims(img, axis=-1)
        img = np.expand_dims(img, axis=0)
        return img

    def predict(self, image_path: str) -> Dict[str, Any]:
        """
        Predict malware family from image.
        """
        if self.model is None:
            # Mock prediction if no model is loaded
            return {
                "family": "Trojan",
                "confidence": 0.85,
                "probabilities": {label: 0.1 for label in self.labels}
            }
            
        try:
            img_tensor = self.preprocess_image(image_path)
            predictions = self.model.predict(img_tensor)[0]
            
            max_idx = np.argmax(predictions)
            family = self.labels[max_idx]
            confidence = float(predictions[max_idx])
            
            prob_dict = {self.labels[i]: float(predictions[i]) for i in range(len(self.labels))}
            
            return {
                "family": family,
                "confidence": confidence,
                "probabilities": prob_dict
            }
        except Exception as e:
            logger.error(f"CNN prediction failed: {e}")
            return {"error": str(e)}
