import type { LanguageCode } from '../store/sessionStore'

const introDialogueByLanguage: Record<LanguageCode, readonly string[]> = {
  en: [
  'hey there traveler.',
  'before you drift into felipe kummer\'s portfolio, i need one thing.',
  'mind to say your name?',
  ],
  es: [
    'hola, viajero.',
    'antes de entrar en el portfolio de felipe kummer, necesito una cosa.',
    'me dices tu nombre?',
  ],
  'pt-BR': [
    'ola, viajante.',
    'antes de entrar no portfolio do felipe kummer, preciso de uma coisa.',
    'qual e o seu nome?',
  ],
} as const

export const introDialogue = introDialogueByLanguage.en

export function getIntroDialogue(language: LanguageCode) {
  return introDialogueByLanguage[language]
}

export const characterSelectPrompt = (visitorName: string, language: LanguageCode = 'en') => {
  if (language === 'es') {
    return [`${visitorName}, elige al viajero que llevara tu historia por este mundo.`] as const
  }

  if (language === 'pt-BR') {
    return [`${visitorName}, escolha o viajante que levara sua historia por este mundo.`] as const
  }

  return [`${visitorName}, choose the traveler who will carry your story through this world.`] as const
}

export const characterSelectConfirm = (visitorName: string, language: LanguageCode = 'en') => {
  if (language === 'es') {
    return `bienvenido al portfolio de aventura de Felipe Kummer, ${visitorName}.`
  }

  if (language === 'pt-BR') {
    return `bem-vindo ao portfolio de aventura de Felipe Kummer, ${visitorName}.`
  }

  return `ok welcome to the adventure portfolio of Felipe Kummer, ${visitorName}.`
}
