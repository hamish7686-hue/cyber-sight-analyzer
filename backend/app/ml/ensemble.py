from typing import Dict, Any, List

class EnsemblePredictor:
    def __init__(self):
        # Weights for each model based on historical performance
        self.weights = {
            "cnn": 0.4,
            "xgboost": 0.3,
            "transformer": 0.3
        }

    def combine_predictions(self, cnn_result: Dict[str, Any], xgb_result: Dict[str, Any], transformer_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Combines predictions from multiple models using confidence-weighted voting.
        """
        # 1. Determine base maliciousness (Binary Classification)
        malicious_score = 0.0
        
        # CNN (assuming "Benign" is the first label)
        if cnn_result.get("family") != "Benign":
            malicious_score += cnn_result.get("confidence", 0) * self.weights["cnn"]
            
        # XGBoost (returns boolean is_malware)
        if xgb_result.get("is_malware"):
            malicious_score += xgb_result.get("confidence", 0) * self.weights["xgboost"]
            
        # Transformer
        if transformer_result.get("family") != "Benign":
             malicious_score += transformer_result.get("confidence", 0) * self.weights["transformer"]
             
        is_malware = malicious_score > 0.5
        
        # 2. Determine Malware Family (Multiclass Classification)
        # We only consider models that predicted a specific family
        family_scores = {}
        
        if cnn_result.get("family") and cnn_result.get("family") != "Benign":
            family = cnn_result["family"]
            family_scores[family] = family_scores.get(family, 0) + (cnn_result.get("confidence", 0) * self.weights["cnn"])
            
        if transformer_result.get("family") and transformer_result.get("family") != "Benign":
            family = transformer_result["family"]
            family_scores[family] = family_scores.get(family, 0) + (transformer_result.get("confidence", 0) * self.weights["transformer"])
            
        final_family = None
        if family_scores and is_malware:
             final_family = max(family_scores, key=family_scores.get)
             
        # 3. Calculate Risk Level
        risk_level = "Low"
        if is_malware:
            if malicious_score > 0.8:
                risk_level = "Critical"
            elif malicious_score > 0.6:
                risk_level = "High"
            else:
                risk_level = "Medium"
                
        return {
            "is_malware": is_malware,
            "final_family": final_family if is_malware else "Benign",
            "overall_confidence": min(malicious_score, 0.99) if is_malware else min((1 - malicious_score), 0.99),
            "risk_level": risk_level
        }
