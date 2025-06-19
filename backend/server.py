from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI(title="Forever Tapes API", description="Collaborative Audio Memories Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# === MODELS ===

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: str

class AudioMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contributor_name: str
    contributor_email: Optional[str] = None
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
    audio_messages: List[AudioMessage] = []
    background_music_path: Optional[str] = None
    is_public: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PodCardCreate(BaseModel):
    title: str
    description: str
    occasion: str
    creator_name: str
    creator_email: str

class ContributeAudioRequest(BaseModel):
    podcard_id: str
    contributor_name: str
    contributor_email: Optional[str] = None

# === BASIC ROUTES ===

@api_router.get("/")
async def root():
    return {"message": "Forever Tapes API - Collaborative Audio Memories Platform"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# === USER ROUTES ===

@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    """Create a new user"""
    user_dict = user.dict()
    user_obj = User(**user_dict)
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# === PODCARD ROUTES ===

@api_router.post("/podcards", response_model=PodCard)
async def create_podcard(podcard: PodCardCreate):
    """Create a new PodCard (Audio Memory)"""
    podcard_dict = podcard.dict()
    
    # Create or get user
    user = await db.users.find_one({"email": podcard.creator_email})
    if not user:
        user_obj = User(name=podcard.creator_name, email=podcard.creator_email)
        await db.users.insert_one(user_obj.dict())
        creator_id = user_obj.id
    else:
        creator_id = user["id"]
    
    # Create PodCard
    podcard_obj = PodCard(
        title=podcard.title,
        description=podcard.description,
        occasion=podcard.occasion,
        creator_id=creator_id,
        creator_name=podcard.creator_name
    )
    
    await db.podcards.insert_one(podcard_obj.dict())
    return podcard_obj

@api_router.get("/podcards", response_model=List[PodCard])
async def get_podcards(skip: int = 0, limit: int = 10):
    """Get all PodCards"""
    podcards = await db.podcards.find().skip(skip).limit(limit).to_list(limit)
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
    contributor_email: Optional[str] = Form(None),
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