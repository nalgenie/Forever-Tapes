import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mic, Music, Share2, PlayCircle, Users, Volume2, Radio, Heart, Clock, Zap, Headphones, AudioWaveform } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const animationRef = useRef(null);

  // Animated audio wave dots
  const [waveDots, setWaveDots] = useState([]);

  useEffect(() => {
    // Initialize animated dots for audio wave visualization
    const dots = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      color: `hsl(${Math.random() * 60 + 200}, ${Math.random() * 30 + 70}%, ${Math.random() * 20 + 60}%)`,
      speed: Math.random() * 1.5 + 0.3,
      direction: Math.random() * Math.PI * 2
    }));
    setWaveDots(dots);

    // Animate dots
    const interval = setInterval(() => {
      setWaveDots(prevDots => 
        prevDots.map(dot => ({
          ...dot,
          x: (dot.x + Math.cos(dot.direction) * dot.speed + 100) % 100,
          y: (dot.y + Math.sin(dot.direction) * dot.speed + 100) % 100,
          direction: dot.direction + (Math.random() - 0.5) * 0.08
        }))
      );
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const experiences = [
    {
      id: '01',
      title: 'Celebrations',
      subtitle: 'birthday voices, anniversaries, milestones',
      description: 'Collect heartfelt voice messages from loved ones to create lasting audio memories for special occasions.',
      baseColor: 'bg-blue-50',
      hoverColor: 'bg-blue-100',
      textColor: 'text-blue-900',
      accentColor: 'border-blue-200'
    },
    {
      id: '02', 
      title: 'Moments',
      subtitle: 'graduations, achievements, life transitions',
      description: 'Preserve the emotions and significance of life\'s important moments through authentic voice recordings.',
      baseColor: 'bg-purple-50',
      hoverColor: 'bg-purple-100', 
      textColor: 'text-purple-900',
      accentColor: 'border-purple-200'
    },
    {
      id: '03',
      title: 'Memories',
      subtitle: 'family stories, tributes, legacies',
      description: 'Create audio archives that connect generations and preserve the stories that matter most.',
      baseColor: 'bg-orange-50',
      hoverColor: 'bg-orange-100',
      textColor: 'text-orange-900',
      accentColor: 'border-orange-200'
    }
  ];

  const processSteps = [
    {
      step: '❶',
      title: 'Choose Your Voice Color',
      subtitle: 'Every voice is a color here. Which one will you pick?',
      description: 'Sign up and select your unique voice identity. Each contributor gets a distinct color representing their voice in your audio memory.',
      animation: 'partner'
    },
    {
      step: '❂',
      title: 'Create Your Audio Memory',
      subtitle: 'Set up your collaborative recording with custom settings',
      description: 'Configure who can contribute, set message lengths, choose background music, and customize your audio memory collection.',
      animation: 'settings'
    },
    {
      step: '❸',
      title: 'Collect Voice Messages',
      subtitle: 'Contributors add their voices, memories, and emotions',
      description: 'Share your link and watch as friends and family contribute their heartfelt messages. Each voice adds a unique layer to your memory.',
      animation: 'turns'
    },
    {
      step: '❹',
      title: 'Share Your Memory',
      subtitle: 'Create your final audio memory for sharing and celebrating',
      description: 'We blend all voices together with your chosen background music into a beautiful, shareable audio memory that lasts forever.',
      animation: 'final'
    }
  ];

  // Cute illustration inspired by the book pile image but with audio equipment
  const CuteAudioIllustration = () => (
    <div className="simple-logo">
      <svg 
        viewBox="0 0 400 250" 
        className="w-full h-auto"
        style={{ maxHeight: '300px' }}
      >
        {/* Background pile of cassette tapes and audio equipment */}
        
        {/* Back row - large items */}
        <rect x="50" y="120" width="80" height="50" rx="4" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
        <rect x="300" y="100" width="70" height="60" rx="6" fill="#FCA5A5" stroke="#F87171" strokeWidth="2"/>
        <rect x="200" y="90" width="90" height="45" rx="4" fill="#A7F3D0" stroke="#6EE7B7" strokeWidth="2"/>
        
        {/* Middle row - cassette tapes */}
        <rect x="80" y="140" width="60" height="40" rx="3" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
        <rect x="150" y="135" width="65" height="42" rx="3" fill="#A78BFA" stroke="#8B5CF6" strokeWidth="2"/>
        <rect x="260" y="130" width="70" height="45" rx="3" fill="#34D399" stroke="#10B981" strokeWidth="2"/>
        <rect x="340" y="125" width="55" height="38" rx="3" fill="#60A5FA" stroke="#3B82F6" strokeWidth="2"/>
        
        {/* Cassette holes on visible tapes */}
        <circle cx="95" cy="155" r="6" fill="none" stroke="#D97706" strokeWidth="1.5"/>
        <circle cx="125" cy="155" r="6" fill="none" stroke="#D97706" strokeWidth="1.5"/>
        <circle cx="165" cy="150" r="6" fill="none" stroke="#7C3AED" strokeWidth="1.5"/>
        <circle cx="195" cy="150" r="6" fill="none" stroke="#7C3AED" strokeWidth="1.5"/>
        <circle cx="275" cy="145" r="6" fill="none" stroke="#059669" strokeWidth="1.5"/>
        <circle cx="305" cy="145" r="6" fill="none" stroke="#059669" strokeWidth="1.5"/>
        
        {/* Front row - more tapes */}
        <rect x="40" y="170" width="70" height="35" rx="3" fill="#F472B6" stroke="#EC4899" strokeWidth="2"/>
        <rect x="120" y="175" width="75" height="40" rx="3" fill="#FB7185" stroke="#F43F5E" strokeWidth="2"/>
        <rect x="280" y="165" width="80" height="38" rx="3" fill="#38BDF8" stroke="#0EA5E9" strokeWidth="2"/>
        
        {/* Old radio/boombox on the side */}
        <rect x="20" y="80" width="60" height="45" rx="4" fill="#6B7280" stroke="#4B5563" strokeWidth="2"/>
        <circle cx="35" cy="95" r="8" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
        <circle cx="55" cy="95" r="8" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
        <rect x="25" y="110" width="50" height="8" rx="2" fill="#9CA3AF"/>
        
        {/* Headphones draped over equipment */}
        <path d="M150 60 Q200 40 250 60" fill="none" stroke="#3B82F6" strokeWidth="3"/>
        <circle cx="150" cy="70" r="12" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
        <circle cx="250" cy="70" r="12" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
        <path d="M150 82 Q155 90 150 95" fill="none" stroke="#3B82F6" strokeWidth="2"/>
        <path d="M250 82 Q245 90 250 95" fill="none" stroke="#3B82F6" strokeWidth="2"/>
        
        {/* Cute character (sleepy cat) resting on the pile */}
        <ellipse cx="200" cy="125" rx="25" ry="18" fill="#D2B48C" stroke="#CD853F" strokeWidth="2"/>
        <circle cx="195" cy="115" r="8" fill="#DEB887"/>
        <circle cx="205" cy="115" r="8" fill="#DEB887"/>
        <ellipse cx="200" cy="110" rx="12" ry="8" fill="#D2B48C" stroke="#CD853F" strokeWidth="1"/>
        
        {/* Cat ears */}
        <polygon points="190,108 195,98 200,108" fill="#D2B48C" stroke="#CD853F" strokeWidth="1"/>
        <polygon points="200,108 205,98 210,108" fill="#D2B48C" stroke="#CD853F" strokeWidth="1"/>
        
        {/* Cat face details */}
        <circle cx="196" cy="108" r="1.5" fill="#8B4513"/>
        <circle cx="204" cy="108" r="1.5" fill="#8B4513"/>
        <path d="M198 112 Q200 114 202 112" fill="none" stroke="#8B4513" strokeWidth="1"/>
        <path d="M200 114 L200 116" stroke="#8B4513" strokeWidth="1"/>
        
        {/* Cat tail curled */}
        <path d="M220 125 Q230 115 225 105 Q220 100 215 105" fill="none" stroke="#CD853F" strokeWidth="3"/>
        
        {/* Musical notes floating around */}
        <circle cx="100" cy="50" r="3" fill="#8B5CF6" opacity="0.7"/>
        <line x1="103" y1="50" x2="103" y2="35" stroke="#8B5CF6" strokeWidth="2" opacity="0.7"/>
        <path d="M103 35 Q108 32 108 37" fill="#8B5CF6" opacity="0.7"/>
        
        <circle cx="320" cy="40" r="3" fill="#F97316" opacity="0.7"/>
        <line x1="323" y1="40" x2="323" y2="25" stroke="#F97316" strokeWidth="2" opacity="0.7"/>
        <path d="M323 25 Q328 22 328 27" fill="#F97316" opacity="0.7"/>
        
        <circle cx="280" cy="60" r="2.5" fill="#10B981" opacity="0.6"/>
        <line x1="282" y1="60" x2="282" y2="48" stroke="#10B981" strokeWidth="1.5" opacity="0.6"/>
        
        {/* Sound waves */}
        <path d="M30 150 Q35 145 40 150 Q45 155 50 150" fill="none" stroke="#60A5FA" strokeWidth="1.5" opacity="0.6"/>
        <path d="M350 140 Q355 135 360 140 Q365 145 370 140" fill="none" stroke="#34D399" strokeWidth="1.5" opacity="0.6"/>
        
        {/* Small details - tape reels visible */}
        <circle cx="95" cy="155" r="3" fill="#92400E"/>
        <circle cx="125" cy="155" r="3" fill="#92400E"/>
        <circle cx="165" cy="150" r="3" fill="#581C87"/>
        <circle cx="195" cy="150" r="3" fill="#581C87"/>
        
        {/* Cord/wire from headphones */}
        <path d="M175 75 Q170 85 165 95 Q160 105 165 115" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.8"/>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-light">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-sm flex items-center justify-center">
                <Radio className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-normal tracking-wide text-gray-900">
                Forever Tapes
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 font-normal transition-colors"
              >
                Dashboard
              </button>
              <Button 
                onClick={() => navigate('/create')}
                className="bg-gray-900 text-white hover:bg-gray-800 font-normal px-6 py-2"
              >
                Start Creating
              </Button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="space-y-1">
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white z-40 md:hidden pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="space-y-6">
              <button 
                onClick={() => navigate('/dashboard')}
                className="block text-lg text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </button>
              <Button 
                onClick={() => navigate('/create')}
                className="bg-gray-900 text-white hover:bg-gray-800 font-normal px-6 py-2 w-full"
              >
                Start Creating
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Animated Audio Wave Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="relative w-full h-full">
            {waveDots.map(dot => (
              <div
                key={dot.id}
                className="absolute rounded-full transition-all duration-300 ease-out"
                style={{
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  backgroundColor: dot.color,
                  transform: `translate(-50%, -50%)`,
                  filter: 'blur(1px)'
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <Badge className="mb-8 bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 text-sm font-normal">
              Collective Audio Archives
            </Badge>
            
            <h1 className="text-7xl md:text-9xl mb-8 tracking-tight leading-none lofi-heading gradient-heading lowercase">
              forever tapes
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
              Collective Audio Archives for Shared Memories
            </p>

            {/* Cute Audio Illustration */}
            <div className="mb-16 relative">
              <CuteAudioIllustration />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/create')}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-4 font-normal text-lg rounded-full"
              >
                <Mic className="mr-2 w-5 h-5" />
                Start your own memory
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-4 border-gray-300 text-gray-700 hover:bg-gray-50 font-normal text-lg rounded-full"
                onClick={() => navigate('/listen/demo')}
              >
                <PlayCircle className="mr-2 w-5 h-5" />
                Listen to demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section - No buttons */}
      <section className="py-20 px-6 bg-gray-50" id="how-it-works">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-tight text-gray-900 vintage-font">
              The process is simple
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              Creating meaningful audio memories has never been more intuitive.
            </p>
          </div>
          
          <ol className="grid gap-12 md:gap-16">
            {processSteps.map((step, index) => (
              <li key={index} className="flex flex-col md:flex-row items-center gap-8">
                {/* Animation/Visual */}
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="w-64 h-64 relative">
                    {step.animation === 'partner' && (
                      <div className="w-full h-full relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
                        <div className="grid grid-cols-4 gap-3">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full transition-all duration-1000"
                              style={{
                                backgroundColor: `hsl(${(i * 25) % 360}, 70%, 60%)`,
                                transform: `scale(${0.8 + Math.sin(Date.now() / 1000 + i) * 0.2})`,
                                animationDelay: `${i * 100}ms`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {step.animation === 'settings' && (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-orange-100 rounded-3xl p-8 flex flex-col justify-center space-y-4">
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600">Voice duration</div>
                          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-400 to-orange-400 rounded-full transition-all duration-2000" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600">Contributors</div>
                          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-2000" style={{ width: '40%' }}></div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600">Quality</div>
                          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-400 to-blue-400 rounded-full transition-all duration-2000" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {step.animation === 'turns' && (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-blue-100 rounded-3xl flex items-center justify-center">
                        <div className="space-y-4">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="h-3 rounded-full transition-all duration-1000"
                              style={{
                                width: `${Math.random() * 150 + 50}px`,
                                backgroundColor: i % 2 === 0 ? '#3B82F6' : '#F97316',
                                opacity: 0.3 + (i / 6) * 0.7,
                                transform: `translateX(${Math.sin(Date.now() / 1000 + i) * 10}px)`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {step.animation === 'final' && (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-orange-100 rounded-3xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                            <Heart className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-sm text-gray-600">Audio Memory</div>
                          <div className="text-lg font-semibold text-gray-800">Complete</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content - No buttons */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-light mb-4 text-gray-900 vintage-font">
                    <span className="text-3xl mr-3">{step.step}</span>
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4 font-light">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Experience Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-tight text-gray-900 vintage-font">
              Designed for life's
              <br />
              <span className="italic">meaningful sounds</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto font-light">
              Each audio memory is thoughtfully crafted to capture the essence of your occasion.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {experiences.map((experience, index) => (
              <Card 
                key={experience.id}
                className={`border-2 ${experience.accentColor} transition-all duration-300 cursor-pointer hover:shadow-lg ${experience.baseColor} hover:${experience.hoverColor}`}
                onClick={() => navigate('/create')}
              >
                <CardContent className="p-8 h-80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs font-mono text-gray-500 tracking-wider">
                        {experience.id}
                      </span>
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                    </div>
                    <CardTitle className={`text-xl font-normal mb-2 tracking-tight ${experience.textColor}`}>
                      {experience.title}
                    </CardTitle>
                    <p className="text-sm font-light text-gray-600 mb-6">
                      {experience.subtitle}
                    </p>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm font-light">
                    {experience.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight vintage-font">
            Start for free
          </h2>
          <p className="text-xl text-white/90 mb-8 font-light max-w-2xl mx-auto">
            Create your first audio memory at no cost. Upgrade for extended features and unlimited possibilities.
          </p>
          
          <div className="flex justify-center gap-8 text-sm text-white/80 mb-12 font-light">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              First memory is free
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              Professional quality
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              No technical skills required
            </div>
          </div>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/create')}
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 font-normal text-lg rounded-full"
          >
            <Mic className="w-5 h-5 mr-2" />
            Create your first memory
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 px-6 border-t border-gray-100">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-gray-900 rounded-sm flex items-center justify-center">
                <Radio className="w-3 h-3 text-white" />
              </div>
              <span className="text-base font-medium text-gray-900">Forever Tapes</span>
            </div>
            <p className="text-gray-600 max-w-xl mx-auto font-light">
              Collective Audio Archives for Shared Memories
            </p>
          </div>
          
          <div className="text-center text-gray-500 text-sm font-light">
            <p>&copy; 2025 Forever Tapes</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;