/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// ============================================================================
// INSTRUÇÕES PARA ATIVAR O MODO ONLINE (PARA TODO MUNDO VER):
// 1. Vá em https://console.firebase.google.com/
// 2. Crie um projeto novo (grátis).
// 3. Adicione um app "Web" ao projeto.
// 4. Copie as configurações (apiKey, authDomain, etc) e cole abaixo.
// 5. No Console do Firebase, vá em "Firestore Database" > "Create Database".
// 6. Inicie em "Test Mode" (Modo de Teste) para começar rápido.
// ============================================================================

const firebaseConfig = {
  // SUBSTITUA ESTES VALORES PELOS SEUS DO FIREBASE CONSOLE
  apiKey: "", 
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

let db: Firestore | null = null;
let isFirebaseReady = false;

// Verifica se a config foi preenchida (básico)
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseReady = true;
    console.log("Firebase inicializado com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
  }
} else {
  console.warn("Firebase não configurado. Rodando em modo LOCAL (apenas este navegador).");
}

export { db, isFirebaseReady };