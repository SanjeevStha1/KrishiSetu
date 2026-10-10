import React from 'react';

interface IllustrationProps {
  className?: string;
  color?: string;
}

/**
 * Handcrafted single-color warm line illustration of terraced Himalayan hills,
 * sun, and young agricultural seedlings.
 */
export const SproutFieldIllustration: React.FC<IllustrationProps> = ({
  className = 'w-24 h-24',
  color = '#2D6A4F',
}) => {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Background Soft Sun */}
      <circle cx="140" cy="50" r="22" stroke={color} strokeDasharray="3 3" opacity="0.4" />
      <path d="M140 20 V25 M140 75 V80 M110 50 H115 M165 50 H170" opacity="0.3" />

      {/* Terraced Hill Lines */}
      <path d="M10 135 C60 115, 120 125, 190 100" strokeWidth="2.2" opacity="0.5" />
      <path d="M5 150 C70 138, 140 148, 195 130" strokeWidth="2.2" opacity="0.7" />

      {/* Distant Mountain Peak */}
      <path d="M40 90 L75 55 L105 85" strokeWidth="1.8" opacity="0.35" />
      <path d="M85 70 L115 42 L150 80" strokeWidth="1.8" opacity="0.3" />

      {/* Foreground Hero Sprout */}
      <path d="M70 148 C72 125, 68 105, 65 92" strokeWidth="3" />
      {/* Left Leaf */}
      <path
        d="M66 115 C50 110, 42 98, 48 88 C58 88, 64 100, 66 115 Z"
        fill={`${color}15`}
        strokeWidth="2.5"
      />
      {/* Right Leaf */}
      <path
        d="M65 102 C82 96, 92 84, 88 74 C75 75, 68 88, 65 102 Z"
        fill={`${color}20`}
        strokeWidth="2.5"
      />
      {/* Top Young Leaflet */}
      <path
        d="M65 92 C62 76, 70 65, 75 66 C78 74, 72 85, 65 92 Z"
        fill={`${color}25`}
        strokeWidth="2"
      />

      {/* Ground Furrows / Soil texture */}
      <path d="M35 145 H45 M85 142 H100 M120 140 H135" opacity="0.5" />
      <circle cx="55" cy="142" r="1.5" fill={color} stroke="none" />
      <circle cx="110" cy="138" r="1.5" fill={color} stroke="none" />
      <circle cx="150" cy="132" r="1.5" fill={color} stroke="none" />
    </svg>
  );
};

/**
 * Handcrafted warm line illustration of highway transport truck / Bolero
 * navigating Nepal's mountain corridor with agricultural produce.
 */
export const TruckTransportIllustration: React.FC<IllustrationProps> = ({
  className = 'w-32 h-24',
  color = '#2D6A4F',
}) => {
  return (
    <svg
      viewBox="0 0 220 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Mountain Backing */}
      <path d="M15 85 L60 45 L105 80 L155 38 L205 85" strokeWidth="1.8" opacity="0.3" />
      <path d="M50 54 L60 45 L70 54" strokeWidth="1.5" opacity="0.3" />
      <path d="M145 46 L155 38 L165 46" strokeWidth="1.5" opacity="0.3" />

      {/* Highway Road */}
      <path d="M5 118 C60 118, 160 118, 215 118" strokeWidth="3" />
      <path d="M20 128 H40 M70 128 H100 M130 128 H160 M185 128 H205" strokeWidth="2" strokeDasharray="6 6" opacity="0.4" />

      {/* Shared Bolero Truck Body */}
      {/* Cabin */}
      <path
        d="M130 110 H175 C178 110, 182 107, 183 103 L188 88 C189 84, 186 80, 182 80 H155 L145 68 H125 C122 68, 120 70, 120 73 V110 Z"
        fill={`${color}12`}
        strokeWidth="2.5"
      />
      {/* Cabin Window */}
      <path d="M148 74 H130 V88 H160 L154 77 C152 75, 150 74, 148 74 Z" strokeWidth="2" fill="white" />
      {/* Headlight beam */}
      <path d="M188 95 L210 93 M188 98 L212 101" opacity="0.4" strokeWidth="1.5" />

      {/* Cargo Bed with Crates / Sacks */}
      <path d="M50 110 H120 V75 H50 C47 75, 45 77, 45 80 V105 C45 108, 47 110, 50 110 Z" fill={`${color}08`} strokeWidth="2.5" />
      
      {/* Sacks / Harvest Produce in Bed */}
      <path d="M52 75 C52 64, 65 62, 70 75" fill={`${color}20`} strokeWidth="2" />
      <path d="M68 75 C68 60, 84 58, 90 75" fill={`${color}25`} strokeWidth="2" />
      <path d="M88 75 C88 63, 102 61, 108 75" fill={`${color}20`} strokeWidth="2" />
      <path d="M106 75 C106 65, 118 64, 120 75" fill={`${color}15`} strokeWidth="2" />
      {/* Top tie-down rope */}
      <path d="M48 85 L118 78" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

      {/* Wheels */}
      <circle cx="75" cy="112" r="12" fill="white" strokeWidth="2.8" />
      <circle cx="75" cy="112" r="5" fill={color} stroke="none" />
      <circle cx="160" cy="112" r="12" fill="white" strokeWidth="2.8" />
      <circle cx="160" cy="112" r="5" fill={color} stroke="none" />

      {/* Motion Dust Lines */}
      <path d="M25 110 C32 108, 38 112, 42 110" opacity="0.4" strokeWidth="1.8" />
      <path d="M15 114 H32" opacity="0.3" strokeWidth="1.5" />
    </svg>
  );
};

/**
 * Handcrafted empty state illustration showing a quiet mountain village highway
 * waiting for local harvest booking.
 */
export const EmptyPoolIllustration: React.FC<IllustrationProps> = ({
  className = 'w-36 h-28',
  color = '#2D6A4F',
}) => {
  return (
    <svg
      viewBox="0 0 220 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Peaceful Hills */}
      <path d="M10 100 C50 65, 90 75, 130 50 C170 65, 200 90, 215 100" strokeWidth="1.8" opacity="0.35" />
      <path d="M5 120 C60 95, 130 110, 215 95" strokeWidth="2" opacity="0.5" />

      {/* Winding Highway Curve */}
      <path d="M30 145 C60 120, 110 115, 150 135 C175 145, 205 145, 215 142" strokeWidth="2.5" />
      <path d="M55 136 C75 126, 105 124, 130 132" strokeDasharray="4 4" strokeWidth="1.5" opacity="0.4" />

      {/* Highway Milepost / Hub Sign */}
      <path d="M55 130 V105 H85 V130" fill="white" strokeWidth="2" />
      <path d="M60 113 H80 M60 121 H75" strokeWidth="1.5" opacity="0.5" />

      {/* Sun and Clouds */}
      <circle cx="165" cy="45" r="14" strokeDasharray="3 3" opacity="0.4" />
      <path d="M40 40 C45 32, 58 32, 64 38 C70 34, 82 36, 85 42 H35 C33 42, 36 40, 40 40 Z" fill={`${color}08`} strokeWidth="1.5" opacity="0.4" />

      {/* Young Tree by Roadside */}
      <path d="M185 135 V110" strokeWidth="2.5" />
      <path d="M185 115 C175 105, 172 90, 185 85 C198 90, 195 105, 185 115 Z" fill={`${color}15`} strokeWidth="2" />
    </svg>
  );
};
