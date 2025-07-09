import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Mic, 
  Square, 
  Upload, 
  Play, 
  Pause,
  Download, 
  RefreshCw,
  Waveform,
  Volume2,
  ArrowLeft,
  TestTube,
  Zap,
  FileAudio,
  Activity
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import WaveSurfer from 'wavesurfer.js';

const TestAudioPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [testMemory, setTestMemory] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [collageReady, setCollageReady] = useState(false);
  
  // Refs for waveform visualizations
  const recordingWaveformRef = useRef(null);
  const uploadWaveformRef = useRef(null);
  const collageWaveformRef = useRef(null);
  
  // WaveSurfer instances
  const recordingWaveSurfer = useRef(null);
  const uploadWaveSurfer = useRef(null);
  const collageWaveSurfer = useRef(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDevelopment) {
      navigate('/');
      return;
    }
    
    initializeTestMemory();
    
    // Cleanup function
    return () => {
      if (recordingWaveSurfer.current) recordingWaveSurfer.current.destroy();
      if (uploadWaveSurfer.current) uploadWaveSurfer.current.destroy();
      if (collageWaveSurfer.current) collageWaveSurfer.current.destroy();
    };
  }, [isDevelopment, navigate]);

  const initializeTestMemory = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/dev/latest-test-memory`);
      const data = await response.json();
      
      if (data.success) {
        setTestMemory(data.memory);
        toast({
          title: "🧪 Test Memory Ready",
          description: "Developer test memory initialized",
        });
      }
    } catch (error) {
      console.error('Failed to initialize test memory:', error);
      toast({
        title: "Error",
        description: "Failed to initialize test memory",
        variant: "destructive"
      });
    }
  };

  const initializeWaveform = (containerRef, waveSurferRef, options = {}) => {
    if (waveSurferRef.current) {
      waveSurferRef.current.destroy();
    }

    waveSurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#8b5cf6',
      progressColor: '#6d28d9',
      barWidth: 2,
      barGap: 1,
      responsive: true,
      height: 60,
      normalize: true,
      backend: 'WebAudio',
      ...options
    });

    return waveSurferRef.current;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        
        // Create waveform for recorded audio
        if (recordingWaveformRef.current) {
          const wavesurfer = initializeWaveform(recordingWaveformRef, recordingWaveSurfer, {
            waveColor: '#10b981',
            progressColor: '#059669'
          });
          
          const url = URL.createObjectURL(blob);
          wavesurfer.load(url);
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      toast({
        title: "🎤 Recording Started",
        description: "High-quality audio recording in progress...",
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      toast({
        title: "🎤 Recording Stopped",
        description: "Audio recorded successfully with waveform",
      });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      
      // Create waveform for uploaded file
      if (uploadWaveformRef.current) {
        const wavesurfer = initializeWaveform(uploadWaveformRef, uploadWaveSurfer, {
          waveColor: '#f59e0b',
          progressColor: '#d97706'
        });
        
        const url = URL.createObjectURL(file);
        wavesurfer.load(url);
      }
      
      toast({
        title: "📁 File Uploaded",
        description: `${file.name} loaded with waveform visualization`,
      });
    }
  };

  const uploadAudioToMemory = async (audioBlob, filename, contributorName) => {
    if (!testMemory) return;

    const formData = new FormData();
    formData.append('audio_file', audioBlob, filename);
    formData.append('contributor_name', contributorName);
    formData.append('contributor_email', 'dev-test@forever-tapes.com');

    try {
      const response = await fetch(
        `${backendUrl}/api/podcards/${testMemory.id}/audio`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        // Refresh test memory to get updated audio messages
        await initializeTestMemory();
        
        return result;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const uploadRecordedAudio = async () => {
    if (!recordedBlob) return;

    try {
      await uploadAudioToMemory(recordedBlob, 'recorded-audio.webm', 'Test Recorder');
      setRecordedBlob(null);
      
      toast({
        title: "✅ Recorded Audio Uploaded",
        description: "Your recording has been added to the test memory",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not upload recorded audio",
        variant: "destructive"
      });
    }
  };

  const uploadSelectedFile = async () => {
    if (!uploadedFile) return;

    try {
      await uploadAudioToMemory(uploadedFile, uploadedFile.name, 'Test Uploader');
      setUploadedFile(null);
      
      toast({
        title: "✅ File Uploaded",
        description: "Your file has been added to the test memory",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not upload audio file",
        variant: "destructive"
      });
    }
  };

  const generateCollage = async () => {
    if (!testMemory || !testMemory.audio_messages || testMemory.audio_messages.length === 0) {
      toast({
        title: "No Audio Messages",
        description: "Add some audio messages before generating a collage",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Starting collage generation...');

    try {
      // Start processing
      const response = await fetch(`${backendUrl}/api/audio/process-memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `memory_id=${testMemory.id}`
      });

      if (!response.ok) {
        throw new Error('Failed to start processing');
      }

      const result = await response.json();
      setTaskId(result.task_id);
      
      // Poll for status
      pollProcessingStatus(result.task_id);
      
    } catch (error) {
      console.error('Collage generation error:', error);
      setIsProcessing(false);
      toast({
        title: "Generation Failed",
        description: "Could not start collage generation",
        variant: "destructive"
      });
    }
  };

  const pollProcessingStatus = (taskId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${backendUrl}/api/audio/status/${taskId}`);
        const status = await response.json();
        
        setProcessingStatus(`Status: ${status.status} - ${status.stage || 'Processing'}`);
        
        if (status.status === 'completed' || status.status === 'success') {
          clearInterval(interval);
          setIsProcessing(false);
          setCollageReady(true);
          
          // Load collage waveform
          if (collageWaveformRef.current && testMemory) {
            const wavesurfer = initializeWaveform(collageWaveformRef, collageWaveSurfer, {
              waveColor: '#dc2626',
              progressColor: '#b91c1c'
            });
            
            wavesurfer.load(`${backendUrl}/api/audio/processed/${testMemory.id}`);
          }
          
          toast({
            title: "🎉 Collage Ready!",
            description: "Audio collage generated successfully with waveform",
          });
        } else if (status.status === 'failed' || status.status === 'failure') {
          clearInterval(interval);
          setIsProcessing(false);
          toast({
            title: "Generation Failed",
            description: status.error || "Unknown error occurred",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 2000);
  };

  const playWaveform = (waveSurferRef) => {
    if (waveSurferRef.current) {
      if (waveSurferRef.current.isPlaying()) {
        waveSurferRef.current.pause();
      } else {
        waveSurferRef.current.play();
      }
    }
  };

  const downloadCollage = () => {
    if (testMemory && collageReady) {
      const link = document.createElement('a');
      link.href = `${backendUrl}/api/audio/processed/${testMemory.id}`;
      link.download = `test-collage-${testMemory.id}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearTestData = async () => {
    try {
      await fetch(`${backendUrl}/api/dev/clear-test-memories`, { method: 'DELETE' });
      setTestMemory(null);
      setRecordedBlob(null);
      setUploadedFile(null);
      setCollageReady(false);
      setTaskId(null);
      
      // Clear waveforms
      if (recordingWaveSurfer.current) recordingWaveSurfer.current.empty();
      if (uploadWaveSurfer.current) uploadWaveSurfer.current.empty();
      if (collageWaveSurfer.current) collageWaveSurfer.current.empty();
      
      await initializeTestMemory();
      
      toast({
        title: "🧹 Test Data Cleared",
        description: "All test data cleared, fresh memory created",
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Could not clear test data",
        variant: "destructive"
      });
    }
  };

  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="relative z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="p-0 h-auto text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <Badge className="bg-red-100 text-red-800 border-red-200">
              <TestTube className="w-3 h-3 mr-1" />
              Developer Mode Only
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-light mb-4 tracking-tight text-gray-900">
            <span className="font-mono lowercase text-purple-600">test/audio</span>
          </h1>
          <p className="text-xl text-gray-600">
            Developer Testing Mode with Waveform Visualization
          </p>
        </div>

        {/* Test Memory Info */}
        {testMemory && (
          <Card className="mb-8 border-0 shadow-xl bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Active Test Memory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Title:</strong> {testMemory.title}</p>
                  <p><strong>Description:</strong> {testMemory.description}</p>
                  <p><strong>Audio Messages:</strong> {testMemory.audio_messages?.length || 0}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={clearTestData}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Clear & Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recording Section */}
          <Card className="border-0 shadow-xl bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mic className="w-5 h-5 mr-2 text-green-600" />
                Audio Recording with Waveform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-3">
                {!isRecording ? (
                  <Button onClick={startRecording} className="bg-green-600 hover:bg-green-700">
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-700">
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>

              {/* Recording Waveform */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Waveform className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-sm font-medium">Recording Waveform</span>
                </div>
                <div 
                  ref={recordingWaveformRef} 
                  className="w-full h-16 bg-white rounded border"
                ></div>
                {recordedBlob && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      onClick={() => playWaveform(recordingWaveSurfer)} 
                      size="sm" 
                      variant="outline"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Play/Pause
                    </Button>
                    <Button onClick={uploadRecordedAudio} size="sm">
                      <Upload className="w-3 h-3 mr-1" />
                      Upload to Memory
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card className="border-0 shadow-xl bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileAudio className="w-5 h-5 mr-2 text-orange-600" />
                File Upload with Waveform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="border-gray-300"
                />
              </div>

              {/* Upload Waveform */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Waveform className="w-4 h-4 mr-2 text-orange-600" />
                  <span className="text-sm font-medium">Upload Waveform</span>
                </div>
                <div 
                  ref={uploadWaveformRef} 
                  className="w-full h-16 bg-white rounded border"
                ></div>
                {uploadedFile && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      onClick={() => playWaveform(uploadWaveSurfer)} 
                      size="sm" 
                      variant="outline"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Play/Pause
                    </Button>
                    <Button onClick={uploadSelectedFile} size="sm">
                      <Upload className="w-3 h-3 mr-1" />
                      Upload to Memory
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collage Generation Section */}
        <Card className="mt-8 border-0 shadow-xl bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-purple-600" />
              Audio Collage Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-3">
              <Button 
                onClick={generateCollage} 
                disabled={isProcessing || !testMemory?.audio_messages?.length}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Collage
                  </>
                )}
              </Button>
            </div>

            {isProcessing && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800">{processingStatus}</p>
              </div>
            )}

            {/* Collage Waveform */}
            {collageReady && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Volume2 className="w-4 h-4 mr-2 text-red-600" />
                  <span className="text-sm font-medium">Final Collage Waveform</span>
                </div>
                <div 
                  ref={collageWaveformRef} 
                  className="w-full h-16 bg-white rounded border"
                ></div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    onClick={() => playWaveform(collageWaveSurfer)} 
                    size="sm" 
                    variant="outline"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Play/Pause Collage
                  </Button>
                  <Button onClick={downloadCollage} size="sm">
                    <Download className="w-3 h-3 mr-1" />
                    Download MP3
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 border-0 shadow-xl bg-blue-50">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">🧪 Developer Testing Workflow</h3>
            <ol className="text-blue-800 space-y-2 list-decimal list-inside">
              <li><strong>Record Audio:</strong> Use microphone to record with real-time waveform</li>
              <li><strong>Upload Files:</strong> Select audio files with instant waveform visualization</li>
              <li><strong>Add to Memory:</strong> Upload recordings/files to the test memory</li>
              <li><strong>Generate Collage:</strong> Process multiple audio messages into professional collage</li>
              <li><strong>Play & Download:</strong> Test final output with waveform controls</li>
              <li><strong>Reset:</strong> Clear all test data and start fresh</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> This page is only available in development mode. 
                Waveforms provide real-time audio visualization for debugging quality and silence detection.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestAudioPage;