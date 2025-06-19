// 10 ILLUSTRATION VARIATIONS
// Based on the user's favorite original - different colors, arrangements, poses

import React from 'react';

// VARIATION 1: Pastel Dreams - Soft pastel colors
export const Variation1 = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Main Speaker (left) - soft pink */}
    <rect x="40" y="120" width="70" height="90" rx="15" fill="#F472B6" stroke="#EC4899" strokeWidth="2"/>
    <circle cx="75" cy="150" r="18" fill="#BE185D" stroke="#9D174D" strokeWidth="2"/>
    <circle cx="75" cy="180" r="12" fill="#BE185D" stroke="#9D174D" strokeWidth="2"/>
    <rect x="55" y="200" width="40" height="6" rx="3" fill="#EC4899"/>
    
    {/* Vintage Radio (center-left) - lavender */}
    <rect x="120" y="140" width="80" height="60" rx="12" fill="#A78BFA" stroke="#8B5CF6" strokeWidth="2"/>
    <circle cx="140" cy="165" r="10" fill="#6B7280" stroke="#4B5563" strokeWidth="1"/>
    <circle cx="180" cy="165" r="10" fill="#6B7280" stroke="#4B5563" strokeWidth="1"/>
    <rect x="150" y="185" width="20" height="8" rx="4" fill="#8B5CF6"/>
    <line x1="155" y1="155" x2="165" y2="155" stroke="#FDE68A" strokeWidth="2"/>
    
    {/* Tall Speaker (center-right) - mint green */}
    <rect x="210" y="90" width="60" height="110" rx="12" fill="#6EE7B7" stroke="#34D399" strokeWidth="2"/>
    <circle cx="240" cy="125" r="15" fill="#059669" stroke="#047857" strokeWidth="2"/>
    <circle cx="240" cy="155" r="10" fill="#059669" stroke="#047857" strokeWidth="2"/>
    <circle cx="240" cy="180" r="8" fill="#059669" stroke="#047857" strokeWidth="2"/>
    <rect x="225" y="190" width="30" height="4" rx="2" fill="#34D399"/>
    
    {/* Boombox (right) - peach */}
    <rect x="280" y="130" width="85" height="55" rx="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="295" cy="155" r="12" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
    <circle cx="350" cy="155" r="12" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
    <rect x="315" y="145" width="25" height="15" rx="3" fill="#FCD34D" stroke="#FBBF24" strokeWidth="1"/>
    <rect x="315" y="165" width="25" height="6" rx="3" fill="#F59E0B"/>
    
    {/* Small Speaker (far right) - soft blue */}
    <rect x="340" y="100" width="45" height="70" rx="8" fill="#93C5FD" stroke="#60A5FA" strokeWidth="2"/>
    <circle cx="362" cy="125" r="8" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="1"/>
    <circle cx="362" cy="150" r="6" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="1"/>
    
    {/* Character - lying down relaxed */}
    <ellipse cx="200" cy="118" rx="22" ry="10" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="200" cy="108" r="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M188 101 Q200 93 212 101 Q208 105 200 103 Q192 105 188 101" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    <circle cx="196" cy="105" r="1.5" fill="#8B4513"/>
    <circle cx="204" cy="105" r="1.5" fill="#8B4513"/>
    <path d="M198 111 Q200 113 202 111" fill="none" stroke="#8B4513" strokeWidth="1"/>
    <ellipse cx="180" cy="118" rx="10" ry="4" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="220" cy="118" rx="10" ry="4" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="190" cy="128" rx="8" ry="6" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="210" cy="128" rx="8" ry="6" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Dreamy musical notes */}
    <circle cx="120" cy="45" r="3" fill="#F472B6" opacity="0.8"/>
    <line x1="123" y1="45" x2="123" y2="30" stroke="#F472B6" strokeWidth="2" opacity="0.8"/>
    <circle cx="300" cy="35" r="3" fill="#A78BFA" opacity="0.8"/>
    <line x1="303" y1="35" x2="303" y2="20" stroke="#A78BFA" strokeWidth="2" opacity="0.8"/>
    <circle cx="90" cy="60" r="2.5" fill="#6EE7B7" opacity="0.7"/>
    <circle cx="330" cy="55" r="2.5" fill="#FBBF24" opacity="0.7"/>
  </svg>
);

// VARIATION 2: Ocean Vibes - Blue and teal theme
export const Variation2 = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Main Speaker (left) - deep ocean blue */}
    <rect x="45" y="125" width="75" height="85" rx="15" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2"/>
    <circle cx="82" cy="155" r="18" fill="#0F172A" stroke="#020617" strokeWidth="2"/>
    <circle cx="82" cy="185" r="12" fill="#0F172A" stroke="#020617" strokeWidth="2"/>
    <rect x="60" y="200" width="45" height="6" rx="3" fill="#1E3A8A"/>
    
    {/* Vintage Radio (center-left) - turquoise */}
    <rect x="125" y="145" width="75" height="55" rx="12" fill="#06B6D4" stroke="#0891B2" strokeWidth="2"/>
    <circle cx="145" cy="170" r="10" fill="#164E63" stroke="#0F172A" strokeWidth="1"/>
    <circle cx="180" cy="170" r="10" fill="#164E63" stroke="#0F172A" strokeWidth="1"/>
    <rect x="155" y="185" width="15" height="8" rx="4" fill="#0891B2"/>
    <line x1="158" y1="160" x2="167" y2="160" stroke="#67E8F9" strokeWidth="2"/>
    
    {/* Tall Speaker (center-right) - teal */}
    <rect x="205" y="85" width="65" height="115" rx="12" fill="#0D9488" stroke="#0F766E" strokeWidth="2"/>
    <circle cx="237" cy="120" r="15" fill="#134E4A" stroke="#042F2E" strokeWidth="2"/>
    <circle cx="237" cy="150" r="10" fill="#134E4A" stroke="#042F2E" strokeWidth="2"/>
    <circle cx="237" cy="175" r="8" fill="#134E4A" stroke="#042F2E" strokeWidth="2"/>
    <rect x="222" y="185" width="30" height="4" rx="2" fill="#0F766E"/>
    
    {/* Boombox (right) - navy */}
    <rect x="275" y="135" width="80" height="50" rx="10" fill="#1E3A8A" stroke="#1E40AF" strokeWidth="2"/>
    <circle cx="290" cy="160" r="12" fill="#0F172A" stroke="#020617" strokeWidth="2"/>
    <circle cx="340" cy="160" r="12" fill="#0F172A" stroke="#020617" strokeWidth="2"/>
    <rect x="310" y="150" width="20" height="15" rx="3" fill="#3B82F6" stroke="#2563EB" strokeWidth="1"/>
    <rect x="310" y="170" width="20" height="6" rx="3" fill="#1D4ED8"/>
    
    {/* Small Speaker (far right) - cyan */}
    <rect x="335" y="105" width="50" height="65" rx="8" fill="#22D3EE" stroke="#06B6D4" strokeWidth="2"/>
    <circle cx="360" cy="130" r="8" fill="#164E63" stroke="#0F172A" strokeWidth="1"/>
    <circle cx="360" cy="150" r="6" fill="#164E63" stroke="#0F172A" strokeWidth="1"/>
    
    {/* Character - standing and waving */}
    <ellipse cx="195" cy="120" rx="18" ry="15" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="195" cy="100" r="12" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M183 93 Q195 85 207 93 Q203 97 195 95 Q187 97 183 93" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    <circle cx="191" cy="97" r="1.5" fill="#8B4513"/>
    <circle cx="199" cy="97" r="1.5" fill="#8B4513"/>
    <path d="M193 103 Q195 105 197 103" fill="none" stroke="#8B4513" strokeWidth="1"/>
    <ellipse cx="175" cy="115" rx="8" ry="6" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="220" cy="105" rx="8" ry="6" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="185" cy="140" rx="6" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="205" cy="140" rx="6" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Ocean-themed musical notes */}
    <circle cx="110" cy="40" r="3" fill="#06B6D4" opacity="0.8"/>
    <line x1="113" y1="40" x2="113" y2="25" stroke="#06B6D4" strokeWidth="2" opacity="0.8"/>
    <circle cx="310" cy="30" r="3" fill="#22D3EE" opacity="0.8"/>
    <line x1="313" y1="30" x2="313" y2="15" stroke="#22D3EE" strokeWidth="2" opacity="0.8"/>
  </svg>
);

