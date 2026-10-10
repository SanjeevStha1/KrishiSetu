import React, { useState } from 'react';
import { normalizeCropId, getCropMetadata } from '../data/cropRegistry';

interface CropIllustrationProps {
  crop?: string | null;
  cropName?: string;
  photoUrl?: string | null;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showBadge?: boolean;
  alt?: string;
}

/**
 * =========================================================================
 * INDIVIDUAL CARTOON AGRICULTURAL VECTOR ILLUSTRATIONS
 * Style: Clean, friendly, slightly realistic proportions, modern SaaS aesthetic,
 * rich gradients, soft shadows, natural produce colors, 200x200 canvas.
 * =========================================================================
 */

// 1. TOMATO (Bright red vine-ripened tomatoes with fresh green calyx/stem)
export const TomatoVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-tomato">
    <defs>
      <radialGradient id="tomGradMain" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="55%" stopColor="#EE2B2B" />
        <stop offset="100%" stopColor="#B91C1C" />
      </radialGradient>
      <radialGradient id="tomGradSec" cx="30%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#F87171" />
        <stop offset="60%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#991B1B" />
      </radialGradient>
      <filter id="tomDropShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.14" />
      </filter>
    </defs>
    {/* Ground Soft Shadow */}
    <ellipse cx="100" cy="172" rx="68" ry="12" fill="#0F172A" fillOpacity="0.08" />
    
    {/* Secondary Smaller Tomato (Right) */}
    <g filter="url(#tomDropShadow)">
      <circle cx="132" cy="120" r="42" fill="url(#tomGradSec)" />
      {/* Gloss Highlight */}
      <ellipse cx="120" cy="100" rx="14" ry="7" transform="rotate(-30 120 100)" fill="#FFFFFF" fillOpacity="0.32" />
      {/* Calyx / Sepals */}
      <path d="M132 80 C130 84 124 88 120 86 C124 90 128 92 132 94 C136 92 140 90 144 86 C140 88 134 84 132 80 Z" fill="#15803D" />
      <path d="M132 82 C134 76 138 72 142 70 C138 75 135 80 134 84 Z" fill="#16A34A" />
      <circle cx="132" cy="88" r="3.5" fill="#14532D" />
    </g>

    {/* Primary Hero Tomato (Left-Center) */}
    <g filter="url(#tomDropShadow)">
      <path
        d="M92 62 C126 62 144 86 144 116 C144 146 122 168 90 168 C58 168 36 146 36 116 C36 86 58 62 92 62 Z"
        fill="url(#tomGradMain)"
      />
      {/* Specular Light Curve */}
      <path
        d="M60 84 C72 72 94 72 104 76 C94 80 76 82 66 94 C62 98 58 94 60 84 Z"
        fill="#FFFFFF"
        fillOpacity="0.45"
      />
      <ellipse cx="62" cy="104" rx="4" ry="7" fill="#FFFFFF" fillOpacity="0.3" transform="rotate(-20 62 104)" />

      {/* Fresh Green Stem & Crown Leaves (Calyx) */}
      <path d="M92 62 C94 50 90 40 85 32 C88 38 96 46 95 60 Z" fill="#15803D" />
      {/* Leaf 1 (Top Left) */}
      <path d="M90 64 C78 52 64 56 54 58 C66 65 76 68 88 66 Z" fill="#16A34A" />
      {/* Leaf 2 (Bottom Left) */}
      <path d="M88 66 C74 74 65 82 58 92 C70 86 80 78 88 68 Z" fill="#15803D" />
      {/* Leaf 3 (Bottom Right) */}
      <path d="M96 66 C110 74 122 80 130 88 C120 80 108 72 96 68 Z" fill="#16A34A" />
      {/* Leaf 4 (Top Right) */}
      <path d="M94 64 C108 54 120 56 130 54 C118 62 108 66 94 66 Z" fill="#15803D" />
      {/* Calyx Center Button */}
      <circle cx="92" cy="65" r="5" fill="#14532D" />
      <path d="M88 34 C92 32 94 34 94 36" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
);

// 2. POTATO (Earth-toned red/brown tubers with realistic eyes & skin texture)
export const PotatoVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-potato">
    <defs>
      <radialGradient id="potGradMain" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#C47A46" />
        <stop offset="55%" stopColor="#A15C2E" />
        <stop offset="100%" stopColor="#783D17" />
      </radialGradient>
      <radialGradient id="potGradSec" cx="30%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#B45309" />
        <stop offset="60%" stopColor="#92400E" />
        <stop offset="100%" stopColor="#713F12" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="168" rx="72" ry="12" fill="#0F172A" fillOpacity="0.08" />

    {/* Secondary Smaller Potato (Behind) */}
    <path
      d="M110 82 C142 76 168 96 166 124 C164 150 134 162 108 158 C86 154 90 126 94 104 C98 88 100 84 110 82 Z"
      fill="url(#potGradSec)"
    />
    <circle cx="140" cy="106" r="2" fill="#58290E" />
    <circle cx="125" cy="132" r="2.5" fill="#58290E" />
    <circle cx="148" cy="136" r="1.8" fill="#58290E" />

    {/* Primary Hero Red Potato */}
    <path
      d="M58 84 C84 66 128 72 142 96 C158 122 148 156 118 164 C84 172 44 158 36 130 C28 102 42 92 58 84 Z"
      fill="url(#potGradMain)"
    />
    {/* Soft highlight curve */}
    <path
      d="M62 90 C80 78 112 82 124 98"
      stroke="#FDE68A"
      strokeWidth="4"
      strokeLinecap="round"
      strokeOpacity="0.25"
    />
    {/* Realistic Potato Eyes / Dimples */}
    <g fill="#451A03" opacity="0.6">
      <ellipse cx="64" cy="108" rx="3.5" ry="2" transform="rotate(-15 64 108)" />
      <ellipse cx="94" cy="94" rx="3" ry="1.8" transform="rotate(10 94 94)" />
      <ellipse cx="118" cy="120" rx="4" ry="2" transform="rotate(-10 118 120)" />
      <ellipse cx="78" cy="138" rx="3.5" ry="1.8" transform="rotate(5 78 138)" />
      <ellipse cx="106" cy="146" rx="3" ry="1.5" transform="rotate(-20 106 146)" />
    </g>
    {/* Eye Highlights */}
    <path d="M63 110 C65 111 67 111 68 110" stroke="#FDE68A" strokeWidth="1" strokeOpacity="0.4" />
    <path d="M117 122 C119 123 122 123 123 122" stroke="#FDE68A" strokeWidth="1" strokeOpacity="0.4" />
  </svg>
);

// 3. ONION (Cured red/copper onion bulb with papery skin layers and green shoot)
export const OnionVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-onion">
    <defs>
      <radialGradient id="oniGradMain" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#EA580C" />
        <stop offset="60%" stopColor="#C2410C" />
        <stop offset="100%" stopColor="#831843" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="170" rx="60" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Roots at base */}
    <path d="M92 165 C90 174 86 180 82 184 M98 166 C98 176 99 182 100 186 M106 165 C108 174 114 180 118 184" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

    {/* Onion Bulb Body */}
    <path
      d="M100 48 C135 68 156 102 156 130 C156 156 132 168 100 168 C68 168 44 156 44 130 C44 102 65 68 100 48 Z"
      fill="url(#oniGradMain)"
    />

    {/* Papery Vertical Striping / Sheen Lines */}
    <path d="M100 50 C118 76 132 104 132 136 C132 152 120 164 100 168" stroke="#FDBA74" strokeWidth="2" strokeOpacity="0.35" fill="none" />
    <path d="M100 50 C82 76 68 104 68 136 C68 152 80 164 100 168" stroke="#FDBA74" strokeWidth="2" strokeOpacity="0.35" fill="none" />
    <path d="M100 50 C108 78 114 106 114 140 C114 156 108 166 100 168" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.25" fill="none" />

    {/* Gloss Sheen */}
    <path d="M68 96 C62 108 60 124 64 138" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.4" />

    {/* Dried Neck & Fresh Top Sprout */}
    <path d="M96 52 L94 36 C94 30 102 24 106 20 C104 28 102 36 104 50 Z" fill="#65A30D" />
    <path d="M100 46 L108 30 C112 24 118 20 122 16 C116 26 110 36 104 48 Z" fill="#84CC16" />
    <path d="M94 48 C98 44 104 44 108 48 L104 54 L96 54 Z" fill="#9A3412" />
  </svg>
);

// 4. CAULIFLOWER (Dense creamy-white florets enveloped in crisp green outer leaves)
export const CauliflowerVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-cauliflower">
    <defs>
      <radialGradient id="cauliCurdGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="60%" stopColor="#F1F5F9" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </radialGradient>
      <linearGradient id="cauliLeafGrad1" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#14532D" />
        <stop offset="100%" stopColor="#22C55E" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="172" rx="66" ry="12" fill="#0F172A" fillOpacity="0.08" />

    {/* Back Framing Leaves */}
    <path d="M50 148 C30 110 38 68 62 48 C68 76 74 112 84 140 Z" fill="#15803D" />
    <path d="M150 148 C170 110 162 68 138 48 C132 76 126 112 116 140 Z" fill="#15803D" />
    <path d="M100 152 C90 90 92 50 100 32 C108 50 110 90 100 152 Z" fill="#166534" />

    {/* Central White Florets / Curd Dome */}
    <g filter="drop-shadow(0px 4px 6px rgba(15,23,42,0.12))">
      {/* Florette Clusters */}
      <circle cx="100" cy="80" r="28" fill="url(#cauliCurdGrad)" />
      <circle cx="74" cy="94" r="24" fill="url(#cauliCurdGrad)" />
      <circle cx="126" cy="94" r="24" fill="url(#cauliCurdGrad)" />
      <circle cx="68" cy="122" r="22" fill="url(#cauliCurdGrad)" />
      <circle cx="132" cy="122" r="22" fill="url(#cauliCurdGrad)" />
      <circle cx="100" cy="126" r="28" fill="url(#cauliCurdGrad)" />
      <circle cx="100" cy="104" r="22" fill="#FFFFFF" />

      {/* Florette Texture Grooves */}
      <path d="M84 76 C88 82 94 84 100 82 C106 84 112 82 116 76" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <path d="M72 108 C78 114 86 114 90 110" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <path d="M128 108 C122 114 114 114 110 110" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <path d="M88 132 C94 138 106 138 112 132" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
    </g>

    {/* Front Clasping Leaves with White Ribs */}
    <path d="M38 152 C32 128 42 106 58 92 C56 116 66 142 86 160 C64 162 46 160 38 152 Z" fill="url(#cauliLeafGrad1)" />
    <path d="M42 148 C50 128 62 114 74 104" stroke="#DCFCE7" strokeWidth="2.5" strokeLinecap="round" />

    <path d="M162 152 C168 128 158 106 142 92 C144 116 134 142 114 160 C136 162 154 160 162 152 Z" fill="url(#cauliLeafGrad1)" />
    <path d="M158 148 C150 128 138 114 126 104" stroke="#DCFCE7" strokeWidth="2.5" strokeLinecap="round" />

    {/* Base Stem */}
    <path d="M84 160 C92 168 108 168 116 160 L108 174 C104 176 96 176 92 174 Z" fill="#14532D" />
  </svg>
);

// 5. CABBAGE (Layered round green cabbage head with leaf veins)
export const CabbageVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-cabbage">
    <defs>
      <radialGradient id="cabGradBase" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#86EFAC" />
        <stop offset="50%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#15803D" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="170" rx="66" ry="12" fill="#0F172A" fillOpacity="0.08" />

    {/* Outer Crinkled Wrapper Leaves */}
    <circle cx="100" cy="112" r="58" fill="url(#cabGradBase)" />

    {/* Layered Leaf 1 (Left Wrap) */}
    <path
      d="M50 110 C50 78 80 60 108 60 C84 76 72 104 76 136 C60 134 50 124 50 110 Z"
      fill="#16A34A"
    />
    <path d="M52 110 C70 98 90 92 108 88" stroke="#DCFCE7" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
    <path d="M72 102 L80 116" stroke="#DCFCE7" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />

    {/* Layered Leaf 2 (Right Wrap) */}
    <path
      d="M150 110 C150 78 120 60 92 60 C116 76 128 104 124 136 C140 134 150 124 150 110 Z"
      fill="#15803D"
    />
    <path d="M148 110 C130 98 110 92 92 88" stroke="#DCFCE7" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
    <path d="M128 102 L120 116" stroke="#DCFCE7" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />

    {/* Front Center Leaf Heart */}
    <path
      d="M74 124 C82 92 118 92 126 124 C120 152 80 152 74 124 Z"
      fill="#4ADE80"
    />
    <path d="M100 96 V146" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.7" />
    <path d="M100 112 C90 116 84 122 80 128" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    <path d="M100 112 C110 116 116 122 120 128" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
  </svg>
);

// 6. CARROT (Vibrant crisp orange tapering carrots with lush feathery green tops)
export const CarrotVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-carrot">
    <defs>
      <linearGradient id="carGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FB923C" />
        <stop offset="50%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#C2410C" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="174" rx="55" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Feathery Leaf Tops */}
    <g stroke="#15803D" strokeWidth="2.5" strokeLinecap="round">
      <path d="M100 68 C96 46 84 32 72 24 M84 32 C92 38 96 44 98 52 M76 42 C84 46 90 52 94 60" />
      <path d="M102 68 C104 42 108 28 112 18 M106 28 C102 36 104 44 103 54 M110 38 C106 44 105 52 104 60" />
      <path d="M104 68 C112 48 126 36 138 28 M126 36 C118 42 112 48 108 56 M132 46 C122 50 116 56 110 62" />
    </g>

    {/* Carrot Root Body */}
    <path
      d="M84 72 C94 68 110 68 120 72 C124 96 116 142 103 178 C101 182 99 182 97 178 C86 142 78 96 84 72 Z"
      fill="url(#carGradMain)"
    />

    {/* Crown Top Rim */}
    <ellipse cx="102" cy="71" rx="18" ry="4" fill="#EA580C" />

    {/* Horizontal Skin Grooves */}
    <g stroke="#9A3412" strokeWidth="2" strokeLinecap="round" opacity="0.6">
      <path d="M88 88 H98" />
      <path d="M106 96 H116" />
      <path d="M90 114 H102" />
      <path d="M104 126 H112" />
      <path d="M94 142 H102" />
      <path d="M98 158 H104" />
    </g>

    {/* Left Highlight */}
    <path d="M88 80 C84 100 88 136 96 164" stroke="#FED7AA" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.4" />
  </svg>
);

// 7. CUCUMBER (Elongated crisp green cucumber with textured bumps and bloom)
export const CucumberVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-cucumber">
    <defs>
      <linearGradient id="cucGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="50%" stopColor="#16A34A" />
        <stop offset="100%" stopColor="#14532D" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="172" rx="68" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Cucumber Body (Gently curved elongated cylinder) */}
    <path
      d="M48 136 C36 120 44 94 62 82 C88 64 126 66 150 86 C168 102 166 128 152 142 C132 160 82 164 48 136 Z"
      fill="url(#cucGrad)"
    />

    {/* Longitudinal Stripe Ribs */}
    <path d="M52 110 C80 88 124 92 156 116" stroke="#86EFAC" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" strokeDasharray="6 4" />
    <path d="M58 130 C88 110 128 114 154 136" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" strokeDasharray="8 6" />

    {/* Little Texture Nodes / Bumps */}
    <g fill="#14532D" opacity="0.6">
      <circle cx="76" cy="92" r="2" />
      <circle cx="102" cy="84" r="2" />
      <circle cx="128" cy="94" r="2" />
      <circle cx="90" cy="116" r="2.2" />
      <circle cx="116" cy="112" r="2" />
      <circle cx="138" cy="124" r="2" />
      <circle cx="74" cy="132" r="1.8" />
    </g>

    {/* Stem at Left Tip */}
    <path d="M48 126 C42 128 36 126 32 120 C34 116 38 116 42 118" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" />
    {/* Yellow Flower Blossom at Right Tip */}
    <path d="M162 136 L170 134 L168 140 L174 144 L166 146 L164 152 L160 144 Z" fill="#FACC15" />
  </svg>
);

// 8. BRINJAL / EGGPLANT (Deep glossy royal purple eggplant with prominent green calyx)
export const BrinjalVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-brinjal">
    <defs>
      <radialGradient id="brinGrad" cx="35%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="45%" stopColor="#6B21A8" />
        <stop offset="100%" stopColor="#3B0764" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="172" rx="60" ry="12" fill="#0F172A" fillOpacity="0.08" />

    {/* Pear-shaped Glossy Eggplant Body */}
    <path
      d="M100 60 C118 60 126 78 132 98 C144 134 150 162 118 168 C86 174 58 152 64 120 C68 96 82 60 100 60 Z"
      fill="url(#brinGrad)"
    />

    {/* Mirror Gloss Highlight */}
    <path
      d="M82 88 C76 104 74 126 78 144"
      stroke="#FFFFFF"
      strokeWidth="5"
      strokeLinecap="round"
      strokeOpacity="0.45"
    />
    <path d="M84 92 C88 96 90 104 90 112" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.3" />

    {/* Green Calyx / Cap with Spiky Leaves */}
    <path
      d="M100 60 C90 62 82 56 74 64 C78 72 84 82 86 92 C92 84 98 82 100 82 C104 82 108 86 114 92 C116 80 122 72 128 66 C118 58 110 62 100 60 Z"
      fill="#15803D"
    />
    {/* Sturdy Curved Green Stem */}
    <path d="M100 60 C100 46 96 34 88 24 C94 28 106 36 104 58 Z" fill="#166534" />
    <path d="M88 24 C92 22 96 24 96 26" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 9. CAPSICUM (Glossy green bell pepper with deep lobes)
