import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
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
  RefreshCw
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const TestingDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [testMemories, setTestMemories] = useState([]);
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    loadTestMemories();
  }, []);

  const loadTestMemories = async () => {
    try {
      const url = backendUrl ? `${backendUrl}/api/testing/memories` : '/api/testing/memories';
      console.log('Loading test memories from:', url);
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTestMemories(data.test_memories || []);
      } else {
        console.error('Failed to load test memories:', response.status, response.statusText);
        toast({
          title: "Error loading test memories",
          description: `HTTP ${response.status}: ${response.statusText}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading test memories:', error);
      toast({
        title: "Error loading test memories",
        description: error.message,
        variant: "destructive"
      });
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
      
      // Reload the test memories
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

  const clearAllTestMemories = async () => {
    if (!window.confirm('Are you sure you want to clear all test memories?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/testing/clear-all`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear test memories');
      }
      
      const result = await response.json();
      
      toast({
        title: "Test memories cleared!",
        description: `Deleted ${result.deleted_count} test memories.`,
      });
      
      setTestMemories([]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear test memories: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsTestMemory = async (memoryId, isTest) => {
    try {
      const formData = new FormData();
      formData.append('is_test', isTest);
      
      const response = await fetch(`${backendUrl}/api/testing/mark-as-test/${memoryId}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to update test memory status');
      }
      
      toast({
        title: isTest ? "Marked as test memory" : "Unmarked as test memory",
        description: "Memory status updated successfully.",
      });
      
      await loadTestMemories();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update memory status: " + error.message,
        variant: "destructive"
      });
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
              Your Development Testing Hub
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mb-12 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 mr-2" />
              Quick Test Templates
            </CardTitle>
            <p className="text-gray-600">Create test memories instantly for different scenarios</p>
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
                      className="bg-purple-600 text-white hover:bg-purple-700"
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
                <p className="text-gray-500 mb-6">Create test templates above to get started with testing</p>
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
                          </div>
                          <p className="text-gray-600 mb-3">{memory.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {memory.audio_messages?.length || 0} messages
                            </div>
                            <div className="flex items-center gap-1">
                              <Music className="w-3 h-3" />
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
                        <Button
                          onClick={() => markAsTestMemory(memory.id, false)}
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          Unmark Test
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
            <h3 className="text-xl font-bold text-blue-900 mb-4">📋 How to Use Testing Dashboard</h3>
            <ol className="text-blue-800 space-y-2 list-decimal list-inside">
              <li><strong>Create Templates</strong> - Use quick templates for common test scenarios</li>
              <li><strong>Test Features</strong> - Click Listen/Contribute to test different flows</li>
              <li><strong>Mark Memories</strong> - Any memory can be marked as a test memory</li>
              <li><strong>Persistent Storage</strong> - Test memories are saved between sessions</li>
              <li><strong>Easy Cleanup</strong> - Clear all test data when you're done</li>
              <li><strong>Open in New Tab</strong> - Test multiple memories simultaneously</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestingDashboard;