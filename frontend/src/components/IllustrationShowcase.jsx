import React from 'react';

// Simple 2 Variations to Test
const Variation6 = () => (
  <svg width="300" height="200" viewBox="0 0 300 200" className="drop-shadow-lg">
    <rect x="40" y="100" width="60" height="70" rx="10" fill="#0EA5E9" stroke="#0284C7" strokeWidth="2"/>
    <circle cx="70" cy="125" r="12" fill="#0C4A6E" strokeWidth="2"/>
    <rect x="120" y="110" width="70" height="50" rx="8" fill="#EC4899" stroke="#BE185D" strokeWidth="2"/>
    <circle cx="155" cy="135" r="8" fill="#1F2937" strokeWidth="1"/>
    <rect x="200" y="90" width="50" height="80" rx="8" fill="#10B981" stroke="#059669" strokeWidth="2"/>
    <circle cx="225" cy="130" r="10" fill="#022C22" strokeWidth="2"/>
    <ellipse cx="150" cy="80" rx="15" ry="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="150" cy="70" r="8" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="146" cy="67" r="1" fill="#8B4513"/>
    <circle cx="154" cy="67" r="1" fill="#8B4513"/>
  </svg>
);

const Variation7 = () => (
  <svg width="300" height="200" viewBox="0 0 300 200" className="drop-shadow-lg">
    <rect x="40" y="100" width="60" height="70" rx="10" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2"/>
    <circle cx="70" cy="125" r="12" fill="#0F172A" strokeWidth="2"/>
    <rect x="120" y="110" width="70" height="50" rx="8" fill="#06B6D4" stroke="#0891B2" strokeWidth="2"/>
    <circle cx="155" cy="135" r="8" fill="#164E63" strokeWidth="1"/>
    <rect x="200" y="90" width="50" height="80" rx="8" fill="#0D9488" stroke="#0F766E" strokeWidth="2"/>
    <circle cx="225" cy="130" r="10" fill="#134E4A" strokeWidth="2"/>
    <ellipse cx="150" cy="80" rx="15" ry="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="150" cy="70" r="8" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="146" cy="67" r="1" fill="#8B4513"/>
    <circle cx="154" cy="67" r="1" fill="#8B4513"/>
  </svg>
);

const IllustrationShowcase = () => {
  const variations = [
    { id: 6, name: "Retro Neon", component: <Variation6 />, description: "Bright electric colors" },
    { id: 7, name: "Ocean Vibes", component: <Variation7 />, description: "Blue ocean theme" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Illustration Test</h1>
          <p className="text-lg text-gray-600">Testing 2 simple variations</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {variations.map((variation) => (
            <div key={variation.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-center mb-4">
                {variation.component}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  #{variation.id}: {variation.name}
                </h3>
                <p className="text-sm text-gray-600">{variation.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IllustrationShowcase;