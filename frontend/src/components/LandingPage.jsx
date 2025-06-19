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

  const handleListenToDemo = () => {
    navigate('/listen/demo');
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
              {/* Custom SVG Audio Equipment Pile */}
              <svg width="400" height="300" viewBox="0 0 400 300" className="drop-shadow-lg">
                {/* Background gradient */}
                <defs>
                  <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="50%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#fb7185" />
                  </linearGradient>
                </defs>
                
                {/* Large Boombox Base */}
                <rect x="50" y="180" width="120" height="80" rx="8" fill="#2d3748" stroke="#4a5568" strokeWidth="2"/>
                <circle cx="80" cy="220" r="15" fill="#1a202c"/>
                <circle cx="140" cy="220" r="15" fill="#1a202c"/>
                <rect x="100" y="200" width="20" height="8" rx="2" fill="#4a5568"/>
                
                {/* Vintage Radio */}
                <rect x="200" y="160" width="100" height="60" rx="12" fill="#8b4513" stroke="#654321" strokeWidth="2"/>
                <circle cx="225" cy="190" r="12" fill="#2d3748"/>
                <circle cx="275" cy="190" r="12" fill="#2d3748"/>
                <rect x="235" y="175" width="30" height="4" rx="2" fill="#654321"/>
                
                {/* Modern Speaker */}
                <rect x="120" y="120" width="80" height="100" rx="10" fill="#1a365d" stroke="#2d3748" strokeWidth="2"/>
                <circle cx="160" cy="155" r="20" fill="#2d3748"/>
                <circle cx="160" cy="190" r="8" fill="#4a5568"/>
                
                {/* Small Cassette Recorder */}
                <rect x="280" y="200" width="70" height="40" rx="6" fill="#4a5568" stroke="#2d3748" strokeWidth="2"/>
                <rect x="290" y="210" width="20" height="15" rx="2" fill="#2d3748"/>
                <rect x="320" y="210" width="20" height="15" rx="2" fill="#2d3748"/>
                
                {/* Character Resting on Equipment */}
                <circle cx="200" cy="100" r="25" fill="#fbb6ce"/> {/* Head */}
                <ellipse cx="200" cy="140" rx="30" ry="45" fill="#553c9a"/> {/* Body */}
                <ellipse cx="180" cy="160" rx="8" ry="25" fill="#553c9a"/> {/* Left arm */}
                <ellipse cx="220" cy="160" rx="8" ry="25" fill="#553c9a"/> {/* Right arm */}
                
                {/* Musical Notes */}
                <text x="320" y="80" fontSize="24" fill="url(#heroGradient)">♪</text>
                <text x="80" y="60" fontSize="20" fill="url(#heroGradient)">♫</text>
                <text x="300" y="120" fontSize="18" fill="url(#heroGradient)">♪</text>
              </svg>
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

            {/* Demo Button */}
            <div className="pt-8">
              <button
                onClick={handleListenToDemo}
                className="group flex items-center justify-center gap-3 mx-auto px-8 py-4 bg-white/60 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white/80 transition-all duration-300 border border-white/50"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Listen to demo</span>
              </button>
            </div>
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

      {/* Music Library Preview Section */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
              Background music library
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our curated collection of background music to enhance your memories
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { title: 'Birthday jazz loop', artist: 'Tape studio', duration: '1:00', category: 'Birthday' },
              { title: 'Celebration breaks', artist: 'Tape studio', duration: '0:45', category: 'General' },
              { title: 'Warm analog', artist: 'Tape studio', duration: '1:30', category: 'Calm' },
              { title: 'Lo-fi romance', artist: 'Tape studio', duration: '2:00', category: 'Love' }
            ].map((track, index) => (
              <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                      {track.category}
                    </Badge>
                    <button className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Play className="w-4 h-4 text-purple-600" />
                    </button>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 capitalize">{track.title}</h4>
                  <p className="text-sm text-gray-600 mb-2 capitalize">{track.artist}</p>
                  <p className="text-xs text-gray-500">{track.duration}</p>
                </CardContent>
              </Card>
            ))}
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