import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Download,
  Share2,
  Heart,
  MessageSquare,
  Clock,
  Users,
  Music
} from 'lucide-react';
import { mockPodCards } from '../mock';
import { useToast } from '../hooks/use-toast';

const ListenToPodCard = () => {
  const { podCardId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [podCard, setPodCard] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [showIndividualMessages, setShowIndividualMessages] = useState(false);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    // Find the pod card from mock data
    const foundPodCard = mockPodCards.find(card => card.id === podCardId);
    if (foundPodCard) {
      setPodCard(foundPodCard);
    }
  }, [podCardId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setPlaybackTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (currentTrack === 0) {
        // Finished playing the full pod-card
        setHasPlayedOnce(true);
        setShowIndividualMessages(true);
        setIsPlaying(false);
        toast({
          title: "Pod-Card Complete! 🎉",
          description: "You can now listen to individual messages below.",
        });
      } else {
        // Move to next individual message
        if (currentTrack < podCard.messages.length) {
          setCurrentTrack(currentTrack + 1);
        } else {
          setIsPlaying(false);
          setCurrentTrack(0);
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, podCard, toast]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    if (currentTrack > 0) {
      setCurrentTrack(currentTrack - 1);
    }
  };

  const handleSkipForward = () => {
    if (podCard && currentTrack < podCard.messages.length) {
      setCurrentTrack(currentTrack + 1);
    }
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickTime = (clickX / width) * duration;
    
    audio.currentTime = clickTime;
    setPlaybackTime(clickTime);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/listen/${podCardId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied!",
      description: "Share this beautiful pod-card with others!",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your pod-card is being prepared for download.",
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentAudioSource = () => {
    if (currentTrack === 0) {
      return '/mock-audio/final-podcard.mp3'; // Full pod-card
    } else {
      return podCard.messages[currentTrack - 1]?.audioUrl || '';
    }
  };

  const getCurrentTrackName = () => {
    if (currentTrack === 0) {
      return 'Complete Pod-Card';
    } else {
      return podCard.messages[currentTrack - 1]?.contributorName || 'Unknown';
    }
  };

  if (!podCard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-2">Pod-Card Not Found</div>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {podCard.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            A special audio greeting card created by {podCard.createdBy}
          </p>
          <div className="flex justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {podCard.currentMessages} messages
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {podCard.totalDuration} min total
            </div>
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              {podCard.backgroundMusic}
            </div>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto max-w-4xl py-6 px-4">
          <Card className="border-0 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{getCurrentTrackName()}</h3>
                  <p className="text-sm text-gray-600">
                    {currentTrack === 0 ? 'Full Experience' : `Message ${currentTrack} of ${podCard.messages.length}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div 
                ref={progressRef}
                className="w-full bg-gray-200 rounded-full h-2 mb-4 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${duration ? (playbackTime / duration) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">{formatTime(playbackTime)}</span>
                <span className="text-sm text-gray-600">{formatTime(duration)}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkipBack}
                  disabled={currentTrack === 0}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-8"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkipForward}
                  disabled={currentTrack >= podCard.messages.length}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4">
                <Volume2 className="w-4 h-4 text-gray-600" />
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <span className="text-sm text-gray-600 min-w-[40px]">{volume}%</span>
              </div>

              {/* Hidden Audio Element */}
              <audio
                ref={audioRef}
                src={getCurrentAudioSource()}
                volume={volume / 100}
                style={{ display: 'none' }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {!hasPlayedOnce && !showIndividualMessages ? (
            <Card className="border-0 bg-white/50 backdrop-blur-sm text-center">
              <CardContent className="p-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Play className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  Ready to Listen?
                </h2>
                <p className="text-gray-600 mb-6">
                  Press play above to experience the complete pod-card. 
                  After listening, you'll be able to hear individual messages.
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={handlePlayPause}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Listening
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowIndividualMessages(true)}
                  >
                    Skip to Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="messages" className="space-y-6">
              <TabsList className="bg-white/50 backdrop-blur-sm">
                <TabsTrigger value="messages">Individual Messages</TabsTrigger>
                <TabsTrigger value="about">About This Pod-Card</TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="space-y-4">
                <div className="grid gap-4">
                  {podCard.messages.map((message, index) => (
                    <Card key={message.id} className="border-0 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{message.contributorName}</h4>
                              <p className="text-sm text-gray-600">
                                {formatTime(message.duration)} • {new Date(message.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCurrentTrack(index + 1);
                              setIsPlaying(true);
                            }}
                            className={currentTrack === index + 1 ? 'bg-purple-50 border-purple-200' : ''}
                          >
                            {currentTrack === index + 1 && isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about">
                <Card className="border-0 bg-white/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <Heart className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-gray-800">
                        About This Pod-Card
                      </h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold mb-3">Pod-Card Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created by:</span>
                            <span className="font-medium">{podCard.createdBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Messages:</span>
                            <span className="font-medium">{podCard.currentMessages}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Duration:</span>
                            <span className="font-medium">{podCard.totalDuration} min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Background Music:</span>
                            <span className="font-medium">{podCard.backgroundMusic}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Share This Pod-Card</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Loved this pod-card? Share it with others or create your own!
                        </p>
                        <div className="flex gap-2">
                          <Button onClick={handleShare} variant="outline" className="flex-1">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                          <Button 
                            onClick={() => navigate('/create')}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          >
                            Create Your Own
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListenToPodCard;