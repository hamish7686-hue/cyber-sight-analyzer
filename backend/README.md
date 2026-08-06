# AI Malware Detection & Classification Backend

This is the FastAPI backend for the AI-powered Malware Detection and Classification System. It provides APIs for URL scanning, malware feature extraction, AI classification, threat intelligence integration, and continuous model retraining.

## Project Structure
- `app/api`: FastAPI routes and dependencies.
- `app/core`: Configuration and security (JWT, hashing).
- `app/database`: SQLAlchemy models and session setup.
- `app/schemas`: Pydantic models for API validation.
- `app/services`: Core services like the URL Scanner.
- `app/feature_extraction`: Static and dynamic feature extraction logic.
- `app/ml`: AI inference logic (CNN, XGBoost, Transformer, Ensemble, Zero-Day).
- `app/threat_intelligence`: Integrations with VirusTotal and MITRE ATT&CK.
- `app/tasks`: Celery background tasks for heavy processing.
- `app/training`: Continuous learning and retraining logic.

## Setup Instructions

### 1. Prerequisites
- Python 3.11+
- PostgreSQL
- Redis (for Celery)

### 2. Virtual Environment
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PROJECT_NAME="AI Malware Detection API"
DATABASE_URL="postgresql://username:password@localhost/malwaredb"
REDIS_URL="redis://localhost:6379/0"
SECRET_KEY="generate_a_secure_random_key"
VIRUSTOTAL_API_KEY="your_virustotal_api_key_here"
```

### 4. Running the Application

**Start the FastAPI Server:**
```bash
uvicorn main:app --reload
```
The API documentation (Swagger UI) will be available at `http://localhost:8000/docs`.

**Start the Celery Worker (in a separate terminal):**
```bash
celery -A app.worker.celery_app worker --loglevel=info
```

## Machine Learning Models
Pre-trained model weights should be placed in the `backend/saved_models/` directory:
- `cnn_model.h5`
- `xgboost_model.pkl`
- `transformer_model.pt`
- `isolation_forest.pkl` (for zero-day detection)

If the models are not present, the system will gracefully fall back to mock predictions for testing purposes.
