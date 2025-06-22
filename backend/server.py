from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException, Form, Depends
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import shutil
import jwt
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Add backend directory to Python path for audio_processor imports
sys.path.insert(0, str(ROOT_DIR))

# Audio processing imports
try:
    from audio_processor.tasks import process_memory_audio, process_single_audio
    from audio_processor import celery_app
    AUDIO_PROCESSING_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("Audio processing system loaded successfully")
except ImportError as e:
    AUDIO_PROCESSING_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning(f"Audio processing not available: {e}")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Create processed directory for final audio files
PROCESSED_DIR = ROOT_DIR / "processed"
PROCESSED_DIR.mkdir(exist_ok=True)

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer(auto_error=False)

# Create the main app without a prefix
app = FastAPI(title="Forever Tapes API", description="Collaborative Audio Memories Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# === MODELS ===

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    is_verified: bool = False
    magic_link_token: Optional[str] = None
    magic_link_expires: Optional[datetime] = None
    password_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: Optional[str] = None

class MagicLinkRequest(BaseModel):
    email: EmailStr

class AudioMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contributor_name: str
    contributor_email: EmailStr  # Now required
    file_path: str
    duration: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PodCard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    occasion: str  # birthday, anniversary, graduation, etc.
    creator_id: str
    creator_name: str
    creator_email: EmailStr
    audio_messages: List[AudioMessage] = []
    background_music_path: Optional[str] = None
    is_public: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PodCardCreate(BaseModel):
    title: str
    description: str
    occasion: str

class ContributeAudioRequest(BaseModel):
    podcard_id: str
    contributor_name: str
    contributor_email: EmailStr  # Now required

class AudioProcessingJob(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    memory_id: str
    task_id: str
    status: str = "queued"  # queued, processing, completed, failed
    stage: Optional[str] = None
    progress: Optional[dict] = None
    output_file: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class ProcessedMemory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    memory_id: str
    processed_file_path: str
    duration: float
    file_size: int
    processed_messages_count: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

# === AUTHENTICATION HELPERS ===

def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode = {"user_id": user_id, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def generate_magic_link_token() -> str:
    return secrets.token_urlsafe(32)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[User]:
    if not credentials:
        return None
    
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            return None
        
        user = await db.users.find_one({"id": user_id})
        if not user:
            return None
            
        return User(**user)
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

async def get_current_user_required(user: User = Depends(get_current_user)) -> User:
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

def send_magic_link_email(email: str, token: str) -> bool:
    """Send magic link email (mock implementation)"""
    # In production, this would send a real email
    print(f"Magic link for {email}: http://localhost:3000/auth/verify?token={token}")
    return True

# === BASIC ROUTES ===

@api_router.get("/")
async def root():
    return {"message": "Forever Tapes API - Collaborative Audio Memories Platform"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# === AUTHENTICATION ROUTES ===

@api_router.post("/auth/register")
async def register_user(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    user = User(**user_data.dict())
    await db.users.insert_one(user.dict())
    
    # Generate access token
    access_token = create_access_token(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    }

@api_router.post("/auth/magic-link")
async def request_magic_link(request: MagicLinkRequest):
    """Request a magic link for authentication"""
    # Check if user exists, create if not
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Create user with email only
        user_obj = User(
            email=request.email,
            name=request.email.split('@')[0].title()  # Use email prefix as default name
        )
        await db.users.insert_one(user_obj.dict())
        user = user_obj.dict()
    
    # Generate magic link token
    token = generate_magic_link_token()
    expires = datetime.utcnow() + timedelta(hours=1)
    
    # Update user with magic link token
    await db.users.update_one(
        {"email": request.email},
        {"$set": {
            "magic_link_token": token,
            "magic_link_expires": expires
        }}
    )
    
    # Send magic link email
    send_magic_link_email(request.email, token)
    
    return {"message": "Magic link sent to your email"}

@api_router.post("/auth/verify-magic-link")
async def verify_magic_link(token: str):
    """Verify magic link token and authenticate user"""
    user = await db.users.find_one({
        "magic_link_token": token,
        "magic_link_expires": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired magic link")
    
    # Clear magic link token and mark as verified
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "magic_link_token": None,
            "magic_link_expires": None,
            "is_verified": True
        }}
    )
    
    # Generate access token
    access_token = create_access_token(user["id"])
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"]
        }
    }

@api_router.get("/auth/me")
async def get_current_user_info(user: User = Depends(get_current_user_required)):
    """Get current user information"""
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "phone": user.phone,
        "is_verified": user.is_verified
    }

# === USER ROUTES ===

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# === PODCARD ROUTES ===

@api_router.post("/podcards", response_model=PodCard)
async def create_podcard(podcard: PodCardCreate, user: User = Depends(get_current_user_required)):
    """Create a new PodCard (Audio Memory)"""
    # Create PodCard
    podcard_obj = PodCard(
        title=podcard.title,
        description=podcard.description,
        occasion=podcard.occasion,
        creator_id=user.id,
        creator_name=user.name,
        creator_email=user.email
    )
    
    await db.podcards.insert_one(podcard_obj.dict())
    return podcard_obj

@api_router.post("/podcards/free", response_model=PodCard)
async def create_free_podcard(podcard: PodCardCreate):
    """Create a new Free PodCard (Audio Memory) without authentication"""
    # Create PodCard with anonymous user info
    podcard_obj = PodCard(
        title=podcard.title,
        description=podcard.description,
        occasion=podcard.occasion,
        creator_id="anonymous",
        creator_name="Anonymous User",
        creator_email="anonymous@forever-tapes.com",
        is_public=True  # Free memories are always public
    )
    
    await db.podcards.insert_one(podcard_obj.dict())
    return podcard_obj

@api_router.get("/podcards", response_model=List[PodCard])
async def get_podcards(skip: int = 0, limit: int = 10, user: User = Depends(get_current_user)):
    """Get all PodCards (public ones + user's own)"""
    if user:
        # Authenticated user - show public podcards + their own
        podcards = await db.podcards.find({
            "$or": [
                {"is_public": True},
                {"creator_id": user.id}
            ]
        }).skip(skip).limit(limit).to_list(limit)
    else:
        # Anonymous user - show only public podcards
        podcards = await db.podcards.find({"is_public": True}).skip(skip).limit(limit).to_list(limit)
    
    return [PodCard(**podcard) for podcard in podcards]

@api_router.get("/podcards/my")
async def get_my_podcards(user: User = Depends(get_current_user_required)):
    """Get current user's podcards"""
    podcards = await db.podcards.find({"creator_id": user.id}).to_list(100)
    return [PodCard(**podcard) for podcard in podcards]

@api_router.get("/podcards/{podcard_id}", response_model=PodCard)
async def get_podcard(podcard_id: str):
    """Get PodCard by ID"""
    podcard = await db.podcards.find_one({"id": podcard_id})
    if not podcard:
        raise HTTPException(status_code=404, detail="PodCard not found")
    return PodCard(**podcard)

# === AUDIO UPLOAD ROUTES ===

@api_router.post("/podcards/{podcard_id}/audio")
async def upload_audio_message(
    podcard_id: str,
    contributor_name: str = Form(...),
    contributor_email: EmailStr = Form(...),  # Now required
    audio_file: UploadFile = File(...)
):
    """Upload an audio message to a PodCard"""
    
    # Check if PodCard exists
    podcard = await db.podcards.find_one({"id": podcard_id})
    if not podcard:
        raise HTTPException(status_code=404, detail="PodCard not found")
    
    # Validate file type
    if not audio_file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Save file
    file_extension = audio_file.filename.split('.')[-1] if '.' in audio_file.filename else 'wav'
    file_id = str(uuid.uuid4())
    file_path = UPLOADS_DIR / f"{file_id}.{file_extension}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)
    
    # Create AudioMessage
    audio_message = AudioMessage(
        contributor_name=contributor_name,
        contributor_email=contributor_email,
        file_path=str(file_path)
    )
    
    # Add to PodCard
    podcard_obj = PodCard(**podcard)
    podcard_obj.audio_messages.append(audio_message)
    podcard_obj.updated_at = datetime.utcnow()
    
    # Update in database
    await db.podcards.update_one(
        {"id": podcard_id},
        {"$set": podcard_obj.dict()}
    )
    
    return {
        "message": "Audio message uploaded successfully",
        "audio_message": audio_message,
        "podcard_id": podcard_id
    }

@api_router.get("/audio/{file_id}")
async def get_audio_file(file_id: str):
    """Serve audio file"""
    # Find file in uploads directory
    for file_path in UPLOADS_DIR.glob(f"{file_id}.*"):
        return FileResponse(file_path)
    
    raise HTTPException(status_code=404, detail="Audio file not found")

# === DEMO ROUTE ===

@api_router.get("/demo/audio")
async def get_demo_audio():
    """Get demo audio data"""
    return {
        "id": "demo",
        "title": "Demo Audio Memory - Sarah's Birthday",
        "description": "Listen to this sample birthday memory to hear how Forever Tapes works",
        "occasion": "demo",
        "creator_name": "Forever Tapes Team",
        "creator_id": "demo",
        "audio_messages": [
            {
                "id": "demo1",
                "contributor_name": "Mike",
                "contributor_email": "mike@example.com",
                "file_path": "/demo/mike-message.wav",
                "created_at": datetime.utcnow().isoformat(),
                "duration": 25
            },
            {
                "id": "demo2", 
                "contributor_name": "Emma",
                "contributor_email": "emma@example.com",
                "file_path": "/demo/emma-message.wav",
                "created_at": datetime.utcnow().isoformat(),
                "duration": 30
            },
            {
                "id": "demo3",
                "contributor_name": "David",
                "contributor_email": "david@example.com", 
                "file_path": "/demo/david-message.wav",
                "created_at": datetime.utcnow().isoformat(),
                "duration": 28
            }
        ],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_public": True
    }

# === TESTING & DEVELOPMENT ENDPOINTS ===

@api_router.post("/dev/create-test-data")
async def create_test_data():
    """Create comprehensive test data for development"""
    try:
        # Clear existing test data first
        await db.podcards.delete_many({"creator_id": "test-user"})
        
        test_memories = [
            {
                "id": "test-single-message",
                "title": "Single Message Test",
                "description": "Test memory with just one message",
                "occasion": "testing",
                "creator_id": "test-user",
                "creator_name": "Test User",
                "creator_email": "test@forever-tapes.com",
                "audio_messages": [
                    {
                        "id": "test-msg-1",
                        "contributor_name": "Alice",
                        "contributor_email": "alice@test.com",
                        "file_path": "/demo/mike-message.wav",  # Using demo audio
                        "created_at": datetime.utcnow(),
                        "duration": 25
                    }
                ],
                "is_public": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "test-multiple-messages",
                "title": "Multiple Messages Test",
                "description": "Test memory with several messages for audio player testing",
                "occasion": "birthday",
                "creator_id": "test-user",
                "creator_name": "Test User", 
                "creator_email": "test@forever-tapes.com",
                "audio_messages": [
                    {
                        "id": "test-msg-2",
                        "contributor_name": "Bob",
                        "contributor_email": "bob@test.com",
                        "file_path": "/demo/mike-message.wav",
                        "created_at": datetime.utcnow(),
                        "duration": 25
                    },
                    {
                        "id": "test-msg-3",
                        "contributor_name": "Carol",
                        "contributor_email": "carol@test.com", 
                        "file_path": "/demo/emma-message.wav",
                        "created_at": datetime.utcnow(),
                        "duration": 30
                    },
                    {
                        "id": "test-msg-4",
                        "contributor_name": "Dave",
                        "contributor_email": "dave@test.com",
                        "file_path": "/demo/david-message.wav",
                        "created_at": datetime.utcnow(),
                        "duration": 28
                    },
                    {
                        "id": "test-msg-5",
                        "contributor_name": "Eve",
                        "contributor_email": "eve@test.com",
                        "file_path": "/demo/mike-message.wav",
                        "created_at": datetime.utcnow(),
                        "duration": 22
                    }
                ],
                "is_public": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "test-empty-memory",
                "title": "Empty Memory Test", 
                "description": "Test memory with no messages to test empty state",
                "occasion": "celebration",
                "creator_id": "test-user",
                "creator_name": "Test User",
                "creator_email": "test@forever-tapes.com",
                "audio_messages": [],
                "is_public": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "test-free-memory",
                "title": "Free Memory Test",
                "description": "Test memory created through free tier",
                "occasion": "graduation",
                "creator_id": "anonymous",
                "creator_name": "Anonymous User",
                "creator_email": "anonymous@forever-tapes.com",
                "audio_messages": [
                    {
                        "id": "test-msg-6",
                        "contributor_name": "Frank",
                        "contributor_email": "frank@test.com",
                        "file_path": "/demo/emma-message.wav",
                        "created_at": datetime.utcnow(),
                        "duration": 30
                    },
                    {
                        "id": "test-msg-7", 
                        "contributor_name": "Grace",
                        "contributor_email": "grace@test.com",
                        "file_path": "/demo/david-message.wav",
                        "created_at": datetime.utcnow(),
                        "duration": 28
                    }
                ],
                "is_public": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        # Insert all test memories
        for memory in test_memories:
            await db.podcards.insert_one(memory)
        
        return {
            "message": "Test data created successfully",
            "memories_created": len(test_memories),
            "test_ids": [m["id"] for m in test_memories],
            "instructions": {
                "single_message": "Visit /listen/test-single-message",
                "multiple_messages": "Visit /listen/test-multiple-messages", 
                "empty_memory": "Visit /listen/test-empty-memory",
                "free_memory": "Visit /listen/test-free-memory",
                "contribute_test": "Visit /contribute/test-empty-memory to add messages"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create test data: {str(e)}")

@api_router.delete("/dev/clear-test-data")
async def clear_test_data():
    """Clear all test data"""
    try:
        # Delete test memories
        result = await db.podcards.delete_many({"creator_id": "test-user"})
        anonymous_result = await db.podcards.delete_many({"creator_id": "anonymous"})
        
        # Clear test audio processing jobs
        await db.audio_jobs.delete_many({"memory_id": {"$regex": "^test-"}})
        await db.processed_memories.delete_many({"memory_id": {"$regex": "^test-"}})
        
        return {
            "message": "Test data cleared successfully",
            "deleted_memories": result.deleted_count + anonymous_result.deleted_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear test data: {str(e)}")

@api_router.get("/dev/test-scenarios")
async def get_test_scenarios():
    """Get list of available test scenarios"""
    return {
        "scenarios": [
            {
                "name": "Single Message",
                "id": "test-single-message",
                "url": "/listen/test-single-message",
                "description": "Test basic audio playback with one message"
            },
            {
                "name": "Multiple Messages", 
                "id": "test-multiple-messages",
                "url": "/listen/test-multiple-messages",
                "description": "Test skip controls, message list, and multi-track playback"
            },
            {
                "name": "Empty Memory",
                "id": "test-empty-memory", 
                "url": "/listen/test-empty-memory",
                "description": "Test empty state UI and contribution flow"
            },
            {
                "name": "Free Memory",
                "id": "test-free-memory",
                "url": "/listen/test-free-memory", 
                "description": "Test free tier memory functionality"
            },
            {
                "name": "Contribute Test",
                "url": "/contribute/test-empty-memory",
                "description": "Test audio contribution to empty memory"
            },
            {
                "name": "Demo Memory",
                "id": "demo",
                "url": "/listen/demo",
                "description": "Original demo memory with sample data"
            }
        ],
        "setup_instructions": [
            "1. Call POST /api/dev/create-test-data to setup test memories",
            "2. Visit any test scenario URL to test functionality", 
            "3. Call DELETE /api/dev/clear-test-data to cleanup when done",
            "4. Repeat as needed during development"
        ],
        "audio_processing_test": {
            "instructions": "After creating test data, visit any multi-message memory and use POST /api/audio/process-memory to test audio processing",
            "example_payload": {
                "memory_id": "test-multiple-messages"
            }
        }
    }

@api_router.post("/dev/quick-reset")
async def quick_reset():
    """Quick reset - clear test data and recreate it"""
    try:
        # Clear existing test data
        await clear_test_data()
        
        # Create fresh test data
        result = await create_test_data()
        
        return {
            "message": "Quick reset completed successfully",
            "result": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quick reset failed: {str(e)}")

# === AUDIO PROCESSING ROUTES ===

@api_router.post("/audio/process-memory")
async def start_memory_processing(
    memory_id: str = Form(...),
    user: User = Depends(get_current_user)
):
    """Start processing all audio messages for a memory into a professional collage"""
    if not AUDIO_PROCESSING_AVAILABLE:
        raise HTTPException(status_code=503, detail="Audio processing service not available")
        
    try:
        # Get the memory/podcard
        podcard = await db.podcards.find_one({"id": memory_id})
        if not podcard:
            raise HTTPException(status_code=404, detail="Memory not found")
        
        podcard_obj = PodCard(**podcard)
        
        # Check if user has permission (owner or anonymous memory)
        if user and podcard_obj.creator_id != user.id and podcard_obj.creator_id != "anonymous":
            raise HTTPException(status_code=403, detail="Permission denied")
        
        # Check if there are audio messages to process
        if not podcard_obj.audio_messages:
            raise HTTPException(status_code=400, detail="No audio messages to process")
        
        # Prepare audio file paths and metadata
        audio_files = []
        metadata = []
        
        for msg in podcard_obj.audio_messages:
            if os.path.exists(msg.file_path):
                audio_files.append(msg.file_path)
                metadata.append({
                    "contributor_name": msg.contributor_name,
                    "contributor_email": msg.contributor_email,
                    "created_at": msg.created_at.isoformat()
                })
        
        if not audio_files:
            raise HTTPException(status_code=400, detail="No valid audio files found")
        
        # Start the processing task
        task = process_memory_audio.delay(
            memory_id=memory_id,
            audio_file_paths=audio_files,
            metadata=metadata
        )
        
        # Create processing job record
        job = AudioProcessingJob(
            memory_id=memory_id,
            task_id=task.id,
            status="queued"
        )
        await db.audio_jobs.insert_one(job.dict())
        
        return {
            "task_id": task.id,
            "status": "started",
            "message": f"Started processing {len(audio_files)} audio messages for memory {memory_id}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start processing: {str(e)}")

@api_router.get("/audio/status/{task_id}")
async def get_processing_status(task_id: str):
    """Get the status of an audio processing task"""
    try:
        # Get from database first
        job = await db.audio_jobs.find_one({"task_id": task_id})
        if not job:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Try to get live status from Celery if available
        if AUDIO_PROCESSING_AVAILABLE:
            try:
                result = celery_app.AsyncResult(task_id)
                
                # Update job status based on Celery status
                update_data = {}
                
                if result.status == 'PENDING':
                    update_data["status"] = "queued"
                    update_data["stage"] = "queued"
                elif result.status == 'PROGRESS':
                    update_data["status"] = "processing"
                    if result.info:
                        update_data["stage"] = result.info.get('stage')
                        update_data["progress"] = result.info
                elif result.status == 'SUCCESS':
                    update_data["status"] = "completed"
                    update_data["stage"] = "completed"
                    update_data["completed_at"] = datetime.utcnow()
                    if result.result and 'output_path' in result.result:
                        # Move file to processed directory
                        output_path = result.result['output_path']
                        if os.path.exists(output_path):
                            filename = f"memory_{job['memory_id']}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.mp3"
                            final_path = PROCESSED_DIR / filename
                            shutil.move(output_path, final_path)
                            update_data["output_file"] = str(final_path)
                            
                            # Create processed memory record
                            processed = ProcessedMemory(
                                memory_id=job['memory_id'],
                                processed_file_path=str(final_path),
                                duration=result.result.get('duration', 0),
                                file_size=result.result.get('file_size', 0),
                                processed_messages_count=result.result.get('processed_messages', 0)
                            )
                            await db.processed_memories.insert_one(processed.dict())
                elif result.status == 'FAILURE':
                    update_data["status"] = "failed"
                    update_data["error_message"] = str(result.info) if result.info else "Unknown error"
                
                # Update job in database
                if update_data:
                    update_data["updated_at"] = datetime.utcnow()
                    await db.audio_jobs.update_one(
                        {"task_id": task_id},
                        {"$set": update_data}
                    )
                    job.update(update_data)
                    
            except Exception as e:
                logger.warning(f"Could not get live Celery status: {e}")
        
        return {
            "task_id": task_id,
            "status": job.get("status", "unknown"),
            "stage": job.get("stage"),
            "progress": job.get("progress"),
            "error": job.get("error_message"),
            "output_file": job.get("output_file"),
            "created_at": job.get("created_at"),
            "updated_at": job.get("updated_at")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

@api_router.get("/audio/processed/{memory_id}")
async def get_processed_memory(memory_id: str, user: User = Depends(get_current_user)):
    """Get processed audio file for a memory"""
    try:
        # Check if memory exists
        podcard = await db.podcards.find_one({"id": memory_id})
        if not podcard:
            raise HTTPException(status_code=404, detail="Memory not found")
        
        podcard_obj = PodCard(**podcard)
        
        # Check permission (owner, anonymous memory, or public memory)
        if user and podcard_obj.creator_id != user.id and podcard_obj.creator_id != "anonymous" and not podcard_obj.is_public:
            raise HTTPException(status_code=403, detail="Permission denied")
        
        # Get processed memory
        processed = await db.processed_memories.find_one({"memory_id": memory_id})
        if not processed:
            raise HTTPException(status_code=404, detail="Processed audio not found")
        
        # Check if file exists
        if not os.path.exists(processed["processed_file_path"]):
            raise HTTPException(status_code=404, detail="Processed audio file not found")
        
        return FileResponse(
            processed["processed_file_path"],
            media_type="audio/mpeg",
            filename=f"memory_{memory_id}.mp3"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get processed audio: {str(e)}")

@api_router.post("/audio/enhance-single")
async def enhance_single_audio(audio_path: str, contributor_name: str):
    """Enhance a single audio message (called after upload)"""
    try:
        if not os.path.exists(audio_path):
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        if not AUDIO_PROCESSING_AVAILABLE:
            # Audio processing not available, just return success
            return {
                "task_id": "mock",
                "status": "completed",
                "message": f"Audio enhancement not available, using original file"
            }
        
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

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()