export const CapsicumVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-capsicum">
    <defs>
      <radialGradient id="capGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="50%" stopColor="#16A34A" />
        <stop offset="100%" stopColor="#14532D" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="170" rx="58" ry="12" fill="#0F172A" fillOpacity="0.08" />

    {/* Bell Pepper 3-Lobe Body */}
    <g>
      {/* Left Lobe */}
      <path d="M68 76 C50 88 46 122 52 146 C56 162 74 166 84 162 C88 144 86 106 82 76 Z" fill="url(#capGrad)" />
      {/* Right Lobe */}
      <path d="M132 76 C150 88 154 122 148 146 C144 162 126 166 116 162 C112 144 114 106 118 76 Z" fill="url(#capGrad)" />
      {/* Center Lobe */}
      <path d="M78 72 C78 68 122 68 122 72 C126 102 128 146 116 164 C104 168 96 168 84 164 C72 146 74 102 78 72 Z" fill="url(#capGrad)" />
    </g>

    {/* Highlights */}
    <path d="M64 94 C60 108 62 128 66 142" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.4" />
    <path d="M92 84 C88 96 88 116 90 134" stroke="#DCFCE7" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.3" />

    {/* Thick Green Calyx & Indented Stem */}
    <ellipse cx="100" cy="70" rx="14" ry="6" fill="#14532D" />
    <path d="M100 70 C102 52 98 40 92 30 C96 34 108 42 106 68 Z" fill="#15803D" />
  </svg>
);

// 10. GREEN CHILLI (Pointed fiery fresh chillies)
export const ChilliVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-chilli">
    <defs>
      <linearGradient id="chiliGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="60%" stopColor="#16A34A" />
        <stop offset="100%" stopColor="#14532D" />
      </linearGradient>
      <linearGradient id="chiliGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F87171" />
        <stop offset="60%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="172" rx="64" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Red Secondary Chilli (Behind) */}
    <path
      d="M130 52 C120 54 116 66 112 84 C104 118 84 150 62 168 C80 156 116 136 128 98 C134 80 136 60 130 52 Z"
      fill="url(#chiliGrad2)"
    />
    <path d="M130 52 C134 44 140 38 146 34" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />

    {/* Green Hero Chilli (Front, gracefully curved tapering tip) */}
    <path
      d="M74 48 C64 50 62 64 64 82 C68 116 92 148 128 174 C116 156 94 130 88 94 C84 76 82 56 74 48 Z"
      fill="url(#chiliGrad1)"
    />
    {/* Curved Highlight */}
    <path d="M72 64 C70 82 78 108 90 128" stroke="#DCFCE7" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.5" />

    {/* Green Calyx Cap & Curled Stem */}
    <path d="M68 48 C74 44 82 44 86 50 L84 56 C78 54 72 54 68 56 Z" fill="#14532D" />
    <path d="M76 46 C74 36 68 28 58 24" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

// 11. GARLIC (Ivory cured garlic bulb with cloves and root tuft)
export const GarlicVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-garlic">
    <ellipse cx="100" cy="170" rx="58" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Garlic Cloves Cluster */}
    <g filter="drop-shadow(0px 4px 6px rgba(15,23,42,0.1))">
      {/* Left Clove */}
      <path d="M74 154 C54 148 48 118 60 98 C72 80 92 72 100 68 C88 94 80 128 74 154 Z" fill="#F1F5F9" />
      {/* Right Clove */}
      <path d="M126 154 C146 148 152 118 140 98 C128 80 108 72 100 68 C112 94 120 128 126 154 Z" fill="#E2E8F0" />
      {/* Center Clove */}
      <path d="M76 156 C78 122 84 92 100 68 C116 92 122 122 124 156 C110 162 90 162 76 156 Z" fill="#FFFFFF" />
    </g>

    {/* Clove Division Shading Lines */}
    <path d="M100 70 V160" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
    <path d="M84 94 C76 112 76 138 78 156" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M116 94 C124 112 124 138 122 156" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />

    {/* Top Dried Stalk */}
    <path d="M98 68 L96 38 C96 32 104 32 104 38 L102 68 Z" fill="#D1D5DB" />
    <path d="M96 40 H104" stroke="#9CA3AF" strokeWidth="2" />

    {/* Bottom Roots */}
    <path d="M90 160 C88 170 82 176 78 180 M100 162 V182 M110 160 C112 170 118 176 122 180" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 12. GINGER (Fresh knobby branching ginger rhizome)
export const GingerVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-ginger">
    <defs>
      <linearGradient id="gingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="170" rx="66" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Knobby Multi-Branch Root Shape */}
    <path
      d="M54 134 C44 116 52 92 72 90 C84 88 92 98 96 106 C100 86 114 74 130 76 C148 78 152 98 144 114 C158 116 166 130 162 144 C156 160 134 162 116 156 C104 164 80 164 64 152 C56 146 54 140 54 134 Z"
      fill="url(#gingGrad)"
    />

    {/* Knobby Rings & Skin Creases */}
    <g stroke="#78350F" strokeWidth="2" strokeLinecap="round" opacity="0.45">
      <path d="M60 118 C66 112 74 114 78 120" />
      <path d="M78 102 C84 100 90 104 92 110" />
      <path d="M116 90 C122 88 128 92 130 98" />
      <path d="M136 106 C142 108 146 114 144 120" />
      <path d="M142 136 C148 140 152 144 150 148" />
      <path d="M102 132 C110 136 118 136 124 132" />
      <path d="M78 142 C86 146 94 144 98 140" />
    </g>

    {/* Fresh Budding Shoot Tips */}
    <circle cx="68" cy="92" r="3.5" fill="#F87171" opacity="0.8" />
    <circle cx="132" cy="78" r="3.5" fill="#F87171" opacity="0.8" />
  </svg>
);

