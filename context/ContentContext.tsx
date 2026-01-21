/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteContent, CollectionItem } from '../types';

// Conteúdo Padrão (Default)
const DEFAULT_CONTENT: SiteContent = {
  theme: {
    primary: '#D4AF37',
    background: '#0F0F10',
    secondary: '#8A2BE2'
  },
  hero: {
    subtitle: 'Drop Imersivo',
    title: 'H&R GRIFES',
    description: '"Moda que te envolve"',
    buttonText: 'Descobrir'
  },
  marquee: {
    brandName: 'H&R GRIFES',
    text1: 'Drop Imersivo',
    text2: 'Moda que te envolve',
    year: '2025'
  },
  story: {
    titlePrefix: 'A',
    titleHighlight: 'Narrativa',
    description: 'Explore os elementos que definem nossa coleção mais recente. Cada fio tem um propósito, cada corte conta uma história.',
    items: [
      { 
        id: '1', 
        title: 'Narrativa Textural', 
        category: 'Materiais', 
        subtitle: 'Tecido Silk-flow com microplissados.',
        image: 'https://images.unsplash.com/photo-1528459061998-56fd57ad86e3?q=80&w=1000&auto=format&fit=crop',
        description: 'Nossos tecidos são escolhidos para contar uma história de resiliência e elegância. Esta temporada apresenta seda tecnológica reciclada que se move como metal líquido.',
        price: '299,90'
      },
      { 
        id: '2', 
        title: 'Cortes Arquitetônicos', 
        category: 'Silhueta', 
        subtitle: 'Ombros estruturados encontrando drapeados fluidos.', 
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
        description: 'O corpo é a tela. Usamos alfaiataria arquitetônica afiada para emoldurar a forma humana, criando silhuetas de poder para a era moderna.',
        price: '450,00'
      },
      { 
        id: '3', 
        title: 'Cor Viva', 
        category: 'Paleta', 
        subtitle: 'Violetas Profundos e Ouro Polido.',
        image: 'https://images.unsplash.com/photo-1550614000-4b9519e02a15?q=80&w=1000&auto=format&fit=crop',
        description: 'Cores que respiram. Nossa paleta é inspirada na transição do crepúsculo para a noite elétrica da cidade.',
        price: '189,90'
      },
    ]
  },
  lookbook: {
    label: 'Lookbook 2025',
    titleLine1: 'Elegância',
    titleLine2: 'Urbana',
    description: 'H&R GRIFES traz uma coleção desenhada para os holofotes. Da sala de reuniões à abertura da galeria, estas peças adaptam-se à sua narrativa.',
    features: [
      { title: 'Seda Sustentável', desc: 'Fonte ética, incrivelmente macia.' },
      { title: 'Ajuste Sob Medida', desc: 'Serviços sob medida disponíveis.' },
    ],
    items: [
      {
        id: '4',
        title: 'O Blazer Noir',
        category: 'Look 01',
        subtitle: 'Caimento oversized com detalhes em metais dourados.',
        image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1000&auto=format&fit=crop',
        description: 'Uma peça essencial redefinida. O Blazer Noir apresenta ombro caído e botões de fecho dourados assinatura H&R.',
        price: '580,00'
      },
      {
        id: '5',
        title: 'Vestido Etéreo',
        category: 'Look 02',
        subtitle: 'Camadas translúcidas com fio metálico.',
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop',
        description: 'Para os momentos que importam. Este vestido captura cada fóton de luz, criando uma aura pessoal de brilho.',
        price: '890,00'
      },
      {
        id: '6',
        title: 'Urban Shell',
        category: 'Look 03',
        subtitle: 'Casaco resistente à água em violeta fosco.',
        image: 'https://images.unsplash.com/photo-1529139574466-a302d2052574?q=80&w=1000&auto=format&fit=crop',
        description: 'Função encontra alta moda. O Urban Shell é projetado para o andarilho da cidade que se recusa a comprometer o estilo.',
        price: '340,00'
      }
    ]
  },
  rsvp: {
    label: 'Lista de Convidados',
    title: 'Garanta Seu Acesso',
    description: 'Junte-se a nós para a revelação imersiva. Capacidade limitada disponível para esta experiência exclusiva.',
    successTitle: 'Você está na lista.',
    successMessage: 'Enviamos uma confirmação para o seu e-mail.'
  }
};

interface ContentContextType {
  content: SiteContent;
  isAdminMode: boolean;
  isAuthenticated: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' | 'offline';
  isCloudEnabled: boolean;
  cart: CollectionItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (item: CollectionItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  login: (password: string) => boolean;
  logout: () => void;
  toggleAdminMode: () => void;
  updateContent: (section: keyof SiteContent, key: string, value: any) => void;
  updateCollectionItem: (section: 'story' | 'lookbook', itemId: string, field: keyof CollectionItem, value: string) => void;
  reorderItems: (section: 'story' | 'lookbook', newItems: CollectionItem[]) => void;
  addCollectionItem: (section: 'story' | 'lookbook', item: CollectionItem) => void;
  importContent: (newContent: SiteContent) => void;
  resetContent: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'offline'>('idle');
  
  // Cart State
  const [cart, setCart] = useState<CollectionItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initial Data Load
  useEffect(() => {
    // Carregar do LocalStorage
    const savedContent = localStorage.getItem('site_content');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        if (!parsed.theme) parsed.theme = DEFAULT_CONTENT.theme;
        setContent(parsed);
      } catch (e) {
        console.error("Failed to parse saved content", e);
      }
    }
    
    // Status offline
    setSaveStatus('offline');

    // Load cart
    const savedCart = localStorage.getItem('site_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) { console.error(e); }
    }

    // Session
    const session = sessionStorage.getItem('admin_session');
    if (session === 'true') {
      setIsAuthenticated(true);
      setIsAdminMode(true);
    }
  }, []); // Run once on mount

  // Save Logic
  useEffect(() => {
    if (JSON.stringify(content) === JSON.stringify(DEFAULT_CONTENT) && !localStorage.getItem('site_content')) {
      return;
    }

    const saveToStorage = async () => {
      setSaveStatus('saving');
      await new Promise(resolve => setTimeout(resolve, 600)); // Visual feedback delay

      try {
        // Sempre salva Local
        localStorage.setItem('site_content', JSON.stringify(content));
        
        setSaveStatus('saved');
        
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (e) {
        console.error("Erro ao salvar", e);
        setSaveStatus('error');
      }
    };

    const timeoutId = setTimeout(saveToStorage, 1000); // Debounce
    return () => clearTimeout(timeoutId);
  }, [content]);

  // Save cart (always local)
  useEffect(() => {
    localStorage.setItem('site_cart', JSON.stringify(cart));
  }, [cart]);

  // ... (Restante das funções auxiliares permanecem iguais)
  const addToCart = (item: CollectionItem) => {
    setCart(prev => [...prev, item]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const login = (password: string) => {
    if (password === 'admin') {
      setIsAuthenticated(true);
      setIsAdminMode(true);
      sessionStorage.setItem('admin_session', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdminMode(false);
    sessionStorage.removeItem('admin_session');
  };

  const toggleAdminMode = () => {
    if (isAuthenticated) {
      setIsAdminMode(!isAdminMode);
    }
  };

  const updateContent = (section: keyof SiteContent, key: string, value: any) => {
    if (!isAuthenticated) return;
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateCollectionItem = (section: 'story' | 'lookbook', itemId: string, field: keyof CollectionItem, value: string) => {
    if (!isAuthenticated) return;
    setContent(prev => {
      const newItems = prev[section].items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      );
      return {
        ...prev,
        [section]: {
          ...prev[section],
          items: newItems
        }
      };
    });
  };

  const reorderItems = (section: 'story' | 'lookbook', newItems: CollectionItem[]) => {
    if (!isAuthenticated) return;
    setContent(prev => ({ ...prev, [section]: { ...prev[section], items: newItems } }));
  };

  const addCollectionItem = (section: 'story' | 'lookbook', item: CollectionItem) => {
    if (!isAuthenticated) return;
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: [...prev[section].items, item]
      }
    }));
  };

  const importContent = (newContent: SiteContent) => {
    if (!isAuthenticated) return;
    if (window.confirm("Isso substituirá o conteúdo. Continuar?")) setContent(newContent);
  };

  const resetContent = () => {
    if (!isAuthenticated) return;
    if (window.confirm("Resetar para o padrão?")) {
      setContent(DEFAULT_CONTENT);
      localStorage.removeItem('site_content');
    }
  };

  return (
    <ContentContext.Provider value={{ 
      content, 
      isAdminMode,
      isAuthenticated,
      saveStatus,
      isCloudEnabled: false, // Firebase desativado
      cart,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      clearCart,
      login,
      logout,
      toggleAdminMode, 
      updateContent, 
      updateCollectionItem,
      reorderItems,
      addCollectionItem,
      importContent,
      resetContent 
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
