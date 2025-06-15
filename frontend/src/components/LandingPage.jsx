import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mic, Music, Share2, Sparkles, PlayCircle, Heart, Gift, Clock, Users, Volume2 } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const experiences = [
    {
      id: '01',
      title: 'CELEBRATIONS',
      subtitle: 'Birthday wishes, anniversaries & life milestones',
      description: 'Collect heartfelt messages from loved ones to create unforgettable audio celebrations.',
      illustration: '🎉',
      hoverColor: 'from-pink-400 to-rose-500'
    },
    {
      id: '02', 
      title: 'MOMENTS',
      subtitle: 'Graduations, achievements & special occasions',
      description: 'Preserve the emotions and excitement of life\'s most important moments.',
      illustration: '✨',
      hoverColor: 'from-purple-400 to-indigo-500'
    },
    {
      id: '03',
      title: 'MEMORIES',
      subtitle: 'Family stories, tributes & legacy preservation',
      description: 'Create lasting audio memories that connect generations and preserve stories.',
      illustration: '💫',
      hoverColor: 'from-blue-400 to-cyan-500'
    }
  ];

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Professional Audio Collection",
      description: "Send a simple link. Contributors record directly from their device with guided prompts."
    },
    {
      icon: <Music className="w-6 h-6" />,
      title: "Bespoke Sound Design", 
      description: "Custom background music, professional editing, and noise reduction for perfect audio."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaborative Creation",
      description: "Invite unlimited contributors to share their voice in your audio celebration."
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Beautiful Delivery",
      description: "Share your finished audio experience via email, text, or custom landing page."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                FOREVER TAPES
              </span>
            </div>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="hidden sm:flex font-medium"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-8 bg-gray-100 text-gray-800 border-0 px-4 py-2 text-sm font-medium">
              ✨ Bespoke Audio Experiences
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight leading-none">
              CREATE BEAUTIFUL
              <br />
              <span className="block">AUDIO</span>
              <span className="block italic font-light">CELEBRATIONS</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Craft bespoke audio experiences that capture voices, emotions, and moments. 
              Turn heartfelt messages into lasting celebrations and memories.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/create')}
                className="bg-black text-white hover:bg-gray-800 px-12 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Start Creating
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="px-12 py-6 text-lg rounded-full border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300"
                onClick={() => navigate('/listen/demo')}
              >
                <PlayCircle className="mr-2 w-5 h-5" />
                Listen to Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Grid */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              CRAFTED FOR
              <br />
              <span className="italic font-light">Life's Moments</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every audio experience is uniquely tailored to capture the essence of your special occasion.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {experiences.map((experience, index) => (
              <Card 
                key={experience.id}
                className={`border-0 bg-white hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:scale-105 overflow-hidden ${
                  hoveredCard === experience.id ? 'shadow-2xl' : 'shadow-lg'
                }`}
                onMouseEnter={() => setHoveredCard(experience.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigate('/create')}
              >
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${experience.hoverColor} opacity-0 hover:opacity-10 transition-opacity duration-300`} />
                  <CardHeader className="relative p-8 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-mono text-gray-400">
                        {`{ ${experience.id} }`}
                      </span>
                      <span className="text-4xl">{experience.illustration}</span>
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2 tracking-tight">
                      {experience.title}
                    </CardTitle>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {experience.subtitle}
                    </p>
                  </CardHeader>
                  <CardContent className="relative p-8 pt-0">
                    <p className="text-gray-600 leading-relaxed">
                      {experience.description}
                    </p>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              HOW IT WORKS
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Creating beautiful audio experiences has never been simpler or more meaningful.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-800">
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
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            START FOR FREE
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Create your first audio celebration at no cost. Upgrade for extended features and unlimited possibilities.
          </p>
          
          <div className="flex justify-center gap-8 text-sm text-gray-500 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              First celebration is free
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Professional audio quality
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              No technical skills required
            </div>
          </div>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/create')}
            className="bg-black text-white hover:bg-gray-800 px-12 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Create Your First Audio Celebration
            <Sparkles className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-black" />
              </div>
              <span className="text-2xl font-bold tracking-tight">FOREVER TAPES</span>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Creating bespoke audio celebrations, moments and memories that last forever.
            </p>
          </div>
          
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2025 Forever Tapes. Crafting beautiful audio experiences.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;