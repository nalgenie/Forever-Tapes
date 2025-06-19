// VARIATIONS 6-10
// Continuing the illustration variations

import React from 'react';

// VARIATION 6: Retro Neon - Bright neon colors
export const Variation6 = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Main Speaker (left) - electric blue */}
    <rect x="40" y="120" width="75" height="90" rx="15" fill="#0EA5E9" stroke="#0284C7" strokeWidth="3"/>
    <circle cx="77" cy="150" r="18" fill="#0C4A6E" stroke="#082F49" strokeWidth="2"/>
    <circle cx="77" cy="180" r="12" fill="#0C4A6E" stroke="#082F49" strokeWidth="2"/>
    <rect x="57" y="200" width="40" height="8" rx="3" fill="#0284C7"/>
    
    {/* Vintage Radio (center-left) - hot pink */}
    <rect x="120" y="140" width="80" height="60" rx="12" fill="#EC4899" stroke="#BE185D" strokeWidth="3"/>
    <circle cx="140" cy="165" r="10" fill="#1F2937" stroke="#111827" strokeWidth="1"/>
    <circle cx="180" cy="165" r="10" fill="#1F2937" stroke="#111827" strokeWidth="1"/>
    <rect x="150" y="185" width="20" height="8" rx="4" fill="#BE185D"/>
    <line x1="155" y1="155" x2="165" y2="155" stroke="#F9A8D4" strokeWidth="3"/>
    
    {/* Tall Speaker (center-right) - electric green */}
    <rect x="210" y="90" width="60" height="110" rx="12" fill="#10B981" stroke="#059669" strokeWidth="3"/>
    <circle cx="240" cy="125" r="15" fill="#022C22" stroke="#052E16" strokeWidth="2"/>
    <circle cx="240" cy="155" r="10" fill="#022C22" stroke="#052E16" strokeWidth="2"/>
    <circle cx="240" cy="180" r="8" fill="#022C22" stroke="#052E16" strokeWidth="2"/>
    <rect x="225" y="190" width="30" height="4" rx="2" fill="#059669"/>
    
    {/* Boombox (right) - electric purple */}
    <rect x="280" y="130" width="85" height="55" rx="10" fill="#A855F7" stroke="#9333EA" strokeWidth="3"/>
    <circle cx="295" cy="155" r="12" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
    <circle cx="350" cy="155" r="12" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
    <rect x="315" y="145" width="25" height="15" rx="3" fill="#C084FC" stroke="#A855F7" strokeWidth="1"/>
    <rect x="315" y="165" width="25" height="6" rx="3" fill="#9333EA"/>
    
    {/* Small Speaker (far right) - neon yellow */}
    <rect x="340" y="100" width="45" height="70" rx="8" fill="#EAB308" stroke="#CA8A04" strokeWidth="3"/>
    <circle cx="362" cy="125" r="8" fill="#422006" stroke="#1C1917" strokeWidth="1"/>
    <circle cx="362" cy="150" r="6" fill="#422006" stroke="#1C1917" strokeWidth="1"/>
    
    {/* Character - dancing pose */}
    <ellipse cx="205" cy="110" rx="20" ry="15" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="205" cy="95" r="12" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M193 88 Q205 80 217 88 Q213 92 205 90 Q197 92 193 88" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    <circle cx="201" cy="92" r="1.5" fill="#8B4513"/>
    <circle cx="209" cy="92" r="1.5" fill="#8B4513"/>
    <path d="M203 97 Q205 99 207 97" fill="none" stroke="#8B4513" strokeWidth="1"/>
    <ellipse cx="180" cy="105" rx="10" ry="6" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" transform="rotate(-30 180 105)"/>
    <ellipse cx="230" cy="115" rx="10" ry="6" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" transform="rotate(20 230 115)"/>
    <ellipse cx="195" cy="135" rx="6" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="215" cy="135" rx="6" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Electric musical notes */}
    <circle cx="90" cy="40" r="3" fill="#0EA5E9" opacity="0.9"/>
    <line x1="93" y1="40" x2="93" y2="25" stroke="#0EA5E9" strokeWidth="3" opacity="0.9"/>
    <circle cx="320" cy="30" r="3" fill="#EC4899" opacity="0.9"/>
    <line x1="323" y1="30" x2="323" y2="15" stroke="#EC4899" strokeWidth="3" opacity="0.9"/>
    <circle cx="110" cy="60" r="2.5" fill="#10B981" opacity="0.8"/>
    <circle cx="340" cy="50" r="2.5" fill="#EAB308" opacity="0.8"/>
  </svg>
);

// VARIATION 7: Autumn Leaves - Warm autumn colors
export const Variation7 = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Main Speaker (left) - burnt orange */}
    <rect x="55" y="130" width="65" height="80" rx="15" fill="#C2410C" stroke="#9A3412" strokeWidth="2"/>
    <circle cx="87" cy="160" r="15" fill="#451A03" stroke="#1C0701" strokeWidth="2"/>
    <circle cx="87" cy="185" r="10" fill="#451A03" stroke="#1C0701" strokeWidth="2"/>
    <rect x="70" y="200" width="35" height="6" rx="3" fill="#9A3412"/>
    
    {/* Vintage Radio (center-left) - golden yellow */}
    <rect x="130" y="145" width="70" height="55" rx="12" fill="#D97706" stroke="#B45309" strokeWidth="2"/>
    <circle cx="150" cy="170" r="9" fill="#451A03" stroke="#1C0701" strokeWidth="1"/>
    <circle cx="180" cy="170" r="9" fill="#451A03" stroke="#1C0701" strokeWidth="1"/>
    <rect x="160" y="185" width="15" height="7" rx="4" fill="#B45309"/>
    <line x1="163" y1="160" x2="177" y2="160" stroke="#FEF3C7" strokeWidth="2"/>
    
    {/* Tall Speaker (center-right) - deep red */}
    <rect x="210" y="95" width="55" height="105" rx="12" fill="#991B1B" stroke="#7F1D1D" strokeWidth="2"/>
    <circle cx="237" cy="125" r="13" fill="#1C0701" stroke="#000000" strokeWidth="2"/>
    <circle cx="237" cy="150" r="9" fill="#1C0701" stroke="#000000" strokeWidth="2"/>
    <circle cx="237" cy="175" r="7" fill="#1C0701" stroke="#000000" strokeWidth="2"/>
    <rect x="222" y="190" width="30" height="4" rx="2" fill="#7F1D1D"/>
    
    {/* Boombox (right) - rust brown */}
    <rect x="275" y="135" width="80" height="50" rx="10" fill="#8B4513" stroke="#6B3410" strokeWidth="2"/>
    <circle cx="290" cy="160" r="11" fill="#1C0701" stroke="#000000" strokeWidth="2"/>
    <circle cx="340" cy="160" r="11" fill="#1C0701" stroke="#000000" strokeWidth="2"/>
    <rect x="305" y="150" width="30" height="12" rx="3" fill="#A0522D" stroke="#8B4513" strokeWidth="1"/>
    <rect x="305" y="170" width="30" height="5" rx="3" fill="#6B3410"/>
    
    {/* Small Speaker (far right) - amber */}
    <rect x="360" y="110" width="35" height="65" rx="8" fill="#F59E0B" stroke="#D97706" strokeWidth="2"/>
    <circle cx="377" cy="130" r="6" fill="#451A03" stroke="#1C0701" strokeWidth="1"/>
    <circle cx="377" cy="150" r="4" fill="#451A03" stroke="#1C0701" strokeWidth="1"/>
    
    {/* Character - cozy reading pose */}
    <ellipse cx="190" cy="125" rx="16" ry="20" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="190" cy="105" r="11" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M180 99 Q190 92 200 99 Q196 102 190 101 Q184 102 180 99" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    <circle cx="186" cy="102" r="1.5" fill="#8B4513"/>
    <circle cx="194" cy="102" r="1.5" fill="#8B4513"/>
    <path d="M188 107 Q190 109 192 107" fill="none" stroke="#8B4513" strokeWidth="1"/>
    <ellipse cx="175" cy="130" rx="7" ry="5" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="205" cy="130" rx="7" ry="5" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="185" cy="150" rx="5" ry="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="195" cy="150" rx="5" ry="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Autumn musical notes */}
    <circle cx="105" cy="50" r="2.5" fill="#C2410C" opacity="0.8"/>
    <circle cx="300" cy="40" r="2.5" fill="#D97706" opacity="0.8"/>
    <circle cx="130" cy="65" r="2" fill="#F59E0B" opacity="0.7"/>
  </svg>
);

// VARIATION 8: Cotton Candy - Soft pastels with more pink
export const Variation8 = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Main Speaker (left) - soft rose */}
    <rect x="35" y="125" width="80" height="85" rx="20" fill="#FDA4AF" stroke="#FB7185" strokeWidth="2"/>
    <circle cx="75" cy="155" r="17" fill="#BE123C" stroke="#9F1239" strokeWidth="2"/>
    <circle cx="75" cy="185" r="11" fill="#BE123C" stroke="#9F1239" strokeWidth="2"/>
    <rect x="55" y="200" width="40" height="8" rx="4" fill="#FB7185"/>
    
    {/* Vintage Radio (center-left) - baby blue */}
    <rect x="125" y="140" width="75" height="60" rx="15" fill="#93C5FD" stroke="#60A5FA" strokeWidth="2"/>
    <circle cx="145" cy="165" r="10" fill="#1E3A8A" stroke="#1E40AF" strokeWidth="1"/>
    <circle cx="180" cy="165" r="10" fill="#1E3A8A" stroke="#1E40AF" strokeWidth="1"/>
    <rect x="155" y="185" width="18" height="8" rx="4" fill="#60A5FA"/>
    <line x1="160" y1="155" x2="170" y2="155" stroke="#DBEAFE" strokeWidth="2"/>
    
    {/* Tall Speaker (center-right) - lavender */}
    <rect x="215" y="85" width="65" height="115" rx="15" fill="#C4B5FD" stroke="#A78BFA" strokeWidth="2"/>
    <circle cx="247" cy="125" r="16" fill="#5B21B6" stroke="#4C1D95" strokeWidth="2"/>
    <circle cx="247" cy="155" r="11" fill="#5B21B6" stroke="#4C1D95" strokeWidth="2"/>
    <circle cx="247" cy="180" r="8" fill="#5B21B6" stroke="#4C1D95" strokeWidth="2"/>
    <rect x="230" y="190" width="35" height="5" rx="2" fill="#A78BFA"/>
    
    {/* Boombox (right) - peach */}
    <rect x="290" y="125" width="85" height="60" rx="12" fill="#FED7AA" stroke="#FDBA74" strokeWidth="2"/>
    <circle cx="310" cy="155" r="13" fill="#7C2D12" stroke="#451A03" strokeWidth="2"/>
    <circle cx="355" cy="155" r="13" fill="#7C2D12" stroke="#451A03" strokeWidth="2"/>
    <rect x="325" y="145" width="25" height="15" rx="3" fill="#FEF3C7" stroke="#FED7AA" strokeWidth="1"/>
    <rect x="325" y="165" width="25" height="6" rx="3" fill="#FDBA74"/>
    
    {/* Small Speaker (far right) - mint */}
    <rect x="350" y="105" width="40" height="70" rx="10" fill="#A7F3D0" stroke="#6EE7B7" strokeWidth="2"/>
    <circle cx="370" cy="125" r="7" fill="#064E3B" stroke="#022C22" strokeWidth="1"/>
    <circle cx="370" cy="150" r="5" fill="#064E3B" stroke="#022C22" strokeWidth="1"/>
    
    {/* Character - sleepy/dreamy pose */}
    <ellipse cx="210" cy="115" rx="18" ry="16" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="210" cy="100" r="12" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M198 93 Q210 85 222 93 Q218 97 210 95 Q202 97 198 93" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    <path d="M206 97 Q208 98 208 98" fill="#8B4513" strokeWidth="1"/>
    <path d="M212 97 Q214 98 214 98" fill="#8B4513" strokeWidth="1"/>
    <path d="M208 102 Q210 104 212 102" fill="none" stroke="#8B4513" strokeWidth="1"/>
    <ellipse cx="190" cy="120" rx="8" ry="6" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="230" cy="120" rx="8" ry="6" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="200" cy="135" rx="6" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="220" cy="135" rx="6" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Dreamy musical notes */}
    <circle cx="90" cy="50" r="3" fill="#FDA4AF" opacity="0.8"/>
    <circle cx="320" cy="35" r="3" fill="#C4B5FD" opacity="0.8"/>
    <circle cx="110" cy="65" r="2" fill="#A7F3D0" opacity="0.7"/>
  </svg>
);

// VARIATION 9: Cosmic Purple - Deep space theme
export const Variation9 = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Main Speaker (left) - deep purple */}
    <rect x="50" y="120" width="70" height="90" rx="15" fill="#581C87" stroke="#4C1D95" strokeWidth="2"/>
    <circle cx="85" cy="150" r="18" fill="#1E1B4B" stroke="#0F0B29" strokeWidth="2"/>
    <circle cx="85" cy="180" r="12" fill="#1E1B4B" stroke="#0F0B29" strokeWidth="2"/>
    <rect x="65" y="200" width="40" height="6" rx="3" fill="#4C1D95"/>
    
    {/* Vintage Radio (center-left) - cosmic blue */}
    <rect x="130" y="140" width="80" height="60" rx="12" fill="#1E3A8A" stroke="#1E40AF" strokeWidth="2"/>
    <circle cx="150" cy="165" r="10" fill="#0F172A" stroke="#020617" strokeWidth="1"/>
    <circle cx="190" cy="165" r="10" fill="#0F172A" stroke="#020617" strokeWidth="1"/>
    <rect x="165" y="185" width="20" height="8" rx="4" fill="#1E40AF"/>
    <line x1="170" y1="155" x2="185" y2="155" stroke="#60A5FA" strokeWidth="2"/>
    
    {/* Tall Speaker (center-right) - galaxy purple */}
    <rect x="220" y="90" width="60" height="110" rx="12" fill="#7C3AED" stroke="#6D28D9" strokeWidth="2"/>
    <circle cx="250" cy="125" r="15" fill="#1E1B4B" stroke="#0F0B29" strokeWidth="2"/>
    <circle cx="250" cy="155" r="10" fill="#1E1B4B" stroke="#0F0B29" strokeWidth="2"/>
    <circle cx="250" cy="180" r="8" fill="#1E1B4B" stroke="#0F0B29" strokeWidth="2"/>
    <rect x="235" y="190" width="30" height="4" rx="2" fill="#6D28D9"/>
    
    {/* Boombox (right) - dark violet */}
    <rect x="290" y="130" width="85" height="55" rx="10" fill="#4C1D95" stroke="#3730A3" strokeWidth="2"/>
    <circle cx="305" cy="155" r="12" fill="#0F172A" stroke="#020617" strokeWidth="2"/>
    <circle cx="360" cy="155" r="12" fill="#0F172A" stroke="#020617" strokeWidth="2"/>
    <rect x="325" y="145" width="25" height="15" rx="3" fill="#6366F1" stroke="#4C1D95" strokeWidth="1"/>
    <rect x="325" y="165" width="25" height="6" rx="3" fill="#3730A3"/>
    
    {/* Small Speaker (far right) - cosmic teal */}
    <rect x="350" y="100" width="45" height="70" rx="8" fill="#0891B2" stroke="#0E7490" strokeWidth="2"/>
    <circle cx="372" cy="125" r="8" fill="#164E63" stroke="#0F172A" strokeWidth="1"/>
    <circle cx="372" cy="150" r="6" fill="#164E63" stroke="#0F172A" strokeWidth="1"/>
    
    {/* Character - stargazing pose */}
    <ellipse cx="195" cy="120" rx="17" ry="18" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="195" cy="100" r="11" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M185 94 Q195 87 205 94 Q201 97 195 96 Q189 97 185 94" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    <circle cx="191" cy="97" r="1.5" fill="#8B4513"/>
    <circle cx="199" cy="97" r="1.5" fill="#8B4513"/>
    <path d="M193 102 Q195 104 197 102" fill="none" stroke="#8B4513" strokeWidth="1"/>
    <ellipse cx="175" cy="125" rx="8" ry="5" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="215" cy="125" rx="8" ry="5" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="185" cy="140" rx="6" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="205" cy="140" rx="6" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Cosmic musical notes */}
    <circle cx="100" cy="40" r="3" fill="#7C3AED" opacity="0.9"/>
    <line x1="103" y1="40" x2="103" y2="25" stroke="#7C3AED" strokeWidth="2" opacity="0.9"/>
    <circle cx="310" cy="30" r="3" fill="#0891B2" opacity="0.9"/>
    <line x1="313" y1="30" x2="313" y2="15" stroke="#0891B2" strokeWidth="2" opacity="0.9"/>
    
    {/* Stars */}
    <circle cx="80" cy="30" r="1" fill="#FCD34D" opacity="0.8"/>
    <circle cx="340" cy="50" r="1" fill="#FCD34D" opacity="0.8"/>
    <circle cx="120" cy="25" r="1" fill="#FCD34D" opacity="0.8"/>
  </svg>
);

// VARIATION 10: Sunset Gradient - Character on larger equipment stack
export const Variation10 = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Main Speaker (left) - sunset orange */}
    <rect x="30" y="140" width="90" height="70" rx="15" fill="#F97316" stroke="#EA580C" strokeWidth="2"/>
    <circle cx="75" cy="165" r="20" fill="#7C2D12" stroke="#451A03" strokeWidth="2"/>
    <circle cx="75" cy="190" r="12" fill="#7C2D12" stroke="#451A03" strokeWidth="2"/>
    <rect x="50" y="205" width="50" height="6" rx="3" fill="#EA580C"/>
    
    {/* Vintage Radio (center-left) - sunset pink */}
    <rect x="130" y="155" width="75" height="55" rx="12" fill="#F472B6" stroke="#EC4899" strokeWidth="2"/>
    <circle cx="152" cy="180" r="9" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
    <circle cx="182" cy="180" r="9" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
    <rect x="162" y="195" width="15" height="8" rx="4" fill="#EC4899"/>
    <line x1="165" y1="170" x2="175" y2="170" stroke="#F9A8D4" strokeWidth="2"/>
    
    {/* Tall Speaker (center-right) - sunset purple */}
    <rect x="220" y="80" width="70" height="130" rx="12" fill="#A855F7" stroke="#9333EA" strokeWidth="2"/>
    <circle cx="255" cy="120" r="18" fill="#581C87" stroke="#4C1D95" strokeWidth="2"/>
    <circle cx="255" cy="155" r="12" fill="#581C87" stroke="#4C1D95" strokeWidth="2"/>
    <circle cx="255" cy="185" r="10" fill="#581C87" stroke="#4C1D95" strokeWidth="2"/>
    <rect x="240" y="195" width="30" height="5" rx="2" fill="#9333EA"/>
    
    {/* Boombox (right) - sunset yellow */}
    <rect x="300" y="145" width="75" height="65" rx="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="320" cy="175" r="14" fill="#7C2D12" stroke="#451A03" strokeWidth="2"/>
    <circle cx="355" cy="175" r="14" fill="#7C2D12" stroke="#451A03" strokeWidth="2"/>
    <rect x="330" y="160" width="25" height="18" rx="3" fill="#FCD34D" stroke="#FBBF24" strokeWidth="1"/>
    <rect x="330" y="185" width="25" height="8" rx="3" fill="#F59E0B"/>
    
    {/* Character - triumph pose with arms raised */}
    <ellipse cx="180" cy="125" rx="20" ry="20" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="180" cy="105" r="14" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M166 97 Q180 87 194 97 Q190 102 180 99 Q170 102 166 97" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    <circle cx="175" cy="102" r="2" fill="#8B4513"/>
    <circle cx="185" cy="102" r="2" fill="#8B4513"/>
    <path d="M177 108 Q180 111 183 108" fill="none" stroke="#8B4513" strokeWidth="1"/>
    <ellipse cx="155" cy="110" rx="10" ry="8" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" transform="rotate(-45 155 110)"/>
    <ellipse cx="205" cy="110" rx="10" ry="8" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" transform="rotate(45 205 110)"/>
    <ellipse cx="170" cy="150" rx="6" ry="15" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="190" cy="150" rx="6" ry="15" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Celebration musical notes */}
    <circle cx="100" cy="30" r="4" fill="#F97316" opacity="0.9"/>
    <line x1="104" y1="30" x2="104" y2="12" stroke="#F97316" strokeWidth="3" opacity="0.9"/>
    <path d="M104 12 Q110 8 110 15" fill="#F97316" opacity="0.9"/>
    
    <circle cx="300" cy="20" r="4" fill="#F472B6" opacity="0.9"/>
    <line x1="304" y1="20" x2="304" y2="5" stroke="#F472B6" strokeWidth="3" opacity="0.9"/>
    <path d="M304 5 Q310 1 310 8" fill="#F472B6" opacity="0.9"/>
    
    <circle cx="130" cy="45" r="3" fill="#A855F7" opacity="0.8"/>
    <circle cx="350" cy="40" r="3" fill="#FBBF24" opacity="0.8"/>
  </svg>
);

export { Variation6, Variation7, Variation8, Variation9, Variation10 };