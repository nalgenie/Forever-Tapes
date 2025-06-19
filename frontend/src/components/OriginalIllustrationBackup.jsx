// SAVED ORIGINAL ILLUSTRATION - User's Favorite
// This is the illustration the user likes best - DO NOT MODIFY

const OriginalIllustration = () => (
  <svg width="400" height="250" viewBox="0 0 400 250" className="drop-shadow-lg">
    {/* Main Speaker (left) - warm orange/red */}
    <rect x="40" y="120" width="70" height="90" rx="15" fill="#F97316" stroke="#EA580C" strokeWidth="2"/>
    <circle cx="75" cy="150" r="18" fill="#DC2626" stroke="#B91C1C" strokeWidth="2"/>
    <circle cx="75" cy="180" r="12" fill="#DC2626" stroke="#B91C1C" strokeWidth="2"/>
    <rect x="55" y="200" width="40" height="6" rx="3" fill="#EA580C"/>
    
    {/* Vintage Radio (center-left) - warm brown */}
    <rect x="120" y="140" width="80" height="60" rx="12" fill="#A16207" stroke="#92400E" strokeWidth="2"/>
    <circle cx="140" cy="165" r="10" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
    <circle cx="180" cy="165" r="10" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
    <rect x="150" y="185" width="20" height="8" rx="4" fill="#92400E"/>
    <line x1="155" y1="155" x2="165" y2="155" stroke="#FCD34D" strokeWidth="2"/>
    
    {/* Tall Speaker (center-right) - blue/teal */}
    <rect x="210" y="90" width="60" height="110" rx="12" fill="#0284C7" stroke="#0369A1" strokeWidth="2"/>
    <circle cx="240" cy="125" r="15" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2"/>
    <circle cx="240" cy="155" r="10" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2"/>
    <circle cx="240" cy="180" r="8" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2"/>
    <rect x="225" y="190" width="30" height="4" rx="2" fill="#0369A1"/>
    
    {/* Boombox (right) - purple/magenta */}
    <rect x="280" y="130" width="85" height="55" rx="10" fill="#9333EA" stroke="#7C3AED" strokeWidth="2"/>
    <circle cx="295" cy="155" r="12" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
    <circle cx="350" cy="155" r="12" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
    <rect x="315" y="145" width="25" height="15" rx="3" fill="#A855F7" stroke="#9333EA" strokeWidth="1"/>
    <rect x="315" y="165" width="25" height="6" rx="3" fill="#7C3AED"/>
    
    {/* Small Speaker (far right) - green */}
    <rect x="340" y="100" width="45" height="70" rx="8" fill="#059669" stroke="#047857" strokeWidth="2"/>
    <circle cx="362" cy="125" r="8" fill="#065F46" stroke="#064E3B" strokeWidth="1"/>
    <circle cx="362" cy="150" r="6" fill="#065F46" stroke="#064E3B" strokeWidth="1"/>
    
    {/* Character sitting on equipment pile */}
    {/* Body */}
    <ellipse cx="200" cy="115" rx="20" ry="12" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
    
    {/* Head */}
    <circle cx="200" cy="105" r="12" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
    
    {/* Simple hair/head covering */}
    <path d="M188 98 Q200 90 212 98 Q208 102 200 100 Q192 102 188 98" fill="#D97706" stroke="#B45309" strokeWidth="1"/>
    
    {/* Face - simple and peaceful */}
    <circle cx="196" cy="102" r="1.5" fill="#8B4513"/>
    <circle cx="204" cy="102" r="1.5" fill="#8B4513"/>
    <path d="M198 108 Q200 110 202 108" fill="none" stroke="#8B4513" strokeWidth="1"/>
    
    {/* Arms resting */}
    <ellipse cx="185" cy="120" rx="8" ry="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="215" cy="120" rx="8" ry="4" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Legs tucked */}
    <ellipse cx="195" cy="135" rx="6" ry="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    <ellipse cx="205" cy="135" rx="6" ry="10" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1"/>
    
    {/* Musical notes floating around */}
    <circle cx="100" cy="50" r="3" fill="#8B5CF6" opacity="0.7"/>
    <line x1="103" y1="50" x2="103" y2="35" stroke="#8B5CF6" strokeWidth="2" opacity="0.7"/>
    <path d="M103 35 Q108 32 108 37" fill="#8B5CF6" opacity="0.7"/>
    
    <circle cx="320" cy="40" r="3" fill="#F97316" opacity="0.7"/>
    <line x1="323" y1="40" x2="323" y2="25" stroke="#F97316" strokeWidth="2" opacity="0.7"/>
    <path d="M323 25 Q328 22 328 27" fill="#F97316" opacity="0.7"/>
    
    <circle cx="280" cy="60" r="2.5" fill="#10B981" opacity="0.6"/>
    <line x1="282" y1="60" x2="282" y2="48" stroke="#10B981" strokeWidth="1.5" opacity="0.6"/>
    
    <circle cx="80" cy="45" r="2.5" fill="#EC4899" opacity="0.6"/>
    <line x1="82" y1="45" x2="82" y2="33" stroke="#EC4899" strokeWidth="1.5" opacity="0.6"/>
    
    {/* Sound waves */}
    <path d="M30 150 Q35 145 40 150 Q45 155 50 150" fill="none" stroke="#60A5FA" strokeWidth="1.5" opacity="0.6"/>
    <path d="M350 140 Q355 135 360 140 Q365 145 370 140" fill="none" stroke="#34D399" strokeWidth="1.5" opacity="0.6"/>
    <path d="M60 200 Q65 195 70 200 Q75 205 80 200" fill="none" stroke="#F472B6" strokeWidth="1.5" opacity="0.5"/>
    
    {/* Small details on speakers */}
    <circle cx="70" cy="135" r="3" fill="#374151"/>
    <circle cx="110" cy="135" r="3" fill="#374151"/>
    <circle cx="230" cy="110" r="8" fill="#047857"/>
    <circle cx="367" cy="140" r="4" fill="#1E3A8A"/>
  </svg>
);

export default OriginalIllustration;