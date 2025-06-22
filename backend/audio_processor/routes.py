"""
Audio Processing API Routes for Forever Tapes
"""
import os
import uuid
from typing import Dict, List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel

from .tasks import process_memory_audio, process_single_audio
from . import celery_app

router = APIRouter(prefix="/audio", tags=["Audio Processing"])

class ProcessingStatus(BaseModel):
    task_id: str
    status: str
    stage: Optional[str] = None
    current: Optional[int] = None
    total: Optional[int] = None
    error: Optional[str] = None
    result: Optional[Dict] = None

class ProcessMemoryRequest(BaseModel):
    memory_id: str
    audio_files: List[str]  # List of file paths
    metadata: List[Dict]    # Metadata for each file

class ProcessMemoryResponse(BaseModel):
    task_id: str
    status: str
    message: str

@router.post("/process-memory", response_model=ProcessMemoryResponse)
async def start_memory_processing(request: ProcessMemoryRequest):
    """
    Start processing all audio messages for a memory into a professional collage
    """
    try:
        # Validate audio files exist
        missing_files = [f for f in request.audio_files if not os.path.exists(f)]
        if missing_files:
            raise HTTPException(
                status_code=400, 
                detail=f"Audio files not found: {missing_files}"
            )
        
        # Start background processing task
        task = process_memory_audio.delay(
            memory_id=request.memory_id,
            audio_file_paths=request.audio_files,
            metadata=request.metadata
        )
        
        return ProcessMemoryResponse(
            task_id=task.id,
            status="started",
            message=f"Started processing {len(request.audio_files)} audio messages for memory {request.memory_id}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start processing: {str(e)}")

@router.get("/status/{task_id}", response_model=ProcessingStatus)
async def get_processing_status(task_id: str):
    """
    Get the status of an audio processing task
    """
    try:
        # Get task result
        result = celery_app.AsyncResult(task_id)
        
        response = ProcessingStatus(
            task_id=task_id,
            status=result.status.lower()
        )
        
        if result.status == 'PENDING':
            response.stage = "queued"
        elif result.status == 'PROGRESS':
            if result.info:
                response.stage = result.info.get('stage')
                response.current = result.info.get('current')
                response.total = result.info.get('total')
        elif result.status == 'SUCCESS':
            response.result = result.result
            response.stage = "completed"
        elif result.status == 'FAILURE':
            response.error = str(result.info) if result.info else "Unknown error"
            response.stage = "failed"
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

@router.post("/enhance-single")
async def enhance_single_audio(audio_path: str, contributor_name: str):
    """
    Enhance a single audio message (called after upload)
    """
    try:
        if not os.path.exists(audio_path):
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        # Start enhancement task
        task = process_single_audio.delay(
            audio_path=audio_path,
            contributor_name=contributor_name
        )
        
        return {
            "task_id": task.id,
            "status": "started",
            "message": f"Started enhancing audio for {contributor_name}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start enhancement: {str(e)}")

@router.delete("/cancel/{task_id}")
async def cancel_processing(task_id: str):
    """
    Cancel an audio processing task
    """
    try:
        celery_app.control.revoke(task_id, terminate=True)
        return {"message": f"Task {task_id} cancelled"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel task: {str(e)}")

@router.get("/worker-status")
async def get_worker_status():
    """
    Get status of Celery workers
    """
    try:
        inspect = celery_app.control.inspect()
        stats = inspect.stats()
        active = inspect.active()
        
        return {
            "workers": stats or {},
            "active_tasks": active or {},
            "available": bool(stats)
        }
        
    except Exception as e:
        return {
            "workers": {},
            "active_tasks": {},
            "available": False,
            "error": str(e)
        }