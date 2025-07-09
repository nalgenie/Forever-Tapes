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
  Activity,
  Trash2,
  Plus
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
  const [contributorName, setContributorName] = useState('Test User');
  
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
          title: "🧪 Clean Test Environment Ready",
          description: "Fresh test memory initialized for audio testing",
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
      height: 80,
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
          autoGainControl: true,
          sampleRate: 44100
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
        title: "🎤 Recording Complete",
        description: "Audio recorded with waveform visualization",
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
        title: "📁 File Loaded",
        description: `${file.name} ready with waveform visualization`,
      });
    }
  };

  const uploadAudioToMemory = async (audioBlob, filename, contributorName) => {
    if (!testMemory) return;

    const formData = new FormData();
    formData.append('audio_file', audioBlob, filename);
    formData.append('contributor_name', contributorName);
    formData.append('contributor_email', 'test@forever-tapes.com');

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
    if (!recordedBlob || !contributorName.trim()) return;

    try {
      await uploadAudioToMemory(recordedBlob, 'recorded-audio.webm', contributorName);
      setRecordedBlob(null);
      
      if (recordingWaveSurfer.current) {
        recordingWaveSurfer.current.empty();
      }
      
      toast({
        title: "✅ Recording Added",
        description: `${contributorName}'s recording added to test memory`,
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
    if (!uploadedFile || !contributorName.trim()) return;

    try {
      await uploadAudioToMemory(uploadedFile, uploadedFile.name, contributorName);
      setUploadedFile(null);
      
      if (uploadWaveSurfer.current) {
        uploadWaveSurfer.current.empty();
      }
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      toast({
        title: "✅ File Added",
        description: `${contributorName}'s file added to test memory`,
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
    setProcessingStatus('Initializing audio collage generation...');
    setCollageReady(false);

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
            title: "🎉 Collage Complete!",
            description: "Professional audio collage generated successfully",
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
      setProcessingStatus('');
      
      // Clear waveforms
      if (recordingWaveSurfer.current) recordingWaveSurfer.current.empty();
      if (uploadWaveSurfer.current) uploadWaveSurfer.current.empty();
      if (collageWaveSurfer.current) collageWaveSurfer.current.empty();
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      await initializeTestMemory();
      
      toast({
        title: "🧹 Environment Reset",
        description: "Clean test environment ready for new testing",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Could not reset test environment",
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
            
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
              <TestTube className="w-3 h-3 mr-1" />
              Clean Test Environment
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-light mb-4 tracking-tight text-gray-900">
            <span className="font-mono lowercase text-emerald-600">test/audio</span>
          </h1>
          <p className="text-xl text-gray-600">
            Clean Audio Testing Environment
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Record → Upload → Collage → Test
          </p>
        </div>

        {/* Test Memory Info */}
        {testMemory && (
          <Card className="mb-8 border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-emerald-600" />
                  Test Memory
                </div>
                <Button
                  onClick={clearTestData}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Reset Environment
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Title:</span> {testMemory.title}
                </div>
                <div>
                  <span className="font-medium">Audio Messages:</span> {testMemory.audio_messages?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <Badge className="ml-2" variant="outline">
                    Ready for Testing
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contributor Name Input */}
        <Card className="mb-8 border-0 shadow-lg bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 min-w-fit">
                Contributor Name:
              </label>
              <Input
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                placeholder="Enter contributor name..."
                className="max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recording Section */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mic className="w-5 h-5 mr-2 text-green-600" />
                Audio Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                {!isRecording ? (
                  <Button 
                    onClick={startRecording} 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!contributorName.trim()}
                  >
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Waveform className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-sm font-medium">Recording Waveform</span>
                  </div>
                  {recordedBlob && (
                    <Badge className="bg-green-100 text-green-700">
                      Ready to Upload
                    </Badge>
                  )}
                </div>
                <div 
                  ref={recordingWaveformRef} 
                  className="w-full h-20 bg-white rounded border-2 border-dashed border-gray-300"
                ></div>
                {recordedBlob && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      onClick={() => playWaveform(recordingWaveSurfer)} 
                      size="sm" 
                      variant="outline"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      onClick={uploadRecordedAudio} 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add to Memory
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileAudio className="w-5 h-5 mr-2 text-orange-600" />
                File Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="border-gray-300"
                  disabled={!contributorName.trim()}
                />
              </div>

              {/* Upload Waveform */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Waveform className="w-4 h-4 mr-2 text-orange-600" />
                    <span className="text-sm font-medium">File Waveform</span>
                  </div>
                  {uploadedFile && (
                    <Badge className="bg-orange-100 text-orange-700">
                      {uploadedFile.name}
                    </Badge>
                  )}
                </div>
                <div 
                  ref={uploadWaveformRef} 
                  className="w-full h-20 bg-white rounded border-2 border-dashed border-gray-300"
                ></div>
                {uploadedFile && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      onClick={() => playWaveform(uploadWaveSurfer)} 
                      size="sm" 
                      variant="outline"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      onClick={uploadSelectedFile} 
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add to Memory
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collage Generation Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
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
                    Generate Professional Collage
                  </>
                )}
              </Button>
            </div>

            {isProcessing && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800 text-sm">{processingStatus}</p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Collage Waveform */}
            {collageReady && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Volume2 className="w-4 h-4 mr-2 text-red-600" />
                    <span className="text-sm font-medium">Final Collage</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    Ready for Download
                  </Badge>
                </div>
                <div 
                  ref={collageWaveformRef} 
                  className="w-full h-20 bg-white rounded border-2 border-red-300"
                ></div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    onClick={() => playWaveform(collageWaveSurfer)} 
                    size="sm" 
                    variant="outline"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Play Collage
                  </Button>
                  <Button 
                    onClick={downloadCollage} 
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download MP3
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 border-0 shadow-lg bg-emerald-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-emerald-900 mb-4">
              🧪 Clean Testing Workflow
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-emerald-800 mb-2">Testing Steps:</h4>
                <ol className="text-emerald-700 text-sm space-y-1 list-decimal list-inside">
                  <li>Enter contributor name</li>
                  <li>Record or upload audio files</li>
                  <li>Preview with waveform visualization</li>
                  <li>Add multiple messages to memory</li>
                  <li>Generate professional audio collage</li>
                  <li>Test final playback and download</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-emerald-800 mb-2">Features:</h4>
                <ul className="text-emerald-700 text-sm space-y-1 list-disc list-inside">
                  <li>Real-time waveform visualization</li>
                  <li>High-quality audio processing</li>
                  <li>Professional collage generation</li>
                  <li>Clean, focused testing environment</li>
                  <li>Development-only access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestAudioPage;