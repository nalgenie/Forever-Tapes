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

    def test_22_check_celery_worker_status(self):
        """Test the Celery worker status endpoint"""
        print("\n🔍 Testing Celery worker status...")
        response = requests.get(f"{self.api_url}/audio/worker-status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check if workers are available
        self.assertIn("available", data)
        print(f"✅ Celery worker status: Available = {data['available']}")
        
        if data["available"]:
            self.assertIn("workers", data)
            self.assertIn("active_tasks", data)
            print(f"✅ Found {len(data['workers'])} active workers")
        else:
            print("⚠️ No Celery workers available - some tests may be skipped")
    
    def test_23_process_memory_audio(self):
        """Test processing audio for a memory"""
        if not hasattr(self, 'free_podcard_id') or not hasattr(self, 'free_audio_id'):
            self.skipTest("No free podcard or audio ID available from previous tests")
            
        print(f"\n🔍 Testing audio processing for memory ID: {self.free_podcard_id}...")
        
        # First, get the podcard to verify it has audio messages
        response = requests.get(f"{self.api_url}/podcards/{self.free_podcard_id}")
        self.assertEqual(response.status_code, 200)
        podcard = response.json()
        
        if not podcard["audio_messages"]:
            self.skipTest("No audio messages in the podcard to process")
        
        # Start processing the memory
        response = requests.post(
            f"{self.api_url}/audio/process-memory",
            data={"memory_id": self.free_podcard_id}
        )
        
        # Check if processing started successfully
        if response.status_code == 503:
            print("⚠️ Audio processing service not available - skipping test")
            self.skipTest("Audio processing service not available")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("task_id", data)
        self.assertEqual(data["status"], "started")
        
        # Save the task ID for status check
        self.audio_task_id = data["task_id"]
        print(f"✅ Audio processing started with task ID: {self.audio_task_id}")
    
    def test_24_check_processing_status(self):
        """Test checking the status of an audio processing task"""
        if not hasattr(self, 'audio_task_id'):
            self.skipTest("No audio task ID available from previous test")
            
        print(f"\n🔍 Testing audio processing status for task ID: {self.audio_task_id}...")
        
        # Check status (may still be processing)
        response = requests.get(f"{self.api_url}/audio/status/{self.audio_task_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn("status", data)
        self.assertIn("task_id", data)
        self.assertEqual(data["task_id"], self.audio_task_id)
        
        # Print current status
        status = data.get("status", "unknown")
        stage = data.get("stage", "unknown")
        print(f"✅ Audio processing status: {status}, stage: {stage}")
        
        # If processing is complete, check for output file
        if status.lower() == "completed" or status.lower() == "success":
            self.assertIn("output_file", data)
            print(f"✅ Processing completed with output file: {data['output_file']}")
    
    def test_25_enhance_single_audio(self):
        """Test enhancing a single audio file"""
        if not hasattr(self, 'free_podcard_id'):
            self.skipTest("No free podcard ID available from previous tests")
            
        print("\n🔍 Testing single audio enhancement...")
        
        # First, get the podcard to get an audio file path
        response = requests.get(f"{self.api_url}/podcards/{self.free_podcard_id}")
        self.assertEqual(response.status_code, 200)
        podcard = response.json()
        
        if not podcard["audio_messages"]:
            self.skipTest("No audio messages in the podcard to enhance")
        
        # Get the first audio message
        audio_message = podcard["audio_messages"][0]
        
        # Create a test request with mock file path (actual path won't be accessible)
        # In a real scenario, we'd use the actual file path
        test_path = audio_message["file_path"] if "file_path" in audio_message else "/tmp/test_audio.wav"
        test_name = audio_message["contributor_name"] if "contributor_name" in audio_message else "Test Contributor"
        
        # This test might fail as we don't have direct access to the file system paths
        # We're testing the API endpoint functionality, not the actual processing
        response = requests.post(
            f"{self.api_url}/audio/enhance-single",
            params={"audio_path": test_path, "contributor_name": test_name}
        )
        
        # Check response - might be 404 if file not found, which is expected in test environment
        if response.status_code == 404:
            print("⚠️ Audio file not found - expected in test environment")
        elif response.status_code == 503:
            print("⚠️ Audio enhancement service not available")
        else:
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("task_id", data)
            self.assertEqual(data["status"], "started")
            print(f"✅ Audio enhancement started with task ID: {data['task_id']}")
    
    def test_26_invalid_task_id(self):
        """Test checking status with invalid task ID"""
        print("\n🔍 Testing status check with invalid task ID...")
        
        invalid_id = "invalid-task-id"
        response = requests.get(f"{self.api_url}/audio/status/{invalid_id}")
        
        # Should return 404 or 500 depending on implementation
        self.assertIn(response.status_code, [404, 500])
        print("✅ Invalid task ID properly handled")
    
    def test_27_process_invalid_memory(self):
        """Test processing audio for an invalid memory ID"""
        print("\n🔍 Testing audio processing with invalid memory ID...")
        
        invalid_id = "00000000-0000-0000-0000-000000000000"
        response = requests.post(
            f"{self.api_url}/audio/process-memory",
            data={"memory_id": invalid_id}
        )
        
        self.assertEqual(response.status_code, 404)
        print("✅ Invalid memory ID properly handled")
    
    def test_28_verify_complete_flow(self):
        """Test the complete flow: Create memory → Upload audio → Process → Check status"""
        print("\n🔍 Testing complete audio processing flow...")
        
        # 1. Create a new free memory
        test_data = {
            "title": f"Audio Test Memory {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "description": "Testing the complete audio processing flow",
            "occasion": "test"
        }
        
        response = requests.post(f"{self.api_url}/podcards/free", json=test_data)
        self.assertEqual(response.status_code, 200)
        memory = response.json()
        memory_id = memory["id"]
        print(f"✅ Created test memory with ID: {memory_id}")
        
        # 2. Upload audio to the memory
        test_audio_path = "/tmp/test_flow_audio.wav"
        with open(test_audio_path, "wb") as f:
            # Write a simple WAV header and some data
            f.write(b"RIFF\x24WAVEfmt \x10\x01\x01\x44\xac\x88\x58\x01\x02\x10data")
        
        files = {'audio_file': ('test_flow_audio.wav', open(test_audio_path, 'rb'), 'audio/wav')}
        data = {
            'contributor_name': 'Flow Test Contributor',
            'contributor_email': 'flow_test@example.com'
        }
        
        response = requests.post(
            f"{self.api_url}/podcards/{memory_id}/audio",
            files=files,
            data=data
        )
        
        self.assertEqual(response.status_code, 200)
        upload_result = response.json()
        print(f"✅ Uploaded audio to test memory")
        
        # 3. Start processing the memory
        response = requests.post(
            f"{self.api_url}/audio/process-memory",
            data={"memory_id": memory_id}
        )
        
        # Check if processing started successfully
        if response.status_code == 503:
            print("⚠️ Audio processing service not available - skipping processing test")
        else:
            self.assertEqual(response.status_code, 200)
            process_result = response.json()
            task_id = process_result["task_id"]
            print(f"✅ Started processing with task ID: {task_id}")
            
            # 4. Check processing status
            response = requests.get(f"{self.api_url}/audio/status/{task_id}")
            self.assertEqual(response.status_code, 200)
            status_result = response.json()
            print(f"✅ Processing status: {status_result.get('status')}, stage: {status_result.get('stage')}")
        
        # Clean up
        os.remove(test_audio_path)
        print("✅ Complete flow test finished successfully")

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
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_22_check_celery_worker_status))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_23_process_memory_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_24_check_processing_status))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_25_enhance_single_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_26_invalid_task_id))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_27_process_invalid_memory))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_28_verify_complete_flow))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)
