from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException, Form, Depends
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
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