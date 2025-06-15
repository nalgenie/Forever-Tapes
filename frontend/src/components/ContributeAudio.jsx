import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Mic, MicOff, Play, Pause, Upload, Check, Clock, User, Mail, Phone } from 'lucide-react';
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
  
  // Mock pod-card data
  const podCardData = {
    title: 'Birthday Surprise for Sarah',
    description: 'Help us create a special birthday surprise for Sarah! Record a heartfelt message to wish her a happy birthday.',
    maxMessageDuration: 30, // 30 seconds
    createdBy: 'Mike Johnson',
    remainingSlots: 3,
    totalSlots: 10
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
          if (newTime >= podCardData.maxMessageDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Denied",
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
    if (!recordedBlob) return;
    
    if (!contributorData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name before uploading.",
        variant: "destructive"
      });
      return;
    }
    
    if (!contributorData.email.trim()) {
      toast({
        title: "Email Required",
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
      await mockAPI.uploadAudio(file, contributorData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploaded(true);
      
      toast({
        title: "Message Uploaded! 🎉",
        description: "Thank you for contributing to this pod-card!",
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
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md border-0 bg-white/50 backdrop-blur-sm text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              Your message has been successfully added to the pod-card. 
              {podCardData.createdBy} will be notified when all messages are collected.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Create Your Own Pod-Card
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            {podCardData.title}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {podCardData.description}
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              Max {podCardData.maxMessageDuration}s
            </Badge>
            <Badge variant="outline">
              <User className="w-3 h-3 mr-1" />
              {podCardData.remainingSlots} slots left
            </Badge>
          </div>
        </div>

        {/* Contributor Information */}
        <Card className="mb-8 border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={contributorData.name}
                onChange={(e) => setContributorData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={contributorData.email}
                onChange={(e) => setContributorData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={contributorData.phone}
                onChange={(e) => setContributorData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recording Interface */}
        <Card className="border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Record Your Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recording Timer */}
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-gray-800 mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="text-sm text-gray-600">
                {formatTime(podCardData.maxMessageDuration)} maximum
              </div>
              <Progress 
                value={(recordingTime / podCardData.maxMessageDuration) * 100} 
                className="mt-2"
              />
            </div>

            {/* Recording Controls */}
            <div className="flex justify-center gap-4">
              {!recordedBlob ? (
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  size="lg"
                  className={`px-8 py-6 rounded-full ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-6 h-6 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-6 h-6 mr-2" />
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
                    className="px-6"
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
              <div className="border-t pt-6">
                <Alert className="mb-4">
                  <AlertDescription>
                    Your message is ready! Click upload to add it to the pod-card.
                  </AlertDescription>
                </Alert>
                
                {isUploading && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
                
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  {isUploading ? (
                    'Uploading...'
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Message
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-8 border-0 bg-blue-50/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 text-blue-800">Recording Tips:</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Find a quiet space to minimize background noise</li>
              <li>• Hold your phone about 6 inches from your mouth</li>
              <li>• Speak clearly and at a comfortable pace</li>
              <li>• Keep your message under {podCardData.maxMessageDuration} seconds</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContributeAudio;