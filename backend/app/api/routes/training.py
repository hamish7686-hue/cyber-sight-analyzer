from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Any
import numpy as np

from app.api import deps
from app.database.models import User, TrainingHistory
from app.training.retrain import RetrainingService

router = APIRouter()

# In a real setup, this would be a Celery task
def background_training_task(model_type: str, db: Session):
    try:
        service = RetrainingService()
        samples = service.preprocess_new_samples()
        metrics = service.retrain_model(model_type)
        
        history = TrainingHistory(
            model_version=metrics["model_version"],
            model_type=metrics["model_type"],
            accuracy=metrics["accuracy"],
            precision=metrics["precision"],
            recall=metrics["recall"],
            f1_score=metrics["f1_score"]
        )
        db.add(history)
        db.commit()
    except Exception as e:
        print(f"Training failed: {e}")

@router.post("/update-model")
def trigger_model_update(
    *,
    db: Session = Depends(deps.get_db),
    model_type: str = "all", # cnn, xgboost, transformer, all
    current_user: User = Depends(deps.get_current_active_user),
    background_tasks: BackgroundTasks
) -> Any:
    """
    Trigger a model retraining pipeline. Requires admin privileges in a real scenario.
    """
    models_to_train = ["cnn", "xgboost", "transformer"] if model_type == "all" else [model_type]
    
    for model in models_to_train:
        background_tasks.add_task(background_training_task, model, db)
        
    return {"message": f"Training pipeline triggered for {model_type}", "status": "processing"}

@router.get("/history")
def get_training_history(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get the history of model updates.
    """
    history = db.query(TrainingHistory).order_by(TrainingHistory.training_date.desc()).limit(10).all()
    return history
