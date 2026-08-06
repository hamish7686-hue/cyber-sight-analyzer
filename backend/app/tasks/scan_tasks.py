from app.worker import celery_app
from app.database.session import SessionLocal
from app.database.models import URLScan, ExtractedFeature, Prediction, ThreatIntelligence, ExplainabilityResult
from app.services.scanner import URLScanner
from app.feature_extraction.static import StaticFeatureExtractor
from app.feature_extraction.dynamic import DynamicFeatureExtractor
from app.ml.image_gen import MalwareImageGenerator
from app.ml.cnn.inference import CNNModel
from app.ml.xgboost.inference import XGBoostModel
from app.ml.transformer.inference import TransformerModel
from app.ml.ensemble import EnsemblePredictor
from app.ml.zero_day.anomaly import ZeroDayDetector
from app.ml.explainability.explainer import Explainer
import logging
import asyncio

logger = logging.getLogger(__name__)

# Initialize ML models globally for the worker to avoid reloading on every task
cnn_model = CNNModel()
xgb_model = XGBoostModel()
transformer_model = TransformerModel()
ensemble = EnsemblePredictor()
zero_day = ZeroDayDetector()
explainer = Explainer()
image_gen = MalwareImageGenerator()

@celery_app.task(name="app.tasks.scan_tasks.process_scan")
def process_scan(scan_id: int, url: str):
    db = SessionLocal()
    try:
        scan = db.query(URLScan).filter(URLScan.id == scan_id).first()
        if not scan:
            logger.error(f"Scan {scan_id} not found")
            return
            
        scan.status = "processing"
        db.commit()
        
        # 1. Basic URL Scan
        scanner = URLScanner(url)
        metadata = scanner.scan()
        
        # 2. Feature Extraction (Mocking file download/sandbox execution)
        static_extractor = StaticFeatureExtractor("mock_path")
        static_features = static_extractor.extract_pe_features()
        
        dynamic_extractor = DynamicFeatureExtractor()
        dynamic_features = dynamic_extractor.extract_features()
        
        # Save features
        db_features = ExtractedFeature(
            scan_id=scan.id,
            static_features=static_features,
            dynamic_features=dynamic_features
        )
        db.add(db_features)
        
        # 3. Generate Image (Mocked)
        # mock_image_path = image_gen.generate_image("mock_path", f"scan_{scan.id}")
        mock_image_path = "mock_image.png"
        
        # 4. ML Inference
        cnn_pred = cnn_model.predict(mock_image_path)
        xgb_pred = xgb_model.predict(static_features, dynamic_features)
        transformer_pred = transformer_model.predict(dynamic_features)
        
        ensemble_res = ensemble.combine_predictions(cnn_pred, xgb_pred, transformer_pred)
        
        db_predictions = Prediction(
            scan_id=scan.id,
            cnn_prediction=cnn_pred,
            xgboost_prediction=xgb_pred,
            transformer_prediction=transformer_pred,
            ensemble_result=ensemble_res
        )
        db.add(db_predictions)
        
        # 5. Zero-Day Detection
        is_zero_day = zero_day.detect(ensemble_res, static_features)
        
        # 6. Explainability
        explanation = explainer.generate_explanation(cnn_pred, xgb_pred, static_features, dynamic_features)
        db_explain = ExplainabilityResult(
            scan_id=scan.id,
            top_features=explanation.get("top_features"),
            gradcam_path=explanation.get("gradcam"),
            shap_values=explanation.get("shap")
        )
        db.add(db_explain)
        
        # Update scan status
        scan.status = "completed"
        scan.malware_detected = ensemble_res["is_malware"]
        scan.malware_family = ensemble_res["final_family"]
        scan.confidence = ensemble_res["overall_confidence"]
        scan.risk_level = ensemble_res["risk_level"]
        scan.is_zero_day = is_zero_day
        
        db.commit()
        logger.info(f"Successfully processed scan {scan_id}")
        
    except Exception as e:
        logger.error(f"Error processing scan {scan_id}: {e}")
        scan = db.query(URLScan).filter(URLScan.id == scan_id).first()
        if scan:
            scan.status = "failed"
            db.commit()
    finally:
        db.close()
