import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Music, Heart, Users } from 'lucide-react';

// Import the illustration variations
import { Variation1, Variation2, Variation3, Variation4, Variation5 } from './IllustrationVariations';
import { Variation6, Variation7 } from './IllustrationVariations2';

// Create the remaining variations (8 and 9) inline
const Variation8 = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Autumn Leaves - Warm fall colors */}
    <rect x="45" y="125" width="75" height="85" rx="15" fill="#B45309" stroke="#92400E" strokeWidth="2"/>
    <circle cx="82" cy="155" r="18" fill="#451A03" stroke="#1C0701" strokeWidth="2"/>
    <circle cx="82" cy="185" r="12" fill="#451A03" stroke="#1C0701" strokeWidth="2"/>
    <rect x="60" y="200" width="45" height="6" rx="3" fill="#92400E"/>
    
    <rect x="125" y="145" width="75" height="55" rx="12" fill="#DC2626" stroke="#B91C1C" strokeWidth="2"/>
    <circle cx="145" cy="170" r="10" fill="#1F2937" stroke="#111827" strokeWidth="1"/>
    <circle cx="180" cy="170" r="10" fill="#1F2937" stroke="#111827" strokeWidth="1"/>
    <rect x="155" y="185" width="15" height="8" rx="4" fill="#B91C1C"/>
    <line x1="158" y1="160" x2="167" y2="160" stroke="#FEF3C7" strokeWidth="2"/>
    
    <rect x="205" y="85" width="65" height="115" rx="12" fill="#D97706" stroke="#B45309" strokeWidth="2"/>
    <circle cx="237" cy="120" r="15" fill="#451A03" stroke="#1C0701" strokeWidth="2"/>
    <circle cx="237" cy="150" r="10" fill="#451A03" stroke="#1C0701" strokeWidth="2"/>
    <circle cx="237" cy="175" r="8" fill="#451A03" stroke="#1C0701" strokeWidth="2"/>
    <rect x="222" y="185" width="30" height="4" rx="2" fill="#B45309"/>
    
    <rect x="275" y="135" width="80" height="50" rx="10" fill="#EAB308" stroke="#CA8A04" strokeWidth="2"/>
    <circle cx="290" cy="160" r="12" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
    <circle cx="340" cy="160" r="12" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
    <rect x="310" y="150" width="20" height="15" rx="3" fill="#FDE047" stroke="#EAB308" strokeWidth="1"/>
    <rect x="310" y="170" width="20" height="6" rx="3" fill="#CA8A04"/>
    
    <rect x="335" y="105" width="50" height="65" rx="8" fill="#F59E0B" stroke="#D97706" strokeWidth="2"/>
    <circle cx="360" cy="130" r="8" fill="#451A03" stroke="#1C0701" strokeWidth="1"/>
    <circle cx="360" cy="150" r="6" fill="#451A03" stroke="#1C0701" strokeWidth="1"/>
    
    {/* Character - dancing */}
    <ellipse cx="195" cy="120" rx="18" ry="15" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="195" cy="100" r="12" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M183 93 Q195 85 207 93 Q203 97 195 95 Q187 97 183 93" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    <circle cx="191" cy="97" r="1.5" fill="#8B4513"/>
    <circle cx="199" cy="97" r="1.5" fill="#8B4513"/>
    <path d="M193 103 Q195 105 197 103" fill="none" stroke="#8B4513" strokeWidth="1"/>
    <ellipse cx="170" cy="110" rx="8" ry="6" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" transform="rotate(-20 170 110)"/>
    <ellipse cx="225" cy="115" rx="8" ry="6" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" transform="rotate(30 225 115)"/>
    <ellipse cx="185" cy="140" rx="6" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="205" cy="140" rx="6" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Autumn musical notes */}
    <circle cx="110" cy="40" r="3" fill="#DC2626" opacity="0.8"/>
    <line x1="113" y1="40" x2="113" y2="25" stroke="#DC2626" strokeWidth="2" opacity="0.8"/>
    <circle cx="310" cy="30" r="3" fill="#D97706" opacity="0.8"/>
    <line x1="313" y1="30" x2="313" y2="15" stroke="#D97706" strokeWidth="2" opacity="0.8"/>
  </svg>
);

const Variation9 = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Cotton Candy - Pink and purple pastels */}
    <rect x="45" y="125" width="75" height="85" rx="15" fill="#FDF2F8" stroke="#F9A8D4" strokeWidth="2"/>
    <circle cx="82" cy="155" r="18" fill="#EC4899" stroke="#BE185D" strokeWidth="2"/>
    <circle cx="82" cy="185" r="12" fill="#EC4899" stroke="#BE185D" strokeWidth="2"/>
    <rect x="60" y="200" width="45" height="6" rx="3" fill="#F9A8D4"/>
    
    <rect x="125" y="145" width="75" height="55" rx="12" fill="#FAE8FF" stroke="#DDD6FE" strokeWidth="2"/>
    <circle cx="145" cy="170" r="10" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1"/>
    <circle cx="180" cy="170" r="10" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1"/>
    <rect x="155" y="185" width="15" height="8" rx="4" fill="#DDD6FE"/>
    <line x1="158" y1="160" x2="167" y2="160" stroke="#F3E8FF" strokeWidth="2"/>
    
    <rect x="205" y="85" width="65" height="115" rx="12" fill="#FECACA" stroke="#FCA5A5" strokeWidth="2"/>
    <circle cx="237" cy="120" r="15" fill="#EF4444" stroke="#DC2626" strokeWidth="2"/>
    <circle cx="237" cy="150" r="10" fill="#EF4444" stroke="#DC2626" strokeWidth="2"/>
    <circle cx="237" cy="175" r="8" fill="#EF4444" stroke="#DC2626" strokeWidth="2"/>
    <rect x="222" y="185" width="30" height="4" rx="2" fill="#FCA5A5"/>
    
    <rect x="275" y="135" width="80" height="50" rx="10" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="2"/>
    <circle cx="290" cy="160" r="12" fill="#DB2777" stroke="#BE185D" strokeWidth="2"/>
    <circle cx="340" cy="160" r="12" fill="#DB2777" stroke="#BE185D" strokeWidth="2"/>
    <rect x="310" y="150" width="20" height="15" rx="3" fill="#FBCFE8" stroke="#F9A8D4" strokeWidth="1"/>
    <rect x="310" y="170" width="20" height="6" rx="3" fill="#F9A8D4"/>
    
    <rect x="335" y="105" width="50" height="65" rx="8" fill="#F3E8FF" stroke="#DDD6FE" strokeWidth="2"/>
    <circle cx="360" cy="130" r="8" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1"/>
    <circle cx="360" cy="150" r="6" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1"/>
    
    {/* Character - floating/dreamy */}
    <ellipse cx="195" cy="115" rx="18" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="195" cy="105" r="12" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M183 98 Q195 90 207 98 Q203 102 195 100 Q187 102 183 98" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    <circle cx="191" cy="102" r="1.5" fill="#8B4513"/>
    <circle cx="199" cy="102" r="1.5" fill="#8B4513"/>
    <path d="M193 107 Q195 109 197 107" fill="none" stroke="#8B4513" strokeWidth="1"/>
    <ellipse cx="175" cy="120" rx="8" ry="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="215" cy="120" rx="8" ry="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="185" cy="130" rx="6" ry="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="205" cy="130" rx="6" ry="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Cotton candy musical notes */}
    <circle cx="110" cy="40" r="3" fill="#EC4899" opacity="0.8"/>
    <line x1="113" y1="40" x2="113" y2="25" stroke="#EC4899" strokeWidth="2" opacity="0.8"/>
    <circle cx="310" cy="30" r="3" fill="#A855F7" opacity="0.8"/>
    <line x1="313" y1="30" x2="313" y2="15" stroke="#A855F7" strokeWidth="2" opacity="0.8"/>
  </svg>
);

const AboutPage = () => {
  const navigate = useNavigate();

  const illustrationVariations = [
    { name: "Pastel Dreams", component: Variation1, description: "Soft pastel colors with dreamy atmosphere" },
    { name: "Ocean Vibes", component: Variation2, description: "Blue and teal ocean-inspired theme" },
    { name: "Sunset Warmth", component: Variation3, description: "Warm orange and red sunset colors" },
    { name: "Forest Green", component: Variation4, description: "Nature-inspired green variations" },
    { name: "Monochrome Cool", component: Variation5, description: "Classic black, white, and gray" },
    { name: "Retro Neon", component: Variation6, description: "Bright neon colors with electric feel" },
    { name: "Deep Ocean", component: Variation7, description: "Rich blue ocean depths theme" },
    { name: "Autumn Leaves", component: Variation8, description: "Warm fall colors and cozy vibes" },
    { name: "Cotton Candy", component: Variation9, description: "Pink and purple pastel sweetness" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">About Forever Tapes</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* About Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
              <span className="font-mono lowercase vintage-gradient-text vintage-font">forever tapes</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Creating lasting memories through collaborative audio experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Audio Memories</h3>
              <p className="text-gray-600">
                Capture heartfelt messages and turn them into beautiful audio collections that last forever.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Collaborative</h3>
              <p className="text-gray-600">
                Invite friends and family to contribute their voices to your special memory collection.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Meaningful</h3>
              <p className="text-gray-600">
                Every voice message becomes part of a treasured collection filled with love and memories.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Our Story</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Forever Tapes was born from the idea that voices carry emotions in ways that text never can. 
              We believe that the most precious gifts are the heartfelt messages from people we love. 
              Whether it's a birthday surprise, wedding wishes, or just everyday moments worth remembering, 
              Forever Tapes helps you collect and preserve these audio memories in beautiful, shareable formats.
            </p>
          </div>
        </div>

        {/* Illustration Variations Section */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-gray-900">Illustration Variations</h2>
            <p className="text-lg text-gray-600">
              Choose your favorite visual style for the Forever Tapes experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {illustrationVariations.map((variation, index) => {
              const VariationComponent = variation.component;
              return (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">
                      <div className="transform group-hover:scale-105 transition-transform duration-300">
                        <VariationComponent />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 text-center">
                      {variation.name}
                    </h3>
                    <p className="text-gray-600 text-center text-sm">
                      {variation.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button 
            onClick={() => navigate('/')}
            size="lg" 
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-4 text-lg font-medium"
          >
            Start Creating Memories
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;