// VARIATION 3: Sunset Warmth - Warm orange and red theme
export const Variation3 = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Main Speaker (left) - sunset orange */}
    <rect x="50" y="115" width="80" height="95" rx="15" fill="#EA580C" stroke="#C2410C" strokeWidth="2"/>
    <circle cx="90" cy="150" r="20" fill="#7C2D12" stroke="#451A03" strokeWidth="2"/>
    <circle cx="90" cy="185" r="14" fill="#7C2D12" stroke="#451A03" strokeWidth="2"/>
    <rect x="70" y="200" width="40" height="8" rx="3" fill="#C2410C"/>
    
    {/* Vintage Radio (center-left) - coral */}
    <rect x="140" y="135" width="85" height="65" rx="12" fill="#F97316" stroke="#EA580C" strokeWidth="2"/>
    <circle cx="165" cy="165" r="12" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
    <circle cx="200" cy="165" r="12" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
    <rect x="175" y="185" width="25" height="8" rx="4" fill="#EA580C"/>
    <line x1="180" y1="150" x2="195" y2="150" stroke="#FED7AA" strokeWidth="2"/>
    
    {/* Tall Speaker (center-right) - deep red */}
    <rect x="235" y="80" width="70" height="120" rx="12" fill="#DC2626" stroke="#B91C1C" strokeWidth="2"/>
    <circle cx="270" cy="120" r="18" fill="#450A0A" stroke="#1F2937" strokeWidth="2"/>
    <circle cx="270" cy="155" r="12" fill="#450A0A" stroke="#1F2937" strokeWidth="2"/>
    <circle cx="270" cy="185" r="10" fill="#450A0A" stroke="#1F2937" strokeWidth="2"/>
    <rect x="250" y="195" width="40" height="4" rx="2" fill="#B91C1C"/>
    
    {/* Boombox (right) - warm yellow */}
    <rect x="315" y="125" width="70" height="60" rx="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="330" cy="155" r="10" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
    <circle cx="370" cy="155" r="10" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
    <rect x="345" y="145" width="20" height="12" rx="3" fill="#FCD34D" stroke="#FBBF24" strokeWidth="1"/>
    <rect x="345" y="165" width="20" height="5" rx="3" fill="#F59E0B"/>
    
    {/* Character - energetic pose with arms up */}
    <ellipse cx="200" cy="110" rx="20" ry="14" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="200" cy="95" r="14" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M184 87 Q200 77 216 87 Q210 92 200 89 Q190 92 184 87" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    <circle cx="195" cy="92" r="1.5" fill="#8B4513"/>
    <circle cx="205" cy="92" r="1.5" fill="#8B4513"/>
    <path d="M197 98 Q200 101 203 98" fill="none" stroke="#8B4513" strokeWidth="1"/>
    <ellipse cx="175" cy="95" rx="8" ry="8" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="225" cy="95" rx="8" ry="8" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="190" cy="130" rx="6" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="210" cy="130" rx="6" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Warm musical notes */}
    <circle cx="100" cy="35" r="4" fill="#F97316" opacity="0.9"/>
    <line x1="104" y1="35" x2="104" y2="18" stroke="#F97316" strokeWidth="3" opacity="0.9"/>
    <circle cx="330" cy="25" r="4" fill="#FBBF24" opacity="0.9"/>
    <line x1="334" y1="25" x2="334" y2="8" stroke="#FBBF24" strokeWidth="3" opacity="0.9"/>
  </svg>
);

// VARIATION 4: Forest Green - Nature-inspired greens
export const Variation4 = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Main Speaker (left) - forest green */}
    <rect x="35" y="130" width="75" height="80" rx="15" fill="#166534" stroke="#14532D" strokeWidth="2"/>
    <circle cx="72" cy="160" r="16" fill="#052E16" stroke="#022C22" strokeWidth="2"/>
    <circle cx="72" cy="185" r="10" fill="#052E16" stroke="#022C22" strokeWidth="2"/>
    <rect x="55" y="200" width="35" height="6" rx="3" fill="#14532D"/>
    
    {/* Vintage Radio (center-left) - sage green */}
    <rect x="115" y="150" width="70" height="50" rx="12" fill="#84CC16" stroke="#65A30D" strokeWidth="2"/>
    <circle cx="135" cy="172" r="8" fill="#365314" stroke="#1A2E05" strokeWidth="1"/>
    <circle cx="165" cy="172" r="8" fill="#365314" stroke="#1A2E05" strokeWidth="1"/>
    <rect x="145" y="185" width="15" height="6" rx="4" fill="#65A30D"/>
    <line x1="148" y1="165" x2="157" y2="165" stroke="#BEF264" strokeWidth="2"/>
    
    {/* Tall Speaker (center-right) - emerald */}
    <rect x="190" y="95" width="55" height="105" rx="12" fill="#059669" stroke="#047857" strokeWidth="2"/>
    <circle cx="217" cy="125" r="12" fill="#022C22" stroke="#052E16" strokeWidth="2"/>
    <circle cx="217" cy="150" r="8" fill="#022C22" stroke="#052E16" strokeWidth="2"/>
    <circle cx="217" cy="170" r="6" fill="#022C22" stroke="#052E16" strokeWidth="2"/>
    <rect x="205" y="185" width="25" height="4" rx="2" fill="#047857"/>
    
    {/* Boombox (right) - lime green */}
    <rect x="250" y="140" width="90" height="45" rx="10" fill="#65A30D" stroke="#4D7C0F" strokeWidth="2"/>
    <circle cx="270" cy="162" r="10" fill="#1C2917" stroke="#0F172A" strokeWidth="2"/>
    <circle cx="320" cy="162" r="10" fill="#1C2917" stroke="#0F172A" strokeWidth="2"/>
    <rect x="285" y="155" width="30" height="12" rx="3" fill="#84CC16" stroke="#65A30D" strokeWidth="1"/>
    <rect x="285" y="170" width="30" height="5" rx="3" fill="#4D7C0F"/>
    
    {/* Small Speaker (far right) - mint */}
    <rect x="350" y="110" width="40" height="75" rx="8" fill="#A7F3D0" stroke="#6EE7B7" strokeWidth="2"/>
    <circle cx="370" cy="135" r="6" fill="#064E3B" stroke="#022C22" strokeWidth="1"/>
    <circle cx="370" cy="155" r="4" fill="#064E3B" stroke="#022C22" strokeWidth="1"/>
    
    {/* Character - meditating peacefully */}
    <ellipse cx="220" cy="120" rx="15" ry="18" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="220" cy="100" r="10" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M212 94 Q220 88 228 94 Q225 97 220 96 Q215 97 212 94" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    <circle cx="217" cy="97" r="1" fill="#8B4513"/>
    <circle cx="223" cy="97" r="1" fill="#8B4513"/>
    <path d="M218 102 Q220 103 222 102" fill="none" stroke="#8B4513" strokeWidth="1"/>
    <ellipse cx="205" cy="125" rx="6" ry="5" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="235" cy="125" rx="6" ry="5" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="215" cy="140" rx="5" ry="8" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="225" cy="140" rx="5" ry="8" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Nature musical notes */}
    <circle cx="95" cy="50" r="2.5" fill="#84CC16" opacity="0.8"/>
    <circle cx="300" cy="40" r="2.5" fill="#059669" opacity="0.8"/>
    <circle cx="130" cy="60" r="2" fill="#A7F3D0" opacity="0.7"/>
  </svg>
);

