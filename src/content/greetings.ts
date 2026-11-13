import type { Greeting } from '@/types/content'

/**
 * Our own list of common greetings (public-domain words). Includes Hindi and
 * Kannada for a Bengaluru-based developer. Scripts other than Latin render in the
 * heading face, not the script face (same as the reference's behaviour).
 */
export const greetings: Greeting[] = [
  { word: 'hello', language: 'English', lang: 'en', script: 'latin' },
  { word: 'नमस्ते', language: 'हिन्दी', lang: 'hi', script: 'other' },
  { word: 'hola', language: 'Español', lang: 'es', script: 'latin' },
  { word: 'ನಮಸ್ಕಾರ', language: 'ಕನ್ನಡ', lang: 'kn', script: 'other' },
  { word: 'bonjour', language: 'Français', lang: 'fr', script: 'latin' },
  { word: 'ciao', language: 'Italiano', lang: 'it', script: 'latin' },
  { word: 'こんにちは', language: '日本語', lang: 'ja', script: 'other' },
  { word: 'hallo', language: 'Deutsch', lang: 'de', script: 'latin' },
  { word: 'வணக்கம்', language: 'தமிழ்', lang: 'ta', script: 'other' },
  { word: 'olá', language: 'Português', lang: 'pt', script: 'latin' },
  { word: '안녕하세요', language: '한국어', lang: 'ko', script: 'other' },
  { word: 'merhaba', language: 'Türkçe', lang: 'tr', script: 'latin' },
  { word: '你好', language: '中文', lang: 'zh', script: 'other' },
  { word: 'hej', language: 'Svenska', lang: 'sv', script: 'latin' },
  { word: 'مرحبًا', language: 'العربية', lang: 'ar', script: 'other', dir: 'rtl' },
  { word: 'salut', language: 'Română', lang: 'ro', script: 'latin' },
  { word: 'привет', language: 'Русский', lang: 'ru', script: 'other' },
  { word: 'halo', language: 'Bahasa Indonesia', lang: 'id', script: 'latin' },
  { word: 'নমস্কার', language: 'বাংলা', lang: 'bn', script: 'other' },
  { word: 'jambo', language: 'Kiswahili', lang: 'sw', script: 'latin' },
]
