/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft, ChevronRight, ArrowRight, Instagram, Hash, ShoppingBag, CheckCircle, Plus, Upload, Link as LinkIcon, Lock } from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import GradientText from './components/GlitchText';
import CustomCursor from './components/CustomCursor';
import ArtistCard from './components/ArtistCard';
import AIChat from './components/AIChat';
import Marquee from './components/Marquee';
import { useContent } from './context/ContentContext';
import { EditableText, EditableImage, AdminToolbar } from './components/Editable';
import { CollectionItem } from './types';
import { processImageFile } from './utils/image';
import AdminLogin from './components/AdminLogin';

const App: React.FC = () => {
  const { content, updateContent, isAdminMode, addCollectionItem } = useContent();
  const { hero, story, lookbook, rsvp } = content;

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [newItem, setNewItem] = useState({
    title: '',
    category: '',
    subtitle: '',
    image: '',
    description: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [rsvpState, setRsvpState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', size: 'M' });

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem && !isAddModalOpen) return;
      if (e.key === 'Escape') {
        setSelectedItem(null);
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, isAddModalOpen]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpState('submitting');
    // Simulate API call
    setTimeout(() => {
      setRsvpState('success');
    }, 2000);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!newItem.title || !newItem.subtitle) return;

    const itemToAdd: CollectionItem = {
      id: Date.now().toString(),
      title: newItem.title,
      category: newItem.category || `Look 0${lookbook.items.length + 1}`,
      subtitle: newItem.subtitle,
      // Use a default placeholder if no image URL is provided
      image: newItem.image || 'https://images.unsplash.com/photo-1550614000-4b9519e02a15?q=80&w=1000',
      description: newItem.description || 'Uma nova adição exclusiva à coleção H&R GRIFES.'
    };

    addCollectionItem('lookbook', itemToAdd);
    setIsAddModalOpen(false);
    setNewItem({ title: '', category: '', subtitle: '', image: '', description: '' });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processImageFile(file);
        setNewItem(prev => ({ ...prev, image: base64 }));
      } catch (error) {
        console.error("Error processing image", error);
        alert("Erro ao processar imagem.");
      }
    }
  };
  
  return (
    <div className="relative min-h-screen text-white selection:bg-[#D4AF37] selection:text-black cursor-auto md:cursor-none overflow-x-hidden">
      <CustomCursor />
      <FluidBackground />
      <AIChat />
      
      {/* Admin Logic */}
      <AdminToolbar />
      <AdminLogin isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-6 mix-blend-normal">
        <div className="font-heading text-xl md:text-2xl font-bold tracking-widest text-white cursor-default z-50">
           {content.marquee.brandName}
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-12 text-xs font-medium tracking-[0.2em] uppercase">
          {[
            { id: 'story', label: 'História' },
            { id: 'lookbook', label: 'Lookbook' },
            { id: 'rsvp', label: 'Lista VIP' }
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => scrollToSection(item.id)}
              className="hover:text-[#D4AF37] transition-colors text-white/80 cursor-pointer bg-transparent border-none"
              data-hover="true"
            >
              {item.label}
            </button>
          ))}
        </div>
        <button 
          onClick={() => scrollToSection('rsvp')}
          className="hidden md:inline-block border border-white/20 px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black transition-all duration-500 text-white cursor-pointer bg-transparent"
          data-hover="true"
        >
          Entrar na Lista VIP
        </button>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white z-50 relative w-10 h-10 flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
           {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-[#0F0F10]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-10 md:hidden"
          >
            {[
              { id: 'story', label: 'História' },
              { id: 'lookbook', label: 'Lookbook' },
              { id: 'rsvp', label: 'Lista VIP' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-4xl font-heading text-white hover:text-[#D4AF37] transition-colors uppercase bg-transparent border-none"
              >
                {item.label}
              </button>
            ))}
            
            <div className="absolute bottom-12 flex gap-8">
               <a href="#" className="text-white/50 hover:text-white transition-colors uppercase text-xs tracking-widest">Instagram</a>
               <a href="#" className="text-white/50 hover:text-white transition-colors uppercase text-xs tracking-widest">TikTok</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <header id="hero" className="relative h-[100svh] min-h-[600px] flex flex-col items-center justify-center overflow-hidden px-4">
        <motion.div 
          style={{ y, opacity }}
          className="z-10 text-center flex flex-col items-center w-full max-w-7xl pb-20"
        >
           {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center gap-4 text-xs md:text-sm font-sans text-[#D4AF37] tracking-[0.3em] uppercase mb-6"
          >
            <span className="w-8 h-px bg-[#D4AF37]"/>
            <EditableText 
              value={hero.subtitle} 
              onSave={(val) => updateContent('hero', 'subtitle', val)} 
            />
            <span className="w-8 h-px bg-[#D4AF37]"/>
          </motion.div>

          {/* Main Title */}
          <div className="relative w-full flex justify-center items-center">
             {isAdminMode ? (
               <div className="text-[12vw] md:text-[10vw] leading-[0.9] font-heading font-medium tracking-tight text-center text-white">
                 <EditableText 
                    value={hero.title} 
                    onSave={(val) => updateContent('hero', 'title', val)} 
                 />
               </div>
             ) : (
               <GradientText 
                text={hero.title} 
                as="h1" 
                className="text-[12vw] md:text-[10vw] leading-[0.9] font-heading font-medium tracking-tight text-center" 
               />
             )}
          </div>
          
          <motion.div
             initial={{ scaleX: 0 }}
             animate={{ scaleX: 1 }}
             transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
             className="w-24 h-1 bg-[#D4AF37] mt-8 mb-8"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-lg md:text-2xl font-light font-heading italic max-w-xl mx-auto text-white/80 leading-relaxed px-4 text-center"
          >
            <EditableText 
              value={hero.description} 
              onSave={(val) => updateContent('hero', 'description', val)} 
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-12 flex gap-4"
          >
            <button 
              onClick={() => scrollToSection('story')}
              className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors flex items-col items-center gap-2"
              data-hover="true"
            >
              <EditableText 
                value={hero.buttonText} 
                onSave={(val) => updateContent('hero', 'buttonText', val)} 
              />
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* Cinematic Video Overlay/Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-transparent to-[#0F0F10]/50 pointer-events-none" />
      </header>

      {/* NEW MARQUEE SECTION */}
      <Marquee />

      {/* STORY SECTION */}
      <section id="story" className="relative z-10 py-20 md:py-32 bg-[#0F0F10]">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 px-4 border-b border-white/5 pb-8">
             <h2 className="text-4xl md:text-7xl font-heading text-white leading-tight">
              <EditableText value={story.titlePrefix} onSave={(val) => updateContent('story', 'titlePrefix', val)} />
              <span className="text-[#D4AF37] italic ml-4">
                 <EditableText value={story.titleHighlight} onSave={(val) => updateContent('story', 'titleHighlight', val)} />
              </span>
            </h2>
            <div className="text-gray-400 max-w-md text-sm md:text-base mt-4 md:mt-0 font-light">
              <EditableText 
                 value={story.description} 
                 onSave={(val) => updateContent('story', 'description', val)} 
                 multiline
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-0">
            {story.items.map((item, idx) => (
              <div key={item.id} className={`${idx !== 0 ? 'md:border-l border-white/5' : ''}`}>
                <ArtistCard artist={item} section="story" onClick={() => setSelectedItem(item)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOOKBOOK SECTION */}
      <section id="lookbook" className="relative z-10 py-20 md:py-32 bg-[#141415]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* Text Side */}
            <div className="lg:col-span-4 order-1 lg:sticky lg:top-32">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#8A2BE2] text-xs font-bold tracking-widest uppercase block">
                  <EditableText value={lookbook.label} onSave={(val) => updateContent('lookbook', 'label', val)} />
                </span>
                
                {/* Add Item Button (Only visible if Admin) */}
                {isAdminMode && (
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full hover:bg-[#D4AF37] hover:text-black transition-all"
                    data-hover="true"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar Look
                  </button>
                )}
              </div>

              <h2 className="text-4xl md:text-6xl font-heading mb-8 text-white">
                <EditableText value={lookbook.titleLine1} onSave={(val) => updateContent('lookbook', 'titleLine1', val)} />
                <br/> 
                <span className="italic font-light text-white/50">
                  <EditableText value={lookbook.titleLine2} onSave={(val) => updateContent('lookbook', 'titleLine2', val)} />
                </span>
              </h2>
              <div className="text-gray-400 mb-8 font-light leading-relaxed">
                 <EditableText value={lookbook.description} onSave={(val) => updateContent('lookbook', 'description', val)} multiline />
              </div>
              
              <div className="space-y-8">
                {/* Note: Features could be made dynamic array too, but for simplicity kept static structure for now */}
                {lookbook.features.map((feature, i) => (
                  <div key={i} className="pl-6 border-l border-[#D4AF37]">
                    <h4 className="text-lg font-heading text-white mb-1">
                      <EditableText 
                        value={feature.title} 
                        onSave={(val) => {
                          const newFeatures = [...lookbook.features];
                          newFeatures[i].title = val;
                          updateContent('lookbook', 'features', newFeatures);
                        }} 
                      />
                    </h4>
                    <p className="text-sm text-gray-500">
                      <EditableText 
                        value={feature.desc} 
                        onSave={(val) => {
                          const newFeatures = [...lookbook.features];
                          newFeatures[i].desc = val;
                          updateContent('lookbook', 'features', newFeatures);
                        }} 
                      />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery Side */}
            <div className="lg:col-span-8 order-2 grid grid-cols-1 md:grid-cols-2 gap-6">
               <AnimatePresence mode='popLayout'>
                 {lookbook.items.map((look, i) => (
                   <motion.div 
                     key={look.id}
                     layout
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className={`relative group cursor-pointer overflow-hidden ${i % 2 !== 0 ? 'md:mt-12' : ''}`}
                     whileHover={{ y: -10 }}
                   >
                     <div 
                        className="aspect-[3/4] bg-gray-900 overflow-hidden relative"
                        onClick={() => !isAdminMode && setSelectedItem(look)}
                     >
                       <EditableImage 
                          src={look.image} 
                          alt={look.title}
                          onSave={(val) => updateContent('lookbook', 'items', lookbook.items.map(item => item.id === look.id ? {...item, image: val} : item))}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        />
                     </div>
                     <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-black to-transparent z-10">
                       <p className="text-[#D4AF37] text-xs uppercase tracking-widest mb-1">
                          <EditableText 
                             value={look.category} 
                             onSave={(val) => updateContent('lookbook', 'items', lookbook.items.map(item => item.id === look.id ? {...item, category: val} : item))}
                          />
                       </p>
                       <h3 className="text-xl font-heading text-white">
                         <EditableText 
                             value={look.title} 
                             onSave={(val) => updateContent('lookbook', 'items', lookbook.items.map(item => item.id === look.id ? {...item, title: val} : item))}
                          />
                       </h3>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP SECTION (Was Tickets) */}
      <section id="rsvp" className="relative z-10 py-20 md:py-32 px-4 md:px-6 bg-[#0F0F10]">
        <div className="max-w-4xl mx-auto relative">
          {/* Decorative Border */}
          <div className="absolute inset-0 border border-[#D4AF37]/20 pointer-events-none transform translate-x-4 translate-y-4 hidden md:block" />
          
          <div className="bg-[#1a1a1a] p-8 md:p-16 relative shadow-2xl">
            <div className="text-center mb-12">
               <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#D4AF37] mb-3 block">
                 <EditableText value={rsvp.label} onSave={(val) => updateContent('rsvp', 'label', val)} />
               </span>
               <h2 className="text-4xl md:text-5xl font-heading text-white mb-6">
                 <EditableText value={rsvp.title} onSave={(val) => updateContent('rsvp', 'title', val)} />
               </h2>
               <div className="text-gray-400 font-light max-w-lg mx-auto">
                 <EditableText value={rsvp.description} onSave={(val) => updateContent('rsvp', 'description', val)} multiline />
               </div>
            </div>
            
            {rsvpState === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <CheckCircle className="w-16 h-16 text-[#D4AF37] mb-6" />
                <h3 className="text-2xl font-heading text-white mb-2">
                   <EditableText value={rsvp.successTitle} onSave={(val) => updateContent('rsvp', 'successTitle', val)} />
                </h3>
                <p className="text-gray-400">
                   <EditableText value={rsvp.successMessage} onSave={(val) => updateContent('rsvp', 'successMessage', val)} />
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-6 max-w-md mx-auto">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 p-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="Seu nome"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Endereço de E-mail</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 p-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-gray-500">Tamanho Preferido (Para Brindes)</label>
                  <div className="flex gap-2">
                    {['PP', 'P', 'M', 'G', 'GG'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({...formData, size})}
                        className={`flex-1 py-3 text-sm border transition-colors ${formData.size === size ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={rsvpState === 'submitting'}
                  className="w-full bg-white text-black py-4 font-bold tracking-widest uppercase hover:bg-[#D4AF37] transition-colors disabled:opacity-50 mt-8"
                  data-hover="true"
                >
                  {rsvpState === 'submitting' ? 'Processando...' : 'Confirmar Presença'}
                </button>
                
                <p className="text-xs text-center text-gray-600 mt-4">
                  Ao se registrar, você concorda em receber atualizações sobre a H&R GRIFES.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-16 bg-[#0F0F10]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div>
             <div className="font-heading text-3xl font-bold tracking-tight mb-6 text-white">{content.marquee.brandName}</div>
             <div className="flex flex-col gap-2 text-sm text-gray-500 font-light">
               <span>&copy; {content.marquee.year} {content.marquee.brandName}. Todos os direitos reservados.</span>
               <span>{content.hero.description.replace(/"/g, '')}</span>
               {/* Admin Link */}
               <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="text-left text-gray-800 hover:text-gray-600 transition-colors mt-4 text-[10px] uppercase tracking-widest flex items-center gap-1"
               >
                 <Lock className="w-3 h-3" />
                 Área Administrativa
               </button>
             </div>
          </div>
          
          <div className="flex gap-8">
            <a href="#" className="text-gray-500 hover:text-[#D4AF37] transition-colors"><Instagram /></a>
            <a href="#" className="text-gray-500 hover:text-[#D4AF37] transition-colors"><Hash /></a>
            <a href="#" className="text-gray-500 hover:text-[#D4AF37] transition-colors"><ShoppingBag /></a>
          </div>
        </div>
      </footer>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 20 }}
               className="relative w-full max-w-lg bg-[#141415] border border-[#D4AF37]/30 shadow-2xl p-8"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                data-hover="true"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-heading text-2xl text-white mb-6 flex items-center gap-2">
                 <Plus className="w-5 h-5 text-[#D4AF37]" />
                 Adicionar Nova Peça
              </h3>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">Título</label>
                  <input 
                    type="text" 
                    value={newItem.title}
                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                    placeholder="ex: Jaqueta Velvet Night"
                    className="w-full bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">Categoria</label>
                    <input 
                      type="text" 
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                      placeholder="ex: Look 04"
                      className="w-full bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">Subtítulo</label>
                    <input 
                      type="text" 
                      value={newItem.subtitle}
                      onChange={e => setNewItem({...newItem, subtitle: e.target.value})}
                      placeholder="ex: Edição Limitada"
                      className="w-full bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">Imagem</label>
                  <div className="flex gap-2 mb-2">
                     <button 
                       type="button"
                       onClick={() => fileInputRef.current?.click()}
                       className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 p-3 text-sm text-white transition-colors flex items-center justify-center gap-2"
                     >
                       <Upload className="w-4 h-4 text-[#D4AF37]" />
                       Upload do PC
                     </button>
                     <input 
                       type="file"
                       ref={fileInputRef}
                       className="hidden"
                       accept="image/*"
                       onChange={handleFileSelect}
                     />
                  </div>
                  
                  <div className="flex gap-2">
                     <input 
                      type="text" 
                      value={newItem.image}
                      onChange={e => setNewItem({...newItem, image: e.target.value})}
                      placeholder="Ou cole URL da imagem..."
                      className="flex-1 bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                     <div className="p-3 bg-white/5 border border-white/10 flex items-center justify-center">
                       <LinkIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">Descrição</label>
                  <textarea 
                    value={newItem.description}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Detalhes sobre o tecido, corte e inspiração..."
                    rows={3}
                    className="w-full bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={!newItem.title || !newItem.subtitle}
                  className="w-full bg-[#D4AF37] text-black py-3 font-bold tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-50 mt-4"
                  data-hover="true"
                >
                  Adicionar à Coleção
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl bg-[#141415] border border-white/10 flex flex-col md:flex-row shadow-2xl overflow-hidden max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-white hover:text-black transition-colors"
                data-hover="true"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Image Side */}
              <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-black">
                <EditableImage
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  onSave={(val) => {
                     // Determine section based on ID presence
                     const section = lookbook.items.find(i => i.id === selectedItem.id) ? 'lookbook' : 'story';
                     updateContent(section, 'items', content[section].items.map(i => i.id === selectedItem.id ? {...i, image: val} : i));
                     setSelectedItem({...selectedItem, image: val});
                  }}
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
              </div>

              {/* Content Side */}
              <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-[#141415] overflow-y-auto">
                  <span className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase mb-4">{selectedItem.category}</span>
                  
                  <h3 className="text-4xl md:text-5xl font-heading text-white mb-6">
                    <EditableText 
                      value={selectedItem.title}
                      onSave={(val) => {
                         const section = lookbook.items.find(i => i.id === selectedItem.id) ? 'lookbook' : 'story';
                         updateContent(section, 'items', content[section].items.map(i => i.id === selectedItem.id ? {...i, title: val} : i));
                         setSelectedItem({...selectedItem, title: val});
                      }}
                    />
                  </h3>
                  
                  <div className="h-px w-12 bg-white/20 mb-8" />
                  
                  <h4 className="text-lg text-white mb-4 italic font-heading">
                     <EditableText 
                      value={selectedItem.subtitle}
                      onSave={(val) => {
                         const section = lookbook.items.find(i => i.id === selectedItem.id) ? 'lookbook' : 'story';
                         updateContent(section, 'items', content[section].items.map(i => i.id === selectedItem.id ? {...i, subtitle: val} : i));
                         setSelectedItem({...selectedItem, subtitle: val});
                      }}
                    />
                  </h4>
                  
                  <div className="text-gray-400 leading-relaxed font-light mb-12">
                     <EditableText 
                      value={selectedItem.description}
                      onSave={(val) => {
                         const section = lookbook.items.find(i => i.id === selectedItem.id) ? 'lookbook' : 'story';
                         updateContent(section, 'items', content[section].items.map(i => i.id === selectedItem.id ? {...i, description: val} : i));
                         setSelectedItem({...selectedItem, description: val});
                      }}
                      multiline
                    />
                  </div>

                  <button 
                    onClick={() => { setSelectedItem(null); scrollToSection('rsvp'); }}
                    className="w-fit border-b border-[#D4AF37] pb-1 text-[#D4AF37] hover:text-white hover:border-white transition-colors uppercase text-xs tracking-widest"
                  >
                    Consultar sobre esta peça
                  </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;