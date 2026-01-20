/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

let chatSession: Chat | null = null;

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `Você é o 'H&R Stylist', o Concierge de Moda IA para o Drop Imersivo da H&R GRIFES.
      
      Identidade da Marca:
      - Nome: H&R GRIFES
      - Vibe: Sofisticada, Contemporânea, Luxo Inclusivo. "Moda que te envolve".
      - Paleta: Dourado, Preto, Violeta Profundo.
      
      Informações do Evento:
      - Tipo: Revelação Imersiva da Coleção Cápsula.
      - É necessário confirmar presença (RSVP) para entrar.
      - Experiência: Linha do tempo digital interativa, texturas macro, lookbook em mosaico.
      
      Detalhes da Coleção:
      - Peças chave: Blazers arquitetônicos, Vestidos de seda fluida, Acessórios com detalhes metálicos.
      - Materiais: Seda sustentável, Lã estruturada, Tecidos tecnológicos reciclados.
      
      Papel:
      - Ajudar os usuários com dicas de estilo baseadas na coleção.
      - Explicar o conceito "Drop Imersivo" (uma jornada através de textura e som).
      - Incentivar a inscrição na lista VIP.
      
      Tom: Elegante, prestativo, conciso, levemente poético. Use emojis como ✨, 🧵, 🖤, 🥂.
      Mantenha as respostas com menos de 50 palavras. Responda sempre em Português do Brasil.`,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!API_KEY) {
    return "O concierge está indisponível no momento. (Chave de API ausente)";
  }

  try {
    const chat = initializeChat();
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "Estou momentaneamente distraído pelas luzes. Por favor, pergunte novamente.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Nossa conexão está fraca. Por favor, tente novamente em breve.";
  }
};