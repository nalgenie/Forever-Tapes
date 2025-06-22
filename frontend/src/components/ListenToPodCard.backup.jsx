import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
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