// 13. BITTER GOURD / KARELA (Distinctive bumpy green karela)
export const BitterGourdVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-bitter_gourd">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="50%" stopColor="#16A34A" />
        <stop offset="100%" stopColor="#14532D" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="172" rx="65" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Pointed Spindle Body */}
    <path
      d="M38 124 C52 102 84 86 122 88 C148 90 168 106 174 122 C164 144 134 156 94 154 C58 152 42 138 38 124 Z"
      fill="url(#bgGrad)"
    />

    {/* Bumpy Rib Texture Ridges */}
    <g fill="#14532D" opacity="0.6">
      <ellipse cx="64" cy="116" rx="4" ry="2" transform="rotate(-20 64 116)" />
      <ellipse cx="82" cy="104" rx="5" ry="2.5" transform="rotate(-15 82 104)" />
      <ellipse cx="106" cy="98" rx="6" ry="2.8" transform="rotate(5 106 98)" />
      <ellipse cx="132" cy="104" rx="5" ry="2.5" transform="rotate(20 132 104)" />
      <ellipse cx="152" cy="118" rx="4" ry="2" transform="rotate(25 152 118)" />

      <ellipse cx="68" cy="134" rx="4" ry="2" transform="rotate(10 68 134)" />
      <ellipse cx="94" cy="138" rx="6" ry="2.8" transform="rotate(-5 94 138)" />
      <ellipse cx="124" cy="136" rx="5" ry="2.5" transform="rotate(-15 124 136)" />
      <ellipse cx="146" cy="132" rx="4" ry="2" transform="rotate(-20 146 132)" />

      <ellipse cx="98" cy="118" rx="7" ry="3" />
    </g>

    {/* Curved Tail Stem */}
    <path d="M38 124 C30 126 24 122 22 114 C24 108 30 108 34 112" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// 14. BOTTLE GOURD / LAUKA (Smooth light green bottle-shaped gourd)
export const BottleGourdVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-bottle_gourd">
    <defs>
      <radialGradient id="laukaGrad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#BEF264" />
        <stop offset="60%" stopColor="#84CC16" />
        <stop offset="100%" stopColor="#4D7C0F" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="172" rx="58" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Classic Bottle Gourd Curve (Narrow neck expanding into round base) */}
    <path
      d="M94 54 C94 48 106 48 106 54 C108 76 114 92 126 106 C144 126 146 156 122 168 C98 180 66 166 64 136 C62 114 80 94 92 76 Z"
      fill="url(#laukaGrad)"
    />

    {/* Soft Sheen Highlight */}
    <path d="M78 122 C76 136 82 152 92 160" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.4" />

    {/* Top Curled Vine Stem */}
    <path d="M100 52 C100 38 108 30 118 26 C124 24 128 28 124 34 C118 42 110 44 104 50" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// 15. GREEN PEAS (Fresh green pea pod with visible round peas)
export const PeasVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-peas">
    <defs>
      <linearGradient id="peaPodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#86EFAC" />
        <stop offset="50%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#15803D" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="170" rx="66" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Open Outer Pod Half */}
    <path
      d="M36 130 C48 94 88 78 136 86 C162 90 174 106 172 118 C160 148 108 168 54 154 C40 150 34 140 36 130 Z"
      fill="url(#peaPodGrad)"
    />
    <path d="M42 138 C80 152 126 142 166 112" stroke="#14532D" strokeWidth="2.5" fill="none" opacity="0.6" />

    {/* 4 Crisp Sweet Round Peas nestled inside */}
    <circle cx="68" cy="132" r="14" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />
    <ellipse cx="64" cy="128" rx="4" ry="2" fill="#FFFFFF" fillOpacity="0.5" />

    <circle cx="96" cy="124" r="14" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />
    <ellipse cx="92" cy="120" rx="4" ry="2" fill="#FFFFFF" fillOpacity="0.5" />

    <circle cx="124" cy="116" r="14" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />
    <ellipse cx="120" cy="112" rx="4" ry="2" fill="#FFFFFF" fillOpacity="0.5" />

    <circle cx="148" cy="108" r="12" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />
    <ellipse cx="144" cy="105" rx="3.5" ry="1.8" fill="#FFFFFF" fillOpacity="0.5" />

    {/* Pod Stem */}
    <path d="M36 130 C30 128 24 122 22 114" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// 16. RADISH (Crisp white tapering daikon radish with green leafy top)
export const RadishVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-radish">
    <ellipse cx="100" cy="174" rx="55" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Leafy Green Crown */}
    <g stroke="#15803D" strokeWidth="3" strokeLinecap="round">
      <path d="M100 70 C92 46 80 34 68 26 M80 34 C88 40 94 48 96 58" />
      <path d="M102 70 C104 42 108 26 112 16" />
      <path d="M104 70 C114 48 128 36 142 28 M128 38 C120 44 114 52 108 60" />
    </g>

    {/* Radish Root (White with subtle pinkish/purple shoulders) */}
    <path
      d="M84 74 C94 70 110 70 120 74 C126 98 118 144 103 180 C101 184 99 184 97 180 C86 144 78 98 84 74 Z"
      fill="#F8FAFC"
      stroke="#CBD5E1"
      strokeWidth="1.5"
    />
    {/* Pinkish Shoulder Blush */}
    <path d="M84 74 C94 70 110 70 120 74 C122 84 118 94 102 96 C86 94 82 84 84 74 Z" fill="#F43F5E" fillOpacity="0.3" />

    {/* Root Wrinkle Lines */}
    <g stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
      <path d="M88 102 H96" />
      <path d="M106 118 H114" />
      <path d="M92 136 H100" />
      <path d="M102 154 H108" />
    </g>
  </svg>
);

// 17. OKRA / BHINDI / LADIES FINGER (Tender ribbed green pods with pointed tip)
export const OkraVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-ladies_finger">
    <defs>
      <linearGradient id="okraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="50%" stopColor="#16A34A" />
        <stop offset="100%" stopColor="#14532D" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="172" rx="60" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* 5-Ribbed Elongated Pod Body */}
    <path
      d="M78 58 C92 54 112 54 122 58 C126 84 118 138 102 178 C98 138 74 84 78 58 Z"
      fill="url(#okraGrad)"
    />
    {/* Rib Lines */}
    <path d="M92 56 C92 84 94 124 102 178" stroke="#86EFAC" strokeWidth="2" strokeOpacity="0.6" />
    <path d="M108 56 C108 84 106 124 102 178" stroke="#14532D" strokeWidth="2" strokeOpacity="0.6" />

    {/* Cap & Pentagonal Stem */}
    <ellipse cx="100" cy="56" rx="18" ry="5" fill="#14532D" />
    <path d="M100 54 V34 C100 30 96 28 92 26" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

// 18. SPINACH / PALUNGO (Vibrant leafy green spinach bunch)
export const SpinachVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-spinach">
    <defs>
      <linearGradient id="spinGrad1" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#14532D" />
        <stop offset="100%" stopColor="#22C55E" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="172" rx="64" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Back Leaves */}
    <path d="M100 160 C70 120 54 70 78 40 C102 44 114 90 100 160 Z" fill="#15803D" />
    <path d="M100 160 C130 120 146 70 122 40 C98 44 86 90 100 160 Z" fill="#15803D" />

    {/* Center Hero Broad Leaf */}
    <path
      d="M100 164 C64 130 52 82 86 52 C114 52 136 82 114 164 Z"
      fill="url(#spinGrad1)"
    />
    {/* Veins */}
    <path d="M100 164 V60" stroke="#DCFCE7" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M100 120 C88 112 80 102 76 92" stroke="#DCFCE7" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M100 120 C112 112 120 102 124 92" stroke="#DCFCE7" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M100 96 C90 90 84 82 82 74" stroke="#DCFCE7" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M100 96 C110 90 116 82 118 74" stroke="#DCFCE7" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 19. MUSHROOM (Creamy button mushrooms with smooth caps)
export const MushroomVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-mushroom">
    <defs>
      <radialGradient id="mushGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="60%" stopColor="#F1F5F9" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="170" rx="62" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Secondary Smaller Mushroom (Right) */}
    <g>
      <path d="M128 126 H144 V160 H128 Z" fill="#E2E8F0" />
      <path d="M116 128 C116 104 156 104 156 128 C156 132 116 132 116 128 Z" fill="url(#mushGrad)" />
    </g>

    {/* Primary Hero Button Mushroom */}
    <g filter="drop-shadow(0px 4px 6px rgba(15,23,42,0.1))">
      {/* Stem */}
      <path d="M84 116 C84 112 112 112 112 116 L116 164 C116 168 80 168 80 164 Z" fill="#F8FAFC" />
      {/* Cap */}
      <path
        d="M52 116 C52 74 144 74 144 116 C144 126 52 126 52 116 Z"
        fill="url(#mushGrad)"
      />
      {/* Highlight Sheen */}
      <ellipse cx="78" cy="94" rx="14" ry="7" transform="rotate(-25 78 94)" fill="#FFFFFF" fillOpacity="0.5" />
    </g>
  </svg>
);

// 20. PUMPKIN (Rich ribbed orange pumpkin with woody stem)
export const PumpkinVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-pumpkin">
    <defs>
      <radialGradient id="pumpGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FDBA74" />
        <stop offset="50%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#C2410C" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="172" rx="72" ry="12" fill="#0F172A" fillOpacity="0.08" />

    {/* Pumpkin Lobes */}
    <g>
      {/* Outer Left Lobe */}
      <ellipse cx="68" cy="122" rx="34" ry="42" fill="url(#pumpGrad)" />
      {/* Outer Right Lobe */}
      <ellipse cx="132" cy="122" rx="34" ry="42" fill="url(#pumpGrad)" />
      {/* Center Left Lobe */}
      <ellipse cx="84" cy="120" rx="28" ry="46" fill="url(#pumpGrad)" />
      {/* Center Right Lobe */}
      <ellipse cx="116" cy="120" rx="28" ry="46" fill="url(#pumpGrad)" />
      {/* Center Hero Lobe */}
      <ellipse cx="100" cy="118" rx="24" ry="48" fill="url(#pumpGrad)" />
    </g>

    {/* Lobe Creases */}
    <path d="M100 70 V166" stroke="#9A3412" strokeWidth="2" opacity="0.4" />
    <path d="M82 74 C78 100 78 136 84 164" stroke="#9A3412" strokeWidth="2" opacity="0.4" />
    <path d="M118 74 C122 100 122 136 116 164" stroke="#9A3412" strokeWidth="2" opacity="0.4" />

    {/* Woody Brown Stem */}
    <path d="M100 72 C96 56 102 44 112 36 C108 44 104 56 104 72 Z" fill="#78350F" />
    <path d="M96 74 H106" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// 21. SWEET POTATO (Reddish-copper tapered sweet potato)
export const SweetPotatoVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-sweet_potato">
    <defs>
      <linearGradient id="spGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EA580C" />
        <stop offset="50%" stopColor="#9A3412" />
        <stop offset="100%" stopColor="#701A75" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="170" rx="66" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Pointed Tapered Tuber */}
    <path
      d="M40 126 C52 98 94 76 138 88 C166 96 172 120 162 136 C144 162 90 168 52 148 C42 142 36 136 40 126 Z"
      fill="url(#spGrad)"
    />
    <path d="M56 112 C82 96 126 102 152 120" stroke="#FED7AA" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.35" />
    <circle cx="78" cy="116" r="2" fill="#4A044E" />
    <circle cx="114" cy="112" r="2.5" fill="#4A044E" />
    <circle cx="138" cy="132" r="2" fill="#4A044E" />
  </svg>
);

// 22. FRENCH BEANS (Slender vibrant green french bean pods)
export const BeansVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-beans">
    <ellipse cx="100" cy="172" rx="64" ry="10" fill="#0F172A" fillOpacity="0.08" />

    <g stroke="#15803D" strokeLinecap="round">
      {/* Bean Pod 1 */}
      <path d="M52 148 C72 124 104 88 138 52 C142 48 148 48 150 52 C146 88 114 126 86 156" strokeWidth="10" stroke="#22C55E" />
      <path d="M56 146 C74 122 106 88 140 54" strokeWidth="2.5" stroke="#DCFCE7" />
      
      {/* Bean Pod 2 (Crossed) */}
      <path d="M148 148 C128 124 96 88 62 52 C58 48 52 48 50 52 C54 88 86 126 114 156" strokeWidth="10" stroke="#16A34A" />
      <path d="M144 146 C126 122 94 88 60 54" strokeWidth="2.5" stroke="#DCFCE7" />
    </g>
  </svg>
);

