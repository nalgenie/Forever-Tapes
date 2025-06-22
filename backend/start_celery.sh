#!/bin/bash
# Start Celery worker for audio processing

cd /app/backend

# Start Celery worker
python -m celery -A audio_processor worker --loglevel=info --concurrency=2 --queues=audio_processing,audio_enhancement
