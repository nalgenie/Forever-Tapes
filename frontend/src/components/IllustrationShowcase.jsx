import React from 'react';
import { Variation1, Variation2, Variation3, Variation4, Variation5 } from './IllustrationVariations';
import { Variation6, Variation7, Variation8, Variation9, Variation10 } from './IllustrationVariations2';

const IllustrationShowcase = () => {
  const variations = [
    { id: 1, name: "Pastel Dreams", component: <Variation1 />, description: "Soft pastels, lying down relaxed" },
    { id: 2, name: "Ocean Vibes", component: <Variation2 />, description: "Blue/teal theme, character waving" },
    { id: 3, name: "Sunset Warmth", component: <Variation3 />, description: "Orange/red theme, energetic arms up" },
    { id: 4, name: "Forest Green", component: <Variation4 />, description: "Nature greens, meditating peacefully" },
    { id: 5, name: "Monochrome Cool", component: <Variation5 />, description: "Black/white/grays, professional pose" },
    { id: 6, name: "Retro Neon", component: <Variation6 />, description: "Bright neon colors, dancing pose" },
    { id: 7, name: "Autumn Leaves", component: <Variation7 />, description: "Warm autumn colors, cozy reading" },
    { id: 8, name: "Cotton Candy", component: <Variation8 />, description: "Soft pastels with pink, sleepy/dreamy" },
    { id: 9, name: "Cosmic Purple", component: <Variation9 />, description: "Deep space theme, stargazing pose" },
    { id: 10, name: "Sunset Gradient", component: <Variation10 />, description: "Larger equipment, triumph pose" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Forever Tapes Illustration Variations</h1>
          <p className="text-lg text-gray-600">10 different variations of your cute audio equipment illustration</p>
          <p className="text-sm text-gray-500 mt-2">Your original favorite is safely saved in OriginalIllustrationBackup.jsx</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {variations.map((variation) => (
            <div key={variation.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
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

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use These Variations</h2>
            <div className="text-left text-sm text-gray-600 space-y-2">
              <p><strong>1. Choose your favorite:</strong> Pick the variation you like best</p>
              <p><strong>2. Let me know the number:</strong> Tell me which variation (e.g., "#3: Sunset Warmth")</p>
              <p><strong>3. I'll update your homepage:</strong> I'll replace the current illustration with your chosen variation</p>
              <p><strong>4. Further customization:</strong> We can adjust colors, poses, or equipment arrangement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IllustrationShowcase;