import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  TestTube, 
  Play, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Settings,
  Users,
  MessageSquare,
  Music,
  ExternalLink,
  RefreshCw,
  Mic,
  Sparkles,
  User,
  Gift,
  GraduationCap,
  Heart,
  PartyPopper,
  Crown,
  Volume2
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import AIVoiceGenerator from './AIVoiceGenerator';

const TestingDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [testMemories, setTestMemories] = useState([]);
  const [voicePersonas, setVoicePersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  // AI Generation State
  const [recipientName, setRecipientName] = useState('Sarah');
  const [customMemory, setCustomMemory] = useState({
    title: '',
    occasion: 'birthday',
    numMessages: 5
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    loadTestMemories();
    loadVoicePersonas();
  }, []);

  const loadTestMemories = async () => {
    try {
      const url = backendUrl ? `${backendUrl}/api/testing/memories` : '/api/testing/memories';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTestMemories(data.test_memories || []);
      }
    } catch (error) {
      console.error('Error loading test memories:', error);
    }
  };

  const loadVoicePersonas = async () => {
    try {
      const url = backendUrl ? `${backendUrl}/api/voice/personas` : '/api/voice/personas';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setVoicePersonas(data.personas || []);
      }
    } catch (error) {
      console.error('Error loading voice personas:', error);
    }
  };

  const createTestTemplate = async (templateType) => {
    setLoading(true);
    try {
      const url = backendUrl ? `${backendUrl}/api/testing/create-template` : '/api/testing/create-template';
      const formData = new FormData();
      formData.append('template_type', templateType);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "Test memory created!",
        description: result.message,
      });
      
      await loadTestMemories();
      
    } catch (error) {
      console.error('Error creating test template:', error);
      toast({
        title: "Error",
        description: "Failed to create test memory: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRealAiMemory = async () => {
    if (!customMemory.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your real AI memory",
        variant: "destructive"
      });
      return;
    }

    setAiGenerating(true);
    try {
      // Import browserTTS
      const { default: browserTTS } = await import('../services/browserTTS');
      
      if (!browserTTS.isSupported) {
        throw new Error('Browser speech synthesis not supported');
      }

      // Generate multiple messages with real TTS
      const messages = [];
      const usedPersonaIds = [];
      
      toast({
        title: "🎙️ Generating Real AI Voices...",
        description: "Creating audio messages with browser TTS",
      });

      for (let i = 0; i < customMemory.numMessages; i++) {
        // Get a unique persona
        const availablePersonas = voicePersonas.filter(p => !usedPersonaIds.includes(p.id));
        const persona = availablePersonas[i % availablePersonas.length] || voicePersonas[0];
        usedPersonaIds.push(persona.id);

        // Generate message text based on occasion and recipient
        const messageText = `This is a test message for ${recipientName} on the occasion of ${customMemory.occasion}. Generated with browser TTS using voice persona ${persona.name}.`;

        try {
          // Generate real audio
          const audioResult = await browserTTS.generateAndSaveVoiceMessage(
            messageText,
            persona.id,
            recipientName
          );

          messages.push({
            contributor_name: persona.name,
            contributor_email: `${persona.name.toLowerCase().replace(' ', '.')}@example.com`,
            file_path: audioResult.fileId,
            duration: audioResult.audioResult.duration,
            text_content: messageText,
            voice_used: audioResult.audioResult.voice
          });

          toast({
            title: `Voice ${i + 1}/${customMemory.numMessages} Generated`,
            description: `Created ${persona.name}'s voice using ${audioResult.audioResult.voice}`,
          });

        } catch (error) {
          console.error(`Failed to generate voice for ${persona.name}:`, error);
          // Fallback to mock voice
          messages.push({
            contributor_name: persona.name,
            contributor_email: `${persona.name.toLowerCase().replace(' ', '.')}@example.com`,
            file_path: "demo-audio", // Use demo file as fallback
            duration: 25,
            text_content: messageText,
            voice_used: "Fallback Demo Audio"
          });
        }
      }

      // Create memory with real AI voices
      const url = backendUrl ? `${backendUrl}/api/voice/create-real-ai-memory` : '/api/voice/create-real-ai-memory';
      const formData = new FormData();
      formData.append('title', customMemory.title);
      formData.append('occasion', customMemory.occasion);
      formData.append('recipient_name', recipientName);
      formData.append('messages_data', JSON.stringify(messages));
      
      const response = fetch(url, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = response.json();
      
      toast({
        title: "🎉 Real AI Memory Created!",
        description: `Generated ${messages.length} real AI voice messages!`,
      });
      
      loadTestMemories();
      
    } catch (error) {
      console.error('Error creating real AI memory:', error);
      toast({
        title: "Error",
        description: "Failed to create real AI memory: " + error.message,
        variant: "destructive"
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const createAiMemory = () => {
    if (!customMemory.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your AI-generated memory",
        variant: "destructive"
      });
      return;
    }

    setAiGenerating(true);
    try {
      const url = backendUrl ? `${backendUrl}/api/voice/create-ai-memory` : '/api/voice/create-ai-memory';
      const formData = new FormData();
      formData.append('title', customMemory.title);
      formData.append('occasion', customMemory.occasion);
      formData.append('recipient_name', recipientName);
      formData.append('num_messages', customMemory.numMessages.toString());
      
      const response = fetch(url, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = response.json();
      
      toast({
        title: "🎉 AI Memory Created!",
        description: `Generated diverse voice messages with AI personas`,
      });
      
      loadTestMemories();
      
    } catch (error) {
      console.error('Error creating AI memory:', error);
      toast({
        title: "Error",
        description: "Failed to create AI memory: " + error.message,
        variant: "destructive"
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const bulkGenerateScenarios = async () => {
    setAiGenerating(true);
    try {
      const url = backendUrl ? `${backendUrl}/api/voice/bulk-generate-scenarios` : '/api/voice/bulk-generate-scenarios';
      const formData = new FormData();
      formData.append('recipient_name', recipientName);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "🚀 Bulk Scenarios Created!",
        description: `Generated ${result.scenarios_created} complete test scenarios with ${result.total_messages} AI voice messages`,
      });
      
      await loadTestMemories();
      
    } catch (error) {
      console.error('Error bulk generating scenarios:', error);
      toast({
        title: "Error",
        description: "Failed to bulk generate scenarios: " + error.message,
        variant: "destructive"
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const clearAllTestMemories = async () => {
    if (!window.confirm('Are you sure you want to clear all test memories?')) {
      return;
    }
    
    setLoading(true);
    try {
      const url = backendUrl ? `${backendUrl}/api/testing/clear-all` : '/api/testing/clear-all';
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "Test memories cleared!",
        description: `Deleted ${result.deleted_count} test memories.`,
      });
      
      setTestMemories([]);
      
    } catch (error) {
      console.error('Error clearing test memories:', error);
      toast({
        title: "Error",
        description: "Failed to clear test memories: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testTemplates = [
    {
      type: 'empty',
      name: 'Empty Memory',
      description: 'Perfect for testing contribution flow',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    {
      type: 'single',
      name: 'Single Message',
      description: 'Test basic audio playback',
      icon: <Play className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      type: 'multiple',
      name: 'Multiple Messages',
      description: 'Test skip controls and playlist',
      icon: <Music className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    }
  ];

  const occasionIcons = {
    birthday: <Gift className="w-4 h-4" />,
    graduation: <GraduationCap className="w-4 h-4" />,
    wedding: <Heart className="w-4 h-4" />,
    anniversary: <Crown className="w-4 h-4" />,
    celebration: <PartyPopper className="w-4 h-4" />
  };

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
            
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <TestTube className="w-3 h-3 mr-1" />
              Testing Dashboard
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-light mb-4 tracking-tight leading-none text-gray-900">
              <span className="font-mono lowercase vintage-gradient-text vintage-font">testing</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light tracking-wide">
              Your Development Testing Hub with AI Voice Generation
            </p>
          </div>
        </div>

        {/* Real AI Voice Generation Section */}
        <div className="mb-12">
          <AIVoiceGenerator 
            personas={voicePersonas}
            onAudioGenerated={(audioData) => {
              toast({
                title: "🎙️ Real AI Voice Generated!",
                description: `Created voice message using ${audioData.voice}`,
              });
            }}
          />
        </div>

        {/* AI Voice Generation Section */}
        <Card className="mb-12 border-0 shadow-xl bg-gradient-to-r from-purple-50 to-pink-50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
              AI Voice Generation System
            </CardTitle>
            <p className="text-gray-600">Create realistic test memories with diverse AI-generated voice personas</p>
          </CardHeader>
          <CardContent>
            {/* Voice Personas Display */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Available Voice Personas ({voicePersonas.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {voicePersonas.map((persona) => (
                  <div key={persona.id} className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <div className="text-sm font-medium text-gray-900">{persona.name}</div>
                    <div className="text-xs text-gray-500">{persona.accent}</div>
                    <div className="text-xs text-purple-600">{persona.personality}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Settings */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name
                </label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter recipient name..."
                  className="border-gray-300"
                />
              </div>
            </div>

            {/* AI Generation Options */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Custom Memory */}
              <Card className="border border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Mic className="w-5 h-5 mr-2 text-purple-600" />
                    Custom AI Memory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={customMemory.title}
                    onChange={(e) => setCustomMemory({...customMemory, title: e.target.value})}
                    placeholder="Memory title..."
                    className="border-gray-300"
                  />
                  
                  <Select value={customMemory.occasion} onValueChange={(value) => setCustomMemory({...customMemory, occasion: value})}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select occasion..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="birthday">🎁 Birthday</SelectItem>
                      <SelectItem value="graduation">🎓 Graduation</SelectItem>
                      <SelectItem value="wedding">💒 Wedding</SelectItem>
                      <SelectItem value="anniversary">👑 Anniversary</SelectItem>
                      <SelectItem value="celebration">🎉 Celebration</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={customMemory.numMessages.toString()} onValueChange={(value) => setCustomMemory({...customMemory, numMessages: parseInt(value)})}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Number of messages..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Messages</SelectItem>
                      <SelectItem value="5">5 Messages</SelectItem>
                      <SelectItem value="7">7 Messages</SelectItem>
                      <SelectItem value="10">10 Messages</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    onClick={createAiMemory}
                    disabled={aiGenerating || !customMemory.title.trim()}
                    className="w-full bg-purple-600 text-white hover:bg-purple-700 mb-3"
                  >
                    {aiGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Mock AI Memory
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={createRealAiMemory}
                    disabled={aiGenerating}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Generate Real AI Memory (Beta)
                  </Button>
                </CardContent>
              </Card>

              {/* Bulk Generation */}
              <Card className="border border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <PartyPopper className="w-5 h-5 mr-2 text-blue-600" />
                    Bulk Test Scenarios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Create complete test suite with 5 different scenarios:
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>🎁 Birthday (6 messages)</li>
                    <li>🎓 Graduation (4 messages)</li>
                    <li>💒 Wedding (8 messages)</li>
                    <li>👑 Anniversary (3 messages)</li>
                    <li>🎉 Celebration (5 messages)</li>
                  </ul>
                  
                  <Button
                    onClick={bulkGenerateScenarios}
                    disabled={aiGenerating}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {aiGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate All Scenarios
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Quick Templates */}
        <Card className="mb-12 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 mr-2" />
              Quick Test Templates
            </CardTitle>
            <p className="text-gray-600">Create basic test memories instantly for different scenarios</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {testTemplates.map((template) => (
                <Card key={template.type} className="border border-gray-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => createTestTemplate(template.type)}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${template.color}`}>
                      {template.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                    <Button
                      size="sm"
                      disabled={loading}
                      className="bg-gray-600 text-white hover:bg-gray-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Create
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={loadTestMemories}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={clearAllTestMemories}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                disabled={loading || testMemories.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All ({testMemories.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Memories List */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <TestTube className="w-6 h-6 mr-2" />
              Your Test Memories ({testMemories.length})
            </CardTitle>
            <p className="text-gray-600">Manage and test your saved memories</p>
          </CardHeader>
          <CardContent>
            {testMemories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <TestTube className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Test Memories Yet</h3>
                <p className="text-gray-500 mb-6">Create AI-generated memories or basic templates above to get started</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {testMemories.map((memory) => (
                  <Card key={memory.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{memory.title}</h3>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Test Memory
                            </Badge>
                            {memory.creator_id?.includes('ai') && (
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI Generated
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{memory.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {memory.audio_messages?.length || 0} messages
                            </div>
                            <div className="flex items-center gap-1">
                              {occasionIcons[memory.occasion] || <Music className="w-3 h-3" />}
                              {memory.occasion}
                            </div>
                            <div>
                              Created {new Date(memory.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => navigate(`/listen/${memory.id}`)}
                          size="sm"
                          className="bg-purple-600 text-white hover:bg-purple-700"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Listen
                        </Button>
                        <Button
                          onClick={() => navigate(`/contribute/${memory.id}`)}
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Contribute
                        </Button>
                        <Button
                          onClick={() => window.open(`/listen/${memory.id}`, '_blank')}
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open in New Tab
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 border-0 shadow-xl bg-blue-50">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">🚀 AI-Powered Testing Dashboard</h3>
            <ol className="text-blue-800 space-y-2 list-decimal list-inside">
              <li><strong>AI Voice Generation</strong> - Create realistic test memories with diverse AI personas</li>
              <li><strong>Bulk Scenarios</strong> - Generate complete test suites for all occasions instantly</li>
              <li><strong>Custom Memories</strong> - Create specific test scenarios with chosen parameters</li>
              <li><strong>Voice Personas</strong> - 8 diverse AI personas with different backgrounds and accents</li>
              <li><strong>Template Testing</strong> - Use quick templates for basic test scenarios</li>
              <li><strong>Audio Processing</strong> - Test audio collage functionality with multiple messages</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestingDashboard;