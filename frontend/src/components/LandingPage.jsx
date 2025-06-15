import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mic, Music, Share2, PlayCircle, Users, Volume2, Radio, Heart, Clock, Zap, Headphones, Waveform } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const animationRef = useRef(null);

  // Animated audio wave dots
  const [waveDots, setWaveDots] = useState([]);

  useEffect(() => {
    // Initialize animated dots for audio wave visualization
    const dots = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: `hsl(${Math.random() * 60 + 200}, ${Math.random() * 30 + 70}%, ${Math.random() * 20 + 60}%)`,
      speed: Math.random() * 2 + 0.5,
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
          direction: dot.direction + (Math.random() - 0.5) * 0.1
        }))
      );
    }, 100);

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
      title: 'Every voice is a color here. Which one will you pick?',
      subtitle: 'Choose Your Voice Color',
      animation: 'partner',
      buttonText: 'Sign Up',
      buttonAction: () => navigate('/create')
    },
    {
      step: '❷',
      title: 'Create with someone you know via custom audio settings:',
      subtitle: 'Collaborative Audio Settings',
      animation: 'settings',
      buttonText: 'Start Recording',
      buttonAction: () => navigate('/create')
    },
    {
      step: '❸',
      title: 'Take turns adding voices, memories, and emotions...',
      subtitle: 'Collect Voice Messages',
      animation: 'turns',
      buttonText: null,
      buttonAction: null
    },
    {
      step: '❹',
      title: 'Create your final audio experience for sharing (and celebrating).',
      subtitle: 'Share Your Audio Memory',
      animation: 'final',
      buttonText: null,
      buttonAction: null
    }
  ];

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Collection",
      description: "Send a link. Contributors record directly from their device with guided prompts."
    },
    {
      icon: <Waveform className="w-6 h-6" />,
      title: "Audio Mixing", 
      description: "Custom background tracks, advanced editing tools, and audio enhancement for perfect quality."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaborative Creation",
      description: "Invite contributors to add their voice to your audio experience."
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Seamless Sharing",
      description: "Share your finished audio experience via email, text, or custom listening page."
    }
  ];

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
        <div className="absolute inset-0 opacity-30">
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
              Collaborative Audio Experiences
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-light mb-8 tracking-tight leading-none text-gray-900">
              <div className="relative inline-block">
                <span className="relative z-10">Forever</span>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 rounded-full"></div>
              </div>
              <br />
              <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600">
                Tapes
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
              Collaborative Audio Experiences for the Collective Memory
            </p>

            {/* Hero Illustration */}
            <div className="mb-16 relative">
              <div className="w-full max-w-2xl mx-auto h-64 relative">
                <img 
                  src="https://images.unsplash.com/photo-1617994452722-4145e196248b"
                  alt="Audio waves visualization"
                  className="w-full h-full object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-orange-500/20 rounded-2xl"></div>
              </div>
            </div>

            {/* Hero Description */}
            <div className="mb-16 max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                <span className="font-semibold text-gray-900">Forever Tapes</span> is an audio platform for collaborative memory-making. 
                <span className="block mt-4 text-gray-600">
                  Here, multiple voices take turns contributing to a single audio experience and connect as <em className="font-medium">equals in memory</em> across their own parallel world of shared moments. What happens when one of the voices is yours?
                </span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/create')}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-4 font-normal text-lg rounded-full"
              >
                <Mic className="mr-2 w-5 h-5" />
                Start your own experience
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

      {/* Process Section */}
      <section className="py-20 px-6 bg-gray-50" id="how-it-works">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-tight text-gray-900">
              The process is simple
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              Creating meaningful audio experiences has never been more intuitive.
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
                          <div className="text-sm text-gray-600">Audio Experience</div>
                          <div className="text-lg font-semibold text-gray-800">Complete</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-light mb-4 text-gray-900">
                    <span className="text-3xl mr-3">{step.step}</span>
                    {step.title}
                  </h3>
                  
                  {step.buttonText && (
                    <Button
                      onClick={step.buttonAction}
                      className="bg-gray-900 text-white hover:bg-gray-800 font-normal px-6 py-3 rounded-full"
                    >
                      {step.buttonText}
                    </Button>
                  )}
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
            <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-tight text-gray-900">
              Designed for life's
              <br />
              <span className="italic">meaningful sounds</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto font-light">
              Each audio experience is thoughtfully crafted to capture the essence of your occasion.
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

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-tight text-gray-900">
              How it works
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto font-light">
              Creating meaningful audio experiences has never been more intuitive.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-white group-hover:bg-gray-50 rounded-2xl flex items-center justify-center text-gray-700 transition-colors duration-300 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-base font-medium mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
            Start for free
          </h2>
          <p className="text-xl text-white/90 mb-8 font-light max-w-2xl mx-auto">
            Create your first audio experience at no cost. Upgrade for extended features and unlimited possibilities.
          </p>
          
          <div className="flex justify-center gap-8 text-sm text-white/80 mb-12 font-light">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              First experience is free
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
            Create your first experience
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
              Collaborative Audio Experiences for the Collective Memory
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