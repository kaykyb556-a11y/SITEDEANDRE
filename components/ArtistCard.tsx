/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { motion } from 'framer-motion';
import { CollectionItem } from '../types';
import { ArrowUpRight, Edit } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { EditableText, EditableImage } from './Editable';

interface ArtistCardProps {
  artist: CollectionItem;
  section: 'story' | 'lookbook';
  onClick: () => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, section, onClick }) => {
  const { isAdminMode, updateCollectionItem } = useContent();

  const handleTextSave = (field: keyof CollectionItem) => (value: string) => {
    updateCollectionItem(section, artist.id, field, value);
  };

  return (
    <motion.div
      className="group relative h-[500px] md:h-[650px] w-full overflow-hidden border-b md:border-r border-white/5 bg-[#0F0F10] cursor-pointer"
      initial="rest"
      whileHover={isAdminMode ? "rest" : "hover"}
      whileTap={isAdminMode ? "rest" : "hover"}
      animate="rest"
      data-hover={!isAdminMode}
      onClick={!isAdminMode ? onClick : undefined}
    >
      {/* Image Background with Zoom */}
      <div className="absolute inset-0 overflow-hidden">
        <EditableImage 
          src={artist.image} 
          alt={artist.title} 
          onSave={handleTextSave('image')}
          className="h-full w-full object-cover opacity-80 transition-opacity duration-500 will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Overlay Info */}
      <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start pointer-events-auto">
           <span className="text-xs font-serif italic text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full backdrop-blur-md">
             <EditableText value={artist.category} onSave={handleTextSave('category')} />
           </span>
           {!isAdminMode && (
             <motion.div
               variants={{
                 rest: { opacity: 0, x: 20, y: -20 },
                 hover: { opacity: 1, x: 0, y: 0 }
               }}
               className="bg-white text-black rounded-full p-3 will-change-transform"
             >
               <ArrowUpRight className="w-5 h-5" />
             </motion.div>
           )}
        </div>

        <div className="pointer-events-auto">
          <div className="overflow-hidden">
            <motion.h3 
              className="font-heading text-3xl md:text-5xl text-white mb-2 leading-tight"
              variants={isAdminMode ? {} : {
                rest: { y: 0 },
                hover: { y: -5 }
              }}
              transition={{ duration: 0.4 }}
            >
              <EditableText value={artist.title} onSave={handleTextSave('title')} />
            </motion.h3>
          </div>
          <motion.div 
            className="h-px w-0 bg-[#D4AF37] mb-4"
            variants={isAdminMode ? { rest: { width: 60 } } : {
              rest: { width: 0 },
              hover: { width: 60 }
            }}
            transition={{ duration: 0.4 }}
          />
          <motion.div 
            className="text-sm font-light text-gray-300 tracking-wide line-clamp-2"
            variants={isAdminMode ? { rest: { opacity: 1, y: 0 } } : {
              rest: { opacity: 0.7, y: 0 },
              hover: { opacity: 1, y: -2 }
            }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <EditableText value={artist.subtitle} onSave={handleTextSave('subtitle')} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArtistCard;