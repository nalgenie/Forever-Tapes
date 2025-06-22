import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Download,
  Share2,
  MessageSquare,
  Clock,
  Users,
  Music,
  Plus,
  ArrowLeft,
  Heart,
  Gift
} from 'lucide-react';
import { api } from '../api';
import { useToast } from '../hooks/use-toast';

const ListenToPodCard = () => {
  const { podCardId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [podCard, setPodCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'collage'
  
  // Collage-specific states
  const [collageProcessing, setCollageProcessing] = useState(false);
  const [collageStatus, setCollageStatus] = useState(null);
  const [collageTaskId, setCollageTaskId] = useState(null);
  const [processedCollageUrl, setProcessedCollageUrl] = useState(null);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    fetchPodCard();
  }, [podCardId]);

  const fetchPodCard = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      
      // Handle demo case
      if (podCardId === 'demo') {
        const url = backendUrl ? `${backendUrl}/api/demo/audio` : '/api/demo/audio';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setPodCard(data);
        } else {
          throw new Error(`Failed to load demo: ${response.status}`);
        }
      } else {
        const url = backendUrl ? `${backendUrl}/api/podcards/${podCardId}` : `/api/podcards/${podCardId}`;
        console.log('Fetching memory from:', url);
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setPodCard(data);
        } else {
          console.error('Failed to fetch memory:', response.status, response.statusText);
          throw new Error(`Memory not found: ${response.status}`);
        }
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

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    if (currentTrack > 0) {
      setCurrentTrack(currentTrack - 1);
      setPlaybackTime(0);
      setIsPlaying(false);
    }
  };

  const handleSkipForward = () => {
    if (currentTrack < (podCard?.audio_messages?.length || 0) - 1) {
      setCurrentTrack(currentTrack + 1);
      setPlaybackTime(0);
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    audioRef.current.currentTime = newTime;
    setPlaybackTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/listen/${podCardId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: podCard?.title || 'Forever Tapes Memory',
          text: `Listen to this audio memory: ${podCard?.title}`,
          url: shareUrl,
        });
      } catch (err) {
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Memory link copied to clipboard.",
        });
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Memory link copied to clipboard.",
      });
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download feature coming soon!",
      description: "Professional audio processing and download will be available soon.",
    });
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentAudioSrc = () => {
    if (!podCard?.audio_messages || podCard.audio_messages.length === 0) {
      return '';
    }
    
    // Handle demo case
    if (podCardId === 'demo') {
      const demoAudios = {
        0: '/demo-audio/mike-message.mp3',
        1: '/demo-audio/emma-message.mp3',
        2: '/demo-audio/david-message.mp3'
      };
      return demoAudios[currentTrack] || '/demo-audio/intro.mp3';
    }
    
    const message = podCard?.audio_messages?.[currentTrack];
    if (message) {
      // Check if it's a demo audio file (starts with /demo-audio/)
      if (message.file_path.startsWith('/demo-audio/')) {
        return message.file_path; // Use the path directly for demo files
      }
      
      // For uploaded files, extract file ID and construct API URL
      const fileId = message.file_path.split('/').pop().split('.')[0];
      return `${process.env.REACT_APP_BACKEND_URL}/api/audio/${fileId}`;
    }
    return '';
  };

  const getCurrentTrackName = () => {
    if (!podCard?.audio_messages || podCard.audio_messages.length === 0) {
      return 'No messages yet';
    }
    return podCard.audio_messages[currentTrack]?.contributor_name || 'Unknown';
  };

  // Collage functions
  const createCollage = async () => {
    if (!podCard || !podCard.audio_messages || podCard.audio_messages.length < 2) {
      toast({
        title: "Not enough messages",
        description: "Need at least 2 messages to create a mixed collage.",
        variant: "destructive"
      });
      return;
    }

    setCollageProcessing(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const url = backendUrl ? `${backendUrl}/api/audio/process-memory` : '/api/audio/process-memory';
      
      const formData = new FormData();
      formData.append('memory_id', podCardId);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start processing: ${response.status}`);
      }
      
      const result = await response.json();
      setCollageTaskId(result.task_id);
      
      toast({
        title: "Creating audio collage...",
        description: "Mixing all messages together with professional audio processing.",
      });
      
      // Start polling for status
      pollCollageStatus(result.task_id);
      
    } catch (error) {
      console.error('Error creating collage:', error);
      setCollageProcessing(false);
      toast({
        title: "Error",
        description: "Failed to create audio collage: " + error.message,
        variant: "destructive"
      });
    }
  };

  const pollCollageStatus = async (taskId) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const url = backendUrl ? `${backendUrl}/api/audio/status/${taskId}` : `/api/audio/status/${taskId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }
      
      const status = await response.json();
      setCollageStatus(status);
      
      if (status.status === 'completed') {
        setCollageProcessing(false);
        toast({
          title: "Audio collage ready!",
          description: "Your mixed memory is ready to listen to.",
        });
        
        // Get the processed audio URL
        const processedUrl = backendUrl ? `${backendUrl}/api/audio/processed/${podCardId}` : `/api/audio/processed/${podCardId}`;
        setProcessedCollageUrl(processedUrl);
        setViewMode('collage');
        
      } else if (status.status === 'failed') {
        setCollageProcessing(false);
        toast({
          title: "Processing failed",
          description: status.error || "Audio processing failed. Please try again.",
          variant: "destructive"
        });
        
      } else {
        // Still processing, continue polling
        setTimeout(() => pollCollageStatus(taskId), 2000);
      }
      
    } catch (error) {
      console.error('Error checking status:', error);
      setCollageProcessing(false);
      toast({
        title: "Error",
        description: "Failed to check processing status.",
        variant: "destructive"
      });
    }
  };

  const checkExistingCollage = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const url = backendUrl ? `${backendUrl}/api/audio/processed/${podCardId}` : `/api/audio/processed/${podCardId}`;
      
      const response = await fetch(url);
      if (response.ok) {
        setProcessedCollageUrl(url);
      }
    } catch (error) {
      // No existing collage, that's fine
      console.log('No existing collage found');
    }
  };

  const getCurrentAudioSrc = () => {
    // If in collage mode and we have a processed collage, use that
    if (viewMode === 'collage' && processedCollageUrl) {
      return processedCollageUrl;
    }
    
    // Otherwise use individual message logic
    if (!podCard?.audio_messages || podCard.audio_messages.length === 0) {
      return '';
    }
    
    // Handle demo case
    if (podCardId === 'demo') {
      const demoAudios = {
        0: '/demo-audio/mike-message.mp3',
        1: '/demo-audio/emma-message.mp3',
        2: '/demo-audio/david-message.mp3'
      };
      return demoAudios[currentTrack] || '/demo-audio/intro.mp3';
    }
    
    const message = podCard?.audio_messages?.[currentTrack];
    if (message) {
      // Check if it's a demo audio file (starts with /demo-audio/)
      if (message.file_path.startsWith('/demo-audio/')) {
        return message.file_path; // Use the path directly for demo files
      }
      
      // For uploaded files, extract file ID and construct API URL
      const fileId = message.file_path.split('/').pop().split('.')[0];
      return `${process.env.REACT_APP_BACKEND_URL}/api/audio/${fileId}`;
    }
    return '';
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
          <div className="text-2xl font-bold text-gray-800 mb-4">Memory Not Found</div>
          <p className="text-gray-600 mb-6">The audio memory you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const hasMessages = podCard.audio_messages && podCard.audio_messages.length > 0;

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
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              {hasMessages && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-light mb-4 tracking-tight leading-none text-gray-900">
              <span className="font-mono lowercase vintage-gradient-text vintage-font">forever tapes</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light tracking-wide">
              Listen to the Memory
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
              {podCard.description || `Curated by ${podCard.creator_name}`}
            </p>
            
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {podCard.audio_messages?.length || 0} message{(podCard.audio_messages?.length || 0) !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {podCard.occasion}
              </div>
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                {podCard.creator_name}
              </div>
            </div>
          </CardContent>
        </Card>

        {!hasMessages ? (
          /* No Messages State */
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm text-center">
            <CardContent className="p-16">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-gray-900">
                No Messages Yet
              </h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                This memory is waiting for the first contribution. Be the first to add your voice!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={() => navigate(`/contribute/${podCardId}`)}
                  className="bg-green-600 text-white hover:bg-green-700 px-8 py-3 font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Message
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 font-semibold"
                >
                  Browse More Memories
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Audio Player */
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                {/* Current Track Info */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <Music className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {getCurrentTrackName()}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Message {currentTrack + 1} of {podCard.audio_messages.length}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div 
                    ref={progressRef}
                    className="w-full bg-gray-200 rounded-full h-3 cursor-pointer overflow-hidden mb-3"
                    onClick={handleProgressClick}
                  >
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-100"
                      style={{ width: `${duration ? (playbackTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatTime(playbackTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center gap-6 mb-8">
                  <Button
                    onClick={handleSkipBack}
                    disabled={currentTrack === 0}
                    variant="outline"
                    size="lg"
                    className="rounded-full p-4 disabled:opacity-50 border-gray-300 hover:bg-gray-50"
                  >
                    <SkipBack className="w-6 h-6" />
                  </Button>
                  
                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-8 py-4 shadow-lg"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleSkipForward}
                    disabled={currentTrack >= (podCard.audio_messages?.length || 0) - 1}
                    variant="outline"
                    size="lg"
                    className="rounded-full p-4 disabled:opacity-50 border-gray-300 hover:bg-gray-50"
                  >
                    <SkipForward className="w-6 h-6" />
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-4 justify-center">
                  <Volume2 className="w-5 h-5 text-gray-500" />
                  <div className="flex-1 max-w-32">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{volume}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Message List */}
            <Card className="mt-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  All Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {podCard.audio_messages.map((message, index) => (
                    <div 
                      key={message.id || index}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        currentTrack === index 
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-l-4 border-purple-500' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setCurrentTrack(index);
                        setPlaybackTime(0);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {message.contributor_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(message.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentTrack === index && isPlaying && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                          )}
                          <span className="text-sm font-mono text-gray-500">
                            #{(index + 1).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="mt-8 border-0 shadow-xl bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-8 text-center">
                <Gift className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Want to add your voice?
                </h3>
                <p className="text-gray-600 mb-6">
                  Contribute your own message to this memory collection
                </p>
                <Button 
                  onClick={() => navigate(`/contribute/${podCardId}`)}
                  className="bg-green-600 text-white hover:bg-green-700 px-8 py-3 font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your Message
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={getCurrentAudioSrc()}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onTimeUpdate={() => setPlaybackTime(audioRef.current?.currentTime || 0)}
        onEnded={() => {
          if (currentTrack < (podCard?.audio_messages?.length || 0) - 1) {
            handleSkipForward();
          } else {
            setIsPlaying(false);
          }
        }}
        volume={volume / 100}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ListenToPodCard;