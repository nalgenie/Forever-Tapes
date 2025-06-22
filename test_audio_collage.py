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
    
    # Step 2: Create a test memory with multiple audio messages
    print("\nStep 2: Creating a test memory...")
    memory_data = {
        "title": "Audio Collage Test Memory",
        "description": "Test memory for audio collage functionality",
        "occasion": "testing"
    }
    
    response = requests.post(f"{api_url}/podcards/free", json=memory_data)
    if response.status_code != 200:
        print(f"Failed to create test memory: {response.text}")
        return
    
    memory = response.json()
    memory_id = memory["id"]
    print(f"Created test memory with ID: {memory_id}")
    
    # Step 3: Add audio messages to the memory
    print("\nStep 3: Adding audio messages to the memory...")
    
    # Create test audio files
    test_files = []
    for i in range(2):
        test_audio_path = f"/tmp/test_audio_{i}.wav"
        with open(test_audio_path, "wb") as f:
            # Write a simple WAV header and some data
            f.write(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00")
            # Add some random data
            f.write(bytes([i % 256 for _ in range(1000)]))
        test_files.append(test_audio_path)
    
    # Upload audio messages
    for i, file_path in enumerate(test_files):
        files = {'audio_file': (f'test_audio_{i}.wav', open(file_path, 'rb'), 'audio/wav')}
        data = {
            'contributor_name': f'Test Contributor {i}',
            'contributor_email': f'contributor{i}@example.com'
        }
        
        response = requests.post(
            f"{api_url}/podcards/{memory_id}/audio",
            files=files,
            data=data
        )
        
        if response.status_code != 200:
            print(f"Failed to upload audio message {i}: {response.text}")
            continue
        
        print(f"Uploaded audio message {i} successfully")
    
    # Step 4: Verify the memory has the audio messages
    print("\nStep 4: Verifying memory has audio messages...")
    response = requests.get(f"{api_url}/podcards/{memory_id}")
    if response.status_code != 200:
        print(f"Failed to get memory: {response.text}")
        return
    
    memory = response.json()
    print(f"Memory has {len(memory['audio_messages'])} audio messages")
    
    # Step 5: Process the memory audio
    print("\nStep 5: Processing memory audio...")
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
    
    # Step 6: Poll the status until completion
    print("\nStep 6: Polling status until completion...")
    max_attempts = 10
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
    
    # Step 7: Get the processed audio
    if completed:
        print("\nStep 7: Getting processed audio...")
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
    
    # Clean up
    for file_path in test_files:
        if os.path.exists(file_path):
            os.remove(file_path)
    
    print("\n=== Audio Collage Testing Complete ===\n")

if __name__ == "__main__":
    test_audio_collage()