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
  Disc,
  Plus
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
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    fetchPodCard();
  }, [podCardId]);

  const fetchPodCard = async () => {
    try {
      // Handle demo case
      if (podCardId === 'demo') {
        setPodCard({
          id: 'demo',
          title: 'Demo Audio Memory',
          description: 'This is a sample audio memory to showcase Forever Tapes',
          occasion: 'demo',
          creator_name: 'Forever Tapes Team',
          creator_id: 'demo',
          audio_messages: [
            {
              id: 'demo1',
              contributor_name: 'Sarah',
              contributor_email: 'sarah@example.com',
              file_path: '/demo/audio1.wav',
              created_at: new Date().toISOString(),
              duration: 15
            },
            {
              id: 'demo2', 
              contributor_name: 'Mike',
              contributor_email: 'mike@example.com',
              file_path: '/demo/audio2.wav',
              created_at: new Date().toISOString(),
              duration: 20
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_public: true
        });
      } else {
        const data = await api.getPodCard(podCardId);
        setPodCard(data);
      }
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
      setIsPlaying(false);
      if (currentTrack < (podCard?.audio_messages?.length || 0) - 1) {
        setCurrentTrack(currentTrack + 1);
      } else {
        setCurrentTrack(0);
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
  }, [currentTrack, podCard]);

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
    if (podCard && currentTrack < (podCard.audio_messages?.length || 0) - 1) {
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
      title: "Memory link copied ●",
      description: "Share this memory with others.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your audio memory is being prepared.",
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentAudioSource = () => {
    if (podCardId === 'demo') {
      // Demo audio sources
      const demoAudios = {
        0: '/demo-audio/mike.wav',
        1: '/demo-audio/emma.wav', 
        2: '/demo-audio/david.wav'
      };
      return demoAudios[currentTrack] || '/demo-audio/intro.mp3';
    }
    
    const message = podCard?.audio_messages?.[currentTrack];
    if (message) {
      // Extract file ID from file path and construct API URL
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading memory...</p>
        </div>
      </div>
    );
  }

  if (!podCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-black text-gray-800 mb-4 tracking-tight">MEMORY NOT FOUND</div>
          <p className="text-gray-600 mb-6">The audio memory you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} className="font-medium">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const hasMessages = podCard.audio_messages && podCard.audio_messages.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Vintage Tape Style */}
      <div className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto max-w-6xl px-6 py-20 relative z-10">
          <div className="text-center">
            <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-2 backdrop-blur-sm">
              AUDIO MEMORY
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">
              {podCard.title}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              {podCard.description || `Curated by ${podCard.creator_name}`}
            </p>
            
            <div className="flex justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {podCard.audio_messages?.length || 0} message{(podCard.audio_messages?.length || 0) !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {podCard.occasion}
              </div>
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                {podCard.creator_name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {!hasMessages ? (
            <Card className="border-0 shadow-xl text-center bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
              <CardContent className="p-16">
                <div className="w-24 h-24 mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <MessageSquare className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-black mb-6 text-white tracking-tight">
                  NO MESSAGES YET
                </h2>
                <p className="text-purple-100 mb-8 text-lg">
                  This memory is waiting for the first contribution. Be the first to add your voice!
                </p>
                <div className="flex justify-center gap-6">
                  <Button 
                    onClick={() => navigate(`/contribute/${podCardId}`)}
                    className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 font-black tracking-wide"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    ADD FIRST MESSAGE
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-8 py-3 font-semibold"
                    variant="outline"
                  >
                    Browse More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Audio Player */}
              <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl overflow-hidden mb-8">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-black text-xl tracking-wider text-white mb-1">
                        {getCurrentTrackName()}
                      </h3>
                      <p className="text-gray-300 text-sm font-mono">
                        MESSAGE {(currentTrack + 1).toString().padStart(2, '0')} OF {podCard.audio_messages.length.toString().padStart(2, '0')}
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

                  {/* Progress Bar */}
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

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <Button
                      onClick={handleSkipBack}
                      disabled={currentTrack === 0}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full disabled:opacity-50"
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
                      disabled={currentTrack >= (podCard.audio_messages?.length || 0) - 1}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full disabled:opacity-50"
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
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <span className="text-sm font-mono text-gray-400 min-w-[40px]">{volume}%</span>
                  </div>

                  {/* Audio Element */}
                  <audio
                    ref={audioRef}
                    src={getCurrentAudioSource()}
                    volume={volume / 100}
                    style={{ display: 'none' }}
                  />
                </CardContent>
              </Card>

              {/* Messages List */}
              <div className="space-y-4">
                <h2 className="text-2xl font-black tracking-tight text-gray-800 mb-6">ALL MESSAGES</h2>
                {podCard.audio_messages.map((message, index) => (
                  <Card 
                    key={message.id} 
                    className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                      currentTrack === index 
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setCurrentTrack(index);
                      if (!isPlaying) setIsPlaying(true);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${currentTrack === index ? 'bg-white/20' : 'bg-gray-100'} backdrop-blur-sm rounded-full flex items-center justify-center`}>
                            <span className={`font-mono font-black ${currentTrack === index ? 'text-white' : 'text-gray-600'}`}>
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <div>
                            <h4 className={`font-black text-lg ${currentTrack === index ? 'text-white' : 'text-gray-800'}`}>
                              {message.contributor_name}
                            </h4>
                            <p className={`text-sm font-mono ${currentTrack === index ? 'text-blue-100' : 'text-gray-500'}`}>
                              {new Date(message.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          className={`${
                            currentTrack === index 
                              ? 'bg-white/20 hover:bg-white/30 text-white border-white/30' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'
                          } rounded-full p-3`}
                          variant="outline"
                        >
                          {currentTrack === index && isPlaying ? (
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

              {/* Add Message CTA */}
              <Card className="mt-8 border-0 shadow-lg bg-gradient-to-br from-green-400 to-emerald-500 text-white">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-black mb-4 text-white tracking-tight">
                    ADD YOUR MESSAGE
                  </h3>
                  <p className="text-green-100 mb-6">
                    Want to contribute to this memory? Add your own message to the collection.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={() => navigate(`/contribute/${podCardId}`)}
                      className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 font-black tracking-wide"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      CONTRIBUTE
                    </Button>
                    <Button 
                      onClick={() => navigate('/')}
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-8 py-3 font-semibold"
                      variant="outline"
                    >
                      Browse More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListenToPodCard;