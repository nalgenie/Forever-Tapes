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
  Radio,
  MessageSquare,
  Clock,
  Users,
  Music,
  Disc
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
        // Finished playing the full tape
        setHasPlayedOnce(true);
        setShowIndividualMessages(true);
        setIsPlaying(false);
        toast({
          title: "mixtape complete ●",
          description: "you can now listen to individual tracks below.",
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
      title: "mixtape link copied ●",
      description: "share this tape with others.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "download started",
      description: "your mixtape is being prepared.",
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentAudioSource = () => {
    if (currentTrack === 0) {
      return '/mock-audio/final-podcard.mp3'; // Full tape
    } else {
      return podCard.messages[currentTrack - 1]?.audioUrl || '';
    }
  };

  const getCurrentTrackName = () => {
    if (currentTrack === 0) {
      return 'Complete Mixtape';
    } else {
      return podCard.messages[currentTrack - 1]?.contributorName || 'Unknown';
    }
  };

  if (!podCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-black text-gray-800 mb-4 tracking-tight">TAPE NOT FOUND</div>
          <Button onClick={() => navigate('/')} className="font-medium">
            back to home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Vintage Tape Style */}
      <div className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto max-w-6xl px-6 py-20 relative z-10">
          <div className="text-center">
            <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-2 backdrop-blur-sm">
              MIXTAPE
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">
              {podCard.title}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              curated by {podCard.createdBy}
            </p>
            
            <div className="flex justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {podCard.currentMessages} tracks
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {podCard.totalDuration} min
              </div>
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                {podCard.backgroundMusic}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tape Deck Player */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto max-w-6xl px-6 py-6">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-xl tracking-wider text-white mb-1">
                    {getCurrentTrackName()}
                  </h3>
                  <p className="text-gray-300 text-sm font-mono">
                    {currentTrack === 0 ? 'FULL EXPERIENCE' : `TRACK ${currentTrack.toString().padStart(2, '0')}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleShare}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownload}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Analog Progress Bar */}
              <div 
                ref={progressRef}
                className="w-full bg-gray-700 rounded-full h-3 mb-4 cursor-pointer overflow-hidden"
                onClick={handleProgressClick}
              >
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-100 shadow-lg"
                  style={{ width: `${duration ? (playbackTime / duration) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-mono text-gray-400">{formatTime(playbackTime)}</span>
                <span className="text-sm font-mono text-gray-400">{formatTime(duration)}</span>
              </div>

              {/* Tape Deck Controls */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <Button
                  onClick={handleSkipBack}
                  disabled={currentTrack === 0}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full px-12 py-4 shadow-lg shadow-red-500/30"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </Button>
                
                <Button
                  onClick={handleSkipForward}
                  disabled={currentTrack >= podCard.messages.length}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <span className="text-sm font-mono text-gray-400 min-w-[40px]">{volume}%</span>
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
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {!hasPlayedOnce && !showIndividualMessages ? (
            <Card className="border-0 shadow-xl text-center bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
              <CardContent className="p-16">
                <div className="w-24 h-24 mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Disc className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <h2 className="text-3xl font-black mb-6 text-white tracking-tight">
                  READY TO LISTEN?
                </h2>
                <p className="text-purple-100 mb-8 text-lg">
                  press play above to experience the complete mixtape. 
                  after listening, you'll be able to hear individual tracks.
                </p>
                <div className="flex justify-center gap-6">
                  <Button 
                    onClick={handlePlayPause}
                    className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 font-black tracking-wide"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    START TAPE
                  </Button>
                  <Button 
                    onClick={() => setShowIndividualMessages(true)}
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-8 py-3 font-semibold"
                    variant="outline"
                  >
                    skip to tracks
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="tracks" className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="bg-white shadow-lg p-1 rounded-full border">
                  <TabsTrigger value="tracks" className="rounded-full px-6 py-2 font-semibold">
                    INDIVIDUAL TRACKS
                  </TabsTrigger>
                  <TabsTrigger value="about" className="rounded-full px-6 py-2 font-semibold">
                    TAPE INFO
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="tracks" className="space-y-4">
                <div className="grid gap-4">
                  {podCard.messages.map((message, index) => (
                    <Card 
                      key={message.id} 
                      className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                      onClick={() => {
                        setCurrentTrack(index + 1);
                        setIsPlaying(true);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <span className="font-mono font-black text-white">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-black text-lg text-white">{message.contributorName}</h4>
                              <p className="text-blue-100 text-sm font-mono">
                                {formatTime(message.duration)} • {new Date(message.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            className={`bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full p-3 ${
                              currentTrack === index + 1 ? 'bg-white/40' : ''
                            }`}
                            variant="outline"
                          >
                            {currentTrack === index + 1 && isPlaying ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                  <CardContent className="p-12">
                    <div className="text-center mb-12">
                      <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Radio className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-3xl font-black mb-4 text-white tracking-tight">
                        ABOUT THIS TAPE
                      </h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-12">
                      <div>
                        <h4 className="font-black mb-6 text-yellow-100 tracking-wide">TAPE DETAILS</h4>
                        <div className="space-y-3 text-sm font-mono">
                          <div className="flex justify-between text-yellow-100">
                            <span>CURATED BY:</span>
                            <span className="font-bold text-white">{podCard.createdBy}</span>
                          </div>
                          <div className="flex justify-between text-yellow-100">
                            <span>TRACKS:</span>
                            <span className="font-bold text-white">{podCard.currentMessages}</span>
                          </div>
                          <div className="flex justify-between text-yellow-100">
                            <span>TOTAL RUNTIME:</span>
                            <span className="font-bold text-white">{podCard.totalDuration} min</span>
                          </div>
                          <div className="flex justify-between text-yellow-100">
                            <span>BACKGROUND:</span>
                            <span className="font-bold text-white">{podCard.backgroundMusic}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-black mb-6 text-yellow-100 tracking-wide">SHARE THIS TAPE</h4>
                        <p className="text-yellow-100 mb-6 text-sm">
                          love this mixtape? share it with others or create your own.
                        </p>
                        <div className="flex gap-3">
                          <Button 
                            onClick={handleShare} 
                            className="bg-white text-orange-600 hover:bg-gray-100 flex-1 font-semibold"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            share
                          </Button>
                          <Button 
                            onClick={() => navigate('/create')}
                            className="bg-white/20 text-white border-white/30 hover:bg-white/30 flex-1 font-semibold"
                            variant="outline"
                          >
                            create yours
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