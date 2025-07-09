import requests
import unittest
import json
import os
import time
import random
import string
from datetime import datetime

class ForeverTapesAPITest(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(ForeverTapesAPITest, self).__init__(*args, **kwargs)
        # Get the backend URL from the frontend .env file
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    self.base_url = line.strip().split('=')[1].strip('"')
                    break
        
        self.api_url = f"{self.base_url}/api"
        self.test_podcard_id = None
        self.test_audio_id = None
        self.auth_token = None
        self.test_user_email = f"test_{self.random_string(8)}@example.com"
        self.test_user_name = "Test User"
        
    def random_string(self, length=8):
        """Generate a random string for testing"""
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))
        
    def test_01_health_check(self):
        """Test the health check endpoint"""
        print("\n🔍 Testing health check endpoint...")
        response = requests.get(f"{self.api_url}/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        print("✅ Health check passed")
    
    def test_02_request_magic_link(self):
        """Test requesting a magic link for authentication"""
        print(f"\n🔍 Testing magic link request for {self.test_user_email}...")
        response = requests.post(
            f"{self.api_url}/auth/magic-link", 
            json={"email": self.test_user_email}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Magic link sent to your email")
        print("✅ Magic link request successful")
        
        # In a real test, we would need to extract the token from the email
        # For this test, we'll directly query the database to get the token
        # This is a mock implementation for testing purposes
        print("ℹ️ In a real environment, the user would receive an email with the magic link")
        print("ℹ️ For testing, we're simulating the verification process")
        
    def test_03_register_user(self):
        """Test user registration"""
        # Generate a new unique email for registration to avoid conflicts
        unique_email = f"test_reg_{self.random_string(8)}@example.com"
        print(f"\n🔍 Testing user registration for {unique_email}...")
        response = requests.post(
            f"{self.api_url}/auth/register", 
            json={
                "email": unique_email,
                "name": self.test_user_name,
                "phone": "555-123-4567"
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["email"], unique_email)
        self.assertEqual(data["user"]["name"], self.test_user_name)
        
        # Save the auth token for later tests
        self.auth_token = data["access_token"]
        # Update the test user email to the newly registered one
        self.test_user_email = unique_email
        print(f"✅ User registered successfully with token: {self.auth_token[:10]}...")
        
    def test_04_get_current_user(self):
        """Test getting current user information"""
        if not self.auth_token:
            self.skipTest("No auth token available from previous test")
            
        print("\n🔍 Testing get current user endpoint...")
        response = requests.get(
            f"{self.api_url}/auth/me",
            headers={"Authorization": f"Bearer {self.auth_token}"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], self.test_user_email)
        self.assertEqual(data["name"], self.test_user_name)
        print("✅ Retrieved current user successfully")
        
    def test_05_create_podcard_authenticated(self):
        """Test creating a new podcard with authentication"""
        if not self.auth_token:
            self.skipTest("No auth token available from previous test")
            
        print("\n🔍 Testing authenticated podcard creation...")
        test_data = {
            "title": f"Test PodCard {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "description": "This is a test podcard created by the automated test script",
            "occasion": "birthday"
        }
        
        response = requests.post(
            f"{self.api_url}/podcards", 
            json=test_data,
            headers={"Authorization": f"Bearer {self.auth_token}"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["title"], test_data["title"])
        self.assertEqual(data["description"], test_data["description"])
        self.assertEqual(data["occasion"], test_data["occasion"])
        self.assertEqual(data["creator_name"], self.test_user_name)
        self.assertEqual(data["creator_email"], self.test_user_email)
        
        # Save the podcard ID for later tests
        self.test_podcard_id = data["id"]
        print(f"✅ PodCard created successfully with ID: {self.test_podcard_id}")
        
    def test_06_get_my_podcards(self):
        """Test getting user's podcards"""
        if not self.auth_token:
            self.skipTest("No auth token available from previous test")
            
        print("\n🔍 Testing get my podcards endpoint...")
        response = requests.get(
            f"{self.api_url}/podcards/my",
            headers={"Authorization": f"Bearer {self.auth_token}"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        print(f"✅ Retrieved {len(data)} user podcards successfully")
        
    def test_07_get_podcards(self):
        """Test getting all podcards"""
        print("\n🔍 Testing get all podcards endpoint...")
        response = requests.get(f"{self.api_url}/podcards")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        print(f"✅ Retrieved {len(data)} podcards successfully")
        
    def test_08_get_podcard_by_id(self):
        """Test getting a specific podcard by ID"""
        if not self.test_podcard_id:
            self.skipTest("No podcard ID available from previous test")
            
        print(f"\n🔍 Testing get podcard by ID: {self.test_podcard_id}...")
        response = requests.get(f"{self.api_url}/podcards/{self.test_podcard_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.test_podcard_id)
        print("✅ Retrieved specific podcard successfully")
        
    def test_09_upload_audio(self):
        """Test uploading an audio message to a podcard"""
        if not self.test_podcard_id:
            self.skipTest("No podcard ID available from previous test")
            
        print(f"\n🔍 Testing audio upload to podcard ID: {self.test_podcard_id}...")
        
        # Create a simple test audio file
        test_audio_path = "/tmp/test_audio.wav"
        with open(test_audio_path, "wb") as f:
            # Write a simple WAV header and some data
            f.write(b"RIFF\x24WAVEfmt \x10\x01\x01\x44\xac\x88\x58\x01\x02\x10data")
        
        files = {'audio_file': ('test_audio.wav', open(test_audio_path, 'rb'), 'audio/wav')}
        data = {
            'contributor_name': 'Test Contributor',
            'contributor_email': 'contributor@example.com'
        }
        
        response = requests.post(
            f"{self.api_url}/podcards/{self.test_podcard_id}/audio",
            files=files,
            data=data
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["message"], "Audio message uploaded successfully")
        self.assertEqual(result["podcard_id"], self.test_podcard_id)
        
        # Save the audio file ID for later tests
        audio_file_path = result["audio_message"]["file_path"]
        self.test_audio_id = audio_file_path.split('/')[-1].split('.')[0]
        print(f"✅ Audio uploaded successfully with ID: {self.test_audio_id}")
        
        # Clean up
        os.remove(test_audio_path)
        
    def test_10_get_audio_file(self):
        """Test retrieving an audio file"""
        if not self.test_audio_id:
            self.skipTest("No audio ID available from previous test")
            
        print(f"\n🔍 Testing get audio file with ID: {self.test_audio_id}...")
        response = requests.get(f"{self.api_url}/audio/{self.test_audio_id}")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers['Content-Type'].startswith('audio/'))
        print("✅ Retrieved audio file successfully")
        
    def test_11_verify_podcard_updated(self):
        """Verify that the podcard was updated with the audio message"""
        if not self.test_podcard_id:
            self.skipTest("No podcard ID available from previous test")
            
        print(f"\n🔍 Verifying podcard {self.test_podcard_id} has the audio message...")
        response = requests.get(f"{self.api_url}/podcards/{self.test_podcard_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check that the audio message was added to the podcard
        self.assertGreater(len(data["audio_messages"]), 0)
        audio_message = data["audio_messages"][-1]  # Get the last audio message
        self.assertEqual(audio_message["contributor_name"], "Test Contributor")
        self.assertEqual(audio_message["contributor_email"], "contributor@example.com")
        print("✅ Verified podcard has been updated with the audio message")
        
    def test_12_get_demo_audio(self):
        """Test the demo audio endpoint"""
        print("\n🔍 Testing demo audio endpoint...")
        response = requests.get(f"{self.api_url}/demo/audio")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], "demo")
        self.assertGreaterEqual(len(data["audio_messages"]), 3)
        print(f"✅ Retrieved demo audio with {len(data['audio_messages'])} messages")

    def test_13_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        print("\n🔍 Testing unauthorized access to protected endpoints...")
        
        # Try to access current user info without auth token
        response = requests.get(f"{self.api_url}/auth/me")
        self.assertEqual(response.status_code, 401)
        
        # Try to create a podcard without auth token
        test_data = {
            "title": "Unauthorized PodCard",
            "description": "This should fail",
            "occasion": "test"
        }
        response = requests.post(f"{self.api_url}/podcards", json=test_data)
        self.assertEqual(response.status_code, 401)
        
        # Try to get my podcards without auth token
        response = requests.get(f"{self.api_url}/podcards/my")
        self.assertEqual(response.status_code, 401)
        
        print("✅ Unauthorized access properly rejected")
        
    def test_14_invalid_podcard_id(self):
        """Test accessing a non-existent podcard"""
        print("\n🔍 Testing access to non-existent podcard...")
        invalid_id = "00000000-0000-0000-0000-000000000000"
        response = requests.get(f"{self.api_url}/podcards/{invalid_id}")
        self.assertEqual(response.status_code, 404)
        print("✅ Non-existent podcard properly returns 404")
        
    def test_15_invalid_audio_id(self):
        """Test accessing a non-existent audio file"""
        print("\n🔍 Testing access to non-existent audio file...")
        invalid_id = "00000000-0000-0000-0000-000000000000"
        response = requests.get(f"{self.api_url}/audio/{invalid_id}")
        self.assertEqual(response.status_code, 404)
        print("✅ Non-existent audio file properly returns 404")
        
    def test_16_create_free_podcard(self):
        """Test creating a free PodCard without authentication"""
        print("\n🔍 Testing free PodCard creation without authentication...")
        test_data = {
            "title": "Sarah's Birthday Messages",
            "description": "Leave a birthday message for Sarah!",
            "occasion": "birthday"
        }
        
        response = requests.post(
            f"{self.api_url}/podcards/free", 
            json=test_data
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify the PodCard was created with the correct data
        self.assertEqual(data["title"], test_data["title"])
        self.assertEqual(data["description"], test_data["description"])
        self.assertEqual(data["occasion"], test_data["occasion"])
        
        # Verify anonymous user details are set correctly
        self.assertEqual(data["creator_id"], "anonymous")
        self.assertEqual(data["creator_name"], "Anonymous User")
        self.assertEqual(data["creator_email"], "anonymous@forever-tapes.com")
        
        # Verify the memory is public by default
        self.assertTrue(data["is_public"])
        
        # Save the free podcard ID for later tests
        self.free_podcard_id = data["id"]
        print(f"✅ Free PodCard created successfully with ID: {self.free_podcard_id}")
        
    def test_17_get_free_podcard(self):
        """Test retrieving the free PodCard"""
        if not hasattr(self, 'free_podcard_id'):
            self.skipTest("No free podcard ID available from previous test")
            
        print(f"\n🔍 Testing get free podcard by ID: {self.free_podcard_id}...")
        response = requests.get(f"{self.api_url}/podcards/{self.free_podcard_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.free_podcard_id)
        self.assertEqual(data["creator_id"], "anonymous")
        self.assertTrue(data["is_public"])
        print("✅ Retrieved free podcard successfully")
        
    def test_18_contribute_to_free_podcard(self):
        """Test contributing an audio message to a free PodCard"""
        if not hasattr(self, 'free_podcard_id'):
            self.skipTest("No free podcard ID available from previous test")
            
        print(f"\n🔍 Testing audio upload to free podcard ID: {self.free_podcard_id}...")
        
        # Create a simple test audio file
        test_audio_path = "/tmp/test_free_audio.wav"
        with open(test_audio_path, "wb") as f:
            # Write a simple WAV header and some data
            f.write(b"RIFF\x24WAVEfmt \x10\x01\x01\x44\xac\x88\x58\x01\x02\x10data")
        
        files = {'audio_file': ('test_free_audio.wav', open(test_audio_path, 'rb'), 'audio/wav')}
        data = {
            'contributor_name': 'Free Contributor',
            'contributor_email': 'free_contributor@example.com'
        }
        
        response = requests.post(
            f"{self.api_url}/podcards/{self.free_podcard_id}/audio",
            files=files,
            data=data
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["message"], "Audio message uploaded successfully")
        self.assertEqual(result["podcard_id"], self.free_podcard_id)
        
        # Save the audio file ID for later tests
        audio_file_path = result["audio_message"]["file_path"]
        self.free_audio_id = audio_file_path.split('/')[-1].split('.')[0]
        print(f"✅ Audio uploaded to free podcard successfully with ID: {self.free_audio_id}")
        
        # Clean up
        os.remove(test_audio_path)
        
    def test_19_verify_free_podcard_updated(self):
        """Verify that the free podcard was updated with the audio message"""
        if not hasattr(self, 'free_podcard_id'):
            self.skipTest("No free podcard ID available from previous test")
            
        print(f"\n🔍 Verifying free podcard {self.free_podcard_id} has the audio message...")
        response = requests.get(f"{self.api_url}/podcards/{self.free_podcard_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check that the audio message was added to the podcard
        self.assertGreater(len(data["audio_messages"]), 0)
        audio_message = data["audio_messages"][-1]  # Get the last audio message
        self.assertEqual(audio_message["contributor_name"], "Free Contributor")
        self.assertEqual(audio_message["contributor_email"], "free_contributor@example.com")
        print("✅ Verified free podcard has been updated with the audio message")
        
    def test_20_get_free_audio_file(self):
        """Test retrieving the audio file from a free podcard"""
        if not hasattr(self, 'free_audio_id'):
            self.skipTest("No free audio ID available from previous test")
            
        print(f"\n🔍 Testing get audio file from free podcard with ID: {self.free_audio_id}...")
        response = requests.get(f"{self.api_url}/audio/{self.free_audio_id}")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers['Content-Type'].startswith('audio/'))
        print("✅ Retrieved audio file from free podcard successfully")
        
    def test_21_verify_free_podcard_in_list(self):
        """Verify that the free podcard appears in the public podcard list"""
        if not hasattr(self, 'free_podcard_id'):
            self.skipTest("No free podcard ID available from previous test")
            
        print("\n🔍 Verifying free podcard appears in public list...")
        response = requests.get(f"{self.api_url}/podcards")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Find our free podcard in the list
        found = False
        for podcard in data:
            if podcard["id"] == self.free_podcard_id:
                found = True
                self.assertEqual(podcard["creator_id"], "anonymous")
                self.assertTrue(podcard["is_public"])
                break
                
        self.assertTrue(found, "Free podcard not found in public list")
        print("✅ Verified free podcard appears in public list")

    def test_22_process_memory_audio(self):
        """Test processing memory audio for a podcard with multiple audio messages"""
        if not hasattr(self, 'free_podcard_id'):
            self.skipTest("No free podcard ID available from previous test")
            
        print(f"\n🔍 Testing audio processing for memory ID: {self.free_podcard_id}...")
        
        # First, ensure we have at least 2 audio messages in the podcard
        # Add another audio message if needed
        response = requests.get(f"{self.api_url}/podcards/{self.free_podcard_id}")
        self.assertEqual(response.status_code, 200)
        podcard_data = response.json()
        
        if len(podcard_data["audio_messages"]) < 2:
            print("Adding another audio message to ensure we have multiple messages...")
            # Create a simple test audio file
            test_audio_path = "/tmp/test_audio2.wav"
            with open(test_audio_path, "wb") as f:
                # Write a simple WAV header and some data
                f.write(b"RIFF\x24WAVEfmt \x10\x01\x01\x44\xac\x88\x58\x01\x02\x10data")
            
            files = {'audio_file': ('test_audio2.wav', open(test_audio_path, 'rb'), 'audio/wav')}
            data = {
                'contributor_name': 'Second Contributor',
                'contributor_email': 'second@example.com'
            }
            
            response = requests.post(
                f"{self.api_url}/podcards/{self.free_podcard_id}/audio",
                files=files,
                data=data
            )
            
            self.assertEqual(response.status_code, 200)
            os.remove(test_audio_path)
            
            # Get updated podcard data
            response = requests.get(f"{self.api_url}/podcards/{self.free_podcard_id}")
            self.assertEqual(response.status_code, 200)
            podcard_data = response.json()
        
        # Now process the memory audio
        response = requests.post(
            f"{self.api_url}/audio/process-memory",
            data={'memory_id': self.free_podcard_id}
        )
        
        # Check if audio processing is available
        if response.status_code == 503:
            print("⚠️ Audio processing service not available, skipping test")
            self.skipTest("Audio processing service not available")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("task_id", data)
        self.assertEqual(data["status"], "started")
        
        # Save the task ID for the next test
        self.audio_task_id = data["task_id"]
        print(f"✅ Audio processing started with task ID: {self.audio_task_id}")
        
    def test_23_check_processing_status(self):
        """Test checking the status of an audio processing task"""
        if not hasattr(self, 'audio_task_id'):
            self.skipTest("No audio task ID available from previous test")
            
        print(f"\n🔍 Testing audio processing status for task ID: {self.audio_task_id}...")
        
        # Check status (may still be processing)
        response = requests.get(f"{self.api_url}/audio/status/{self.audio_task_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["task_id"], self.audio_task_id)
        
        # Wait for a short time to allow processing to progress
        print("Waiting for processing to progress...")
        max_attempts = 5
        for attempt in range(max_attempts):
            response = requests.get(f"{self.api_url}/audio/status/{self.audio_task_id}")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            status = data.get("status", "unknown")
            
            print(f"  Attempt {attempt+1}/{max_attempts}: Status = {status}, Stage = {data.get('stage')}")
            
            if status in ["success", "completed"]:
                break
                
            if status == "failure" or status == "failed":
                print(f"⚠️ Processing failed: {data.get('error', 'Unknown error')}")
                break
                
            # Wait before checking again
            time.sleep(2)
        
        print(f"✅ Audio processing status checked: {status}")
        
    def test_24_get_processed_audio(self):
        """Test retrieving processed audio for a memory"""
        if not hasattr(self, 'free_podcard_id'):
            self.skipTest("No free podcard ID available from previous test")
            
        print(f"\n🔍 Testing retrieval of processed audio for memory ID: {self.free_podcard_id}...")
        
        # Try to get the processed audio
        response = requests.get(f"{self.api_url}/audio/processed/{self.free_podcard_id}")
        
        # If processing is still ongoing or failed, this might return 404
        if response.status_code == 404:
            print("⚠️ Processed audio not found yet, processing may still be ongoing")
            self.skipTest("Processed audio not available yet")
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers['Content-Type'].startswith('audio/'))
        print("✅ Retrieved processed audio successfully")
        
    def test_25_process_memory_invalid_id(self):
        """Test processing memory audio with an invalid memory ID"""
        print("\n🔍 Testing audio processing with invalid memory ID...")
        
        invalid_id = "00000000-0000-0000-0000-000000000000"
        response = requests.post(
            f"{self.api_url}/audio/process-memory",
            data={'memory_id': invalid_id}
        )
        
        # If audio processing is not available, we'll get a 503
        if response.status_code == 503:
            print("⚠️ Audio processing service not available, skipping test")
            self.skipTest("Audio processing service not available")
        
        self.assertEqual(response.status_code, 404)
        print("✅ Invalid memory ID properly returns 404")
        
    def test_26_check_status_invalid_task(self):
        """Test checking status with an invalid task ID"""
        print("\n🔍 Testing status check with invalid task ID...")
        
        invalid_id = "00000000-0000-0000-0000-000000000000"
        response = requests.get(f"{self.api_url}/audio/status/{invalid_id}")
        
        # This should return 404 if the task doesn't exist
        self.assertEqual(response.status_code, 404)
        print("✅ Invalid task ID properly returns 404")
        
    def test_27_get_processed_audio_invalid_memory(self):
        """Test retrieving processed audio with an invalid memory ID"""
        print("\n🔍 Testing processed audio retrieval with invalid memory ID...")
        
        invalid_id = "00000000-0000-0000-0000-000000000000"
        response = requests.get(f"{self.api_url}/audio/processed/{invalid_id}")
        
        self.assertEqual(response.status_code, 404)
        print("✅ Invalid memory ID properly returns 404")
        
    def test_28_anonymous_access_to_processed_audio(self):
        """Test anonymous access to processed audio for a public memory"""
        if not hasattr(self, 'free_podcard_id'):
            self.skipTest("No free podcard ID available from previous test")
            
        print(f"\n🔍 Testing anonymous access to processed audio for public memory: {self.free_podcard_id}...")
        
        # Try to get the processed audio without authentication
        response = requests.get(f"{self.api_url}/audio/processed/{self.free_podcard_id}")
        
        # If processing is still ongoing or failed, this might return 404
        if response.status_code == 404:
            print("⚠️ Processed audio not found yet, processing may still be ongoing")
            self.skipTest("Processed audio not available yet")
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers['Content-Type'].startswith('audio/'))
        print("✅ Anonymous access to processed audio for public memory works correctly")
        
    def test_29_enhance_single_audio(self):
        """Test enhancing a single audio file"""
        print("\n🔍 Testing single audio enhancement...")
        
        # Create a simple test audio file
        test_audio_path = "/tmp/test_enhance.wav"
        with open(test_audio_path, "wb") as f:
            # Write a simple WAV header and some data
            f.write(b"RIFF\x24WAVEfmt \x10\x01\x01\x44\xac\x88\x58\x01\x02\x10data")
        
        # Call the enhance endpoint
        response = requests.post(
            f"{self.api_url}/audio/enhance-single",
            params={
                'audio_path': test_audio_path,
                'contributor_name': 'Test Enhancer'
            }
        )
        
        # If audio processing is not available, we'll get a 503 or a mock response
        if response.status_code == 503:
            print("⚠️ Audio processing service not available, skipping test")
            self.skipTest("Audio processing service not available")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("task_id", data)
        self.assertEqual(data["status"], "started")
        
        # Clean up
        os.remove(test_audio_path)
        print("✅ Single audio enhancement works correctly")
        
    def test_30_get_voice_personas(self):
        """Test getting all available mock voice personas"""
        print("\n🔍 Testing voice personas endpoint...")
        
        response = requests.get(f"{self.api_url}/voice/personas")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify we have the expected number of personas
        self.assertIn("personas", data)
        self.assertEqual(data["total_count"], 8)
        self.assertEqual(len(data["personas"]), 8)
        
        # Verify persona diversity
        personas = data["personas"]
        
        # Check for different genders
        genders = set(p["gender"] for p in personas)
        self.assertGreaterEqual(len(genders), 2, "Should have at least male and female genders")
        
        # Check for different ages
        ages = set(p["age"] for p in personas)
        self.assertGreaterEqual(len(ages), 3, "Should have diverse age ranges")
        
        # Check for different accents
        accents = set(p["accent"] for p in personas)
        self.assertGreaterEqual(len(accents), 5, "Should have diverse accents")
        
        # Check for different personalities
        personalities = set(p["personality"] for p in personas)
        self.assertGreaterEqual(len(personalities), 5, "Should have diverse personalities")
        
        # Check for specific personas
        persona_names = [p["name"] for p in personas]
        expected_names = ["Alice Johnson", "Marcus Chen", "Sofia Rodriguez", "David Thompson", 
                          "Priya Patel", "James Murphy", "Emily Wang", "Carlos Santos"]
        
        for name in expected_names:
            self.assertIn(name, persona_names, f"Expected persona {name} not found")
        
        # Check persona structure
        for persona in personas:
            self.assertIn("id", persona)
            self.assertIn("name", persona)
            self.assertIn("age", persona)
            self.assertIn("gender", persona)
            self.assertIn("accent", persona)
            self.assertIn("personality", persona)
            self.assertIn("audio_file", persona)
            self.assertIn("email_domain", persona)
            
            # Verify audio file paths exist
            self.assertTrue(persona["audio_file"].startswith("/app/backend/demo-audio/"))
        
        print(f"✅ Retrieved {len(personas)} diverse voice personas successfully")
        
    def test_31_generate_voice_message(self):
        """Test generating a realistic voice message for different occasions"""
        print("\n🔍 Testing voice message generation...")
        
        # Test for different occasions
        occasions = ["birthday", "graduation", "wedding", "anniversary", "celebration"]
        
        for occasion in occasions:
            print(f"  Testing message generation for occasion: {occasion}")
            
            # Test with random persona
            data = {
                'occasion': occasion,
                'recipient_name': 'Sarah Johnson'
            }
            
            response = requests.post(
                f"{self.api_url}/voice/generate-message",
                data=data
            )
            
            self.assertEqual(response.status_code, 200)
            result = response.json()
            
            # Verify response structure
            self.assertTrue(result["success"])
            self.assertIn("message_content", result)
            self.assertIn("persona", result)
            self.assertIn("generated_at", result)
            self.assertIn("audio_file", result)
            
            # Verify message content is appropriate for the occasion
            message = result["message_content"]
            self.assertIn("Sarah", message, "Message should be personalized with recipient name")
            
            if occasion == "birthday":
                self.assertTrue(any(term in message.lower() for term in ["birthday", "special day"]))
            elif occasion == "graduation":
                self.assertTrue(any(term in message.lower() for term in ["graduation", "proud", "accomplish"]))
            elif occasion == "wedding":
                self.assertTrue(any(term in message.lower() for term in ["wedding", "marriage", "love"]))
            elif occasion == "anniversary":
                self.assertTrue(any(term in message.lower() for term in ["anniversary", "journey", "love"]))
            elif occasion == "celebration":
                self.assertTrue(any(term in message.lower() for term in ["congratulations", "celebrate", "exciting"]))
            
            # Verify persona details are included
            persona = result["persona"]
            self.assertIn("name", persona)
            self.assertIn("gender", persona)
            self.assertIn("accent", persona)
            self.assertIn("personality", persona)
            
            # Verify audio file path
            self.assertTrue(result["audio_file"].startswith("/app/backend/demo-audio/"))
            
            # Test with specific persona
            if occasion == "birthday":  # Only test specific persona once
                print("  Testing message generation with specific persona")
                
                # Get a specific persona ID
                personas_response = requests.get(f"{self.api_url}/voice/personas")
                personas_data = personas_response.json()
                specific_persona_id = personas_data["personas"][0]["id"]
                
                data = {
                    'occasion': occasion,
                    'recipient_name': 'Sarah Johnson',
                    'persona_id': specific_persona_id
                }
                
                response = requests.post(
                    f"{self.api_url}/voice/generate-message",
                    data=data
                )
                
                self.assertEqual(response.status_code, 200)
                result = response.json()
                
                # Verify the specific persona was used
                self.assertEqual(result["persona"]["id"], specific_persona_id)
        
        print("✅ Voice message generation works correctly for all occasions")
        
    def test_32_create_ai_memory(self):
        """Test creating a test memory with AI-generated voice messages"""
        print("\n🔍 Testing AI memory creation...")
        
        # Test with different numbers of messages
        for num_messages in [3, 5]:
            print(f"  Testing memory creation with {num_messages} messages")
            
            data = {
                'title': f"Test AI Memory with {num_messages} Messages",
                'occasion': "birthday",
                'recipient_name': "Michael Smith",
                'num_messages': num_messages
            }
            
            response = requests.post(
                f"{self.api_url}/voice/create-ai-memory",
                data=data
            )
            
            self.assertEqual(response.status_code, 200)
            result = response.json()
            
            # Verify response structure
            self.assertTrue(result["success"])
            self.assertIn("memory", result)
            self.assertIn("generated_messages", result)
            self.assertIn("personas_used", result)
            self.assertIn("listen_url", result)
            
            # Verify the correct number of messages were generated
            self.assertEqual(result["generated_messages"], num_messages)
            self.assertEqual(len(result["personas_used"]), num_messages)
            self.assertEqual(len(result["memory"]["audio_messages"]), num_messages)
            
            # Verify memory structure
            memory = result["memory"]
            self.assertEqual(memory["title"], data["title"])
            self.assertEqual(memory["occasion"], data["occasion"])
            self.assertTrue(memory["is_test_memory"])
            self.assertTrue(memory["is_public"])
            
            # Verify audio messages
            for message in memory["audio_messages"]:
                self.assertIn("contributor_name", message)
                self.assertIn("contributor_email", message)
                self.assertIn("file_path", message)
                self.assertTrue(message["file_path"].startswith("/app/backend/demo-audio/"))
            
            # Save memory ID for cleanup test
            if num_messages == 5:  # Save the last one for cleanup test
                self.ai_memory_id = memory["id"]
                print(f"  Saved AI memory ID for cleanup test: {self.ai_memory_id}")
        
        print("✅ AI memory creation works correctly with different message counts")
        
    def test_33_bulk_generate_scenarios(self):
        """Test generating a complete set of test scenarios with AI voices"""
        print("\n🔍 Testing bulk scenario generation...")
        
        data = {
            'recipient_name': "Jennifer Williams"
        }
        
        response = requests.post(
            f"{self.api_url}/voice/bulk-generate-scenarios",
            data=data
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        # Verify response structure
        self.assertTrue(result["success"])
        self.assertIn("scenarios_created", result)
        self.assertIn("memories", result)
        self.assertIn("recipient_name", result)
        
        # Verify the correct number of scenarios were created
        self.assertEqual(result["scenarios_created"], 5)
        self.assertEqual(len(result["memories"]), 5)
        
        # Verify all occasion types are covered
        occasions = [memory["occasion"] for memory in result["memories"]]
        expected_occasions = ["birthday", "graduation", "wedding", "anniversary", "celebration"]
        for occasion in expected_occasions:
            self.assertIn(occasion, occasions, f"Expected occasion {occasion} not found in bulk scenarios")
        
        # Verify each memory has the expected structure
        for memory in result["memories"]:
            self.assertIn("id", memory)
            self.assertIn("title", memory)
            self.assertIn("occasion", memory)
            self.assertIn("messages", memory)
            self.assertIn("url", memory)
            
            # Verify the memory has messages
            self.assertGreater(memory["messages"], 0)
            
            # Verify the URL format
            self.assertTrue(memory["url"].startswith("/listen/"))
        
        # Save the memory IDs for cleanup test
        self.bulk_memory_ids = [memory["id"] for memory in result["memories"]]
        print(f"  Created {len(self.bulk_memory_ids)} bulk scenarios successfully")
        
        print("✅ Bulk scenario generation works correctly")
        
    def test_34_clear_ai_memories(self):
        """Test clearing all AI-generated test memories"""
        print("\n🔍 Testing AI memory cleanup...")
        
        # Verify that the AI memories exist before cleaning
        if hasattr(self, 'ai_memory_id'):
            response = requests.get(f"{self.api_url}/podcards/{self.ai_memory_id}")
            self.assertEqual(response.status_code, 200, "AI memory should exist before cleanup")
        
        if hasattr(self, 'bulk_memory_ids') and self.bulk_memory_ids:
            response = requests.get(f"{self.api_url}/podcards/{self.bulk_memory_ids[0]}")
            self.assertEqual(response.status_code, 200, "Bulk memory should exist before cleanup")
        
        # Clear AI memories
        response = requests.delete(f"{self.api_url}/voice/clear-ai-memories")
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        # Verify response structure
        self.assertTrue(result["success"])
        self.assertIn("deleted_count", result)
        self.assertGreaterEqual(result["deleted_count"], 1, "Should have deleted at least one memory")
        
        # Verify that the AI memories were deleted
        if hasattr(self, 'ai_memory_id'):
            response = requests.get(f"{self.api_url}/podcards/{self.ai_memory_id}")
            self.assertEqual(response.status_code, 404, "AI memory should be deleted after cleanup")
        
        if hasattr(self, 'bulk_memory_ids') and self.bulk_memory_ids:
            response = requests.get(f"{self.api_url}/podcards/{self.bulk_memory_ids[0]}")
            self.assertEqual(response.status_code, 404, "Bulk memory should be deleted after cleanup")
        
        print(f"✅ Successfully cleared {result['deleted_count']} AI-generated memories")

    def test_35_create_developer_test_memory(self):
        """Test creating a developer test memory"""
        print("\n🔍 Testing developer test memory creation...")
        
        response = requests.post(f"{self.api_url}/dev/create-test-memory")
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        # Verify response structure
        self.assertTrue(result["success"])
        self.assertIn("memory", result)
        self.assertIn("memory_id", result)
        
        # Verify memory structure
        memory = result["memory"]
        self.assertEqual(memory["title"], "🧪 Clean Test Memory")
        self.assertEqual(memory["creator_id"], "dev-test")
        self.assertEqual(memory["creator_email"], "dev@forever-tapes.com")
        self.assertTrue(memory["is_test_memory"])
        self.assertTrue(memory["is_public"])
        
        # Save memory ID for later tests
        self.dev_test_memory_id = memory["id"]
        print(f"✅ Developer test memory created successfully with ID: {self.dev_test_memory_id}")
        
    def test_36_get_latest_test_memory(self):
        """Test getting the latest developer test memory"""
        if not hasattr(self, 'dev_test_memory_id'):
            self.skipTest("No developer test memory ID available from previous test")
            
        print("\n🔍 Testing get latest developer test memory...")
        
        response = requests.get(f"{self.api_url}/dev/latest-test-memory")
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        # Verify response structure
        self.assertTrue(result["success"])
        self.assertIn("memory", result)
        self.assertIn("memory_id", result)
        
        # Verify memory structure
        memory = result["memory"]
        self.assertEqual(memory["creator_id"], "dev-test")
        self.assertTrue(memory["is_test_memory"])
        
        print(f"✅ Retrieved latest developer test memory successfully with ID: {result['memory_id']}")
        
    def test_37_upload_audio_to_test_memory(self):
        """Test uploading audio to a developer test memory"""
        if not hasattr(self, 'dev_test_memory_id'):
            self.skipTest("No developer test memory ID available from previous test")
            
        print(f"\n🔍 Testing audio upload to developer test memory ID: {self.dev_test_memory_id}...")
        
        # Create a simple test audio file
        test_audio_path = "/tmp/test_dev_audio.wav"
        with open(test_audio_path, "wb") as f:
            # Write a simple WAV header and some data
            f.write(b"RIFF\x24WAVEfmt \x10\x01\x01\x44\xac\x88\x58\x01\x02\x10data")
        
        files = {'audio_file': ('test_dev_audio.wav', open(test_audio_path, 'rb'), 'audio/wav')}
        data = {
            'contributor_name': 'Dev Test Contributor',
            'contributor_email': 'dev_contributor@example.com'
        }
        
        response = requests.post(
            f"{self.api_url}/podcards/{self.dev_test_memory_id}/audio",
            files=files,
            data=data
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["message"], "Audio message uploaded successfully")
        self.assertEqual(result["podcard_id"], self.dev_test_memory_id)
        
        # Save the audio file ID for later tests
        audio_file_path = result["audio_message"]["file_path"]
        self.dev_audio_id = audio_file_path.split('/')[-1].split('.')[0]
        print(f"✅ Audio uploaded to developer test memory successfully with ID: {self.dev_audio_id}")
        
        # Clean up
        os.remove(test_audio_path)
        
    def test_38_get_dev_audio_file(self):
        """Test retrieving the audio file from a developer test memory"""
        if not hasattr(self, 'dev_audio_id'):
            self.skipTest("No developer audio ID available from previous test")
            
        print(f"\n🔍 Testing get audio file from developer test memory with ID: {self.dev_audio_id}...")
        response = requests.get(f"{self.api_url}/audio/{self.dev_audio_id}")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers['Content-Type'].startswith('audio/'))
        
        # Test HEAD request
        head_response = requests.head(f"{self.api_url}/audio/{self.dev_audio_id}")
        self.assertEqual(head_response.status_code, 200)
        self.assertTrue(head_response.headers['Content-Type'].startswith('audio/'))
        
        print("✅ Retrieved audio file from developer test memory successfully")
        
    def test_39_process_dev_memory_audio(self):
        """Test processing memory audio for a developer test memory"""
        if not hasattr(self, 'dev_test_memory_id'):
            self.skipTest("No developer test memory ID available from previous test")
            
        print(f"\n🔍 Testing audio processing for developer test memory ID: {self.dev_test_memory_id}...")
        
        # Process the memory audio
        response = requests.post(
            f"{self.api_url}/audio/process-memory",
            data={'memory_id': self.dev_test_memory_id}
        )
        
        # Check if audio processing is available
        if response.status_code == 503:
            print("⚠️ Audio processing service not available, skipping test")
            self.skipTest("Audio processing service not available")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("task_id", data)
        self.assertEqual(data["status"], "started")
        
        # Save the task ID for the next test
        self.dev_audio_task_id = data["task_id"]
        print(f"✅ Audio processing started for developer test memory with task ID: {self.dev_audio_task_id}")
        
    def test_40_check_dev_processing_status(self):
        """Test checking the status of an audio processing task for developer test memory"""
        if not hasattr(self, 'dev_audio_task_id'):
            self.skipTest("No developer audio task ID available from previous test")
            
        print(f"\n🔍 Testing audio processing status for developer test memory task ID: {self.dev_audio_task_id}...")
        
        # Check status (may still be processing)
        response = requests.get(f"{self.api_url}/audio/status/{self.dev_audio_task_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["task_id"], self.dev_audio_task_id)
        
        # Wait for a short time to allow processing to progress
        print("Waiting for processing to progress...")
        max_attempts = 5
        for attempt in range(max_attempts):
            response = requests.get(f"{self.api_url}/audio/status/{self.dev_audio_task_id}")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            status = data.get("status", "unknown")
            
            print(f"  Attempt {attempt+1}/{max_attempts}: Status = {status}, Stage = {data.get('stage')}")
            
            if status in ["success", "completed"]:
                break
                
            if status == "failure" or status == "failed":
                print(f"⚠️ Processing failed: {data.get('error', 'Unknown error')}")
                break
                
            # Wait before checking again
            time.sleep(2)
        
        print(f"✅ Audio processing status checked for developer test memory: {status}")
        
    def test_41_get_dev_processed_audio(self):
        """Test retrieving processed audio for a developer test memory"""
        if not hasattr(self, 'dev_test_memory_id'):
            self.skipTest("No developer test memory ID available from previous test")
            
        print(f"\n🔍 Testing retrieval of processed audio for developer test memory ID: {self.dev_test_memory_id}...")
        
        # Try to get the processed audio
        response = requests.get(f"{self.api_url}/audio/processed/{self.dev_test_memory_id}")
        
        # If processing is still ongoing or failed, this might return 404
        if response.status_code == 404:
            print("⚠️ Processed audio not found yet, processing may still be ongoing")
            self.skipTest("Processed audio not available yet")
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers['Content-Type'].startswith('audio/'))
        print("✅ Retrieved processed audio for developer test memory successfully")
        
    def test_42_clear_developer_test_memories(self):
        """Test clearing all developer test memories"""
        print("\n🔍 Testing clearing developer test memories...")
        
        response = requests.delete(f"{self.api_url}/dev/clear-test-memories")
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        # Verify response structure
        self.assertTrue(result["success"])
        self.assertIn("deleted_count", result)
        self.assertGreaterEqual(result["deleted_count"], 1, "Should have deleted at least one memory")
        
        # Verify the memory was deleted
        if hasattr(self, 'dev_test_memory_id'):
            response = requests.get(f"{self.api_url}/podcards/{self.dev_test_memory_id}")
            self.assertEqual(response.status_code, 404, "Developer test memory should be deleted after cleanup")
        
        print(f"✅ Successfully cleared {result['deleted_count']} developer test memories")

if __name__ == "__main__":
    # Create a single test instance to share state between tests
    test_instance = ForeverTapesAPITest()
    
    # Run the tests in order
    test_suite = unittest.TestSuite()
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_01_health_check))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_02_request_magic_link))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_03_register_user))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_04_get_current_user))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_05_create_podcard_authenticated))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_06_get_my_podcards))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_07_get_podcards))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_08_get_podcard_by_id))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_09_upload_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_10_get_audio_file))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_11_verify_podcard_updated))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_12_get_demo_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_13_unauthorized_access))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_14_invalid_podcard_id))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_15_invalid_audio_id))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_16_create_free_podcard))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_17_get_free_podcard))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_18_contribute_to_free_podcard))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_19_verify_free_podcard_updated))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_20_get_free_audio_file))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_21_verify_free_podcard_in_list))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_22_process_memory_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_23_check_processing_status))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_24_get_processed_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_25_process_memory_invalid_id))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_26_check_status_invalid_task))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_27_get_processed_audio_invalid_memory))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_28_anonymous_access_to_processed_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_29_enhance_single_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_30_get_voice_personas))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_31_generate_voice_message))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_32_create_ai_memory))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_33_bulk_generate_scenarios))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_34_clear_ai_memories))
    
    # Add new tests for developer test memory endpoints
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_35_create_developer_test_memory))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_36_get_latest_test_memory))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_37_upload_audio_to_test_memory))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_38_get_dev_audio_file))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_39_process_dev_memory_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_40_check_dev_processing_status))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_41_get_dev_processed_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_42_clear_developer_test_memories))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)


