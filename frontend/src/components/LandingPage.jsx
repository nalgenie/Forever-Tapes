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

  const handleCreateFreeMemory = () => {
    navigate('/create-free');
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
                  <button 
                    onClick={() => navigate('/about')}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
                  >
                    About
                  </button>
                  <button 
                    onClick={() => navigate('/how-it-works')}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
                  >
                    How It Works
                  </button>
                  {process.env.NODE_ENV === 'development' && (
                    <button 
                      onClick={() => navigate('/test/audio')}
                      className="text-purple-600 hover:text-purple-800 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-purple-50 text-sm"
                    >
                      🧪 Test Audio
                    </button>
                  )}
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
                    onClick={() => navigate('/create-free')}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
                  >
                    Create a Free Memory
                  </button>
                  <button 
                    onClick={() => setMemoryId('') || document.getElementById('memory-id-input')?.focus()}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
                  >
                    Contribute
                  </button>
                  <button 
                    onClick={() => navigate('/about')}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
                  >
                    About
                  </button>
                  <button 
                    onClick={() => navigate('/how-it-works')}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
                  >
                    How It Works
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
              {/* Original Cute Audio Equipment Pile */}
              <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
                {/* Main Speaker (left) - warm orange/red */}
                <rect x="40" y="120" width="70" height="90" rx="15" fill="#F97316" stroke="#EA580C" strokeWidth="2"/>
                <circle cx="75" cy="150" r="18" fill="#DC2626" stroke="#B91C1C" strokeWidth="2"/>
                <circle cx="75" cy="180" r="12" fill="#DC2626" stroke="#B91C1C" strokeWidth="2"/>
                <rect x="55" y="200" width="40" height="6" rx="3" fill="#EA580C"/>
                
                {/* Vintage Radio (center-left) - warm brown */}
                <rect x="120" y="140" width="80" height="60" rx="12" fill="#A16207" stroke="#92400E" strokeWidth="2"/>
                <circle cx="140" cy="165" r="10" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
                <circle cx="180" cy="165" r="10" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
                <rect x="150" y="185" width="20" height="8" rx="4" fill="#92400E"/>
                <line x1="155" y1="155" x2="165" y2="155" stroke="#FCD34D" strokeWidth="2"/>
                
                {/* Tall Speaker (center-right) - blue/teal */}
                <rect x="210" y="90" width="60" height="110" rx="12" fill="#0284C7" stroke="#0369A1" strokeWidth="2"/>
                <circle cx="240" cy="125" r="15" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2"/>
                <circle cx="240" cy="155" r="10" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2"/>
                <circle cx="240" cy="180" r="8" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2"/>
                <rect x="225" y="190" width="30" height="4" rx="2" fill="#0369A1"/>
                
                {/* Boombox (right) - purple/magenta */}
                <rect x="280" y="130" width="85" height="55" rx="10" fill="#9333EA" stroke="#7C3AED" strokeWidth="2"/>
                <circle cx="295" cy="155" r="12" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
                <circle cx="350" cy="155" r="12" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
                <rect x="315" y="145" width="25" height="15" rx="3" fill="#A855F7" stroke="#9333EA" strokeWidth="1"/>
                <rect x="315" y="165" width="25" height="6" rx="3" fill="#7C3AED"/>
                
                {/* Small Speaker (far right) - green */}
                <rect x="340" y="100" width="45" height="70" rx="8" fill="#059669" stroke="#047857" strokeWidth="2"/>
                <circle cx="362" cy="125" r="8" fill="#065F46" stroke="#064E3B" strokeWidth="1"/>
                <circle cx="362" cy="150" r="6" fill="#065F46" stroke="#064E3B" strokeWidth="1"/>
                
                {/* Character sitting on equipment pile */}
                {/* Body */}
                <ellipse cx="200" cy="115" rx="20" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
                
                {/* Head */}
                <circle cx="200" cy="105" r="12" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
                
                {/* Simple hair/head covering */}
                <path d="M188 98 Q200 90 212 98 Q208 102 200 100 Q192 102 188 98" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
                
                {/* Face - simple and peaceful */}
                <circle cx="196" cy="102" r="1.5" fill="#8B4513"/>
                <circle cx="204" cy="102" r="1.5" fill="#8B4513"/>
                <path d="M198 108 Q200 110 202 108" fill="none" stroke="#8B4513" strokeWidth="1"/>
                
                {/* Arms resting */}
                <ellipse cx="185" cy="120" rx="8" ry="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
                <ellipse cx="215" cy="120" rx="8" ry="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
                
                {/* Legs tucked */}
                <ellipse cx="195" cy="135" rx="6" ry="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
                <ellipse cx="205" cy="135" rx="6" ry="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
                
                {/* Musical notes floating around */}
                <circle cx="100" cy="50" r="3" fill="#8B5CF6" opacity="0.7"/>
                <line x1="103" y1="50" x2="103" y2="35" stroke="#8B5CF6" strokeWidth="2" opacity="0.7"/>
                <path d="M103 35 Q108 32 108 37" fill="#8B5CF6" opacity="0.7"/>
                
                <circle cx="320" cy="40" r="3" fill="#F97316" opacity="0.7"/>
                <line x1="323" y1="40" x2="323" y2="25" stroke="#F97316" strokeWidth="2" opacity="0.7"/>
                <path d="M323 25 Q328 22 328 27" fill="#F97316" opacity="0.7"/>
                
                <circle cx="280" cy="60" r="2.5" fill="#10B981" opacity="0.6"/>
                <line x1="282" y1="60" x2="282" y2="48" stroke="#10B981" strokeWidth="1.5" opacity="0.6"/>
                
                <circle cx="80" cy="45" r="2.5" fill="#EC4899" opacity="0.6"/>
                <line x1="82" y1="45" x2="82" y2="33" stroke="#EC4899" strokeWidth="1.5" opacity="0.6"/>
                
                {/* Sound waves */}
                <path d="M30 150 Q35 145 40 150 Q45 155 50 150" fill="none" stroke="#60A5FA" strokeWidth="1.5" opacity="0.6"/>
                <path d="M350 140 Q355 135 360 140 Q365 145 370 140" fill="none" stroke="#34D399" strokeWidth="1.5" opacity="0.6"/>
                <path d="M60 200 Q65 195 70 200 Q75 205 80 200" fill="none" stroke="#F472B6" strokeWidth="1.5" opacity="0.5"/>
                
                {/* Small details on speakers */}
                <circle cx="70" cy="135" r="3" fill="#374151"/>
                <circle cx="110" cy="135" r="3" fill="#374151"/>
                <circle cx="230" cy="110" r="8" fill="#047857"/>
                <circle cx="367" cy="140" r="4" fill="#1E3A8A"/>
              </svg>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Create Free Memory Button */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 cursor-pointer group" onClick={handleCreateFreeMemory}>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-900">Create a Free Memory</h3>
                  <p className="text-gray-600 mb-4">Start collecting messages instantly - no sign up required</p>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Free</Badge>
                  <ArrowRight className="w-5 h-5 mx-auto mt-2 text-green-500 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>

              {/* Premium Sign In Button */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 cursor-pointer group" onClick={handleOrganiseMemory}>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-900">Sign In for Premium</h3>
                  <p className="text-gray-600 mb-4">Full dashboard, unlimited memories, and advanced features</p>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">Premium</Badge>
                  <ArrowRight className="w-5 h-5 mx-auto mt-2 text-purple-500 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </div>

            {/* Contribute to Memory Section */}
            <div className="pt-4">
              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-900">Contribute to a Memory</h4>
                  <p className="text-gray-600 mb-3 text-sm">Add your voice to an existing memory collection</p>
                  
                  <div className="flex gap-2 max-w-md mx-auto">
                    <Input
                      id="memory-id-input"
                      placeholder="Enter memory ID or link"
                      value={memoryId}
                      onChange={(e) => setMemoryId(e.target.value)}
                      className="border-gray-200 text-center text-sm"
                    />
                    <Button 
                      onClick={handleContributeToMemory}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                    >
                      Go
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

      {/* Features Section */}

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
              onClick={handleCreateFreeMemory}
              size="lg" 
              className="bg-green-600 text-white hover:bg-green-700 rounded-full px-12 py-4 text-lg font-medium mr-4"
            >
              Create a Free Memory
            </Button>
            <Button 
              onClick={handleOrganiseMemory}
              size="lg" 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-12 py-4 text-lg font-medium"
            >
              Sign In for Premium
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