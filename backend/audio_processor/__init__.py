"""
Audio Processing Configuration for Forever Tapes
"""
import os
from celery import Celery

# Redis connection
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

# Initialize Celery
celery_app = Celery(
    'audio_processor',
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=['audio_processor.tasks']
)

# Configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    result_expires=3600,  # Results expire after 1 hour
    worker_prefetch_multiplier=1,  # Process one task at a time for audio processing
    task_acks_late=True,
    worker_max_tasks_per_child=50,
)

# Task routes
celery_app.conf.task_routes = {
    'audio_processor.tasks.process_memory_audio': {'queue': 'audio_processing'},
    'audio_processor.tasks.process_single_audio': {'queue': 'audio_enhancement'},
}

if __name__ == '__main__':
    celery_app.start()