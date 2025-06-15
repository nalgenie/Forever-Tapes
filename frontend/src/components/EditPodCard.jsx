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
  Clock
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
    // Find the pod card from mock data
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
      title: "Message Deleted",
      description: "The message has been removed from your pod-card.",
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
      title: "Noise Reduction Applied",
      description: "Background noise has been reduced for this message.",
    });
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(podCard.shareLink);
    toast({
      title: "Link Copied!",
      description: "Share this link to collect more messages.",
    });
  };

  const handleSendInvites = () => {
    toast({
      title: "Invitations Sent",
      description: "Email invitations have been sent to collect more messages.",
    });
  };

  const handleGenerateFinal = async () => {
    setIsGenerating(true);
    try {
      await mockAPI.generateFinalPodCard(podCard.id);
      toast({
        title: "Pod-Card Generated! 🎉",
        description: "Your final pod-card is ready to share!",
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-2">Pod-Card Not Found</div>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{podCard.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">
                  <Users className="w-3 h-3 mr-1" />
                  {podCard.currentMessages} / {podCard.maxMessages} messages
                </Badge>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {podCard.maxMessageDuration} min max
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopyShareLink}
            >
              <Link className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              onClick={handleSendInvites}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invites
            </Button>
            <Button
              onClick={handleGenerateFinal}
              disabled={isGenerating || podCard.messages.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isGenerating ? 'Generating...' : 'Generate Final Pod-Card'}
            </Button>
          </div>
        </div>

        {/* Collection Progress */}
        <Card className="mb-8 border-0 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Collection Progress</h3>
              <span className="text-sm text-gray-600">
                {Math.round((podCard.currentMessages / podCard.maxMessages) * 100)}% Complete
              </span>
            </div>
            <Progress value={(podCard.currentMessages / podCard.maxMessages) * 100} className="mb-4" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{podCard.currentMessages} messages collected</span>
              <span>{podCard.maxMessages - podCard.currentMessages} slots remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="messages">Messages ({podCard.messages.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            {podCard.messages.length === 0 ? (
              <Card className="border-0 bg-white/50 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">No Messages Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Share your collection link to start receiving messages from contributors.
                  </p>
                  <Button onClick={handleCopyShareLink} variant="outline">
                    <Link className="w-4 h-4 mr-2" />
                    Copy Share Link
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {podCard.messages.map((message, index) => (
                  <Card key={message.id} className="border-0 bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{message.contributorName}</h4>
                          <p className="text-sm text-gray-600">{message.contributorEmail}</p>
                          <p className="text-sm text-gray-500">
                            Duration: {formatDuration(message.duration)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
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
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlayPause(message.id)}
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
                          
                          <div className="text-sm text-gray-600 min-w-[60px]">
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
                          <span className="text-sm text-gray-600 min-w-[40px]">
                            {message.volume}%
                          </span>
                        </div>

                        {/* Advanced Controls */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyNoiseReduction(message.id)}
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Reduce Noise
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Scissors className="w-4 h-4 mr-2" />
                            Trim
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMessageEdit(message.id, 'volume', 100)}
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
            <Card className="border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Pod-Card Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertDescription>
                    Settings can be modified while collecting messages. Changes will affect new contributors.
                  </AlertDescription>
                </Alert>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Collection Limits</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Max Messages: {podCard.maxMessages}</label>
                        <Slider
                          value={[podCard.maxMessages]}
                          onValueChange={(value) => setPodCard(prev => ({ ...prev, maxMessages: value[0] }))}
                          max={50}
                          min={5}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Max Message Duration: {podCard.maxMessageDuration} min</label>
                        <Slider
                          value={[podCard.maxMessageDuration]}
                          onValueChange={(value) => setPodCard(prev => ({ ...prev, maxMessageDuration: value[0] }))}
                          max={5}
                          min={0.5}
                          step={0.5}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Background Music</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        Current: {podCard.backgroundMusic || 'None selected'}
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        Change Music
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
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