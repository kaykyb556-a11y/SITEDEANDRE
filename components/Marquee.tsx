/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import { EditableText } from './Editable';

const MarqueeItem: React.FC = () => {
  const { content, updateContent } = useContent();
  const { marquee } = content;

  return (
    <div className="flex items-center gap-12 px-6">
      {/* Variation 1: Solid Gold */}
      <span className="text-4xl md:text-6xl font-heading font-bold text-[#D4AF37] tracking-tighter">
        <EditableText 
           value={marquee.brandName} 
           onSave={(val) => updateContent('marquee', 'brandName', val)} 
        />
      </span>
      
      {/* Separator: Violet Italic */}
      <span className="text-2xl md:text-3xl text-[#8A2BE2] font-serif italic whitespace-nowrap">
        <EditableText 
           value={marquee.text1} 
           onSave={(val) => updateContent('marquee', 'text1', val)} 
        />
      </span>

      {/* Variation 2: Outline / Stroke */}
      <span 
        className="text-4xl md:text-6xl font-heading font-bold text-transparent tracking-tighter"
        style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.5)' }}
      >
        {marquee.brandName}
      </span>

      {/* Separator: White Italic */}
      <span className="text-2xl md:text-3xl text-white/80 font-serif italic whitespace-nowrap">
        <EditableText 
           value={marquee.text2} 
           onSave={(val) => updateContent('marquee', 'text2', val)} 
        />
      </span>
      
       {/* Variation 3: Solid Violet */}
       <span className="text-4xl md:text-6xl font-heading font-bold text-[#8A2BE2] tracking-tighter">
        {marquee.brandName}
      </span>

      <span className="text-2xl md:text-3xl text-[#D4AF37] font-serif italic whitespace-nowrap">
        <EditableText 
           value={marquee.year} 
           onSave={(val) => updateContent('marquee', 'year', val)} 
        />
      </span>
    </div>
  );
};

const Marquee: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden border-y border-white/10 bg-[#0F0F10]/80 backdrop-blur-md py-8 z-20 select-none">
      {/* Gradient Overlays for smooth fade at edges */}
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#0F0F10] to-transparent z-10" />
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#0F0F10] to-transparent z-10" />

      <div className="flex">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: "-50%" }}
          transition={{ 
            repeat: Infinity, 
            ease: "linear", 
            duration: 30 
          }}
          initial={{ x: "0%" }}
          style={{ width: "fit-content" }}
        >
          {/* Render enough copies to ensure smooth looping on large screens */}
          {[...Array(4)].map((_, i) => (
            <MarqueeItem key={i} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Marquee;