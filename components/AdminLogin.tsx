/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ChevronRight } from 'lucide-react';
import { useContent } from '../context/ContentContext';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useContent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      setPassword('');
      setError(false);
      onClose();
    } else {
      setError(true);
      // Shake effect logic handled by framer motion usually, but simpler error state here
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-[#141415] border border-[#D4AF37]/30 p-8 shadow-2xl relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4 border border-[#D4AF37]/30">
                <Lock className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h2 className="text-2xl font-heading text-white">Acesso Restrito</h2>
              <p className="text-gray-400 text-sm mt-2 text-center">
                Área de administração do site.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  className={`w-full bg-black/50 border p-4 text-white focus:outline-none transition-colors ${
                    error ? 'border-red-500' : 'border-white/10 focus:border-[#D4AF37]'
                  }`}
                  placeholder="••••••••"
                  autoFocus
                />
                {error && (
                  <p className="text-red-500 text-xs mt-2">Senha incorreta.</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#D4AF37] text-black font-bold py-4 uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2"
              >
                Acessar Painel <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminLogin;