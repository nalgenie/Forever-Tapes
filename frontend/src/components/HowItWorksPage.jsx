import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Users, 
  Music, 
  Share2, 
  Mic, 
  Headphones,
  CheckCircle,
  UserPlus,
  Play,
  Gift,
  Sparkles,
  Heart
} from 'lucide-react';

// Import illustration components
import { Variation1, Variation2, Variation3 } from './IllustrationVariations';

const HowItWorksPage = () => {
  const navigate = useNavigate();
  const [activeFlow, setActiveFlow] = useState('organizer');

  // Flow steps data
  const flows = {
    organizer: {
      title: "Memory Organizer",
      subtitle: "Create and manage audio memory collections",
      color: "purple",
      illustration: <Variation1 />,
      steps: [
        {
          icon: <UserPlus className="w-8 h-8" />,
          title: "Create Your Memory",
          description: "Choose a title, occasion, and write a description for your audio memory collection",
          detail: "Add context like 'Sarah's 30th Birthday' or 'Grandpa's Retirement' to help contributors know what to record"
        },
        {
          icon: <Share2 className="w-8 h-8" />,
          title: "Share the Link",
          description: "Send the unique memory link to friends, family, or colleagues via text, email, or social media",
          detail: "Each memory gets a simple shareable link - no accounts required for contributors"
        },
        {
          icon: <Music className="w-8 h-8" />,
          title: "Collect & Listen",
          description: "Voice messages automatically collect in your memory. Listen individually or as a mixed collage",
          detail: "Professional audio processing creates smooth transitions between messages"
        },
        {
          icon: <Gift className="w-8 h-8" />,
          title: "Share the Final Memory",
          description: "Once complete, share the beautiful audio memory with everyone who participated",
          detail: "Memories can be downloaded, shared, or kept private - you're in control"
        }
      ]
    },
    contributor: {
      title: "Voice Contributor", 
      subtitle: "Add your voice to someone's memory collection",
      color: "green",
      illustration: <Variation2 />,
      steps: [
        {
          icon: <Share2 className="w-8 h-8" />,
          title: "Receive the Invitation",
          description: "Someone shares a memory link with you - click it to get started",
          detail: "No account needed! The link contains everything you need to contribute"
        },
        {
          icon: <Mic className="w-8 h-8" />,
          title: "Record Your Message",
          description: "Share your thoughts, wishes, or memories using your device's microphone",
          detail: "Record directly in your browser - we'll enhance the audio quality automatically"
        },
        {
          icon: <Sparkles className="w-8 h-8" />,
          title: "Add Your Details",
          description: "Include your name and optionally your email - that's all we need",
          detail: "Keep it simple - just enough info for the organizer to know who contributed"
        },
        {
          icon: <CheckCircle className="w-8 h-8" />,
          title: "You're Done!",
          description: "Your voice is now part of the memory collection - sit back and feel good",
          detail: "The organizer will receive your contribution and can share the completed memory with you"
        }
      ]
    },
    listener: {
      title: "Forever Tapes Recipient",
      subtitle: "Receive and share beautiful audio memory collections", 
      color: "blue",
      illustration: <Variation3 />,
      steps: [
        {
          icon: <Gift className="w-8 h-8" />,
          title: "Receive Your Memory",
          description: "The organiser shares the completed audio memory collection with you as the intended recipient",
          detail: "You'll get special access to the full memory once all contributions have been collected"
        },
        {
          icon: <Play className="w-8 h-8" />,
          title: "Choose Your Experience", 
          description: "Listen to individual messages one by one, or enjoy the full mixed collage",
          detail: "Individual mode lets you hear each person separately, whilst collage mode blends all voices together"
        },
        {
          icon: <Music className="w-8 h-8" />,
          title: "Enjoy High-Quality Audio",
          description: "Professional audio processing ensures every voice sounds clear and balanced",
          detail: "We automatically normalise volume levels and add smooth transitions"
        },
        {
          icon: <Share2 className="w-8 h-8" />,
          title: "Share Public Links",
          description: "Create public links to specific messages or the complete collage for others to enjoy",
          detail: "As the recipient, you control who else can access the memory through public sharing"
        }
      ]
    }
  };

  const currentFlow = flows[activeFlow];
  const colorClasses = {
    purple: {
      bg: "from-purple-500 to-pink-500",
      badge: "bg-purple-100 text-purple-700 border-purple-200",
      button: "bg-purple-600 hover:bg-purple-700",
      icon: "text-purple-600"
    },
    green: {
      bg: "from-green-500 to-blue-500", 
      badge: "bg-green-100 text-green-700 border-green-200",
      button: "bg-green-600 hover:bg-green-700",
      icon: "text-green-600"
    },
    blue: {
      bg: "from-blue-500 to-indigo-500",
      badge: "bg-blue-100 text-blue-700 border-blue-200", 
      button: "bg-blue-600 hover:bg-blue-700",
      icon: "text-blue-600"
    }
  };

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
            
            <Button
              onClick={() => navigate('/about')}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              About Forever Tapes
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-light mb-4 tracking-tight leading-none text-gray-900">
            <span className="font-mono lowercase vintage-gradient-text vintage-font">how it works</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light tracking-wide mb-8">
            Three Simple Ways to Experience Audio Memories
          </p>
          
          {/* Flow Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {Object.entries(flows).map(([key, flow]) => (
              <Button
                key={key}
                onClick={() => setActiveFlow(key)}
                variant={activeFlow === key ? "default" : "outline"}
                className={`px-6 py-3 ${
                  activeFlow === key 
                    ? `${colorClasses[flow.color].button} text-white` 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {flow.title}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Flow Display */}
        <div className="max-w-6xl mx-auto">
          {/* Flow Header */}
          <Card className="mb-12 border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${colorClasses[currentFlow.color].bg}`} />
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1">
                  <Badge className={`mb-4 ${colorClasses[currentFlow.color].badge} px-4 py-2`}>
                    {currentFlow.title}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    {currentFlow.subtitle}
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {activeFlow === 'organizer' && "Perfect for birthdays, retirements, graduations, or any occasion where you want to collect heartfelt messages from multiple people."}
                    {activeFlow === 'contributor' && "Someone wants to include your voice in their special memory collection. It takes just a few minutes to add something meaningful."}
                    {activeFlow === 'listener' && "Experience the magic of collective audio memories, professionally mixed and beautifully presented."}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-64 h-40 flex items-center justify-center">
                    {currentFlow.illustration}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flow Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {currentFlow.steps.map((step, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${colorClasses[currentFlow.color].bg} flex items-center justify-center text-white`}>
                    {step.icon}
                  </div>
                  <div className="text-sm font-bold text-gray-500 mb-2">
                    STEP {index + 1}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {step.description}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {step.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <Card className={`border-0 shadow-xl bg-gradient-to-r ${colorClasses[currentFlow.color].bg} text-white`}>
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-lg opacity-90 mb-6">
                {activeFlow === 'organizer' && "Create your first memory collection and start gathering beautiful voice messages from the people who matter most."}
                {activeFlow === 'contributor' && "Ask someone to create a memory and send you the link, or explore our demo to see how it works."}
                {activeFlow === 'listener' && "Experience a sample memory collection to hear the magic of collective audio storytelling."}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {activeFlow === 'organizer' && (
                  <>
                    <Button
                      onClick={() => navigate('/create-free')}
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 font-semibold"
                    >
                      Try It Free
                    </Button>
                    <Button
                      onClick={() => navigate('/auth/login')}
                      variant="outline"
                      size="lg" 
                      className="border-white text-white hover:bg-white/10 px-8 py-3 font-semibold"
                    >
                      Sign Up for Premium
                    </Button>
                  </>
                )}
                {activeFlow === 'contributor' && (
                  <>
                    <Button
                      onClick={() => navigate('/listen/demo')}
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 font-semibold"
                    >
                      Try Demo Memory
                    </Button>
                    <Button
                      onClick={() => navigate('/')}
                      variant="outline"
                      size="lg"
                      className="border-white text-white hover:bg-white/10 px-8 py-3 font-semibold"
                    >
                      Get Invitation Link
                    </Button>
                  </>
                )}
                {activeFlow === 'listener' && (
                  <>
                    <Button
                      onClick={() => navigate('/listen/demo')}
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 font-semibold"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Listen to Demo
                    </Button>
                    <Button
                      onClick={() => navigate('/')}
                      variant="outline"
                      size="lg"
                      className="border-white text-white hover:bg-white/10 px-8 py-3 font-semibold"
                    >
                      Create Your Own
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cross-Flow Navigation */}
          <div className="mt-12 text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">
              Explore Other Perspectives
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
              {Object.entries(flows).filter(([key]) => key !== activeFlow).map(([key, flow]) => (
                <Button
                  key={key}
                  onClick={() => setActiveFlow(key)}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  View {flow.title} Flow
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;