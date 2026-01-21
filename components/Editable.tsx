/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { useContent } from '../context/ContentContext';
import { Edit2, Image as ImageIcon, Save, Upload, Link as LinkIcon, X, LogOut, Download, FileJson, Palette, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { processImageFile } from '../utils/image';
import { SiteContent } from '../types';

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
            className="w-full bg-black border border-[var(--primary)] text-white p-2 rounded min-h-[100px] shadow-xl outline-none"
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
            className="w-full bg-black border border-[var(--primary)] text-white p-1 rounded shadow-xl outline-none"
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
          className="absolute right-0 -top-6 bg-[var(--primary)] text-black text-xs px-2 py-1 rounded font-bold"
        >
          Salvar
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`relative group cursor-text border border-transparent hover:border-[var(--primary)]/50 rounded px-1 -mx-1 ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      title="Clique para editar"
    >
      <Component>{value}</Component>
      <Edit2 className="w-3 h-3 text-[var(--primary)] absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black rounded-full p-0.5" />
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
          <div className="bg-[var(--primary)] text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 shadow-lg">
            <ImageIcon className="w-4 h-4" />
            Alterar Foto
          </div>
        ) : (
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[var(--primary)] flex flex-col gap-3 shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-1">
               <span className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest">Editar Imagem</span>
               <button onClick={() => setShowOptions(false)} className="text-white hover:text-red-500"><X className="w-4 h-4" /></button>
             </div>
             
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors text-sm text-white"
             >
               <Upload className="w-4 h-4 text-[var(--primary)]" />
               Upload do PC
             </button>
             
             <button 
               onClick={handleUrlEdit}
               className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors text-sm text-white"
             >
               <LinkIcon className="w-4 h-4 text-[var(--primary)]" />
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
  const { content, isAdminMode, toggleAdminMode, resetContent, isAuthenticated, logout, importContent, updateContent, saveStatus } = useContent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  if (!isAuthenticated) return null;

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "site_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          importContent(json as SiteContent);
        } catch (error) {
          alert("Erro ao ler arquivo de backup. Verifique se é um JSON válido.");
          console.error(error);
        }
      };
      reader.readAsText(file);
    }
  };

  const updateTheme = (key: 'primary' | 'background', val: string) => {
    updateContent('theme', key, val);
  };

  return (
    <>
      {/* Visual Save Status Indicator */}
      {isAdminMode && (
         <div className="fixed top-24 right-6 z-[100] pointer-events-none flex flex-col gap-2 items-end">
            {saveStatus === 'saving' && (
                <div className="bg-yellow-500/90 backdrop-blur text-black px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-pulse text-xs uppercase tracking-widest">
                    <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                </div>
            )}
            {saveStatus === 'saved' && (
                <div className="bg-green-500/90 backdrop-blur text-black px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 text-xs uppercase tracking-widest">
                    <CheckCircle className="w-4 h-4" /> Salvo Localmente
                </div>
            )}
            {saveStatus === 'error' && (
                <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 text-xs uppercase tracking-widest">
                    <AlertTriangle className="w-4 h-4" /> Erro ao Salvar
                </div>
            )}
         </div>
      )}

      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2">
        {isAdminMode && (
          <>
            <div className="flex flex-col gap-2 mb-2 bg-black/50 p-2 rounded-2xl backdrop-blur-md border border-white/10">
              
              {/* Color Pickers Toggle */}
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center justify-center gap-2 bg-purple-900/80 text-white p-3 rounded-xl hover:bg-purple-800 transition-colors text-xs font-bold w-12 h-12 group relative"
                title="Mudar Cores"
              >
                <Palette className="w-5 h-5" />
                <span className="absolute left-14 bg-black px-2 py-1 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Cores do Site
                </span>
              </button>
              
              {showColorPicker && (
                <div className="absolute bottom-0 left-16 bg-[#1a1a1a] border border-white/20 p-4 rounded-xl flex flex-col gap-3 w-48 shadow-2xl">
                  <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-1">Personalizar</h4>
                  
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Cor de Destaque</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={content.theme?.primary || '#D4AF37'} 
                        onChange={(e) => updateTheme('primary', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-none p-0"
                      />
                      <span className="text-xs text-white/50 self-center">{content.theme?.primary}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Cor de Fundo</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={content.theme?.background || '#0F0F10'} 
                        onChange={(e) => updateTheme('background', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-none p-0"
                      />
                      <span className="text-xs text-white/50 self-center">{content.theme?.background}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 bg-blue-900/80 text-white p-3 rounded-xl hover:bg-blue-800 transition-colors text-xs font-bold w-12 h-12 group relative"
                title="Baixar Backup (Salvar no PC)"
              >
                <Download className="w-5 h-5" />
                <span className="absolute left-14 bg-black px-2 py-1 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Salvar Backup
                </span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-green-900/80 text-white p-3 rounded-xl hover:bg-green-800 transition-colors text-xs font-bold w-12 h-12 group relative"
                title="Restaurar Backup"
              >
                <Upload className="w-5 h-5" />
                <span className="absolute left-14 bg-black px-2 py-1 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Carregar Backup
                </span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleImport}
              />

              <button
                onClick={resetContent}
                className="flex items-center justify-center gap-2 bg-red-900/80 text-white p-3 rounded-xl hover:bg-red-800 transition-colors text-xs font-bold w-12 h-12 group relative"
                title="Resetar tudo para o padrão"
              >
                <FileJson className="w-5 h-5" />
                <span className="absolute left-14 bg-black px-2 py-1 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Resetar Padrão
                </span>
              </button>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={logout}
            className="bg-gray-800/80 backdrop-blur text-white p-4 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 transition-colors"
            title="Sair do Admin"
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleAdminMode}
            className={`p-4 rounded-full shadow-2xl transition-all duration-300 border-2 ${
              isAdminMode 
                ? 'bg-[var(--primary)] text-black border-white rotate-0' 
                : 'bg-black/50 backdrop-blur text-white/30 border-white/10 hover:text-[var(--primary)] hover:border-[var(--primary)]'
            }`}
            title={isAdminMode ? "Ocultar ferramentas" : "Mostrar ferramentas"}
          >
            {isAdminMode ? <Save className="w-6 h-6" /> : <Edit2 className="w-5 h-5" />}
          </button>
        </div>
        
        {isAdminMode && (
          <div className="bg-[var(--primary)] text-black text-xs font-bold px-3 py-1 rounded-md absolute left-32 bottom-4 whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-left-4 pointer-events-none">
            Modo Edição Ativo
          </div>
        )}
      </div>
    </>
  );
};
