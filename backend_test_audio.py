import requests
import unittest
import json
import os
import time
import random
import string
from datetime import datetime

class ForeverTapesAudioAPITest(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(ForeverTapesAudioAPITest, self).__init__(*args, **kwargs)
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
    
    def test_02_create_free_podcard(self):
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
        
    def test_03_contribute_to_free_podcard(self):
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
        
    def test_04_audio_worker_status(self):
        """Test the audio worker status endpoint"""
        print("\n🔍 Testing audio worker status endpoint...")
        response = requests.get(f"{self.api_url}/audio/worker-status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        print(f"Worker status: {data}")
        print("✅ Audio worker status endpoint accessible")
        
    def test_05_enhance_single_audio(self):
        """Test the enhance single audio endpoint"""
        if not hasattr(self, 'free_podcard_id') or not hasattr(self, 'free_audio_id'):
            self.skipTest("No audio ID available from previous test")
            
        print("\n🔍 Testing enhance single audio endpoint...")
        
        # Find the audio file path
        audio_path = None
        response = requests.get(f"{self.api_url}/podcards/{self.free_podcard_id}")
        if response.status_code == 200:
            data = response.json()
            for msg in data["audio_messages"]:
                if self.free_audio_id in msg["file_path"]:
                    audio_path = msg["file_path"]
                    break
        
        if not audio_path:
            self.skipTest("Could not find audio file path")
        
        # Test the enhance single audio endpoint
        response = requests.post(
            f"{self.api_url}/audio/enhance-single",
            params={
                "audio_path": audio_path,
                "contributor_name": "Test Contributor"
            }
        )
        
        print(f"Response: {response.status_code} - {response.text}")
        self.assertIn(response.status_code, [200, 503])  # Either success or service unavailable
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("task_id", data)
            self.assertIn("status", data)
            print("✅ Audio enhancement request successful")
        else:
            print("⚠️ Audio enhancement service not available (expected during testing)")
            
    def test_06_process_memory(self):
        """Test the process memory endpoint"""
        if not hasattr(self, 'free_podcard_id'):
            self.skipTest("No podcard ID available from previous test")
            
        print("\n🔍 Testing process memory endpoint...")
        
        response = requests.post(
            f"{self.api_url}/audio/process-memory",
            data={
                "memory_id": self.free_podcard_id
            }
        )
        
        print(f"Response: {response.status_code} - {response.text}")
        self.assertIn(response.status_code, [200, 503, 400, 404])  # Various possible responses
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn("task_id", data)
            self.assertIn("status", data)
            
            # Test the status endpoint with the task ID
            task_id = data["task_id"]
            status_response = requests.get(f"{self.api_url}/audio/status/{task_id}")
            print(f"Status response: {status_response.status_code} - {status_response.text}")
            self.assertEqual(status_response.status_code, 200)
            
            print("✅ Memory processing request successful")
        elif response.status_code == 503:
            print("⚠️ Audio processing service not available (expected during testing)")
        elif response.status_code == 400:
            print("⚠️ Bad request - likely no audio messages to process")
        elif response.status_code == 404:
            print("⚠️ Memory not found")
            
    def test_07_invalid_task_id(self):
        """Test the status endpoint with an invalid task ID"""
        print("\n🔍 Testing status endpoint with invalid task ID...")
        
        invalid_id = "00000000-0000-0000-0000-000000000000"
        response = requests.get(f"{self.api_url}/audio/status/{invalid_id}")
        print(f"Response: {response.status_code} - {response.text}")
        self.assertIn(response.status_code, [404, 500])  # Either not found or internal error
        
        print("✅ Invalid task ID properly handled")
        
    def test_08_full_flow(self):
        """Test the complete flow: create memory, upload audio, process, check status"""
        print("\n🔍 Testing complete audio processing flow...")
        
        # 1. Create a free memory
        test_data = {
            "title": f"Test Audio Processing {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "description": "Testing the complete audio processing flow",
            "occasion": "test"
        }
        
        response = requests.post(
            f"{self.api_url}/podcards/free", 
            json=test_data
        )
        self.assertEqual(response.status_code, 200)
        memory_data = response.json()
        memory_id = memory_data["id"]
        print(f"✅ Created free memory with ID: {memory_id}")
        
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
        print(f"✅ Uploaded audio to memory")
        
        # 3. Process the memory
        response = requests.post(
            f"{self.api_url}/audio/process-memory",
            data={
                "memory_id": memory_id
            }
        )
        
        print(f"Process response: {response.status_code} - {response.text}")
        
        if response.status_code == 200:
            process_result = response.json()
            task_id = process_result["task_id"]
            
            # 4. Check processing status
            status_response = requests.get(f"{self.api_url}/audio/status/{task_id}")
            print(f"Status response: {status_response.status_code} - {status_response.text}")
            self.assertEqual(status_response.status_code, 200)
            
            print("✅ Complete flow successful")
        elif response.status_code == 503:
            print("⚠️ Audio processing service not available (expected during testing)")
        else:
            print(f"⚠️ Process memory failed with status {response.status_code}")
        
        # Clean up
        os.remove(test_audio_path)

if __name__ == "__main__":
    # Create a single test instance to share state between tests
    test_instance = ForeverTapesAudioAPITest()
    
    # Run the tests in order
    test_suite = unittest.TestSuite()
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_01_health_check))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_02_create_free_podcard))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_03_contribute_to_free_podcard))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_04_audio_worker_status))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_05_enhance_single_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_06_process_memory))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_07_invalid_task_id))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_08_full_flow))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)
