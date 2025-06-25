import requests
import unittest
import json
import os
import time
import random
import string
from datetime import datetime

class AudioServingTest(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(AudioServingTest, self).__init__(*args, **kwargs)
        # Get the backend URL from the frontend .env file
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    self.base_url = line.strip().split('=')[1].strip('"')
                    break
        
        self.api_url = f"{self.base_url}/api"
        
    def test_01_demo_audio_files_get(self):
        """Test GET requests for demo audio files using file_id format"""
        print("\n🔍 Testing GET requests for demo audio files...")
        
        # Test the specific demo files mentioned in the review request
        demo_files = ["mike-message", "emma-message", "david-message"]
        
        for file_id in demo_files:
            print(f"  Testing GET for file_id: {file_id}")
            response = requests.get(f"{self.api_url}/audio/{file_id}")
            self.assertEqual(response.status_code, 200, f"Failed to retrieve {file_id}")
            self.assertTrue(response.headers['Content-Type'].startswith('audio/'), 
                           f"Incorrect content type for {file_id}: {response.headers['Content-Type']}")
            self.assertGreater(len(response.content), 1000, f"Audio file {file_id} seems too small")
            print(f"  ✅ Successfully retrieved {file_id} with content type: {response.headers['Content-Type']}")
        
        print("✅ All demo audio files accessible via GET requests")
    
    def test_02_demo_audio_files_head(self):
        """Test HEAD requests for demo audio files (required by browsers)"""
        print("\n🔍 Testing HEAD requests for demo audio files...")
        
        # Test the specific demo files mentioned in the review request
        demo_files = ["mike-message", "emma-message", "david-message"]
        
        for file_id in demo_files:
            print(f"  Testing HEAD for file_id: {file_id}")
            response = requests.head(f"{self.api_url}/audio/{file_id}")
            self.assertEqual(response.status_code, 200, f"HEAD request failed for {file_id}")
            self.assertTrue(response.headers['Content-Type'].startswith('audio/'), 
                           f"Incorrect content type for {file_id}: {response.headers['Content-Type']}")
            print(f"  ✅ HEAD request successful for {file_id} with content type: {response.headers['Content-Type']}")
        
        print("✅ All demo audio files respond correctly to HEAD requests")
    
    def test_03_demo_audio_direct_access(self):
        """Test direct access to demo audio files via /api/demo-audio/{filename}"""
        print("\n🔍 Testing direct access to demo audio files...")
        
        # Test direct access to demo audio files with extensions
        demo_files = [
            "mike-message.wav", 
            "emma-message.wav", 
            "emma-message.mp3", 
            "david-message.wav",
            "david-message.mp3"
        ]
        
        for filename in demo_files:
            print(f"  Testing GET for filename: {filename}")
            response = requests.get(f"{self.api_url}/demo-audio/{filename}")
            
            # Some files might not exist in both formats, so we'll check if they exist
            if response.status_code == 200:
                self.assertTrue(response.headers['Content-Type'].startswith('audio/'), 
                               f"Incorrect content type for {filename}: {response.headers['Content-Type']}")
                self.assertGreater(len(response.content), 1000, f"Audio file {filename} seems too small")
                print(f"  ✅ Successfully retrieved {filename} with content type: {response.headers['Content-Type']}")
            else:
                print(f"  ⚠️ File {filename} not found (this might be expected)")
        
        print("✅ Direct access to demo audio files tested")
    
    def test_04_demo_audio_direct_head(self):
        """Test HEAD requests for direct demo audio access"""
        print("\n🔍 Testing HEAD requests for direct demo audio access...")
        
        # Test direct access to demo audio files with extensions
        demo_files = [
            "mike-message.wav", 
            "emma-message.wav", 
            "emma-message.mp3", 
            "david-message.wav",
            "david-message.mp3"
        ]
        
        for filename in demo_files:
            print(f"  Testing HEAD for filename: {filename}")
            response = requests.head(f"{self.api_url}/demo-audio/{filename}")
            
            # Some files might not exist in both formats, so we'll check if they exist
            if response.status_code == 200:
                self.assertTrue(response.headers['Content-Type'].startswith('audio/'), 
                               f"Incorrect content type for {filename}: {response.headers['Content-Type']}")
                print(f"  ✅ HEAD request successful for {filename} with content type: {response.headers['Content-Type']}")
            else:
                print(f"  ⚠️ File {filename} not found (this might be expected)")
        
        print("✅ HEAD requests for direct demo audio access tested")
    
    def test_05_ai_memory_creation_and_audio_access(self):
        """Test creating an AI-generated memory and accessing its audio files"""
        print("\n🔍 Testing AI memory creation and audio file access...")
        
        # Create an AI-generated memory
        data = {
            'title': "Audio Serving Test Memory",
            'occasion': "testing",
            'recipient_name': "Audio Test",
            'num_messages': 5  # Create 5 messages to test multiple audio files
        }
        
        response = requests.post(
            f"{self.api_url}/voice/create-ai-memory",
            data=data
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        
        # Verify the memory was created successfully
        self.assertTrue(result["success"])
        self.assertEqual(result["generated_messages"], 5)
        
        # Get the memory details
        memory = result["memory"]
        memory_id = memory["id"]
        
        # Test accessing each audio file in the memory
        print(f"  Testing access to {len(memory['audio_messages'])} audio files in memory {memory_id}")
        
        for i, message in enumerate(memory["audio_messages"]):
            # Extract the file_id from the file_path
            file_path = message["file_path"]
            
            # The file_path should now be just the file_id without extension
            file_id = file_path
            
            print(f"  Testing audio file {i+1}: {file_id}")
            
            # Test GET request
            get_response = requests.get(f"{self.api_url}/audio/{file_id}")
            self.assertEqual(get_response.status_code, 200, f"Failed to retrieve audio file {file_id}")
            self.assertTrue(get_response.headers['Content-Type'].startswith('audio/'), 
                           f"Incorrect content type for {file_id}: {get_response.headers['Content-Type']}")
            
            # Test HEAD request
            head_response = requests.head(f"{self.api_url}/audio/{file_id}")
            self.assertEqual(head_response.status_code, 200, f"HEAD request failed for {file_id}")
            self.assertTrue(head_response.headers['Content-Type'].startswith('audio/'), 
                           f"Incorrect content type for {file_id}: {head_response.headers['Content-Type']}")
            
            print(f"  ✅ Successfully accessed audio file {file_id}")
        
        # Clean up - delete the test memory
        cleanup_response = requests.delete(f"{self.api_url}/voice/clear-ai-memories")
        self.assertEqual(cleanup_response.status_code, 200)
        
        print("✅ AI memory creation and audio file access tested successfully")
    
    def test_06_demo_audio_endpoint_file_paths(self):
        """Test that the demo audio endpoint uses the correct file ID format"""
        print("\n🔍 Testing demo audio endpoint file path format...")
        
        response = requests.get(f"{self.api_url}/demo/audio")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check that the audio messages exist
        self.assertGreaterEqual(len(data["audio_messages"]), 3)
        
        # Check each audio message for the correct file path format
        for message in data["audio_messages"]:
            file_path = message["file_path"]
            
            # Test accessing the file using the file_id format
            file_id = os.path.basename(file_path).split('.')[0]
            
            print(f"  Testing access to demo file: {file_id}")
            
            # Test GET request
            get_response = requests.get(f"{self.api_url}/audio/{file_id}")
            self.assertEqual(get_response.status_code, 200, f"Failed to retrieve demo file {file_id}")
            
            # Test HEAD request
            head_response = requests.head(f"{self.api_url}/audio/{file_id}")
            self.assertEqual(head_response.status_code, 200, f"HEAD request failed for demo file {file_id}")
            
            print(f"  ✅ Successfully accessed demo file {file_id}")
        
        print("✅ Demo audio endpoint file path format tested successfully")
    
    def test_07_invalid_file_id(self):
        """Test accessing non-existent audio files"""
        print("\n🔍 Testing access to non-existent audio files...")
        
        # Test with an invalid file ID
        invalid_id = "non-existent-file"
        
        # Test GET request
        get_response = requests.get(f"{self.api_url}/audio/{invalid_id}")
        self.assertEqual(get_response.status_code, 404, "GET request for non-existent file should return 404")
        
        # Test HEAD request
        head_response = requests.head(f"{self.api_url}/audio/{invalid_id}")
        self.assertEqual(head_response.status_code, 404, "HEAD request for non-existent file should return 404")
        
        print("✅ Non-existent audio files properly return 404 for both GET and HEAD requests")

if __name__ == "__main__":
    # Create a test instance
    test_instance = AudioServingTest()
    
    # Run the tests in order
    test_suite = unittest.TestSuite()
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_01_demo_audio_files_get))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_02_demo_audio_files_head))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_03_demo_audio_direct_access))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_04_demo_audio_direct_head))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_05_ai_memory_creation_and_audio_access))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_06_demo_audio_endpoint_file_paths))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_07_invalid_file_id))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)