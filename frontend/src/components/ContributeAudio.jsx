import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Mic, MicOff, Play, Pause, Upload, Check, Clock, User, Mail, Phone, Volume2, Radio } from 'lucide-react';
import { api } from '../api';
import { useToast } from '../hooks/use-toast';

const ContributeAudio = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [podCard, setPodCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false); // New state for final step
  
  const [contributorData, setContributorData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    fetchPodCard();
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [shareId, audioURL]);

  const fetchPodCard = async () => {
    try {
      const response = await api.getPodCard(shareId);
      setPodCard(response);
    } catch (error) {
      console.error('Error fetching podcard:', error);
      toast({
        title: "Memory not found",
        description: "The audio memory you're looking for doesn't exist.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto-stop at 30 seconds for now
          if (newTime >= 30) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Mic access required",
        description: "Please allow microphone access to record your message.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setIsPlaying(false);
    setRecordingTime(0);
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
  };

  const handleReadyToSubmit = () => {
    if (!recordedBlob) {
      toast({
        title: "No recording found",
        description: "Please record a message first.",
        variant: "destructive"
      });
      return;
    }
    setShowSubmissionForm(true);
  };

  const handleCancelSubmission = () => {
    setShowSubmissionForm(false);
    setContributorData({ name: '', email: '', phone: '' });
  };

  const handleUpload = async () => {
    if (!recordedBlob || !podCard) return;
    
    if (!contributorData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name.",
        variant: "destructive"
      });
      return;
    }

    if (!contributorData.email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      const file = new File([recordedBlob], 'message.wav', { type: 'audio/wav' });
      await api.uploadAudio(shareId, file, contributorData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploaded(true);
      
      toast({
        title: "Message added to memory ●",
        description: "Thanks for contributing to this audio memory.",
      });
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading memory...</p>
        </div>
      </div>
    );
  }

  if (!podCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Memory Not Found</h2>
          <p className="text-gray-600 mb-4">The memory you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} className="bg-purple-500 hover:bg-purple-600 text-white">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (isUploaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center py-8 px-6">
        <Card className="w-full max-w-lg border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-4 text-gray-900 tracking-tight">
              MESSAGE RECORDED
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your message has been added to <span className="font-semibold">{podCard.title}</span>. 
              {podCard.creator_name} will receive the final memory when complete.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => navigate(`/listen/${shareId}`)}
                className="bg-purple-500 text-white hover:bg-purple-600 px-6 py-3 font-medium"
              >
                Listen to Memory
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 font-medium"
              >
                Create Your Own
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="relative z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 py-12">
        {/* Hero Section - matching home page style */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-light mb-4 tracking-tight leading-none text-gray-900">
              <span className="font-mono lowercase vintage-gradient-text vintage-font">forever tapes</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light tracking-wide">
              Add Your Voice to the Memory
            </p>
          </div>
        </div>

        {/* Memory Details Card */}
        <Card className="mb-12 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 px-4 py-2">
              {podCard.occasion || 'Memory'}
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              {podCard.title}
            </h2>
            
            <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
              {podCard.description || 'Add your voice to this audio memory collection.'}
            </p>
            
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Max 30 seconds
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {podCard.audio_messages.length} messages collected
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contributor Info Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Your Information
              </CardTitle>
              <p className="text-gray-600">Let them know who this message is from</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-gray-700 font-semibold">Name *</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={contributorData.name}
                  onChange={(e) => setContributorData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700 font-semibold">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  value={contributorData.email}
                  onChange={(e) => setContributorData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-2 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Recording Interface Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Record Your Message
              </CardTitle>
              <p className="text-gray-600">Share your voice with the memory</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="text-center bg-gray-50 rounded-2xl p-6">
                <div className="text-5xl font-mono font-bold text-gray-900 mb-2 tracking-wider">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  / {formatTime(30)}
                </div>
                <Progress 
                  value={(recordingTime / 30) * 100} 
                  className="h-2"
                />
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center">
                {!recordedBlob ? (
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    size="lg"
                    className={`px-12 py-6 rounded-full text-lg font-bold tracking-wide ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg' 
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-6 h-6 mr-3" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-6 h-6 mr-3" />
                        Start Recording
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      onClick={isPlaying ? pauseRecording : playRecording}
                      className="bg-purple-600 text-white hover:bg-purple-700 px-6 py-3 font-semibold"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={resetRecording}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-6 py-3 font-semibold"
                      variant="outline"
                    >
                      Re-record
                    </Button>
                  </div>
                )}
              </div>

              {/* Audio Element */}
              {audioURL && (
                <audio
                  ref={audioRef}
                  src={audioURL}
                  onEnded={() => setIsPlaying(false)}
                  style={{ display: 'none' }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        {recordedBlob && (
          <Card className="mt-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <Alert className="mb-6 bg-green-50 border-green-200">
                <Radio className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Your message is ready! Click to add it to the memory collection.
                </AlertDescription>
              </Alert>
              
              {isUploading && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-medium mb-2 text-gray-600">
                    <span>Adding to memory...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                size="lg"
                className="w-full bg-green-600 text-white hover:bg-green-700 py-4 text-lg font-bold tracking-wide shadow-lg"
              >
                {isUploading ? (
                  'Adding to Memory...'
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Add to Memory
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recording Tips - Vintage Style + Demo Examples */}
        <Card className="mt-8 border-0 shadow-lg bg-yellow-50 border-l-4 border-yellow-400">
          <CardContent className="p-8">
            <h3 className="font-black text-lg mb-4 text-yellow-800 tracking-wide">RECORDING TIPS & EXAMPLES:</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recording Tips */}
              <div>
                <h4 className="font-semibold mb-3 text-yellow-700">Recording tips:</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>• find a quiet spot</p>
                  <p>• keep phone 6 inches away</p>
                  <p>• speak clearly and naturally</p>
                  <p>• stay under 30 seconds</p>
                  <p>• share a specific memory</p>
                  <p>• keep it genuine</p>
                </div>
              </div>

              {/* Demo Examples */}
              <div>
                <h4 className="font-semibold mb-3 text-yellow-700">Example messages for inspiration:</h4>
                <div className="space-y-3">
                  {/* Demo Example 1 */}
                  <div className="bg-white/60 rounded p-3 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-yellow-800">Birthday example</span>
                      <button className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center hover:bg-yellow-300 transition-colors">
                        <Play className="w-3 h-3 text-yellow-700" />
                      </button>
                    </div>
                    <p className="text-xs text-yellow-700 italic">
                      "Remember when we got lost on our road trip? That was the best adventure..."
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">🎵 Demo placeholder - 12s</p>
                  </div>

                  {/* Demo Example 2 */}
                  <div className="bg-white/60 rounded p-3 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-yellow-800">Thank you example</span>
                      <button className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center hover:bg-yellow-300 transition-colors">
                        <Play className="w-3 h-3 text-yellow-700" />
                      </button>
                    </div>
                    <p className="text-xs text-yellow-700 italic">
                      "Thank you for always believing in me, especially when I didn't believe in myself..."
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">🎵 Demo placeholder - 18s</p>
                  </div>

                  {/* Demo Example 3 */}
                  <div className="bg-white/60 rounded p-3 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-yellow-800">Memory example</span>
                      <button className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center hover:bg-yellow-300 transition-colors">
                        <Play className="w-3 h-3 text-yellow-700" />
                      </button>
                    </div>
                    <p className="text-xs text-yellow-700 italic">
                      "You taught me how to ride a bike, and more importantly, how to get back up when I fall..."
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">🎵 Demo placeholder - 15s</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContributeAudio;