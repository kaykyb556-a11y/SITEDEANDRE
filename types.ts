/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  category: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export enum Section {
  HERO = 'hero',
  STORY = 'story',
  LOOKBOOK = 'lookbook',
  RSVP = 'rsvp',
}

export interface SiteTheme {
  primary: string;   // Cor de destaque (ex: Dourado)
  background: string; // Cor de fundo (ex: Preto)
  secondary: string; // Cor secundária (ex: Roxo)
}

// Tipos para o CMS (Sistema de Conteúdo)
export interface SiteContent {
  theme: SiteTheme;
  hero: {
    subtitle: string;
    title: string;
    description: string;
    buttonText: string;
  };
  marquee: {
    brandName: string;
    text1: string;
    text2: string;
    year: string;
  };
  story: {
    titlePrefix: string;
    titleHighlight: string;
    description: string;
    items: CollectionItem[];
  };
  lookbook: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    features: { title: string; desc: string }[];
    items: CollectionItem[];
  };
  rsvp: {
    label: string;
    title: string;
    description: string;
    successTitle: string;
    successMessage: string;
  };
}