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
    is_test_memory: bool = False  # New field for testing dashboard
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

async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[User]:
    """Get current user but don't require authentication"""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except:
        return None

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
@api_router.head("/audio/{file_id}")
async def get_audio_file(file_id: str):
    """Serve audio file"""
    # Check uploads directory first
    for file_path in UPLOADS_DIR.glob(f"{file_id}.*"):
        return FileResponse(file_path)
    
    # Check demo-audio directory for demo files by file ID
    demo_audio_dir = ROOT_DIR / "demo-audio"
    if demo_audio_dir.exists():
        for file_path in demo_audio_dir.glob(f"{file_id}.*"):
            return FileResponse(file_path)
    
    raise HTTPException(status_code=404, detail="Audio file not found")

@api_router.get("/demo-audio/{filename}")
@api_router.head("/demo-audio/{filename}")
async def get_demo_audio_file(filename: str):
    """Serve demo audio files directly by filename"""
    demo_audio_dir = ROOT_DIR / "demo-audio"
    file_path = demo_audio_dir / filename
    
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    
    raise HTTPException(status_code=404, detail="Demo audio file not found")

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
                "file_path": "/app/backend/demo-audio/mike-message.wav",
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
                "file_path": "/app/backend/demo-audio/david-message.wav",
                "created_at": datetime.utcnow().isoformat(),
                "duration": 28
            }
        ],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_public": True
    }

# === MOCK VOICE GENERATION SYSTEM ===

import random

