import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Play, ArrowRight, Users, Heart, Gift, Headphones, Music, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [memoryId, setMemoryId] = useState('');

  const handleOrganiseMemory = () => {
    if (isAuthenticated) {
      navigate('/create');
    } else {
      navigate('/auth/login');
    }
  };

  const handleContributeToMemory = () => {
    if (memoryId.trim()) {
      navigate(`/contribute/${memoryId.trim()}`);
    } else {
      // Show input for memory ID
      document.getElementById('memory-id-input')?.focus();
    }
  };

  const handleLogout = () => {
    logout();
    // Optionally show a toast
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="relative z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-center">
            {/* Centered Navigation Menu */}
            <div className="flex items-center space-x-8">
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => navigate('/create')}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
                  >
                    Create
                  </button>
                  <button 
                    onClick={() => setMemoryId('') || document.getElementById('memory-id-input')?.focus()}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
                  >
                    Contribute
                  </button>
                  <div className="flex items-center space-x-3 ml-4">
                    <span className="text-sm text-gray-600">
                      {user?.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white/50"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/auth/login')}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
                  >
                    Sign in
                  </button>
                  <button 
                    onClick={() => navigate('/auth/login')}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
                  >
                    Create
                  </button>
                  <button 
                    onClick={() => setMemoryId('') || document.getElementById('memory-id-input')?.focus()}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
                  >
                    Contribute
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-12 pb-20">
        <div className="text-center mb-16">
          {/* Main Title */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-light mb-4 tracking-tight leading-none text-gray-900">
              <span className="font-mono lowercase vintage-gradient-text vintage-font">forever tapes</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light tracking-wide">
              Collaborative Audio Memories
            </p>
          </div>

          {/* Hero Illustration */}
          <div className="mb-16 flex justify-center">
            <div className="relative">
              {/* Illustration will be added here - placeholder for now */}
              <div className="w-96 h-72 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                <p className="text-purple-600 font-medium">Cute audio equipment illustration coming soon!</p>
              </div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Organise Memory Button */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 cursor-pointer group" onClick={handleOrganiseMemory}>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-900">Organise a memory</h3>
                  <p className="text-gray-600 mb-4">Create and collect heartfelt messages for someone special</p>
                  <ArrowRight className="w-5 h-5 mx-auto text-purple-500 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>

              {/* Contribute to Memory Button */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-900">Contribute to a memory</h3>
                  <p className="text-gray-600 mb-4">Add your voice to an existing memory collection</p>
                  
                  <div className="space-y-3">
                    <Input
                      id="memory-id-input"
                      placeholder="Enter memory ID or link"
                      value={memoryId}
                      onChange={(e) => setMemoryId(e.target.value)}
                      className="border-gray-200 text-center"
                    />
                    <Button 
                      onClick={handleContributeToMemory}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demo Button - Removed */}
            {/* <div className="pt-8">
              <button
                onClick={handleListenToDemo}
                className="group flex items-center justify-center gap-3 mx-auto px-8 py-4 bg-white/60 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white/80 transition-all duration-300 border border-white/50"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Listen to demo</span>
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white/60 backdrop-blur-sm py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to create beautiful audio memories that last forever
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Create your memory</h3>
              <p className="text-gray-600 leading-relaxed">
                Set up a memory collection for any occasion. Choose your theme and customize the experience.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Invite contributors</h3>
              <p className="text-gray-600 leading-relaxed">
                Share your memory link with friends and family. They can record messages directly from their phone or computer.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center">
                <Headphones className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Listen together</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy the finished audio collection with beautiful background music mixing all the heartfelt messages.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Subtle redesign */}
      <div className="bg-white/40 backdrop-blur-sm py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
              Ready to create lasting memories?
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Start collecting heartfelt messages from the people who matter most. 
              Create your first audio memory in minutes.
            </p>
            <Button 
              onClick={handleOrganiseMemory}
              size="lg" 
              className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-4 text-lg font-medium"
            >
              Start creating for free
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600">
            © 2025 Forever Tapes. Creating beautiful audio memories.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;