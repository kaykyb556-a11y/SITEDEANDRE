/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, Reorder } from 'framer-motion';
import { Menu, X, ChevronLeft, ChevronRight, ArrowRight, Instagram, Hash, ShoppingBag, CheckCircle, Plus, Upload, Link as LinkIcon, Lock, Trash2, CreditCard, Grid, Home, Star, GripVertical, Move, Tag } from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import GradientText from './components/GlitchText';
import CustomCursor from './components/CustomCursor';
import ArtistCard from './components/ArtistCard';
import Marquee from './components/Marquee';
import { useContent } from './context/ContentContext';
import { EditableText, EditableImage, AdminToolbar } from './components/Editable';
import { CollectionItem } from './types';
import { processImageFile } from './utils/image';
import AdminLogin from './components/AdminLogin';

const App: React.FC = () => {
  const { 
    content, 
    updateContent, 
    isAdminMode, 
    addCollectionItem, 
    cart, 
    addToCart, 
    removeFromCart, 
    clearCart,
    isCartOpen,
    setIsCartOpen,
    reorderItems
  } = useContent();
  const { hero, story, lookbook, rsvp, theme } = content;

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'shop'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modal & Selection State
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // New Item Form State
  const [newItem, setNewItem] = useState({
    title: '',
    category: '',
    subtitle: '',
    image: '',
    description: ''
  });
  const [targetSection, setTargetSection] = useState<'lookbook' | 'story'>('lookbook');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Order Form State
  const [orderState, setOrderState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  // Reset scroll when changing views
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem && !isAddModalOpen && !isCartOpen) return;
      if (e.key === 'Escape') {
        setSelectedItem(null);
        setIsAddModalOpen(false);
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, isAddModalOpen, isCartOpen]);

  // Update CSS Variables based on theme
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme?.primary || '#D4AF37');
    root.style.setProperty('--bg-color', theme?.background || '#0F0F10');
    // We can add more vars as needed
  }, [theme]);

  const scrollToSection = (id: string) => {
    setCurrentView('home'); // Ensure we are on home view
    setMobileMenuOpen(false);
    
    // Small delay to allow render if switching from shop
    setTimeout(() => {
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
    }, 100);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Sua sacola está vazia.");
      return;
    }
    setOrderState('submitting');

    // WHATSAPP INTEGRATION
    const PHONE_NUMBER = "559885356924"; // Número atualizado
    
    let message = `*NOVO PEDIDO - H&R GRIFES*\n\n`;
    message += `*Cliente:* ${formData.name}\n`;
    message += `*Contato:* ${formData.phone}\n`;
    message += `*Email:* ${formData.email}\n`;
    message += `*Endereço:* ${formData.address}\n\n`;
    message += `*ITENS DO PEDIDO:*\n`;
    
    cart.forEach((item, index) => {
      message += `--------------------------------\n`;
      message += `📦 *Item ${index + 1}:* ${item.title}\n`;
      message += `🔖 *Ref:* ${item.category}\n`;
      
      // Adiciona link da foto se for uma URL web (não base64) para evitar erros de limite de URL
      if (item.image && item.image.startsWith('http')) {
         message += `📸 *Foto:* ${item.image}\n`;
      }
    });

    message += `--------------------------------\n`;
    message += `\n💰 *Total de Itens:* ${cart.length}`;

    const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    setOrderState('success');
    clearCart();
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.subtitle) return;

    const itemToAdd: CollectionItem = {
      id: Date.now().toString(),
      title: newItem.title,
      category: newItem.category || (targetSection === 'lookbook' ? `Look 0${lookbook.items.length + 1}` : 'Destaque'),
      subtitle: newItem.subtitle,
      image: newItem.image || 'https://images.unsplash.com/photo-1550614000-4b9519e02a15?q=80&w=1000',
      description: newItem.description || 'Uma nova adição exclusiva à coleção H&R GRIFES.'
    };

    addCollectionItem(targetSection, itemToAdd);
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

  // Combine items for Shop View
  const allShopItems = [...story.items, ...lookbook.items];
  
  return (
    <div className="relative min-h-screen text-white selection:bg-[var(--primary)] selection:text-black cursor-auto md:cursor-none overflow-x-hidden bg-[var(--bg-color)] transition-colors duration-700">
      <CustomCursor />
      {currentView === 'home' && <FluidBackground />}
      
      {/* Admin Logic */}
      <AdminToolbar />
      <AdminLogin isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-6 bg-gradient-to-b from-[var(--bg-color)] to-transparent backdrop-blur-[2px]">
        <div 
          className="font-heading text-xl md:text-2xl font-bold tracking-widest text-white cursor-pointer z-50 hover:text-[var(--primary)] transition-colors"
          onClick={() => setCurrentView('home')}
        >
           {content.marquee.brandName}
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-12 text-xs font-medium tracking-[0.2em] uppercase items-center">
          <button 
            onClick={() => setCurrentView('home')}
            className={`hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none ${currentView === 'home' ? 'text-[var(--primary)]' : 'text-white/80'}`}
            data-hover="true"
          >
            Home
          </button>
          
          <button 
            onClick={() => setCurrentView('shop')}
            className={`hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none flex items-center gap-2 ${currentView === 'shop' ? 'text-[var(--primary)]' : 'text-white/80'}`}
            data-hover="true"
          >
            <Grid className="w-3 h-3" /> Loja Online
          </button>

          {/* Cart Icon - Desktop */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:text-[var(--primary)] transition-colors border border-white/20 rounded-full"
            data-hover="true"
          >
            <ShoppingBag className="w-4 h-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu Toggle & Cart */}
        <div className="flex items-center gap-4 md:hidden z-50">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative text-white"
          >
            <ShoppingBag className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
          
          <button 
            className="text-white relative w-10 h-10 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
             {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-[var(--bg-color)]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-10 md:hidden"
          >
            <button
              onClick={() => { setMobileMenuOpen(false); setCurrentView('home'); }}
              className={`text-3xl font-heading hover:text-[var(--primary)] transition-colors uppercase bg-transparent border-none ${currentView === 'home' ? 'text-[var(--primary)]' : 'text-white'}`}
            >
              Home
            </button>
            
            <button
              onClick={() => { setMobileMenuOpen(false); setCurrentView('shop'); }}
              className={`text-3xl font-heading hover:text-[var(--primary)] transition-colors uppercase bg-transparent border-none ${currentView === 'shop' ? 'text-[var(--primary)]' : 'text-white'}`}
            >
              Loja / Catálogo
            </button>
            
            <button
               onClick={() => { setMobileMenuOpen(false); setIsCartOpen(true); }}
               className="text-xl font-heading text-[var(--primary)] uppercase tracking-widest mt-4 flex items-center gap-2 border border-[var(--primary)] px-6 py-3 rounded-full"
            >
               <ShoppingBag className="w-5 h-5" /> Ver Sacola ({cart.length})
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW CONTROLLER */}
      {currentView === 'home' ? (
        <>
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
                className="flex items-center gap-4 text-xs md:text-sm font-sans text-[var(--primary)] tracking-[0.3em] uppercase mb-6"
              >
                <span className="w-8 h-px bg-[var(--primary)]"/>
                <EditableText 
                  value={hero.subtitle} 
                  onSave={(val) => updateContent('hero', 'subtitle', val)} 
                />
                <span className="w-8 h-px bg-[var(--primary)]"/>
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
                 className="w-24 h-1 bg-[var(--primary)] mt-8 mb-8"
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
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-transparent to-[var(--bg-color)]/50 pointer-events-none" />
          </header>

          <Marquee />

          {/* STORY SECTION */}
          <section id="story" className="relative z-10 py-12 md:py-32 bg-[var(--bg-color)]">
            <div className="max-w-[1800px] mx-auto px-4 md:px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-24 px-4 border-b border-white/5 pb-8">
                 <h2 className="text-4xl md:text-7xl font-heading text-white leading-tight">
                  <EditableText value={story.titlePrefix} onSave={(val) => updateContent('story', 'titlePrefix', val)} />
                  <span className="text-[var(--primary)] italic ml-4">
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

              {/* Story Grid with Reorder Capability */}
              {isAdminMode ? (
                <Reorder.Group 
                  axis="y" 
                  values={story.items} 
                  onReorder={(newOrder) => reorderItems('story', newOrder)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0"
                  as="div"
                >
                  {story.items.map((item, idx) => (
                    <Reorder.Item 
                      key={item.id} 
                      value={item}
                      className={`relative ${idx !== 0 ? 'md:border-l border-white/5' : ''}`}
                    >
                       {/* Enhanced Drag Handle */}
                      <div className="absolute top-2 left-2 z-30 bg-[var(--primary)] text-black p-3 rounded-lg cursor-grab active:cursor-grabbing shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform border border-black/20">
                        <Move className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest hidden md:block">Mover</span>
                      </div>
                      <ArtistCard artist={item} section="story" onClick={() => setSelectedItem(item)} />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0">
                  {story.items.map((item, idx) => (
                    <div key={item.id} className={`${idx !== 0 ? 'md:border-l border-white/5' : ''}`}>
                      <ArtistCard artist={item} section="story" onClick={() => setSelectedItem(item)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* LOOKBOOK SECTION */}
          <section id="lookbook" className="relative z-10 py-12 md:py-32 bg-[var(--bg-color)] brightness-110">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                
                {/* Text Side */}
                <div className="lg:col-span-4 order-1 lg:sticky lg:top-32">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#8A2BE2] text-xs font-bold tracking-widest uppercase block">
                      <EditableText value={lookbook.label} onSave={(val) => updateContent('lookbook', 'label', val)} />
                    </span>
                    {isAdminMode && (
                      <button 
                        onClick={() => {
                          setTargetSection('lookbook');
                          setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-[var(--primary)] border border-[var(--primary)]/30 px-3 py-1 rounded-full hover:bg-[var(--primary)] hover:text-black transition-all"
                        data-hover="true"
                      >
                        <Plus className="w-3 h-3" /> Adicionar Look
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
                    {lookbook.features.map((feature, i) => (
                      <div key={i} className="pl-6 border-l border-[var(--primary)]">
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
                <div className="lg:col-span-8 order-2">
                   {isAdminMode ? (
                      <Reorder.Group 
                        axis="y"
                        values={lookbook.items}
                        onReorder={(newOrder) => reorderItems('lookbook', newOrder)}
                        className="grid grid-cols-2 gap-4 md:gap-6"
                        as="div"
                      >
                        {lookbook.items.map((look, i) => (
                           <Reorder.Item 
                             key={look.id}
                             value={look}
                             className={`relative group cursor-pointer overflow-hidden ${i % 2 !== 0 ? 'md:mt-12' : ''}`}
                           >
                             {/* Enhanced Drag Handle */}
                             <div className="absolute top-2 left-2 z-30 bg-[var(--primary)] text-black p-3 rounded-lg cursor-grab active:cursor-grabbing shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform border border-black/20">
                                <Move className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest hidden md:block">Mover</span>
                              </div>

                             <div 
                                className="aspect-[3/4] bg-gray-900 overflow-hidden relative"
                             >
                               <EditableImage 
                                  src={look.image} 
                                  alt={look.title}
                                  onSave={(val) => updateContent('lookbook', 'items', lookbook.items.map(item => item.id === look.id ? {...item, image: val} : item))}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                />
                             </div>
                             <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full bg-gradient-to-t from-black to-transparent z-10">
                               <p className="text-[var(--primary)] text-[10px] md:text-xs uppercase tracking-widest mb-1">
                                  <EditableText 
                                     value={look.category} 
                                     onSave={(val) => updateContent('lookbook', 'items', lookbook.items.map(item => item.id === look.id ? {...item, category: val} : item))}
                                  />
                               </p>
                               <h3 className="text-lg md:text-xl font-heading text-white">
                                 <EditableText 
                                     value={look.title} 
                                     onSave={(val) => updateContent('lookbook', 'items', lookbook.items.map(item => item.id === look.id ? {...item, title: val} : item))}
                                  />
                               </h3>
                             </div>
                           </Reorder.Item>
                        ))}
                      </Reorder.Group>
                   ) : (
                     <div className="grid grid-cols-2 gap-4 md:gap-6">
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
                             <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full bg-gradient-to-t from-black to-transparent z-10">
                               <p className="text-[var(--primary)] text-[10px] md:text-xs uppercase tracking-widest mb-1">
                                  <EditableText 
                                     value={look.category} 
                                     onSave={(val) => updateContent('lookbook', 'items', lookbook.items.map(item => item.id === look.id ? {...item, category: val} : item))}
                                  />
                               </p>
                               <h3 className="text-lg md:text-xl font-heading text-white">
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
                   )}
                </div>
              </div>
            </div>
          </section>

          {/* RSVP/SHOP LINK SECTION */}
          <section id="rsvp" className="relative z-10 py-12 md:py-32 px-4 md:px-6 bg-[var(--bg-color)]">
            <div className="max-w-4xl mx-auto relative">
              <div className="absolute inset-0 border border-[var(--primary)]/20 pointer-events-none transform translate-x-4 translate-y-4 hidden md:block" />
              
              <div className="bg-[#1a1a1a] p-8 md:p-16 relative shadow-2xl text-center">
                <div className="mb-8">
                   <span className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--primary)] mb-3 block">
                     <EditableText value={rsvp.label} onSave={(val) => updateContent('rsvp', 'label', val)} />
                   </span>
                   <h2 className="text-4xl md:text-5xl font-heading text-white mb-6">
                     <EditableText value={rsvp.title} onSave={(val) => updateContent('rsvp', 'title', val)} />
                   </h2>
                   <div className="text-gray-400 font-light max-w-lg mx-auto mb-8">
                     <EditableText value={rsvp.description} onSave={(val) => updateContent('rsvp', 'description', val)} multiline />
                   </div>
                   
                   <div className="flex flex-col md:flex-row gap-4 justify-center">
                     <button 
                        onClick={() => setCurrentView('shop')}
                        className="bg-white text-black px-8 py-4 font-bold tracking-widest uppercase hover:bg-[var(--primary)] transition-colors"
                        data-hover="true"
                     >
                        Ir para Loja Online
                     </button>
                     <button 
                        onClick={() => setIsCartOpen(true)}
                        className="bg-transparent border border-white/20 text-white px-8 py-4 font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
                        data-hover="true"
                     >
                        Ver Sacola
                     </button>
                   </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* ======================== SHOP / CATALOG VIEW ======================== */
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="pt-32 pb-20 px-4 md:px-12 max-w-[1920px] mx-auto min-h-screen"
        >
          <div className="flex flex-col items-center mb-16">
            <h1 className="text-4xl md:text-6xl font-heading text-white mb-4">Catálogo Completo</h1>
            <p className="text-gray-400 max-w-xl text-center font-light mb-8">
              Explore todas as peças exclusivas da coleção H&R GRIFES em um só lugar.
            </p>
            {isAdminMode && (
              <button
                onClick={() => {
                  setTargetSection('lookbook');
                  setIsAddModalOpen(true);
                }}
                className="mt-4 flex items-center gap-2 bg-[var(--primary)] text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-colors"
              >
                <Plus className="w-5 h-5" />
                Adicionar Produto
              </button>
            )}
            <div className="w-24 h-1 bg-[var(--primary)] mt-8" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {allShopItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group relative bg-[#141415] border border-white/5 overflow-hidden"
              >
                <div 
                  className="aspect-[3/4] overflow-hidden relative cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Quick Add Overlay - UPDATED STYLE */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="bg-black/80 backdrop-blur-md border border-[var(--primary)] text-white hover:bg-[var(--primary)] hover:text-black px-6 py-3 uppercase text-xs font-bold tracking-widest transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-3 h-3" /> Adicionar
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="text-[var(--primary)] text-[10px] uppercase tracking-widest mb-1">
                    {item.category}
                  </div>
                  <h3 className="text-white font-heading text-lg mb-2 truncate">{item.title}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2 font-light">{item.subtitle}</p>
                </div>
              </motion.div>
            ))}
            
            {/* Show message if no items */}
            {allShopItems.length === 0 && (
               <div className="col-span-full py-20 text-center text-gray-500">
                 Nenhum produto disponível no momento.
               </div>
            )}
          </div>
        </motion.div>
      )}

      {/* FOOTER (Shared) */}
      <footer className="relative z-10 border-t border-white/5 py-16 bg-[var(--bg-color)]">
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
            <a href="#" className="text-gray-500 hover:text-[var(--primary)] transition-colors"><Instagram /></a>
            <a href="#" className="text-gray-500 hover:text-[var(--primary)] transition-colors"><Hash /></a>
            <a href="#" className="text-gray-500 hover:text-[var(--primary)] transition-colors"><ShoppingBag /></a>
          </div>
        </div>
      </footer>
      
      {/* CART MODAL */}
      <AnimatePresence>
        {isCartOpen && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex justify-end"
             onClick={() => setIsCartOpen(false)}
           >
             <motion.div
               initial={{ x: "100%" }}
               animate={{ x: 0 }}
               exit={{ x: "100%" }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               onClick={(e) => e.stopPropagation()}
               className="w-full md:w-[500px] bg-[#141415] h-full shadow-2xl border-l border-[var(--primary)]/20 flex flex-col"
             >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[var(--bg-color)]">
                  <h2 className="text-2xl font-heading text-white flex items-center gap-3">
                    <ShoppingBag className="text-[var(--primary)]" />
                    Sua Sacola
                  </h2>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white">
                    <X />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                      <ShoppingBag className="w-16 h-16 opacity-20" />
                      <p className="uppercase tracking-widest text-sm">Sua sacola está vazia</p>
                      <button 
                        onClick={() => { setIsCartOpen(false); setCurrentView('shop'); }}
                        className="text-[var(--primary)] border-b border-[var(--primary)] pb-1 hover:text-white hover:border-white transition-colors text-sm"
                      >
                        Ir para a Loja
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cart.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex gap-4 bg-white/5 p-4 rounded-lg border border-white/5">
                          <img src={item.image} alt={item.title} className="w-20 h-24 object-cover rounded bg-gray-800" />
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-white font-heading text-lg">{item.title}</h4>
                              <p className="text-xs text-[var(--primary)] uppercase tracking-widest">{item.category}</p>
                            </div>
                            <button 
                              onClick={() => removeFromCart(index)}
                              className="text-gray-500 hover:text-red-500 text-xs flex items-center gap-1 self-start transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Remover
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Order Form inside Cart */}
                      <div className="mt-8 pt-8 border-t border-white/10">
                        <h3 className="text-xl font-heading text-white mb-6">Finalizar no WhatsApp</h3>
                        
                        {orderState === 'success' ? (
                           <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg text-center">
                              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                              <h4 className="text-white font-bold mb-2">Pedido Iniciado!</h4>
                              <p className="text-sm text-gray-400">O WhatsApp deve ter aberto com o seu pedido. Caso contrário, verifique se o bloqueador de pop-ups está ativo.</p>
                              <button 
                                onClick={() => setIsCartOpen(false)}
                                className="mt-4 text-green-500 hover:text-white text-sm underline"
                              >
                                Fechar
                              </button>
                           </div>
                        ) : (
                          <form onSubmit={handleOrderSubmit} className="space-y-4">
                            <input 
                              type="text" 
                              required
                              placeholder="Nome Completo"
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                              className="w-full bg-black/30 border border-white/10 p-3 text-white focus:outline-none focus:border-[var(--primary)] rounded"
                            />
                            <input 
                              type="email" 
                              placeholder="E-mail (Opcional)"
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                              className="w-full bg-black/30 border border-white/10 p-3 text-white focus:outline-none focus:border-[var(--primary)] rounded"
                            />
                            <input 
                              type="tel" 
                              required
                              placeholder="Seu WhatsApp/Telefone"
                              value={formData.phone}
                              onChange={e => setFormData({...formData, phone: e.target.value})}
                              className="w-full bg-black/30 border border-white/10 p-3 text-white focus:outline-none focus:border-[var(--primary)] rounded"
                            />
                            <textarea
                              placeholder="Endereço de Entrega"
                              required
                              rows={2}
                              value={formData.address}
                              onChange={e => setFormData({...formData, address: e.target.value})}
                              className="w-full bg-black/30 border border-white/10 p-3 text-white focus:outline-none focus:border-[var(--primary)] rounded resize-none"
                            />
                            
                            <button 
                              type="submit"
                              disabled={orderState === 'submitting'}
                              className="w-full bg-[#25D366] text-black py-4 font-bold tracking-widest uppercase hover:bg-[#128C7E] hover:text-white transition-colors flex justify-center items-center gap-2 mt-4 rounded-lg"
                            >
                              {orderState === 'submitting' ? 'Abrindo WhatsApp...' : (
                                <>
                                  <CreditCard className="w-4 h-4" /> Enviar para WhatsApp
                                </>
                              )}
                            </button>
                            <p className="text-[10px] text-gray-500 text-center mt-2">
                              Você será redirecionado para o WhatsApp para confirmar o pedido.
                            </p>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </div>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

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
               className="relative w-full max-w-lg bg-[#141415] border border-[var(--primary)]/30 shadow-2xl p-8"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                data-hover="true"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-heading text-2xl text-white mb-6 flex items-center gap-2">
                 <Plus className="w-5 h-5 text-[var(--primary)]" />
                 Adicionar Nova Peça
              </h3>

              <form onSubmit={handleAddItem} className="space-y-4">
                
                {/* Section Selector */}
                <div>
                   <label className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">Seção de Destino</label>
                   <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                           type="radio" 
                           name="targetSection" 
                           checked={targetSection === 'lookbook'} 
                           onChange={() => setTargetSection('lookbook')}
                           className="accent-[var(--primary)]"
                        />
                        <span className="text-sm text-white">Catálogo / Loja</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                           type="radio" 
                           name="targetSection" 
                           checked={targetSection === 'story'} 
                           onChange={() => setTargetSection('story')}
                           className="accent-[var(--primary)]"
                        />
                        <span className="text-sm text-white">Destaques (Home)</span>
                      </label>
                   </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">Título</label>
                  <input 
                    type="text" 
                    value={newItem.title}
                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                    placeholder="ex: Jaqueta Velvet Night"
                    className="w-full bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
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
                      className="w-full bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">Subtítulo</label>
                    <input 
                      type="text" 
                      value={newItem.subtitle}
                      onChange={e => setNewItem({...newItem, subtitle: e.target.value})}
                      placeholder="ex: Edição Limitada"
                      className="w-full bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
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
                       <Upload className="w-4 h-4 text-[var(--primary)]" />
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
                      className="flex-1 bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
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
                    className="w-full bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={!newItem.title || !newItem.subtitle}
                  className="w-full bg-[var(--primary)] text-black py-3 font-bold tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-50 mt-4"
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
                  <span className="text-[var(--primary)] text-xs font-bold tracking-[0.2em] uppercase mb-4">{selectedItem.category}</span>
                  
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

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      addToCart(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="group relative w-full overflow-hidden bg-[var(--primary)] text-black py-5 font-bold tracking-[0.2em] uppercase shadow-lg shadow-[var(--primary)]/20"
                  >
                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                      initial={{ x: '-150%' }}
                      whileHover={{ x: '150%' }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    />
                    
                    <span className="relative z-10 flex items-center justify-center gap-3">
                       <ShoppingBag className="w-5 h-5" /> Adicionar à Sacola
                    </span>
                  </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;