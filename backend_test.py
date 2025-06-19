import requests
import unittest
import json
import os
import time
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
        
    def test_01_health_check(self):
        """Test the health check endpoint"""
        print("\n🔍 Testing health check endpoint...")
        response = requests.get(f"{self.api_url}/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        print("✅ Health check passed")
        
    def test_02_create_podcard(self):
        """Test creating a new podcard"""
        print("\n🔍 Testing podcard creation...")
        test_data = {
            "title": f"Test PodCard {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "description": "This is a test podcard created by the automated test script",
            "occasion": "birthday",
            "creator_name": "Test User",
            "creator_email": "test@example.com"
        }
        
        response = requests.post(f"{self.api_url}/podcards", json=test_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["title"], test_data["title"])
        self.assertEqual(data["description"], test_data["description"])
        self.assertEqual(data["occasion"], test_data["occasion"])
        self.assertEqual(data["creator_name"], test_data["creator_name"])
        
        # Save the podcard ID for later tests
        self.test_podcard_id = data["id"]
        print(f"✅ PodCard created successfully with ID: {self.test_podcard_id}")
        
    def test_03_get_podcards(self):
        """Test getting all podcards"""
        print("\n🔍 Testing get all podcards endpoint...")
        response = requests.get(f"{self.api_url}/podcards")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        print(f"✅ Retrieved {len(data)} podcards successfully")
        
    def test_04_get_podcard_by_id(self):
        """Test getting a specific podcard by ID"""
        if not self.test_podcard_id:
            self.skipTest("No podcard ID available from previous test")
            
        print(f"\n🔍 Testing get podcard by ID: {self.test_podcard_id}...")
        response = requests.get(f"{self.api_url}/podcards/{self.test_podcard_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.test_podcard_id)
        print("✅ Retrieved specific podcard successfully")
        
    def test_05_upload_audio(self):
        """Test uploading an audio message to a podcard"""
        if not self.test_podcard_id:
            self.skipTest("No podcard ID available from previous test")
            
        print(f"\n🔍 Testing audio upload to podcard ID: {self.test_podcard_id}...")
        
        # Create a simple test audio file
        test_audio_path = "/tmp/test_audio.wav"
        with open(test_audio_path, "wb") as f:
            # Write a simple WAV header and some data
            f.write(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00")
        
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
        
    def test_06_get_audio_file(self):
        """Test retrieving an audio file"""
        if not self.test_audio_id:
            self.skipTest("No audio ID available from previous test")
            
        print(f"\n🔍 Testing get audio file with ID: {self.test_audio_id}...")
        response = requests.get(f"{self.api_url}/audio/{self.test_audio_id}")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers['Content-Type'].startswith('audio/'))
        print("✅ Retrieved audio file successfully")
        
    def test_07_verify_podcard_updated(self):
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

if __name__ == "__main__":
    # Run the tests in order
    test_suite = unittest.TestSuite()
    test_suite.addTest(ForeverTapesAPITest('test_01_health_check'))
    test_suite.addTest(ForeverTapesAPITest('test_02_create_podcard'))
    test_suite.addTest(ForeverTapesAPITest('test_03_get_podcards'))
    test_suite.addTest(ForeverTapesAPITest('test_04_get_podcard_by_id'))
    test_suite.addTest(ForeverTapesAPITest('test_05_upload_audio'))
    test_suite.addTest(ForeverTapesAPITest('test_06_get_audio_file'))
    test_suite.addTest(ForeverTapesAPITest('test_07_verify_podcard_updated'))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)