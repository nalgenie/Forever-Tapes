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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading memory...</p>
        </div>
      </div>
    );
  }

  if (!podCard) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Memory Not Found</h2>
          <p className="text-gray-600 mb-4">The memory you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} className="bg-blue-500 hover:bg-blue-600 text-white">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (isUploaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-8 px-6">
        <Card className="w-full max-w-lg border-0 shadow-2xl">
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
                className="bg-black text-white hover:bg-gray-800 px-6 py-3 font-medium"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black tracking-wider">FOREVER TAPES</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 py-12">
        {/* Hero Card */}
        <Card className="mb-12 border-0 shadow-xl bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <CardContent className="p-12 relative z-10 text-center">
            <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-2 backdrop-blur-sm">
              {podCard.occasion || 'Memory'}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
              {podCard.title}
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
              {podCard.description || 'Add your voice to this audio memory collection.'}
            </p>
            
            <div className="flex justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                <Clock className="w-3 h-3" />
                max 30s
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                <User className="w-3 h-3" />
                {podCard.audio_messages.length} messages so far
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contributor Info Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-400 to-cyan-500 text-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-black tracking-tight text-white">
                CONTRIBUTOR INFO
              </CardTitle>
              <p className="text-blue-100">who's adding to this memory?</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-white font-semibold">name *</Label>
                <Input
                  id="name"
                  placeholder="your name"
                  value={contributorData.name}
                  onChange={(e) => setContributorData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder-white/60 backdrop-blur-sm"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white font-semibold">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your email"
                  value={contributorData.email}
                  onChange={(e) => setContributorData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder-white/60 backdrop-blur-sm"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Recording Interface Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-black tracking-tight text-white">
                RECORD MESSAGE
              </CardTitle>
              <p className="text-purple-100">lay down your track</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Analog-style Timer Display */}
              <div className="text-center bg-black/20 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-5xl font-mono font-black text-white mb-2 tracking-wider">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-purple-200 mb-3">
                  / {formatTime(30)}
                </div>
                <Progress 
                  value={(recordingTime / 30) * 100} 
                  className="h-2 bg-white/10"
                />
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center">
                {!recordedBlob ? (
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    size="lg"
                    className={`px-12 py-6 rounded-full text-lg font-black tracking-wide ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/50' 
                        : 'bg-white text-purple-600 hover:bg-gray-100 shadow-lg'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-6 h-6 mr-3" />
                        STOP REC
                      </>
                    ) : (
                      <>
                        <Mic className="w-6 h-6 mr-3" />
                        START REC
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      onClick={isPlaying ? pauseRecording : playRecording}
                      className="bg-white text-purple-600 hover:bg-gray-100 px-6 py-3 font-semibold"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          play
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={resetRecording}
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-6 py-3 font-semibold"
                      variant="outline"
                    >
                      re-record
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
          <Card className="mt-8 border-0 shadow-lg bg-gradient-to-br from-green-400 to-emerald-500 text-white">
            <CardContent className="p-8">
              <Alert className="mb-6 bg-white/20 border-white/30 backdrop-blur-sm">
                <Radio className="w-4 h-4 text-white" />
                <AlertDescription className="text-white">
                  Your track is ready for the memory. Click to add it to the collection.
                </AlertDescription>
              </Alert>
              
              {isUploading && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-medium mb-2 text-green-100">
                    <span>adding to memory...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2 bg-white/20" />
                </div>
              )}
              
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                size="lg"
                className="w-full bg-white text-green-600 hover:bg-gray-100 py-4 text-lg font-black tracking-wide shadow-lg"
              >
                {isUploading ? (
                  'ADDING TO MEMORY...'
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    ADD TO MEMORY
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recording Tips - Vintage Style */}
        <Card className="mt-8 border-0 shadow-lg bg-yellow-50 border-l-4 border-yellow-400">
          <CardContent className="p-8">
            <h3 className="font-black text-lg mb-4 text-yellow-800 tracking-wide">RECORDING TIPS:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-700">
              <div>
                <p>• find a quiet spot</p>
                <p>• keep phone 6 inches away</p>
                <p>• speak clearly and naturally</p>
              </div>
              <div>
                <p>• stay under 30 seconds</p>
                <p>• share a specific memory</p>
                <p>• keep it genuine</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContributeAudio;