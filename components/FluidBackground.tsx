/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const StarField = () => {
  // Reduced particle count for performance, subtle dust effect
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.5 + 0.1
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#D4AF37] will-change-[opacity,transform]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            transform: 'translateZ(0)'
          }}
          initial={{ opacity: p.opacity, scale: 1 }}
          animate={{
            opacity: [p.opacity, 0.8, p.opacity],
            scale: [1, 1.2, 1],
            y: [0, -20, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

const FluidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0F0F10]">
      
      <StarField />

      {/* Blob 1: Gold - Luxury focus */}
      <motion.div
        className="absolute top-[-20%] left-[20%] w-[80vw] h-[80vw] bg-[#D4AF37] rounded-full mix-blend-screen filter blur-[80px] opacity-10 will-change-transform"
        animate={{
          x: [0, 50, -25, 0],
          y: [0, -25, 25, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Blob 2: Deep Violet - Immersive/Digital touch */}
      <motion.div
        className="absolute top-[40%] right-[-20%] w-[90vw] h-[90vw] bg-[#8A2BE2] rounded-full mix-blend-screen filter blur-[100px] opacity-10 will-change-transform"
        animate={{
          x: [0, -50, 25, 0],
          y: [0, 50, -25, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Blob 3: Silver/Grey - Neutral balance */}
      <motion.div
        className="absolute bottom-[-20%] left-[-20%] w-[100vw] h-[100vw] bg-[#2a2a2a] rounded-full mix-blend-screen filter blur-[60px] opacity-20 will-change-transform"
        animate={{
          x: [0, 75, -75, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Static Grain Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0F0F10]/50 to-[#0F0F10] pointer-events-none" />
    </div>
  );
};

export default FluidBackground;