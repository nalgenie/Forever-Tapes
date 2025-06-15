import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mic, Music, Share2, Sparkles, PlayCircle, Heart, Gift, Clock } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Easy Audio Collection",
      description: "Send a simple link to friends and family. They record their message directly from their phone."
    },
    {
      icon: <Music className="w-8 h-8" />,
      title: "Custom Background Music",
      description: "Choose from our curated library or upload your own music to set the perfect mood."
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Professional Editing",
      description: "Trim, reorder, and adjust volume levels. Add noise reduction with one-click presets."
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Beautiful Delivery",
      description: "Share your finished pod-card via email or text with a gorgeous listening experience."
    }
  ];

  const useCases = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Birthday Surprises",
      description: "Collect birthday wishes from friends around the world"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Wedding Messages",
      description: "Preserve heartfelt wedding toasts and well-wishes"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Memory Keeping",
      description: "Create time capsules for graduations, anniversaries, and milestones"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Pod-Card
              </span>
            </div>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="hidden sm:flex"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
            ✨ The Future of Audio Greeting Cards
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Create Magical
            <br />
            Audio Pod-Cards
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
            Collect heartfelt voice messages from loved ones and create a beautiful, 
            shareable audio experience that lasts forever.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/create')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Create Your First Pod-Card
              <Sparkles className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-6 text-lg rounded-2xl border-2 hover:bg-white/50 transition-all duration-300"
              onClick={() => navigate('/listen/demo')}
            >
              <PlayCircle className="mr-2 w-5 h-5" />
              Listen to Demo
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              First pod-card is FREE
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Mobile-friendly
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              No app download required
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Creating memorable audio experiences has never been easier
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center text-purple-600">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Perfect For Every Occasion
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Create lasting memories for life's most important moments
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-0 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm hover:from-white/80 hover:to-white/50 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white">
                    {useCase.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600">
                    {useCase.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Create Magic?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Start your first pod-card for free and see how easy it is to collect and share beautiful audio memories.
          </p>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/create')}
            className="bg-white text-purple-600 hover:bg-gray-50 px-8 py-6 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Get Started Now
            <Sparkles className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/20 backdrop-blur-sm py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Pod-Card</span>
          </div>
          <p className="text-gray-600">
            Creating beautiful audio memories, one pod-card at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;