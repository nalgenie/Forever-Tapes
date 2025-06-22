"""
Audio Processing Tasks for Forever Tapes
"""
import os
import uuid
import json
import tempfile
import shutil
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime

import librosa
import numpy as np
import soundfile as sf
from pydub import AudioSegment
from pydub.effects import normalize, compress_dynamic_range
from celery import current_task

from . import celery_app

# Audio configuration
SAMPLE_RATE = 44100  # Podcast quality
CROSSFADE_DURATION = 0.5  # 500ms crossfade
MAX_AMPLITUDE = 0.9  # Prevent clipping
COMPRESSION_RATIO = 4.0  # Dynamic range compression
SILENCE_THRESHOLD = -50  # dB threshold for silence detection
MIN_MESSAGE_GAP = 1.0  # Minimum 1 second between messages

class AudioProcessor:
    """Professional audio processing for Forever Tapes"""
    
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        
    def __del__(self):
        if hasattr(self, 'temp_dir') and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
    
    def normalize_audio(self, audio_path: str) -> str:
        """Normalize audio levels for consistent volume"""
        try:
            # Load audio
            audio = AudioSegment.from_file(audio_path)
            
            # Normalize to consistent RMS level
            normalized = normalize(audio, headroom=3.0)  # Leave 3dB headroom
            
            # Apply gentle compression for consistency
            compressed = compress_dynamic_range(
                normalized, 
                threshold=-20.0, 
                ratio=COMPRESSION_RATIO,
                attack=5.0,
                release=50.0
            )
            
            # Output path
            output_path = os.path.join(self.temp_dir, f"normalized_{uuid.uuid4().hex}.wav")
            compressed.export(output_path, format="wav", parameters=["-ar", str(SAMPLE_RATE)])
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Audio normalization failed: {str(e)}")
    
    def enhance_voice(self, audio_path: str) -> str:
        """Enhance voice quality using librosa"""
        try:
            # Load audio with librosa for advanced processing
            y, sr = librosa.load(audio_path, sr=SAMPLE_RATE, mono=True)
            
            # Remove silence from beginning and end
            y_trimmed, _ = librosa.effects.trim(
                y, 
                top_db=abs(SILENCE_THRESHOLD),
                frame_length=2048,
                hop_length=512
            )
            
            # Gentle noise reduction using spectral gating
            # Get noise profile from first 0.5 seconds (usually silence/low signal)
            noise_sample = y_trimmed[:int(0.5 * sr)]
            if len(noise_sample) > 0:
                noise_power = np.mean(noise_sample ** 2)
                # Apply gentle noise gate
                gate_threshold = max(noise_power * 2, (10 ** (SILENCE_THRESHOLD / 20)) ** 2)
                y_gated = np.where(y_trimmed ** 2 > gate_threshold, y_trimmed, y_trimmed * 0.1)
                y_enhanced = y_gated
            else:
                y_enhanced = y_trimmed
            
            # Ensure we don't clip
            if np.max(np.abs(y_enhanced)) > 0:
                y_enhanced = y_enhanced / np.max(np.abs(y_enhanced)) * MAX_AMPLITUDE
            
            # Export enhanced audio
            output_path = os.path.join(self.temp_dir, f"enhanced_{uuid.uuid4().hex}.wav")
            sf.write(output_path, y_enhanced, SAMPLE_RATE)
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Voice enhancement failed: {str(e)}")
    
    def add_fade_in_out(self, audio_path: str, fade_in_ms: int = 100, fade_out_ms: int = 300) -> str:
        """Add gentle fade in/out to prevent pops"""
        try:
            audio = AudioSegment.from_file(audio_path)
            
            # Add fades
            faded = audio.fade_in(fade_in_ms).fade_out(fade_out_ms)
            
            # Output path
            output_path = os.path.join(self.temp_dir, f"faded_{uuid.uuid4().hex}.wav")
            faded.export(output_path, format="wav", parameters=["-ar", str(SAMPLE_RATE)])
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Fade processing failed: {str(e)}")
    
    def create_memory_collage(self, audio_files: List[str], metadata: List[Dict]) -> str:
        """Create professional audio collage from multiple voice messages"""
        try:
            if not audio_files:
                raise ValueError("No audio files provided")
            
            # Load and process all audio segments
            segments = []
            for i, audio_file in enumerate(audio_files):
                current_task.update_state(
                    state='PROGRESS',
                    meta={'stage': 'processing_voices', 'current': i + 1, 'total': len(audio_files)}
                )
                
                # Process individual audio file
                normalized_path = self.normalize_audio(audio_file)
                enhanced_path = self.enhance_voice(normalized_path)
                faded_path = self.add_fade_in_out(enhanced_path)
                
                # Load processed segment
                segment = AudioSegment.from_file(faded_path)
                segments.append(segment)
            
            current_task.update_state(
                state='PROGRESS',
                meta={'stage': 'creating_collage', 'current': 0, 'total': 1}
            )
            
            # Create the collage
            final_audio = AudioSegment.empty()
            
            for i, segment in enumerate(segments):
                if i == 0:
                    # First segment - just add it
                    final_audio += segment
                else:
                    # Add gap between messages
                    silence_gap = AudioSegment.silent(duration=int(MIN_MESSAGE_GAP * 1000))
                    
                    # Add crossfade effect
                    crossfade_ms = int(CROSSFADE_DURATION * 1000)
                    if len(final_audio) > crossfade_ms and len(segment) > crossfade_ms:
                        # Crossfade the segments
                        final_audio = final_audio.append(silence_gap, crossfade=crossfade_ms)
                        final_audio = final_audio.append(segment, crossfade=crossfade_ms)
                    else:
                        # No crossfade if segments too short
                        final_audio += silence_gap + segment
            
            # Final mastering
            current_task.update_state(
                state='PROGRESS',
                meta={'stage': 'mastering', 'current': 0, 'total': 1}
            )
            
            # Final normalization and compression
            mastered = normalize(final_audio, headroom=1.0)
            mastered = compress_dynamic_range(
                mastered,
                threshold=-18.0,
                ratio=2.0,
                attack=3.0,
                release=30.0
            )
            
            # Export final memory
            output_path = os.path.join(self.temp_dir, f"memory_collage_{uuid.uuid4().hex}.mp3")
            mastered.export(
                output_path, 
                format="mp3", 
                bitrate="192k",  # High quality for mobile
                parameters=["-ar", str(SAMPLE_RATE), "-ac", "2"]  # Stereo output
            )
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Collage creation failed: {str(e)}")

@celery_app.task(bind=True)
def process_memory_audio(self, memory_id: str, audio_file_paths: List[str], metadata: List[Dict]) -> Dict:
    """
    Process all audio messages for a memory into a professional collage
    
    Args:
        memory_id: The PodCard ID
        audio_file_paths: List of paths to audio files
        metadata: List of metadata for each audio file
    
    Returns:
        Dict with processing results and output file path
    """
    try:
        self.update_state(
            state='PROGRESS',
            meta={'stage': 'initializing', 'current': 0, 'total': len(audio_file_paths)}
        )
        
        processor = AudioProcessor()
        
        # Create the professional audio collage
        output_path = processor.create_memory_collage(audio_file_paths, metadata)
        
        # Calculate final audio info
        final_audio = AudioSegment.from_file(output_path)
        duration_seconds = len(final_audio) / 1000.0
        
        self.update_state(
            state='SUCCESS',
            meta={
                'stage': 'completed',
                'output_path': output_path,
                'duration': duration_seconds,
                'file_size': os.path.getsize(output_path),
                'processed_messages': len(audio_file_paths)
            }
        )
        
        return {
            'memory_id': memory_id,
            'output_path': output_path,
            'duration': duration_seconds,
            'file_size': os.path.getsize(output_path),
            'processed_messages': len(audio_file_paths),
            'created_at': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        self.update_state(
            state='FAILURE',
            meta={'error': str(e), 'stage': 'failed'}
        )
        raise

@celery_app.task(bind=True)
def process_single_audio(self, audio_path: str, contributor_name: str) -> Dict:
    """
    Process a single audio message for quality enhancement
    
    Args:
        audio_path: Path to the audio file
        contributor_name: Name of the contributor
    
    Returns:
        Dict with processing results
    """
    try:
        self.update_state(
            state='PROGRESS',
            meta={'stage': 'enhancing_voice', 'contributor': contributor_name}
        )
        
        processor = AudioProcessor()
        
        # Process the audio
        normalized_path = processor.normalize_audio(audio_path)
        enhanced_path = processor.enhance_voice(normalized_path)
        final_path = processor.add_fade_in_out(enhanced_path)
        
        # Replace original with processed version
        shutil.copy2(final_path, audio_path)
        
        # Get audio info
        audio = AudioSegment.from_file(audio_path)
        duration_seconds = len(audio) / 1000.0
        
        return {
            'processed_path': audio_path,
            'duration': duration_seconds,
            'contributor': contributor_name,
            'created_at': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        self.update_state(
            state='FAILURE',
            meta={'error': str(e), 'contributor': contributor_name}
        )
        raise