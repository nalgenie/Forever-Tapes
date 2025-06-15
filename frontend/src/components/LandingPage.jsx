import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mic, Music, Share2, Sparkles, PlayCircle, Heart, Gift, Clock, Users, Volume2, Radio, Disc, Headphones } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const experiences = [
    {
      id: '01',
      title: 'CELEBRATIONS',
      subtitle: 'birthday mixes • anniversary tapes • milestone recordings',
      description: 'Collect heartfelt messages from loved ones and create unforgettable audio celebrations.',
      gradient: 'from-orange-400 to-red-500',
      hoverGradient: 'from-orange-500 to-red-600',
      icon: '🎂'
    },
    {
      id: '02', 
      title: 'MOMENTS',
      subtitle: 'graduation mixes • achievement tapes • occasion recordings',
      description: 'Preserve the emotions and excitement of life\'s most important moments.',
      gradient: 'from-purple-400 to-indigo-500',
      hoverGradient: 'from-purple-500 to-indigo-600',
      icon: '✨'
    },
    {
      id: '03',
      title: 'MEMORIES',
      subtitle: 'family archives • tribute tapes • legacy recordings',
      description: 'Create lasting audio memories that connect generations and preserve stories.',
      gradient: 'from-cyan-400 to-blue-500',
      hoverGradient: 'from-cyan-500 to-blue-600',
      icon: '💿'
    }
  ];

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "audio collection",
      description: "send a link. contributors record directly from their device with guided prompts."
    },
    {
      icon: <Music className="w-6 h-6" />,
      title: "vintage mixing", 
      description: "custom background loops, analog-style editing, and noise reduction for that perfect sound."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "collaborative creation",
      description: "invite unlimited contributors to add their voice to your mixtape."
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "digital delivery",
      description: "share your finished tape via email, text, or custom listening page."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-wider">
                FOREVER TAPES
              </span>
            </div>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="hidden sm:flex font-medium"
            >
              dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-8 bg-red-100 text-red-800 border-0 px-4 py-2 text-sm font-medium">
              bespoke audio experiences
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight leading-none">
              CREATE AUDIO
              <br />
              <span className="block text-red-500">MIXTAPES</span>
              <span className="block text-4xl md:text-5xl font-normal italic">for life's moments</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              craft bespoke audio experiences that capture voices, emotions, and moments. 
              turn heartfelt messages into lasting celebrations and memories.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/create')}
                className="bg-black text-white hover:bg-gray-800 px-12 py-6 text-lg font-black tracking-wide rounded-none shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                START RECORDING
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="px-12 py-6 text-lg rounded-none border-2 border-gray-800 hover:bg-gray-800 hover:text-white transition-all duration-300 font-medium"
                onClick={() => navigate('/listen/demo')}
              >
                <PlayCircle className="mr-2 w-5 h-5" />
                listen to demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Grid - Halles Cartoucherie style */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              CRAFTED FOR
              <br />
              <span className="text-3xl md:text-4xl font-normal italic">life's soundtrack</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              every audio experience is uniquely tailored to capture the essence of your special occasion.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {experiences.map((experience, index) => (
              <div key={experience.id} className="relative group">
                {/* Base Card */}
                <Card 
                  className={`border-0 shadow-xl transition-all duration-500 cursor-pointer transform hover:scale-105 overflow-hidden bg-gradient-to-br ${experience.gradient} text-white relative z-10 ${
                    hoveredCard === experience.id ? 'opacity-0' : 'opacity-100'
                  }`}
                  onMouseEnter={() => setHoveredCard(experience.id)}
                  onClick={() => navigate('/create')}
                >
                  <CardContent className="p-8 h-80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-mono text-white/80">
                          {`{ ${experience.id} }`}
                        </span>
                        <span className="text-4xl">{experience.icon}</span>
                      </div>
                      <CardTitle className="text-2xl font-black mb-2 tracking-tight">
                        {experience.title}
                      </CardTitle>
                      <p className="text-sm font-medium text-white/80 uppercase tracking-wide">
                        {experience.subtitle}
                      </p>
                    </div>
                    <p className="text-white/90 leading-relaxed">
                      {experience.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Hover Card */}
                <Card 
                  className={`absolute inset-0 border-0 shadow-xl transition-all duration-500 cursor-pointer transform hover:scale-105 overflow-hidden bg-gradient-to-br ${experience.hoverGradient} text-white z-20 ${
                    hoveredCard === experience.id ? 'opacity-100' : 'opacity-0'
                  }`}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate('/create')}
                >
                  <CardContent className="p-8 h-80 flex flex-col justify-center items-center text-center">
                    <div className="text-6xl mb-6">{experience.icon}</div>
                    <h3 className="text-3xl font-black mb-4">{experience.title}</h3>
                    <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-2">
                      start creating
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              HOW IT WORKS
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              creating authentic audio experiences has never been simpler or more meaningful.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-red-400 group-hover:to-orange-500 rounded-2xl flex items-center justify-center text-gray-700 group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-black mb-3 text-gray-800 tracking-wide uppercase">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            START FOR FREE
          </h2>
          <p className="text-xl text-white/90 mb-8 font-light">
            create your first audio mixtape at no cost. upgrade for extended features and unlimited possibilities.
          </p>
          
          <div className="flex justify-center gap-8 text-sm text-white/80 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              first mixtape is free
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              analog-quality processing
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              no technical skills required
            </div>
          </div>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/create')}
            className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-6 text-lg font-black tracking-wide rounded-none shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            CREATE YOUR FIRST MIXTAPE
            <Sparkles className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Radio className="w-4 h-4 text-white" />
              </div>
              <span className="text-2xl font-black tracking-wider">FOREVER TAPES</span>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto font-light">
              crafting bespoke audio celebrations, moments and memories that last forever.
            </p>
          </div>
          
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2025 forever tapes. crafting authentic audio experiences.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;