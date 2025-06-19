import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  Trash2, 
  Share2, 
  Download,
  Scissors,
  RotateCcw,
  Link,
  Mail,
  MessageSquare,
  Wand2,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import { mockPodCards, mockAPI } from '../mock';
import { useToast } from '../hooks/use-toast';

const EditPodCard = () => {
  const { podCardId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [podCard, setPodCard] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [playbackProgress, setPlaybackProgress] = useState({});
  const audioRefs = useRef({});

  useEffect(() => {
    // Find the celebration from mock data
    const foundPodCard = mockPodCards.find(card => card.id === podCardId);
    if (foundPodCard) {
      setPodCard(foundPodCard);
    }
  }, [podCardId]);

  const handleMessageEdit = (messageId, field, value) => {
    setPodCard(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === messageId ? { ...msg, [field]: value } : msg
      )
    }));
  };

  const handleDeleteMessage = (messageId) => {
    setPodCard(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId),
      currentMessages: prev.currentMessages - 1
    }));
    
    toast({
      title: "Message Removed",
      description: "The message has been removed from your celebration.",
    });
  };

  const handlePlayPause = (messageId) => {
    const audio = audioRefs.current[messageId];
    if (!audio) return;

    if (currentlyPlaying === messageId) {
      audio.pause();
      setCurrentlyPlaying(null);
    } else {
      // Pause any currently playing audio
      Object.values(audioRefs.current).forEach(audioEl => {
        if (audioEl && !audioEl.paused) {
          audioEl.pause();
        }
      });
      
      audio.play();
      setCurrentlyPlaying(messageId);
    }
  };

  const handleAudioTimeUpdate = (messageId) => {
    const audio = audioRefs.current[messageId];
    if (audio) {
      const progress = (audio.currentTime / audio.duration) * 100;
      setPlaybackProgress(prev => ({
        ...prev,
        [messageId]: progress
      }));
    }
  };

  const handleAudioEnded = (messageId) => {
    setCurrentlyPlaying(null);
    setPlaybackProgress(prev => ({
      ...prev,
      [messageId]: 0
    }));
  };

  const handleApplyNoiseReduction = (messageId) => {
    toast({
      title: "Noise Reduction Applied ✨",
      description: "Background noise has been reduced for this message.",
    });
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(podCard.shareLink);
    toast({
      title: "Share Link Copied! 📋",
      description: "Share this link to collect more heartfelt messages.",
    });
  };

  const handleSendInvites = () => {
    toast({
      title: "Invitations Sent 📧",
      description: "Email invitations have been sent to collect more messages.",
    });
  };

  const handleGenerateFinal = async () => {
    setIsGenerating(true);
    try {
      await mockAPI.generateFinalPodCard(podCard.id);
      toast({
        title: "Celebration Complete! 🎉",
        description: "Your beautiful audio celebration is ready to share!",
      });
      navigate(`/listen/${podCard.id}`);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!podCard) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-4">Celebration Not Found</div>
          <Button onClick={() => navigate('/dashboard')} className="rounded-full px-8">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">FOREVER TAPES</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCopyShareLink}
                className="rounded-full"
              >
                <Link className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={handleSendInvites}
                className="rounded-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Invites
              </Button>
              <Button
                onClick={handleGenerateFinal}
                disabled={isGenerating || podCard.messages.length === 0}
                className="bg-black text-white hover:bg-gray-800 rounded-full px-6"
              >
                {isGenerating ? 'Generating...' : 'Complete Celebration'}
                <Sparkles className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            {podCard.title}
          </h1>
          <div className="flex justify-center gap-6 text-gray-600">
            <Badge variant="outline" className="border-gray-300">
              <Users className="w-3 h-3 mr-1" />
              {podCard.currentMessages} / {podCard.maxMessages} messages
            </Badge>
            <Badge variant="outline" className="border-gray-300">
              <Clock className="w-3 h-3 mr-1" />
              {podCard.maxMessageDuration} min max per message
            </Badge>
          </div>
        </div>

        {/* Collection Progress */}
        <Card className="mb-12 border-0 bg-gray-50">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold tracking-tight">Collection Progress</h3>
              <span className="text-lg font-semibold text-gray-600">
                {Math.round((podCard.currentMessages / podCard.maxMessages) * 100)}% Complete
              </span>
            </div>
            <Progress value={(podCard.currentMessages / podCard.maxMessages) * 100} className="h-3 mb-4" />
            <div className="flex justify-between text-gray-600">
              <span>{podCard.currentMessages} messages collected</span>
              <span>{podCard.maxMessages - podCard.currentMessages} slots remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="messages" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-gray-100 p-1 rounded-full">
              <TabsTrigger value="messages" className="rounded-full px-6 py-2 font-medium">
                Messages ({podCard.messages.length})
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-full px-6 py-2 font-medium">
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="messages" className="space-y-6">
            {podCard.messages.length === 0 ? (
              <Card className="border-0 bg-gray-50">
                <CardContent className="p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">No Messages Yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Share your collection link to start receiving heartfelt messages from contributors.
                  </p>
                  <Button onClick={handleCopyShareLink} className="rounded-full px-8">
                    <Link className="w-4 h-4 mr-2" />
                    Copy Share Link
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {podCard.messages.map((message, index) => (
                  <Card key={message.id} className="border-0 bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-xl font-bold text-gray-800 mb-1">{message.contributorName}</h4>
                          <p className="text-gray-600 mb-2">{message.contributorEmail}</p>
                          <p className="text-sm text-gray-500">
                            Duration: {formatDuration(message.duration)} • Added {new Date(message.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-gray-400">
                            {`{ ${String(index + 1).padStart(2, '0')} }`}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Audio Controls */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlayPause(message.id)}
                            className="rounded-full"
                          >
                            {currentlyPlaying === message.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <div className="flex-1">
                            <Progress 
                              value={playbackProgress[message.id] || 0} 
                              className="h-2"
                            />
                          </div>
                          
                          <div className="text-sm text-gray-600 font-mono min-w-[60px]">
                            {formatDuration(message.duration)}
                          </div>
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center gap-4">
                          <Volume2 className="w-4 h-4 text-gray-600" />
                          <div className="flex-1">
                            <Slider
                              value={[message.volume]}
                              onValueChange={(value) => handleMessageEdit(message.id, 'volume', value[0])}
                              max={100}
                              min={0}
                              step={5}
                            />
                          </div>
                          <span className="text-sm text-gray-600 font-mono min-w-[50px]">
                            {message.volume}%
                          </span>
                        </div>

                        {/* Advanced Controls */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyNoiseReduction(message.id)}
                            className="rounded-full"
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Reduce Noise
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                          >
                            <Scissors className="w-4 h-4 mr-2" />
                            Trim
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMessageEdit(message.id, 'volume', 100)}
                            className="rounded-full"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      </div>

                      {/* Hidden Audio Element */}
                      <audio
                        ref={el => audioRefs.current[message.id] = el}
                        src={message.audioUrl}
                        onTimeUpdate={() => handleAudioTimeUpdate(message.id)}
                        onEnded={() => handleAudioEnded(message.id)}
                        style={{ display: 'none' }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-0 bg-gray-50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">Celebration Settings</CardTitle>
                <p className="text-gray-600">Modify settings for your audio celebration</p>
              </CardHeader>
              <CardContent className="space-y-8">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-800">
                    Settings can be modified while collecting messages. Changes will affect new contributors.
                  </AlertDescription>
                </Alert>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold mb-6">Collection Limits</h4>
                    <div className="space-y-6">
                      <div>
                        <label className="font-medium text-gray-800 mb-3 block">
                          Maximum Messages: {podCard.maxMessages}
                        </label>
                        <Slider
                          value={[podCard.maxMessages]}
                          onValueChange={(value) => setPodCard(prev => ({ ...prev, maxMessages: value[0] }))}
                          max={50}
                          min={5}
                          step={1}
                        />
                      </div>
                      <div>
                        <label className="font-medium text-gray-800 mb-3 block">
                          Max Message Duration: {podCard.maxMessageDuration} min
                        </label>
                        <Slider
                          value={[podCard.maxMessageDuration]}
                          onValueChange={(value) => setPodCard(prev => ({ ...prev, maxMessageDuration: value[0] }))}
                          max={5}
                          min={0.5}
                          step={0.5}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-6">Background Music</h4>
                    <div className="p-6 bg-white rounded-lg border">
                      <div className="text-gray-600 mb-4">
                        <strong>Current:</strong> {podCard.backgroundMusic || 'None selected'}
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full">
                        Change Music
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button className="rounded-full px-8">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditPodCard;