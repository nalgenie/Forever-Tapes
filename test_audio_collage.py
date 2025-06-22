import requests
import time
import os
import json
from pprint import pprint

def get_backend_url():
    """Get the backend URL from the frontend .env file"""
    with open('/app/frontend/.env', 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                return line.strip().split('=')[1].strip('"')
    return None

def test_audio_collage():
    """Test the complete audio collage flow"""
    base_url = get_backend_url()
    api_url = f"{base_url}/api"
    
    print("\n=== Testing Audio Collage Functionality ===\n")
    
    # Step 1: Check worker status
    print("Step 1: Checking worker status...")
    response = requests.get(f"{api_url}/audio/worker-status")
    print(f"Status code: {response.status_code}")
    if response.status_code == 200:
        worker_status = response.json()
        print(f"Worker available: {worker_status.get('available', False)}")
        print(f"Number of workers: {len(worker_status.get('workers', {}))}")
    else:
        print(f"Error: {response.text}")
    
    # Step 2: Create test data with the test data generation endpoint
    print("\nStep 2: Creating test data...")
    response = requests.post(f"{api_url}/dev/create-test-data")
    if response.status_code != 200:
        print(f"Failed to create test data: {response.text}")
        return
    
    test_data = response.json()
    print(f"Created test data: {test_data['message']}")
    print(f"Test memory IDs: {test_data['test_ids']}")
    
    # Use the multiple messages test memory
    memory_id = None
    for id in test_data['test_ids']:
        if "multiple" in id:
            memory_id = id
            break
    
    if not memory_id:
        print("Could not find a test memory with multiple messages")
        return
    
    print(f"Using test memory with ID: {memory_id}")
    
    # Step 3: Verify the memory has audio messages
    print("\nStep 3: Verifying memory has audio messages...")
    response = requests.get(f"{api_url}/podcards/{memory_id}")
    if response.status_code != 200:
        print(f"Failed to get memory: {response.text}")
        return
    
    memory = response.json()
    print(f"Memory has {len(memory['audio_messages'])} audio messages")
    
    if len(memory['audio_messages']) < 2:
        print("Memory does not have enough audio messages for collage testing")
        return
    
    # Step 4: Process the memory audio
    print("\nStep 4: Processing memory audio...")
    response = requests.post(
        f"{api_url}/audio/process-memory",
        data={'memory_id': memory_id}
    )
    
    if response.status_code != 200:
        print(f"Failed to start processing: {response.text}")
        return
    
    process_result = response.json()
    task_id = process_result["task_id"]
    print(f"Started processing with task ID: {task_id}")
    
    # Step 5: Poll the status until completion
    print("\nStep 5: Polling status until completion...")
    max_attempts = 30
    completed = False
    
    for attempt in range(max_attempts):
        response = requests.get(f"{api_url}/audio/status/{task_id}")
        if response.status_code != 200:
            print(f"Failed to get status: {response.text}")
            time.sleep(2)
            continue
        
        status_data = response.json()
        status = status_data.get("status", "unknown")
        stage = status_data.get("stage", "unknown")
        
        print(f"Attempt {attempt+1}/{max_attempts}: Status = {status}, Stage = {stage}")
        
        if status in ["success", "completed"]:
            completed = True
            print("Processing completed successfully!")
            break
            
        if status == "failure" or status == "failed":
            print(f"Processing failed: {status_data.get('error', 'Unknown error')}")
            break
            
        # Wait before checking again
        time.sleep(2)
    
    # Step 6: Get the processed audio
    if completed:
        print("\nStep 6: Getting processed audio...")
        response = requests.get(f"{api_url}/audio/processed/{memory_id}")
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            content_length = response.headers.get('Content-Length', '0')
            print(f"Retrieved processed audio successfully!")
            print(f"Content-Type: {content_type}")
            print(f"Content-Length: {content_length} bytes")
            
            # Save the processed audio to a file
            output_path = "/tmp/processed_audio.mp3"
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"Saved processed audio to {output_path}")
            
            # Check file properties
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                print(f"File size: {file_size} bytes")
                
                # Check if it's a valid audio file
                if file_size > 0:
                    print("File appears to be valid")
                else:
                    print("Warning: File size is 0 bytes")
        else:
            print(f"Failed to get processed audio: {response.text}")
    
    # Step 7: Clean up test data
    print("\nStep 7: Cleaning up test data...")
    response = requests.delete(f"{api_url}/dev/clear-test-data")
    if response.status_code == 200:
        print(f"Test data cleaned up: {response.json()['message']}")
    else:
        print(f"Failed to clean up test data: {response.text}")
    
    print("\n=== Audio Collage Testing Complete ===\n")

if __name__ == "__main__":
    test_audio_collage()

if __name__ == "__main__":
    test_audio_collage()