// 23. CORIANDER (Fresh aromatic green coriander sprig)
export const CorianderVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-coriander">
    <ellipse cx="100" cy="172" rx="60" ry="10" fill="#0F172A" fillOpacity="0.08" />

    <g stroke="#15803D" strokeWidth="2.5" strokeLinecap="round">
      <path d="M100 166 V90" />
      <path d="M100 130 C84 116 70 102 60 80" />
      <path d="M100 110 C116 96 130 82 140 60" />
    </g>

    {/* Fan-Shaped Serrated Leaves */}
    <g fill="#22C55E">
      <path d="M100 90 C88 78 84 64 94 56 C100 54 106 58 106 58 C106 58 112 54 118 56 C128 64 124 78 100 90 Z" />
      <path d="M60 80 C48 68 44 54 54 46 C60 44 66 48 66 48 C66 48 72 44 78 46 C88 54 84 68 60 80 Z" />
      <path d="M140 60 C128 48 124 34 134 26 C140 24 146 28 146 28 C146 28 152 24 158 26 C168 34 164 48 140 60 Z" />
    </g>
  </svg>
);

// 24. PADDY / RICE (Golden rice sheaf with grains)
export const PaddyVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-paddy">
    <ellipse cx="100" cy="172" rx="62" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Graceful Arching Stalk */}
    <path d="M80 170 C80 130 90 90 130 50" stroke="#CA8A04" strokeWidth="3" strokeLinecap="round" />

    {/* Golden Grains along Stalk */}
    <g fill="#EAB308" stroke="#A16207" strokeWidth="1.2">
      <ellipse cx="126" cy="56" rx="6" ry="3.5" transform="rotate(30 126 56)" />
      <ellipse cx="136" cy="66" rx="6" ry="3.5" transform="rotate(10 136 66)" />
      <ellipse cx="118" cy="72" rx="6" ry="3.5" transform="rotate(45 118 72)" />
      <ellipse cx="128" cy="84" rx="6" ry="3.5" transform="rotate(20 128 84)" />
      <ellipse cx="108" cy="90" rx="6" ry="3.5" transform="rotate(50 108 90)" />
      <ellipse cx="118" cy="102" rx="6" ry="3.5" transform="rotate(35 118 102)" />
      <ellipse cx="98" cy="110" rx="6" ry="3.5" transform="rotate(55 98 110)" />
      <ellipse cx="106" cy="122" rx="6" ry="3.5" transform="rotate(40 106 122)" />
    </g>
  </svg>
);

// 25. WHEAT (Golden wheat spikelet)
export const WheatVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-wheat">
    <ellipse cx="100" cy="172" rx="60" ry="10" fill="#0F172A" fillOpacity="0.08" />

    <path d="M100 170 V40" stroke="#CA8A04" strokeWidth="3" strokeLinecap="round" />

    {/* Symmetrical Wheat Grains & Awns */}
    <g fill="#FBBF24" stroke="#B45309" strokeWidth="1.5">
      <ellipse cx="92" cy="60" rx="7" ry="4" transform="rotate(-30 92 60)" />
      <path d="M88 56 L68 36" stroke="#B45309" strokeWidth="1.5" />

      <ellipse cx="108" cy="60" rx="7" ry="4" transform="rotate(30 108 60)" />
      <path d="M112 56 L132 36" stroke="#B45309" strokeWidth="1.5" />

      <ellipse cx="92" cy="78" rx="7" ry="4" transform="rotate(-30 92 78)" />
      <path d="M88 74 L68 54" stroke="#B45309" strokeWidth="1.5" />

      <ellipse cx="108" cy="78" rx="7" ry="4" transform="rotate(30 108 78)" />
      <path d="M112 74 L132 54" stroke="#B45309" strokeWidth="1.5" />

      <ellipse cx="92" cy="96" rx="7" ry="4" transform="rotate(-30 92 96)" />
      <path d="M88 92 L68 72" stroke="#B45309" strokeWidth="1.5" />

      <ellipse cx="108" cy="96" rx="7" ry="4" transform="rotate(30 108 96)" />
      <path d="M112 92 L132 72" stroke="#B45309" strokeWidth="1.5" />
    </g>
  </svg>
);

// 26. MAIZE / CORN (Golden sweet corn cob with green husk)
export const MaizeVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-maize">
    <ellipse cx="100" cy="172" rx="60" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Green Husk (Left & Right) */}
    <path d="M70 156 C60 120 62 82 82 54 C80 90 84 130 96 162 Z" fill="#16A34A" />
    <path d="M130 156 C140 120 138 82 118 54 C120 90 116 130 104 162 Z" fill="#15803D" />

    {/* Golden Corn Kernel Cob */}
    <path d="M84 148 C80 98 84 62 100 42 C116 62 120 98 116 148 Z" fill="#FBBF24" />

    {/* Kernel Grid Pattern */}
    <g stroke="#D97706" strokeWidth="1.5" strokeOpacity="0.6">
      <path d="M86 70 H114" />
      <path d="M84 88 H116" />
      <path d="M84 106 H116" />
      <path d="M84 124 H116" />
      <path d="M86 142 H114" />
      <path d="M94 48 V148" />
      <path d="M106 48 V148" />
    </g>
  </svg>
);

// 27. MUSTARD / TORI (Yellow blooming mustard flowers)
export const MustardVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-mustard">
    <ellipse cx="100" cy="172" rx="60" ry="10" fill="#0F172A" fillOpacity="0.08" />

    {/* Green Stems */}
    <g stroke="#15803D" strokeWidth="2.5" strokeLinecap="round">
      <path d="M100 168 V70" />
      <path d="M100 120 L74 90" />
      <path d="M100 104 L126 78" />
    </g>

    {/* Yellow 4-Petal Mustard Blossoms */}
    <g fill="#FACC15" stroke="#CA8A04" strokeWidth="1">
      <circle cx="100" cy="62" r="6" />
      <circle cx="94" cy="68" r="6" />
      <circle cx="106" cy="68" r="6" />
      <circle cx="100" cy="74" r="6" />
      <circle cx="100" cy="68" r="2.5" fill="#713F12" stroke="none" />

      <circle cx="74" cy="82" r="5" />
      <circle cx="69" cy="87" r="5" />
      <circle cx="79" cy="87" r="5" />
      <circle cx="74" cy="92" r="5" />

      <circle cx="126" cy="70" r="5" />
      <circle cx="121" cy="75" r="5" />
      <circle cx="131" cy="75" r="5" />
      <circle cx="126" cy="80" r="5" />
    </g>
  </svg>
);

