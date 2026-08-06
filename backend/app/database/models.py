from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    scans = relationship("URLScan", back_populates="user")

class URLScan(Base):
    __tablename__ = "url_scans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    url = Column(String, index=True, nullable=False)
    status = Column(String, default="pending") # pending, processing, completed, failed
    malware_detected = Column(Boolean, nullable=True)
    malware_family = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)
    is_zero_day = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="scans")
    features = relationship("ExtractedFeature", back_populates="scan", uselist=False)
    predictions = relationship("Prediction", back_populates="scan", uselist=False)
    threat_intel = relationship("ThreatIntelligence", back_populates="scan", uselist=False)
    explainability = relationship("ExplainabilityResult", back_populates="scan", uselist=False)

class ExtractedFeature(Base):
    __tablename__ = "extracted_features"
    
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("url_scans.id"))
    static_features = Column(JSON, nullable=True)
    dynamic_features = Column(JSON, nullable=True)
    image_path = Column(String, nullable=True) # Path to generated malware image
    
    scan = relationship("URLScan", back_populates="features")

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("url_scans.id"))
    cnn_prediction = Column(JSON, nullable=True)
    xgboost_prediction = Column(JSON, nullable=True)
    transformer_prediction = Column(JSON, nullable=True)
    ensemble_result = Column(JSON, nullable=True)
    
    scan = relationship("URLScan", back_populates="predictions")

class ThreatIntelligence(Base):
    __tablename__ = "threat_intelligence"
    
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("url_scans.id"))
    virustotal_data = Column(JSON, nullable=True)
    mitre_attack = Column(JSON, nullable=True)
    ioc_indicators = Column(JSON, nullable=True)
    
    scan = relationship("URLScan", back_populates="threat_intel")

class ExplainabilityResult(Base):
    __tablename__ = "explainability_results"
    
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("url_scans.id"))
    top_features = Column(JSON, nullable=True)
    gradcam_path = Column(String, nullable=True) # Path to saved Grad-CAM image
    shap_values = Column(JSON, nullable=True)
    
    scan = relationship("URLScan", back_populates="explainability")

class MalwareSample(Base):
    __tablename__ = "malware_samples"
    
    id = Column(Integer, primary_key=True, index=True)
    sample_hash = Column(String, unique=True, index=True) # SHA256
    family = Column(String, index=True)
    label = Column(Integer) # 0: benign, 1: malicious
    binary_path = Column(String, nullable=True)
    image_path = Column(String, nullable=True)
    extracted_features = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TrainingHistory(Base):
    __tablename__ = "training_history"
    
    id = Column(Integer, primary_key=True, index=True)
    model_version = Column(String, index=True)
    model_type = Column(String) # cnn, xgboost, transformer
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    training_date = Column(DateTime, default=datetime.utcnow)
