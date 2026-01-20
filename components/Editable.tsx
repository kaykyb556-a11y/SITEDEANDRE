/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { useContent } from '../context/ContentContext';
import { Edit2, Image as ImageIcon, Save, Upload, Link as LinkIcon, X, LogOut } from 'lucide-react';
import { processImageFile } from '../utils/image';

interface EditableTextProps {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  value, 
  onSave, 
  className = '', 
  as: Component = 'span',
  multiline = false 
}) => {
  const { isAdminMode } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  if (!isAdminMode) {
    return <Component className={className}>{value}</Component>;
  }

  if (isEditing) {
    return (
      <div className="relative inline-block w-full z-50">
        {multiline ? (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full bg-black border border-[#D4AF37] text-white p-2 rounded min-h-[100px] shadow-xl outline-none"
            autoFocus
            onBlur={() => {
              onSave(tempValue);
              setIsEditing(false);
            }}
          />
        ) : (
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full bg-black border border-[#D4AF37] text-white p-1 rounded shadow-xl outline-none"
            autoFocus
            onBlur={() => {
              onSave(tempValue);
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSave(tempValue);
                setIsEditing(false);
              }
            }}
          />
        )}
        <button 
          onMouseDown={(e) => {
             e.preventDefault(); // Prevent blur
             onSave(tempValue);
             setIsEditing(false);
          }}
          className="absolute right-0 -top-6 bg-[#D4AF37] text-black text-xs px-2 py-1 rounded font-bold"
        >
          Salvar
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`relative group cursor-text border border-transparent hover:border-[#D4AF37]/50 rounded px-1 -mx-1 ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      title="Clique para editar"
    >
      <Component>{value}</Component>
      <Edit2 className="w-3 h-3 text-[#D4AF37] absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black rounded-full p-0.5" />
    </div>
  );
};

interface EditableImageProps {
  src: string;
  alt: string;
  onSave: (url: string) => void;
  className?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({ src, alt, onSave, className = '' }) => {
  const { isAdminMode } = useContent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  
  if (!isAdminMode) {
    return <img src={src} alt={alt} className={className} />;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processImageFile(file);
        onSave(base64);
        setShowOptions(false);
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        alert("Erro ao processar imagem. Tente uma menor.");
      }
    }
  };

  const handleUrlEdit = () => {
    const newUrl = prompt("Insira a nova URL da imagem:", src);
    if (newUrl !== null && newUrl !== src) {
      onSave(newUrl);
    }
    setShowOptions(false);
  };

  return (
    <div className={`relative group ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
      
      {/* Botão de Edição */}
      <div 
        className={`absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 group-hover:bg-black/50 transition-colors ${showOptions ? 'bg-black/80 z-20' : ''}`}
        onClick={() => !showOptions && setShowOptions(true)}
      >
        {!showOptions ? (
          <div className="bg-[#D4AF37] text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 shadow-lg">
            <ImageIcon className="w-4 h-4" />
            Alterar Foto
          </div>
        ) : (
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#D4AF37] flex flex-col gap-3 shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-1">
               <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">Editar Imagem</span>
               <button onClick={() => setShowOptions(false)} className="text-white hover:text-red-500"><X className="w-4 h-4" /></button>
             </div>
             
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors text-sm text-white"
             >
               <Upload className="w-4 h-4 text-[#D4AF37]" />
               Upload do PC
             </button>
             
             <button 
               onClick={handleUrlEdit}
               className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors text-sm text-white"
             >
               <LinkIcon className="w-4 h-4 text-[#D4AF37]" />
               Usar URL
             </button>

             <input 
               type="file" 
               ref={fileInputRef}
               className="hidden" 
               accept="image/*"
               onChange={handleFileChange}
             />
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminToolbar: React.FC = () => {
  const { isAdminMode, toggleAdminMode, resetContent, isAuthenticated, logout } = useContent();

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2">
      {isAdminMode && (
        <button
          onClick={resetContent}
          className="bg-red-900/80 backdrop-blur text-white p-3 rounded-full shadow-lg border border-red-500 hover:bg-red-800 transition-colors text-xs font-bold"
          title="Resetar tudo para o padrão"
        >
          Resetar
        </button>
      )}

      {/* Logout Button */}
      <button
        onClick={logout}
        className="bg-gray-800/80 backdrop-blur text-white p-3 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 transition-colors text-xs font-bold"
        title="Sair do Admin"
      >
        <LogOut className="w-5 h-5" />
      </button>
      
      <button
        onClick={toggleAdminMode}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 border-2 ${
          isAdminMode 
            ? 'bg-[#D4AF37] text-black border-white rotate-0' 
            : 'bg-black/50 backdrop-blur text-white/30 border-white/10 hover:text-[#D4AF37] hover:border-[#D4AF37]'
        }`}
        title={isAdminMode ? "Desativar edição" : "Ativar edição"}
      >
        {isAdminMode ? <Save className="w-6 h-6" /> : <Edit2 className="w-5 h-5" />}
      </button>
      
      {isAdminMode && (
        <div className="bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-md absolute left-16 bottom-4 whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-left-4 pointer-events-none">
          Modo Edição Ativo
        </div>
      )}
    </div>
  );
};