// 28. APPLE (Crisp red highland Himalayan apple)
export const AppleVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-apple">
    <defs>
      <radialGradient id="appGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#F87171" />
        <stop offset="50%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="170" rx="60" ry="12" fill="#0F172A" fillOpacity="0.08" />

    {/* Heart-Shaped Apple Body */}
    <path
      d="M100 72 C80 62 50 74 50 110 C50 148 76 166 100 166 C124 166 150 148 150 110 C150 74 120 62 100 72 Z"
      fill="url(#appGrad)"
    />

    {/* Gloss Highlight */}
    <ellipse cx="74" cy="98" rx="10" ry="20" transform="rotate(-20 74 98)" fill="#FFFFFF" fillOpacity="0.4" />

    {/* Top Indentation & Stem */}
    <path d="M100 72 C100 52 106 42 114 34" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
    {/* Single Fresh Leaf */}
    <path d="M104 56 C116 48 130 52 134 60 C124 66 112 64 104 56 Z" fill="#15803D" />
  </svg>
);

// 29. NEUTRAL AGRICULTURAL HARVEST BASKET / CRATE FALLBACK
// (Clean wooden crate brimming with farm harvest produce)
export const HarvestFallbackVector: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} id="svg-crop-fallback-harvest">
    <ellipse cx="100" cy="174" rx="72" ry="12" fill="#0F172A" fillOpacity="0.08" />

    {/* Produce Rising Out of Crate */}
    {/* Green leafy greens */}
    <path d="M60 110 C46 80 64 60 84 72 C80 94 76 108 72 120 Z" fill="#16A34A" />
    <path d="M140 110 C154 80 136 60 116 72 C120 94 124 108 128 120 Z" fill="#15803D" />
    {/* Red round tomato */}
    <circle cx="86" cy="100" r="18" fill="#EF4444" />
    {/* Orange carrot top */}
    <path d="M110 88 L124 106 L118 114 L104 96 Z" fill="#EA580C" />
    {/* Yellow/golden squash */}
    <circle cx="104" cy="108" r="16" fill="#F59E0B" />

    {/* Wooden Farm Produce Crate */}
    <g filter="drop-shadow(0px 4px 6px rgba(15,23,42,0.12))">
      {/* Front Wooden Slat 1 (Top) */}
      <rect x="42" y="116" width="116" height="16" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
      <circle cx="48" cy="124" r="1.5" fill="#451A03" />
      <circle cx="152" cy="124" r="1.5" fill="#451A03" />

      {/* Front Wooden Slat 2 (Middle) */}
      <rect x="42" y="136" width="116" height="16" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
      <circle cx="48" cy="144" r="1.5" fill="#451A03" />
      <circle cx="152" cy="144" r="1.5" fill="#451A03" />

      {/* Front Wooden Slat 3 (Bottom) */}
      <rect x="44" y="156" width="112" height="14" rx="3" fill="#92400E" stroke="#451A03" strokeWidth="1.5" />

      {/* Side Corner Braces */}
      <rect x="40" y="112" width="10" height="58" rx="2" fill="#78350F" />
      <rect x="150" y="112" width="10" height="58" rx="2" fill="#78350F" />
    </g>
  </svg>
);

/**
 * =========================================================================
 * REGISTRY MAPPING TABLE
 * =========================================================================
 */
export const CROP_VECTOR_MAP: Record<string, React.FC<{ className?: string }>> = {
  tomato: TomatoVector,
  potato: PotatoVector,
  onion: OnionVector,
  cauliflower: CauliflowerVector,
  cabbage: CabbageVector,
  carrot: CarrotVector,
  cucumber: CucumberVector,
  brinjal: BrinjalVector,
  capsicum: CapsicumVector,
  green_chilli: ChilliVector,
  garlic: GarlicVector,
  ginger: GingerVector,
  bitter_gourd: BitterGourdVector,
  bottle_gourd: BottleGourdVector,
  beans: BeansVector,
  peas: PeasVector,
  radish: RadishVector,
  ladies_finger: OkraVector,
  spinach: SpinachVector,
  mushroom: MushroomVector,
  pumpkin: PumpkinVector,
  sweet_potato: SweetPotatoVector,
  coriander: CorianderVector,
  paddy: PaddyVector,
  wheat: WheatVector,
  maize: MaizeVector,
  mustard: MustardVector,
  apple: AppleVector,
};

/**
 * Reusable CropIllustration Component
 */
export const CropIllustration: React.FC<CropIllustrationProps> = ({
  crop,
  cropName,
  photoUrl,
  className = '',
  size = 'md',
  showBadge = false,
  alt,
}) => {
  const [photoError, setPhotoError] = useState(false);
  const normalizedId = normalizeCropId(crop || cropName);
  const metadata = getCropMetadata(crop || cropName);
  const VectorComponent = CROP_VECTOR_MAP[normalizedId] || HarvestFallbackVector;

  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
    full: 'w-full h-full',
  }[size];

  // If farmer uploaded a genuine custom photo and it loads without error, render photo
  const hasValidPhoto = photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '' && !photoError;

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden select-none ${className}`}
      id={`crop-illus-${normalizedId}`}
    >
      {hasValidPhoto ? (
        <img
          src={photoUrl}
          alt={alt || metadata?.name || 'Crop produce'}
          onError={() => setPhotoError(true)}
          className={`object-cover rounded-2xl ${sizeClasses}`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <div className={`flex items-center justify-center ${sizeClasses}`}>
          <VectorComponent className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
        </div>
      )}

      {showBadge && metadata && (
        <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-full bg-[#0F172A]/80 backdrop-blur-xs text-white text-[10px] font-bold border border-white/10 shadow-xs">
          {metadata.nepaliName}
        </div>
      )}
    </div>
  );
};
