from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Any

from app.api import deps
from app.schemas.scan import ScanRequest, ScanResponse
from app.database.models import URLScan, User
from app.services.scanner import URLScanner

router = APIRouter()

# Mock background task for now (will be replaced by Celery later)
def process_scan_task(scan_id: int, url: str, db: Session):
    try:
        scan = db.query(URLScan).filter(URLScan.id == scan_id).first()
        if not scan:
            return
        
        scan.status = "processing"
        db.commit()
        
        # 1. URL Scanning
        scanner = URLScanner(url)
        metadata = scanner.scan()
        
        # In a real scenario, this would trigger feature extraction, ML inference, etc.
        # For now, we mock a completed successful scan.
        
        scan.status = "completed"
        scan.malware_detected = False
        scan.confidence = 0.95
        scan.risk_level = "Low"
        
        db.commit()
    except Exception as e:
        scan = db.query(URLScan).filter(URLScan.id == scan_id).first()
        if scan:
            scan.status = "failed"
            db.commit()
        print(f"Background task failed: {e}")

@router.post("/scan-url", response_model=ScanResponse)
def create_scan(
    *,
    db: Session = Depends(deps.get_db),
    scan_in: ScanRequest,
    current_user: User = Depends(deps.get_current_active_user),
    background_tasks: BackgroundTasks
) -> Any:
    """
    Submit a URL for scanning.
    """
    scan = URLScan(
        user_id=current_user.id,
        url=str(scan_in.url),
        status="pending"
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Run the processing in the background
    background_tasks.add_task(process_scan_task, scan.id, str(scan_in.url), db)
    
    return {
        "scan_id": scan.id,
        "url": scan.url,
        "status": scan.status
    }

@router.get("/results/{scan_id}", response_model=ScanResponse)
def get_scan_result(
    *,
    db: Session = Depends(deps.get_db),
    scan_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get the results of a specific scan.
    """
    scan = db.query(URLScan).filter(URLScan.id == scan_id, URLScan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    return {
        "scan_id": scan.id,
        "url": scan.url,
        "status": scan.status,
        "malware_detected": scan.malware_detected,
        "malware_family": scan.malware_family,
        "confidence": scan.confidence,
        "risk_level": scan.risk_level,
        "zero_day": scan.is_zero_day
    }
