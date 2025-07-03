import requests
import unittest
import json
import os
import time
import random
import string
from datetime import datetime

class AudioCollageTest(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(AudioCollageTest, self).__init__(*args, **kwargs)
        # Get the backend URL from the frontend .env file
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    self.base_url = line.strip().split('=')[1].strip('"')
                    break
        
        self.api_url = f"{self.base_url}/api"
        self.test_memory_id = None
        self.task_id = None
        
    def random_string(self, length=8):
        """Generate a random string for testing"""
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))
        
    def test_01_worker_status(self):
        """Test the worker status endpoint"""
        print("\n🔍 Testing worker status endpoint...")
        response = requests.get(f"{self.api_url}/audio/worker-status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["available"], "Celery workers should be available")
        print("✅ Worker status check passed - Celery workers are available")
    
    def test_02_create_test_memory(self):
        """Create a test memory with multiple audio messages"""
        print("\n🔍 Creating test memory with multiple audio messages...")
        
        # Create a test memory with multiple audio messages
        response = requests.post(
            f"{self.api_url}/voice/create-ai-memory",
            data={
                'title': f"Audio Collage Test Memory {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                'occasion': "testing",
                'recipient_name': "Test User",
                'num_messages': 5  # Create 5 messages
            }
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["generated_messages"], 5)
        
        # Save the memory ID for later tests
        self.test_memory_id = data["memory"]["id"]
        print(f"✅ Test memory created successfully with ID: {self.test_memory_id}")
        
    def test_03_process_memory_audio(self):
        """Test processing memory audio"""
        if not self.test_memory_id:
            self.skipTest("No test memory ID available from previous test")
            
        print(f"\n🔍 Testing audio processing for memory ID: {self.test_memory_id}...")
        
        # First, get the memory details to verify it has audio messages
        memory_response = requests.get(f"{self.api_url}/podcards/{self.test_memory_id}")
        self.assertEqual(memory_response.status_code, 200)
        memory_data = memory_response.json()
        
        print(f"  Memory title: {memory_data['title']}")
        print(f"  Audio messages: {len(memory_data['audio_messages'])}")
        for i, msg in enumerate(memory_data['audio_messages']):
            print(f"    Message {i+1}: {msg['contributor_name']} - {msg['file_path']}")
        
        # Process the memory audio
        response = requests.post(
            f"{self.api_url}/audio/process-memory",
            data={'memory_id': self.test_memory_id}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("task_id", data)
        self.assertEqual(data["status"], "started")
        
        # Save the task ID for the next test
        self.task_id = data["task_id"]
        print(f"✅ Audio processing started with task ID: {self.task_id}")
        
    def test_04_check_processing_status(self):
        """Test checking the status of an audio processing task"""
        if not self.task_id:
            self.skipTest("No task ID available from previous test")
            
        print(f"\n🔍 Testing audio processing status for task ID: {self.task_id}...")
        
        # Check status and wait for completion
        max_attempts = 10
        completed = False
        final_status = None
        
        for attempt in range(max_attempts):
            response = requests.get(f"{self.api_url}/audio/status/{self.task_id}")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            status = data.get("status", "unknown")
            stage = data.get("stage", "unknown")
            
            print(f"  Attempt {attempt+1}/{max_attempts}: Status = {status}, Stage = {stage}")
            
            if status in ["success", "completed"]:
                completed = True
                final_status = data
                break
                
            if status == "failure" or status == "failed":
                print(f"⚠️ Processing failed: {data.get('error', 'Unknown error')}")
                break
                
            # Wait before checking again
            time.sleep(3)
        
        if completed:
            print(f"✅ Audio processing completed successfully")
            print(f"  Output file: {final_status.get('result', {}).get('output_path', 'Unknown')}")
            print(f"  Duration: {final_status.get('result', {}).get('duration', 'Unknown')} seconds")
            print(f"  Processed messages: {final_status.get('result', {}).get('processed_messages', 'Unknown')}")
        else:
            self.fail("Audio processing did not complete within the expected time")
        
    def test_05_get_processed_audio(self):
        """Test retrieving processed audio for a memory"""
        if not self.test_memory_id:
            self.skipTest("No test memory ID available from previous test")
            
        print(f"\n🔍 Testing retrieval of processed audio for memory ID: {self.test_memory_id}...")
        
        # Try to get the processed audio
        response = requests.get(f"{self.api_url}/audio/processed/{self.test_memory_id}")
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers['Content-Type'].startswith('audio/'))
        content_length = int(response.headers.get('Content-Length', 0))
        self.assertGreater(content_length, 1000, "Processed audio file should have significant size")
        
        print(f"✅ Retrieved processed audio successfully")
        print(f"  Content-Type: {response.headers['Content-Type']}")
        print(f"  Content-Length: {content_length} bytes")
        
    def test_06_invalid_memory_id(self):
        """Test processing with an invalid memory ID"""
        print("\n🔍 Testing audio processing with invalid memory ID...")
        
        invalid_id = "00000000-0000-0000-0000-000000000000"
        response = requests.post(
            f"{self.api_url}/audio/process-memory",
            data={'memory_id': invalid_id}
        )
        
        self.assertEqual(response.status_code, 404)
        print("✅ Invalid memory ID properly returns 404")
        
    def test_07_invalid_task_id(self):
        """Test checking status with an invalid task ID"""
        print("\n🔍 Testing status check with invalid task ID...")
        
        invalid_id = "00000000-0000-0000-0000-000000000000"
        response = requests.get(f"{self.api_url}/audio/status/{invalid_id}")
        
        self.assertEqual(response.status_code, 404)
        print("✅ Invalid task ID properly returns 404")
        
    def test_08_cleanup(self):
        """Clean up test data"""
        if not self.test_memory_id:
            self.skipTest("No test memory ID available from previous test")
            
        print("\n🔍 Cleaning up test data...")
        
        # Delete the test memory
        response = requests.delete(f"{self.api_url}/voice/clear-ai-memories")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        
        print(f"✅ Cleaned up {data['deleted_count']} test memories")

if __name__ == "__main__":
    # Create a single test instance to share state between tests
    test_instance = AudioCollageTest()
    
    # Run the tests in order
    test_suite = unittest.TestSuite()
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_01_worker_status))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_02_create_test_memory))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_03_process_memory_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_04_check_processing_status))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_05_get_processed_audio))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_06_invalid_memory_id))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_07_invalid_task_id))
    test_suite.addTest(unittest.FunctionTestCase(test_instance.test_08_cleanup))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)