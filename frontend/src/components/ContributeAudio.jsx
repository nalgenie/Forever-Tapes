import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Upload, 
  ArrowLeft,
  Clock,
  User,
  Radio
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const ContributeAudio = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [podCard, setPodCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  
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
    
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [shareId]);

  const fetchPodCard = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const url = backendUrl ? `${backendUrl}/api/podcards/${shareId}` : `/api/podcards/${shareId}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPodCard(data);
      } else {
        throw new Error(`Failed to load memory: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching PodCard:', error);
      toast({
        title: "Error",
        description: "Failed to load memory. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        chunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
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
    setRecordingTime(0);
    setIsPlaying(false);
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

    // Email is now optional - no validation needed

    setIsUploading(true);
    setUploadProgress(0);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const url = backendUrl ? `${backendUrl}/api/podcards/${shareId}/audio` : `/api/podcards/${shareId}/audio`;
      
      const formData = new FormData();
      const file = new File([recordedBlob], 'message.wav', { type: 'audio/wav' });
      formData.append('audio_file', file);
      formData.append('contributor_name', contributorData.name);
      formData.append('contributor_email', contributorData.email || 'anonymous@forever-tapes.com'); // Use fallback for empty email

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploaded(true);
      
      toast({
        title: "Message added successfully!",
        description: "Your voice has been added to the memory.",
      });
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload your message. Please try again.",
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
              <Radio className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-4 text-gray-900 tracking-tight">
              MESSAGE ADDED
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
              <ArrowLeft className="w-4 h-4 mr-2 inline" />
              Back to Home
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 py-12">
        {/* Hero Section */}
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

        {!showSubmissionForm ? (
          /* Recording Interface */
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Record Your Message
                </CardTitle>
                <p className="text-gray-600">Share your voice with this memory</p>
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
                    <div className="space-y-4 w-full">
                      {/* Playback Controls */}
                      <div className="flex justify-center gap-4">
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
                      
                      {/* Submit Button */}
                      <div className="text-center">
                        <Button
                          onClick={handleReadyToSubmit}
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-lg font-bold shadow-lg"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Add to Memory
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                          You'll be asked for your name and email next
                        </p>
                      </div>
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

            {/* Helpful Tips */}
            <Card className="mt-8 border-0 shadow-xl bg-blue-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Recording Tips</h3>
                <ul className="text-blue-800 space-y-2 text-sm">
                  <li>• Find a quiet space for the best audio quality</li>
                  <li>• Speak clearly and at a natural pace</li>
                  <li>• You have up to 30 seconds to share your message</li>
                  <li>• You can listen and re-record until you're happy</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Submission Form */
          <div className="max-w-xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Almost Done!
                </CardTitle>
                <p className="text-gray-600">Let them know who this message is from</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-semibold">Your Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={contributorData.name}
                    onChange={(e) => setContributorData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-2 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-semibold">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={contributorData.email}
                    onChange={(e) => setContributorData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-2 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Used to notify you when the memory is complete
                  </p>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm font-medium mb-2 text-gray-600">
                      <span>Adding to memory...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleCancelSubmission}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={isUploading}
                  >
                    Back to Recording
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || !contributorData.name.trim() || !contributorData.email.trim()}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  >
                    {isUploading ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit Message
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributeAudio;