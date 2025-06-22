import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Play, 
  RefreshCw, 
  Trash2, 
  Settings,
  TestTube,
  Database,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const DevTools = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState(null);

  const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;

  const handleCreateTestData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/dev/create-test-data`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create test data');
      }
      
      const result = await response.json();
      setTestData(result);
      
      toast({
        title: "Test data created!",
        description: `Created ${result.memories_created} test memories successfully.`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test data: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearTestData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/dev/clear-test-data`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear test data');
      }
      
      const result = await response.json();
      setTestData(null);
      
      toast({
        title: "Test data cleared!",
        description: `Deleted ${result.deleted_memories} test memories.`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear test data: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReset = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/dev/quick-reset`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to quick reset');
      }
      
      const result = await response.json();
      setTestData(result.result);
      
      toast({
        title: "Quick reset complete!",
        description: "Test data refreshed successfully.",
      });
      
    } catch (error) {
      toast({
        title: "Error", 
        description: "Quick reset failed: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testScenarios = [
    {
      name: "Single Message",
      id: "test-single-message", 
      description: "Test basic audio playback with one message",
      badge: "Basic",
      color: "bg-blue-100 text-blue-700"
    },
    {
      name: "Multiple Messages",
      id: "test-multiple-messages",
      description: "Test skip controls, message list, and multi-track playback", 
      badge: "Advanced",
      color: "bg-purple-100 text-purple-700"
    },
    {
      name: "Empty Memory",
      id: "test-empty-memory",
      description: "Test empty state UI and contribution flow",
      badge: "Edge Case", 
      color: "bg-orange-100 text-orange-700"
    },
    {
      name: "Free Memory",
      id: "test-free-memory",
      description: "Test free tier memory functionality",
      badge: "Freemium",
      color: "bg-green-100 text-green-700"
    },
    {
      name: "Demo Memory", 
      id: "demo",
      description: "Original demo memory with sample data",
      badge: "Demo",
      color: "bg-gray-100 text-gray-700"
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
            
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Settings className="w-3 h-3 mr-1" />
              Development Tools
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-light mb-4 tracking-tight leading-none text-gray-900">
              <span className="font-mono lowercase vintage-gradient-text vintage-font">dev tools</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light tracking-wide">
              Testing & Development Dashboard
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mb-12 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Database className="w-6 h-6 mr-2" />
              Test Data Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Button
                onClick={handleCreateTestData}
                disabled={loading}
                className="bg-green-600 text-white hover:bg-green-700 p-6 h-auto flex-col"
              >
                <TestTube className="w-6 h-6 mb-2" />
                <span className="font-semibold">Create Test Data</span>
                <span className="text-sm opacity-90">Setup test memories</span>
              </Button>
              
              <Button
                onClick={handleQuickReset}
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700 p-6 h-auto flex-col"
              >
                <RefreshCw className="w-6 h-6 mb-2" />
                <span className="font-semibold">Quick Reset</span>
                <span className="text-sm opacity-90">Clear & recreate</span>
              </Button>
              
              <Button
                onClick={handleClearTestData}
                disabled={loading}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50 p-6 h-auto flex-col"
              >
                <Trash2 className="w-6 h-6 mb-2" />
                <span className="font-semibold">Clear Test Data</span>
                <span className="text-sm opacity-90">Remove all test data</span>
              </Button>
            </div>
            
            {testData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✅ Test Data Ready</h4>
                <p className="text-green-700 text-sm">
                  Created {testData.memories_created} test memories. Use the scenarios below to test features.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Scenarios */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Play className="w-6 h-6 mr-2" />
              Test Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testScenarios.map((scenario) => (
                <Card key={scenario.id} className="border border-gray-200 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900">{scenario.name}</h3>
                      <Badge className={scenario.color}>{scenario.badge}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {scenario.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/listen/${scenario.id}`)}
                        size="sm"
                        className="bg-purple-600 text-white hover:bg-purple-700 flex-1"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Listen
                      </Button>
                      {scenario.id !== 'demo' && (
                        <Button
                          onClick={() => navigate(`/contribute/${scenario.id}`)}
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 border-0 shadow-xl bg-blue-50">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">📋 Testing Instructions</h3>
            <ol className="text-blue-800 space-y-2 list-decimal list-inside">
              <li><strong>Create Test Data</strong> - Click "Create Test Data" to setup test memories</li>
              <li><strong>Test Scenarios</strong> - Use the scenario cards to test different features</li>
              <li><strong>Audio Features</strong> - Test play/pause, skip controls, volume, and message list</li>
              <li><strong>Contribution Flow</strong> - Use "Empty Memory" to test adding messages</li>
              <li><strong>Quick Reset</strong> - Refresh test data when needed during development</li>
              <li><strong>Audio Processing</strong> - Use multi-message memories to test audio processing APIs</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DevTools;