// VARIATION 5: Monochrome Cool - Black, white, and grays
export const Variation5 = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Main Speaker (left) - charcoal */}
    <rect x="45" y="125" width="70" height="85" rx="15" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
    <circle cx="80" cy="155" r="16" fill="#111827" stroke="#030712" strokeWidth="2"/>
    <circle cx="80" cy="180" r="10" fill="#111827" stroke="#030712" strokeWidth="2"/>
    <rect x="60" y="195" width="40" height="6" rx="3" fill="#1F2937"/>
    
    {/* Vintage Radio (center-left) - silver */}
    <rect x="125" y="145" width="75" height="55" rx="12" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="2"/>
    <circle cx="145" cy="170" r="10" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
    <circle cx="180" cy="170" r="10" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
    <rect x="155" y="185" width="20" height="8" rx="4" fill="#9CA3AF"/>
    <line x1="160" y1="160" x2="175" y2="160" stroke="#F3F4F6" strokeWidth="2"/>
    
    {/* Tall Speaker (center-right) - dark gray */}
    <rect x="210" y="90" width="60" height="110" rx="12" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
    <circle cx="240" cy="125" r="15" fill="#030712" stroke="#000000" strokeWidth="2"/>
    <circle cx="240" cy="155" r="10" fill="#030712" stroke="#000000" strokeWidth="2"/>
    <circle cx="240" cy="180" r="8" fill="#030712" stroke="#000000" strokeWidth="2"/>
    <rect x="225" y="190" width="30" height="4" rx="2" fill="#111827"/>
    
    {/* Boombox (right) - light gray */}
    <rect x="280" y="130" width="85" height="55" rx="10" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="2"/>
    <circle cx="295" cy="155" r="12" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
    <circle cx="350" cy="155" r="12" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
    <rect x="315" y="145" width="25" height="15" rx="3" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1"/>
    <rect x="315" y="165" width="25" height="6" rx="3" fill="#D1D5DB"/>
    
    {/* Small Speaker (far right) - white */}
    <rect x="340" y="100" width="45" height="70" rx="8" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="2"/>
    <circle cx="362" cy="125" r="8" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
    <circle cx="362" cy="150" r="6" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
    
    {/* Character - professional pose */}
    <ellipse cx="200" cy="115" rx="18" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="200" cy="105" r="11" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M190 99 Q200 92 210 99 Q206 102 200 101 Q194 102 190 99" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    <circle cx="196" cy="102" r="1.5" fill="#8B4513"/>
    <circle cx="204" cy="102" r="1.5" fill="#8B4513"/>
    <path d="M198 107 Q200 109 202 107" fill="none" stroke="#8B4513" strokeWidth="1"/>
    <ellipse cx="182" cy="120" rx="8" ry="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="218" cy="120" rx="8" ry="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="192" cy="130" rx="6" ry="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="208" cy="130" rx="6" ry="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Minimal musical notes */}
    <circle cx="100" cy="45" r="2" fill="#6B7280" opacity="0.8"/>
    <circle cx="310" cy="35" r="2" fill="#9CA3AF" opacity="0.8"/>
  </svg>
);

// CONTINUE WITH VARIATIONS 6-10...
// [I'll add the remaining 5 variations in the next part to keep the file manageable]