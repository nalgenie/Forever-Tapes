import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mic, Music, Share2, PlayCircle, Users, Volume2, Radio } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const experiences = [
    {
      id: '01',
      title: 'Celebrations',
      subtitle: 'birthday tapes, anniversaries, milestones',
      description: 'Collect meaningful messages from loved ones to mark special occasions and create lasting audio memories.',
      baseColor: 'bg-stone-100',
      hoverColor: 'bg-stone-200',
      textColor: 'text-stone-800'
    },
    {
      id: '02', 
      title: 'Moments',
      subtitle: 'graduations, achievements, transitions',
      description: 'Preserve the emotions and significance of life\'s important moments through authentic voice recordings.',
      baseColor: 'bg-slate-100',
      hoverColor: 'bg-slate-200', 
      textColor: 'text-slate-800'
    },
    {
      id: '03',
      title: 'Memories',
      subtitle: 'family stories, tributes, legacies',
      description: 'Create audio archives that connect generations and preserve the stories that matter most.',
      baseColor: 'bg-neutral-100',
      hoverColor: 'bg-neutral-200',
      textColor: 'text-neutral-800'
    }
  ];

  const features = [
    {
      icon: <Mic className="w-5 h-5" />,
      title: "Audio Collection",
      description: "Send a link. Contributors record directly from their device with guided prompts."
    },
    {
      icon: <Music className="w-5 h-5" />,
      title: "Professional Editing", 
      description: "Custom background tracks, advanced editing tools, and audio enhancement for perfect quality."
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Collaborative Creation",
      description: "Invite contributors to add their voice to your audio experience."
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: "Seamless Delivery",
      description: "Share your finished audio experience via email, text, or custom listening page."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-sm flex items-center justify-center">
                <Radio className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-medium tracking-wide text-gray-900">
                Forever Tapes
              </span>
            </div>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 font-normal"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <Badge className="mb-8 bg-gray-100 text-gray-700 border-0 px-3 py-1 text-sm font-normal">
              Bespoke audio experiences
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-light mb-8 tracking-tight leading-none text-gray-900">
              Create audio
              <br />
              <span className="font-normal italic">celebrations</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed font-light">
              Craft meaningful audio experiences that capture voices, emotions, and moments. 
              Transform heartfelt messages into lasting memories.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/create')}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 font-normal"
              >
                Start creating
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-normal"
                onClick={() => navigate('/listen/demo')}
              >
                <PlayCircle className="mr-2 w-4 h-4" />
                Listen to demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Grid */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light mb-4 tracking-tight text-gray-900">
              Designed for life's
              <br />
              <span className="italic">meaningful moments</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto font-light">
              Each audio experience is thoughtfully crafted to capture the essence of your occasion.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {experiences.map((experience, index) => (
              <div key={experience.id} className="relative group">
                {/* Base Card */}
                <Card 
                  className={`border-0 transition-all duration-700 cursor-pointer overflow-hidden ${experience.baseColor} relative z-10 ${
                    hoveredCard === experience.id ? 'opacity-0' : 'opacity-100'
                  }`}
                  onMouseEnter={() => setHoveredCard(experience.id)}
                  onClick={() => navigate('/create')}
                >
                  <CardContent className="p-8 h-80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-mono text-gray-500 tracking-wider">
                          {experience.id}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-normal mb-2 tracking-tight text-gray-900">
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

                {/* Hover Card */}
                <Card 
                  className={`absolute inset-0 border-0 transition-all duration-700 cursor-pointer overflow-hidden ${experience.hoverColor} z-20 ${
                    hoveredCard === experience.id ? 'opacity-100' : 'opacity-0'
                  }`}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate('/create')}
                >
                  <CardContent className="p-8 h-80 flex flex-col justify-center items-center text-center">
                    <h3 className="text-2xl font-light mb-6 text-gray-900">{experience.title}</h3>
                    <Button className="bg-gray-900 text-white hover:bg-gray-800 font-normal px-6 py-2">
                      Create
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
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light mb-4 tracking-tight text-gray-900">
              How it works
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto font-light">
              Creating meaningful audio experiences has never been more intuitive.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-12 h-12 mx-auto mb-6 bg-gray-100 group-hover:bg-gray-200 rounded-sm flex items-center justify-center text-gray-700 transition-colors duration-300">
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

      {/* Pricing Teaser */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-6 tracking-tight">
            Start for free
          </h2>
          <p className="text-lg text-gray-300 mb-8 font-light max-w-2xl mx-auto">
            Create your first audio experience at no cost. Upgrade for extended features and unlimited possibilities.
          </p>
          
          <div className="flex justify-center gap-8 text-sm text-gray-400 mb-12 font-light">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              First experience is free
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              Professional quality
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              No technical skills required
            </div>
          </div>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/create')}
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 font-normal"
          >
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
              Crafting meaningful audio experiences for life's most important moments.
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