class MockVoiceGenerator:
    """Mock AI Voice Generation System for Testing"""
    
    def __init__(self):
        self.personas = [
            {
                "id": "alice_johnson",
                "name": "Alice Johnson",
                "age": 28,
                "gender": "female",
                "accent": "American Midwest",
                "personality": "warm, enthusiastic",
                "audio_file": "emma-message.wav",
                "email_domain": "gmail.com"
            },
            {
                "id": "marcus_chen",
                "name": "Marcus Chen",
                "age": 35,
                "gender": "male",
                "accent": "Canadian",
                "personality": "thoughtful, sincere",
                "audio_file": "mike-message.wav",
                "email_domain": "outlook.com"
            },
            {
                "id": "sofia_rodriguez",
                "name": "Sofia Rodriguez",
                "age": 24,
                "gender": "female",
                "accent": "Spanish-American",
                "personality": "energetic, caring",
                "audio_file": "emma-message.mp3",
                "email_domain": "yahoo.com"
            },
            {
                "id": "david_thompson",
                "name": "David Thompson",
                "age": 42,
                "gender": "male",
                "accent": "British",
                "personality": "wise, humorous",
                "audio_file": "david-message.wav",
                "email_domain": "gmail.com"
            },
            {
                "id": "priya_patel",
                "name": "Priya Patel",
                "age": 31,
                "gender": "female",
                "accent": "Indian-British",
                "personality": "inspiring, genuine",
                "audio_file": "emma-message.wav",
                "email_domain": "gmail.com"
            },
            {
                "id": "james_murphy",
                "name": "James Murphy",
                "age": 26,
                "gender": "male",
                "accent": "Irish",
                "personality": "funny, loyal",
                "audio_file": "mike-message.wav",
                "email_domain": "icloud.com"
            },
            {
                "id": "emily_wang",
                "name": "Emily Wang",
                "age": 29,
                "gender": "female",
                "accent": "Australian",
                "personality": "adventurous, supportive",
                "audio_file": "emma-message.mp3",
                "email_domain": "gmail.com"
            },
            {
                "id": "carlos_santos",
                "name": "Carlos Santos",
                "age": 38,
                "gender": "male",
                "accent": "Brazilian-Portuguese",
                "personality": "passionate, family-oriented",
                "audio_file": "david-message.mp3",
                "email_domain": "hotmail.com"
            }
        ]
        
        self.message_templates = {
            "birthday": [
                "Happy birthday, {name}! 🎉 Hope your special day is filled with joy, laughter, and all your favorite things. You deserve the absolute best!",
                "Wishing you the happiest of birthdays, {name}! 🎂 May this new year of life bring you incredible adventures and beautiful memories.",
                "Happy birthday to an amazing person! {name}, you bring so much light into everyone's life. Have a wonderful celebration! 🎈",
                "It's your special day, {name}! 🎁 Hope you're surrounded by love, good food, and all the people who care about you most.",
                "Happy birthday, {name}! 🌟 Another year of being awesome! May all your birthday wishes come true this year."
            ],
            "graduation": [
                "Congratulations on your graduation, {name}! 🎓 Your hard work and dedication have truly paid off. So proud of everything you've accomplished!",
                "What an incredible achievement, {name}! 🎓 Graduation is just the beginning of all the amazing things you'll do. The future is so bright for you!",
                "Way to go, graduate! {name}, you've shown such determination and resilience. This is your moment to shine! 🌟",
                "Congratulations, {name}! 🎓 Watching you reach this milestone fills my heart with pride. You're going to do incredible things!",
                "So proud of you, {name}! 🎓 Your graduation is a testament to your strength and perseverance. Here's to your bright future!"
            ],
            "anniversary": [
                "Happy anniversary, {name}! 💕 What a beautiful journey you've been on together. Here's to many more years of love and happiness!",
                "Congratulations on your anniversary, {name}! 💖 Your love story continues to inspire everyone around you. Wishing you endless joy together!",
                "Happy anniversary! {name}, seeing the love you share is truly heartwarming. May your bond grow stronger with each passing year! 💕",
                "What a special milestone, {name}! 💖 Your anniversary is a celebration of the beautiful love you've built together. Cheers to you both!",
                "Happy anniversary, {name}! 💕 Your relationship is such a beautiful example of true love. Wishing you continued happiness together!"
            ],
            "celebration": [
                "Congratulations, {name}! 🎉 This is such exciting news! You've worked so hard for this moment and it's wonderful to see it pay off!",
                "Way to go, {name}! 🌟 Your success is so well-deserved. I'm thrilled to celebrate this special achievement with you!",
                "Amazing news, {name}! 🎊 Your dedication and talent have led to this incredible moment. So happy to share in your joy!",
                "Congratulations on this fantastic achievement, {name}! 🎈 You should be so proud of yourself. This is just the beginning!",
                "What wonderful news, {name}! 🎉 Your hard work and positive spirit have brought you to this exciting moment. Celebrate big!"
            ],
            "wedding": [
                "Congratulations on your wedding, {name}! 💒 Wishing you a lifetime filled with love, laughter, and beautiful moments together!",
                "What a beautiful wedding day, {name}! 💕 May your marriage be blessed with endless love, joy, and wonderful adventures together!",
                "Happy wedding day, {name}! 💖 Today marks the beginning of your greatest adventure together. Wishing you both all the happiness in the world!",
                "Congratulations, {name}! 💒 Your wedding day is just the start of a beautiful love story. May every day be filled with love and laughter!",
                "Best wishes on your wedding, {name}! 💕 May your marriage be everything you've dreamed of and more. So happy for you both!"
            ]
        }
    
    def get_random_persona(self, exclude_ids=None):
        """Get a random persona, optionally excluding certain IDs"""
        available_personas = self.personas
        if exclude_ids:
            available_personas = [p for p in self.personas if p["id"] not in exclude_ids]
        return random.choice(available_personas)
    
    def generate_message(self, occasion: str, recipient_name: str, persona_id: str = None):
        """Generate a realistic message for the given occasion"""
        if persona_id:
            persona = next((p for p in self.personas if p["id"] == persona_id), None)
        else:
            persona = self.get_random_persona()
        
        if not persona:
            persona = self.get_random_persona()
        
        templates = self.message_templates.get(occasion, self.message_templates["celebration"])
        message_template = random.choice(templates)
        
        # Add personality-based modifications
        message = message_template.format(name=recipient_name)
        
        if persona["personality"] == "funny, loyal":
            message += " Can't wait to celebrate with you properly! 😄"
        elif persona["personality"] == "wise, humorous":
            message += " Remember, age is just a number... a really big number in your case! 😉"
        elif persona["personality"] == "energetic, caring":
            message += " Sending you the biggest virtual hug! 🤗"
        elif persona["personality"] == "passionate, family-oriented":
            message += " Family celebrations are the best celebrations! ❤️"
        
        return {
            "message": message,
            "persona": persona,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def create_test_audio_message(self, message_data: dict, recipient_name: str):
        """Create an AudioMessage object from generated message data"""
        persona = message_data["persona"]
        email = f"{persona['name'].lower().replace(' ', '.')}@{persona['email_domain']}"
        
        # Use the file ID format expected by the audio endpoint (without extension)
        file_id = persona['audio_file'].split('.')[0]  # Remove extension for file ID
        
        return AudioMessage(
            contributor_name=persona["name"],
            contributor_email=email,
            file_path=file_id,  # Store just the file ID
            duration=random.uniform(20, 35)  # Realistic message duration
        )

# Initialize the mock voice generator
mock_voice_generator = MockVoiceGenerator()

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
                        "file_path": "mike-message",
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
                        "file_path": "/api/demo-audio/mike-message.wav",
                        "created_at": datetime.utcnow(),
                        "duration": 25
                    },
                    {
                        "id": "test-msg-3",
                        "contributor_name": "Carol",
                        "contributor_email": "carol@test.com", 
                        "file_path": "/api/demo-audio/emma-message.wav",
                        "created_at": datetime.utcnow(),
                        "duration": 30
                    },
                    {
                        "id": "test-msg-4",
                        "contributor_name": "Dave",
                        "contributor_email": "dave@test.com",
                        "file_path": "/api/demo-audio/david-message.wav",
                        "created_at": datetime.utcnow(),
                        "duration": 28
                    },
                    {
                        "id": "test-msg-5",
                        "contributor_name": "Eve",
                        "contributor_email": "eve@test.com",
                        "file_path": "/api/demo-audio/mike-message.wav",
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
                        "file_path": "/api/demo-audio/emma-message.wav",
                        "created_at": datetime.utcnow(),
                        "duration": 30
                    },
                    {
                        "id": "test-msg-7", 
                        "contributor_name": "Grace",
                        "contributor_email": "grace@test.com",
                        "file_path": "/api/demo-audio/david-message.wav",
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

# === MOCK AI VOICE GENERATION ENDPOINTS ===

@api_router.get("/voice/personas")
async def get_voice_personas():
    """Get all available mock voice personas"""
    return {
        "personas": mock_voice_generator.personas,
        "total_count": len(mock_voice_generator.personas),
        "message": "Mock AI Voice Generation System - Free testing personas"
    }

@api_router.post("/voice/generate-message")
async def generate_voice_message(
    occasion: str = Form(...),
    recipient_name: str = Form(...),
    persona_id: str = Form(None)
):
    """Generate a realistic voice message for testing"""
    try:
        message_data = mock_voice_generator.generate_message(
            occasion=occasion,
            recipient_name=recipient_name,
            persona_id=persona_id
        )
        
        return {
            "success": True,
            "message_content": message_data["message"],
            "persona": message_data["persona"],
            "generated_at": message_data["generated_at"],
            "audio_file": message_data["persona"]["audio_file"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate message: {str(e)}")

@api_router.post("/voice/create-ai-memory")
async def create_ai_generated_memory(
    title: str = Form(...),
    occasion: str = Form(...),
    recipient_name: str = Form(...),
    num_messages: int = Form(default=5),
    user: User = Depends(get_current_user_optional)
):
    """Create a test memory with AI-generated voice messages"""
    try:
        # Validate num_messages
        if num_messages < 1 or num_messages > 10:
            raise HTTPException(status_code=400, detail="Number of messages must be between 1 and 10")
        
        # Create the base memory
        description = f"AI-generated test memory with {num_messages} diverse voice messages for {occasion}"
        podcard_obj = PodCard(
            title=title,
            description=description,
            occasion=occasion,
            creator_id=user.id if user else "ai-test-user",
            creator_name=user.name if user else "AI Test User",
            creator_email=user.email if user else "ai-test@forever-tapes.com",
            audio_messages=[],
            is_public=True,
            is_test_memory=True
        )
        
        # Generate diverse voice messages
        used_persona_ids = []
        for i in range(num_messages):
            # Get a unique persona for variety
            persona = mock_voice_generator.get_random_persona(exclude_ids=used_persona_ids)
            used_persona_ids.append(persona["id"])
            
            # Generate message content
            message_data = mock_voice_generator.generate_message(
                occasion=occasion,
                recipient_name=recipient_name,
                persona_id=persona["id"]
            )
            
            # Create audio message
            audio_message = mock_voice_generator.create_test_audio_message(
                message_data, recipient_name
            )
            
            podcard_obj.audio_messages.append(audio_message)
        
        # Save to database
        await db.podcards.insert_one(podcard_obj.dict())
        
        return {
            "success": True,
            "memory": podcard_obj.dict(),
            "generated_messages": len(podcard_obj.audio_messages),
            "personas_used": [msg.contributor_name for msg in podcard_obj.audio_messages],
            "listen_url": f"/listen/{podcard_obj.id}",
            "message": f"Created AI-generated test memory with {num_messages} diverse voice messages"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create AI memory: {str(e)}")

@api_router.post("/voice/bulk-generate-scenarios")
async def bulk_generate_test_scenarios(
    recipient_name: str = Form(default="Sarah"),
    user: User = Depends(get_current_user_optional)
):
    """Generate a complete set of test scenarios with AI voices"""
    try:
        scenarios = [
            {"title": f"{recipient_name}'s Birthday Celebration", "occasion": "birthday", "messages": 6},
            {"title": f"{recipient_name}'s Graduation Party", "occasion": "graduation", "messages": 4},
            {"title": f"{recipient_name}'s Wedding Wishes", "occasion": "wedding", "messages": 8},
            {"title": f"{recipient_name}'s Anniversary", "occasion": "anniversary", "messages": 3},
            {"title": f"Celebrating {recipient_name}", "occasion": "celebration", "messages": 5}
        ]
        
        created_memories = []
        
        for scenario in scenarios:
            # Create memory with AI-generated messages
            description = f"AI-generated test scenario: {scenario['messages']} diverse voice messages"
            podcard_obj = PodCard(
                title=scenario["title"],
                description=description,
                occasion=scenario["occasion"],
                creator_id=user.id if user else "ai-bulk-test",
                creator_name=user.name if user else "AI Bulk Test",
                creator_email=user.email if user else "ai-bulk@forever-tapes.com",
                audio_messages=[],
                is_public=True,
                is_test_memory=True
            )
            
            # Generate diverse messages
            used_persona_ids = []
            for i in range(scenario["messages"]):
                persona = mock_voice_generator.get_random_persona(exclude_ids=used_persona_ids)
                used_persona_ids.append(persona["id"])
                
                message_data = mock_voice_generator.generate_message(
                    occasion=scenario["occasion"],
                    recipient_name=recipient_name,
                    persona_id=persona["id"]
                )
                
                audio_message = mock_voice_generator.create_test_audio_message(
                    message_data, recipient_name
                )
                
                podcard_obj.audio_messages.append(audio_message)
            
            # Save to database
            await db.podcards.insert_one(podcard_obj.dict())
            created_memories.append({
                "id": podcard_obj.id,
                "title": podcard_obj.title,
                "occasion": podcard_obj.occasion,
                "messages": len(podcard_obj.audio_messages),
                "url": f"/listen/{podcard_obj.id}"
            })
        
        return {
            "success": True,
            "scenarios_created": len(created_memories),
            "recipient_name": recipient_name,
            "memories": created_memories,
            "message": f"Created {len(created_memories)} AI-generated test scenarios for {recipient_name}",
            "total_messages": sum(len(memory["messages"]) for memory in created_memories)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to bulk generate scenarios: {str(e)}")

@api_router.delete("/voice/clear-ai-memories")
async def clear_ai_generated_memories(user: User = Depends(get_current_user_optional)):
    """Clear all AI-generated test memories"""
    try:
        # Delete AI-generated memories
        ai_creators = ["ai-test-user", "ai-bulk-test"]
        if user:
            query = {
                "$or": [
                    {"creator_id": {"$in": ai_creators}},
                    {"creator_id": user.id, "is_test_memory": True}
                ]
            }
        else:
            query = {"creator_id": {"$in": ai_creators}}
        
        result = await db.podcards.delete_many(query)
        
        return {
            "success": True,
            "deleted_count": result.deleted_count,
            "message": f"Cleared {result.deleted_count} AI-generated test memories"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear AI memories: {str(e)}")

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

# === TESTING DASHBOARD ROUTES ===

@api_router.get("/testing/memories")
async def get_test_memories(user: User = Depends(get_current_user_optional)):
    """Get all test memories for the current user"""
    try:
        # Get test memories for the user (or all if user is None for anonymous testing)
        query = {"is_test_memory": True}
        if user:
            query["creator_id"] = user.id
        
        cursor = db.podcards.find(query).sort("created_at", -1)
        memories = await cursor.to_list(length=100)
        
        # Convert to PodCard objects for validation
        test_memories = []
        for memory in memories:
            try:
                podcard = PodCard(**memory)
                test_memories.append(podcard.dict())
            except Exception as e:
                logger.warning(f"Invalid memory format: {e}")
                continue
        
        return {
            "test_memories": test_memories,
            "count": len(test_memories)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get test memories: {str(e)}")

@api_router.post("/testing/create-template")
async def create_test_template(
    template_type: str = Form(...),
    user: User = Depends(get_current_user_optional)
):
    """Create a test memory from predefined templates"""
    try:
        templates = {
            "empty": {
                "title": "Test Empty Memory",
                "description": "A test memory with no messages - perfect for testing contribution flow",
                "occasion": "testing",
                "audio_messages": []
            },
            "single": {
                "title": "Test Single Message",
                "description": "A test memory with one message - test basic playback",
                "occasion": "birthday",
                "audio_messages": [
                    {
                        "id": str(uuid.uuid4()),
                        "contributor_name": "Test Contributor",
                        "contributor_email": "test@example.com",
                        "file_path": "/api/demo-audio/mike-message.wav",
                        "duration": 25,
                        "created_at": datetime.utcnow()
                    }
                ]
            },
            "multiple": {
                "title": "Test Multiple Messages",
                "description": "A test memory with several messages - test skip controls and playlist",
                "occasion": "celebration",
                "audio_messages": [
                    {
                        "id": str(uuid.uuid4()),
                        "contributor_name": "Alice",
                        "contributor_email": "alice@example.com",
                        "file_path": "/api/demo-audio/mike-message.wav",
                        "duration": 25,
                        "created_at": datetime.utcnow()
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "contributor_name": "Bob",
                        "contributor_email": "bob@example.com",
                        "file_path": "/api/demo-audio/emma-message.wav",
                        "duration": 30,
                        "created_at": datetime.utcnow()
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "contributor_name": "Carol",
                        "contributor_email": "carol@example.com",
                        "file_path": "/api/demo-audio/david-message.wav",
                        "duration": 28,
                        "created_at": datetime.utcnow()
                    }
                ]
            }
        }
        
        if template_type not in templates:
            raise HTTPException(status_code=400, detail="Invalid template type")
        
        template = templates[template_type]
        
        # Create the test memory
        podcard_obj = PodCard(
            title=template["title"],
            description=template["description"],
            occasion=template["occasion"],
            creator_id=user.id if user else "test-user",
            creator_name=user.name if user else "Test User",
            creator_email=user.email if user else "test@forever-tapes.com",
            audio_messages=[AudioMessage(**msg) for msg in template["audio_messages"]],
            is_public=True,
            is_test_memory=True  # Mark as test memory
        )
        
        await db.podcards.insert_one(podcard_obj.dict())
        
        return {
            "message": "Test memory created successfully",
            "memory": podcard_obj.dict(),
            "template_type": template_type
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create test template: {str(e)}")

@api_router.delete("/testing/clear-all")
async def clear_all_test_memories(user: User = Depends(get_current_user_optional)):
    """Clear all test memories for the current user"""
    try:
        # Delete test memories for the user
        query = {"is_test_memory": True}
        if user:
            query["creator_id"] = user.id
        else:
            # For anonymous users, clear test-user and anonymous memories
            query["creator_id"] = {"$in": ["test-user", "anonymous"]}
        
        result = await db.podcards.delete_many(query)
        
        # Also clear any associated processing jobs
        if result.deleted_count > 0:
            await db.audio_jobs.delete_many({"memory_id": {"$regex": "^test-"}})
            await db.processed_memories.delete_many({"memory_id": {"$regex": "^test-"}})
        
        return {
            "message": "All test memories cleared successfully",
            "deleted_count": result.deleted_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear test memories: {str(e)}")

# === AUDIO PROCESSING ROUTES ===

@api_router.post("/audio/process-memory")
async def start_memory_processing(
    memory_id: str = Form(...),
    user: User = Depends(get_current_user_optional)
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
        
        # Check permission (owner, anonymous memory, or public memory)
        if user and podcard_obj.creator_id != user.id and podcard_obj.creator_id != "anonymous" and not podcard_obj.is_public:
            raise HTTPException(status_code=403, detail="Permission denied")
        elif not user and podcard_obj.creator_id != "anonymous" and not podcard_obj.is_public:
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
async def get_processed_memory(memory_id: str, user: User = Depends(get_current_user_optional)):
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
        elif not user and podcard_obj.creator_id != "anonymous" and not podcard_obj.is_public:
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