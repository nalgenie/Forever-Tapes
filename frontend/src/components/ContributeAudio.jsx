import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Mic, MicOff, Play, Pause, Upload, Check, Clock, User, Mail, Phone, Volume2, Heart } from 'lucide-react';
import { mockAPI } from '../mock';
import { useToast } from '../hooks/use-toast';

const ContributeAudio = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  
  // Mock celebration data with new branding
  const celebrationData = {
    title: 'Birthday Celebration for Sarah',
    description: 'Help us create a beautiful birthday celebration for Sarah! Record a heartfelt message sharing your favorite memory or wishing her all the best.',
    maxMessageDuration: 30, // 30 seconds
    createdBy: 'Mike Johnson',
    remainingSlots: 3,
    totalSlots: 10,
    celebrationType: 'Birthday'
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

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
          // Auto-stop at max duration
          if (newTime >= celebrationData.maxMessageDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to record your heartfelt message.",
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
    if (!recordedBlob) return;
    
    if (!contributorData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please share your name so we know who this beautiful message is from.",
        variant: "destructive"
      });
      return;
    }
    
    if (!contributorData.email.trim()) {
      toast({
        title: "Email Required",
        description: "We need your email to send you updates about this celebration.",
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
      await mockAPI.uploadAudio(file, contributorData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploaded(true);
      
      toast({
        title: "Message Added Successfully! 🎉",
        description: "Thank you for contributing to this beautiful celebration!",
      });
      
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        title: "Upload Failed",
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

  if (isUploaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-8 px-6">
        <Card className="w-full max-w-lg border-0 bg-gray-50 text-center">
          <CardContent className="p-12">
            <div className="w-20 h-20 mx-auto mb-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800 tracking-tight">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your heartfelt message has been added to <strong>{celebrationData.title}</strong>. 
              {celebrationData.createdBy} will be delighted when they experience the final celebration.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-black text-white hover:bg-gray-800 rounded-full px-8"
            >
              Create Your Own Celebration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">FOREVER TAPES</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-3xl px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-6 bg-purple-100 text-purple-800 border-0 px-4 py-2">
            ✨ {celebrationData.celebrationType} Celebration
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
            {celebrationData.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            {celebrationData.description}
          </p>
          
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <Badge variant="outline" className="border-gray-300">
              <Clock className="w-3 h-3 mr-1" />
              Max {celebrationData.maxMessageDuration}s
            </Badge>
            <Badge variant="outline" className="border-gray-300">
              <User className="w-3 h-3 mr-1" />
              {celebrationData.remainingSlots} slots remaining
            </Badge>
          </div>
        </div>

        {/* Contributor Information */}
        <Card className="mb-8 border-0 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">Your Information</CardTitle>
            <p className="text-gray-600">Let us know who this beautiful message is from</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-lg font-semibold">Your Name *</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={contributorData.name}
                onChange={(e) => setContributorData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-2 h-12 text-lg"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-lg font-semibold">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={contributorData.email}
                onChange={(e) => setContributorData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-2 h-12 text-lg"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-lg font-semibold">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={contributorData.phone}
                onChange={(e) => setContributorData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-2 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recording Interface */}
        <Card className="border-0 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">Record Your Message</CardTitle>
            <p className="text-gray-600">Share your heartfelt thoughts and make this celebration special</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Recording Timer */}
            <div className="text-center">
              <div className="text-6xl font-mono font-black text-gray-800 mb-4">
                {formatTime(recordingTime)}
              </div>
              <div className="text-lg text-gray-600 mb-4">
                {formatTime(celebrationData.maxMessageDuration)} maximum
              </div>
              <Progress 
                value={(recordingTime / celebrationData.maxMessageDuration) * 100} 
                className="h-3"
              />
            </div>

            {/* Recording Controls */}
            <div className="flex justify-center gap-6">
              {!recordedBlob ? (
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  size="lg"
                  className={`px-12 py-6 rounded-full text-lg font-semibold ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                      : 'bg-black text-white hover:bg-gray-800'
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
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 rounded-full border-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetRecording}
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 rounded-full border-2"
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

            {/* Upload Section */}
            {recordedBlob && (
              <div className="border-t border-gray-200 pt-8">
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <Heart className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your message sounds wonderful! Click upload to add it to the celebration.
                  </AlertDescription>
                </Alert>
                
                {isUploading && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span>Uploading your message...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  size="lg"
                  className="w-full bg-black text-white hover:bg-gray-800 py-4 text-lg font-semibold rounded-full"
                >
                  {isUploading ? (
                    'Adding Your Message...'
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Add Message to Celebration
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recording Tips */}
        <Card className="mt-8 border-0 bg-blue-50">
          <CardContent className="p-8">
            <h3 className="font-bold text-lg mb-4 text-blue-800">Recording Tips for the Best Experience:</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• Find a quiet space to minimize background noise</li>
              <li>• Hold your device about 6 inches from your mouth</li>
              <li>• Speak clearly and from the heart</li>
              <li>• Keep your message under {celebrationData.maxMessageDuration} seconds</li>
              <li>• Share a specific memory or heartfelt wish</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContributeAudio;