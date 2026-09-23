import type { LanguageCode } from '../store/sessionStore'

const introDialogueByLanguage: Record<LanguageCode, readonly string[]> = {
  en: [
    'Welcome, traveler.',
    'A new adventure awaits in Felipe Kummer\'s world.',
    'What should we call you?',
  ],
  es: [
    'Hola, viajero.',
    'Una nueva aventura te espera en el mundo de Felipe Kummer.',
    '¿Cómo te llamas?',
  ],
  'pt-BR': [
    'Olá, viajante.',
    'Uma nova aventura espera por você no mundo de Felipe Kummer.',
    'Qual é o seu nome?',
  ],
} as const

export const introDialogue = introDialogueByLanguage.en

export function getIntroDialogue(language: LanguageCode) {
  return introDialogueByLanguage[language]
}

export const characterSelectPrompt = (visitorName: string, language: LanguageCode = 'en') => {
  if (language === 'es') {
    return [`${visitorName}, elige al viajero que llevará tu historia por este mundo.`] as const
  }

  if (language === 'pt-BR') {
    return [`${visitorName}, escolha o viajante que levará sua história por este mundo.`] as const
  }

  return [`${visitorName}, choose the traveler who will carry your story through this world.`] as const
}

export const characterSelectConfirm = (visitorName: string, language: LanguageCode = 'en') => {
  if (language === 'es') {
    return `Bienvenido a la aventura de Felipe Kummer, ${visitorName}.`
  }

  if (language === 'pt-BR') {
    return `Bem-vindo à aventura de Felipe Kummer, ${visitorName}.`
  }

  return `Welcome to Felipe Kummer's adventure, ${visitorName}.`
}
