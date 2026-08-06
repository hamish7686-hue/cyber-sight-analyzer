from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any, List

class ScanRequest(BaseModel):
    url: HttpUrl

class ThreatIntelResponse(BaseModel):
    virus_total: Optional[Dict[str, Any]] = None
    mitre_attack: Optional[List[Dict[str, str]]] = None
    ioc: Optional[str] = None

class ExplainabilityResponse(BaseModel):
    top_features: Optional[List[Dict[str, Any]]] = None
    gradcam: Optional[str] = None
    shap: Optional[List[Any]] = None

class ScanResponse(BaseModel):
    scan_id: int
    url: str
    status: str
    malware_detected: Optional[bool] = None
    malware_family: Optional[str] = None
    confidence: Optional[float] = None
    risk_level: Optional[str] = None
    zero_day: Optional[bool] = None
    cnn_prediction: Optional[Any] = None
    xgboost_prediction: Optional[Any] = None
    transformer_prediction: Optional[Any] = None
    threat_intelligence: Optional[ThreatIntelResponse] = None
    explainability: Optional[ExplainabilityResponse] = None
