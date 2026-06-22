import type { LanguageCode } from '../store/sessionStore'

type WorldText = {
  collected: string
  controlsKeyboard: string
  controlsMobile: string
  dialogueCloseKeyboard: string
  dialogueCloseMobile: string
  finalGuide: string
  guideAcceptKeyboard: string
  guideAcceptMobile: string
  guideBeginKeyboard: string
  guideBeginMobile: string
  guideContinueKeyboard: string
  guideContinueMobile: string
  guideLight: string
  guideTitle: string
  houseLabels: Record<string, string>
  lightCalls: string
  mapCloseHint: string
  mapTitle: string
  promptKeyboard: (label: string) => string
  promptMobile: (label: string) => string
  trialWaits: string
  welcome: (visitorName: string) => string
  you: string
}

type InteriorText = {
  challengeConfirmKeyboard: string
  challengeConfirmMobile: string
  closes: string
  confirmKeyboard: string
  confirmMobile: string
  controlsKeyboard: string
  controlsMobile: string
  defaultCloseKeyboard: string
  defaultCloseMobile: string
  inspect: string
  labels: Record<string, string>
  nextKeyboard: string
  nextMobile: string
  no: string
  previous: string
  promptKeyboard: (label: string) => string
  promptMobile: (label: string) => string
  rematchQuestion: string
  selectKeyboard: string
  selectMobile: string
  titles: Record<string, string>
  yes: string
}

type BattleSceneText = {
  attackDamage: (damage: number) => string
  enemyCounter: (enemyName: string, damage: number) => string
  focusedTrialLog: string
  magicDamage: (damage: number) => string
  noPotionRemains: string
  notEnoughMp: string
  playerDefeatLog: string
  playerName: string
  potionHeal: (healed: number) => string
  potionSteady: string
}

type CrystalRewardText = {
  allReady: (totalCrystalCount: number) => string
  answersAgain: (crystalName: string) => string
  collectAll: (totalCrystalCount: number) => string
  continueHint: string
  received: (crystalName: string) => string
  shinesAgain: (crystalName: string) => string
  takeCrystal: (crystalName: string) => string
}

type FinalPrizeText = {
  body: string
  downloadPdf: string
  hint: string
  scheduleCall: string
  title: string
}

const worldTextByLanguage: Record<LanguageCode, WorldText> = {
  en: {
    collected: 'collected',
    controlsKeyboard: 'move: wasd/arrows   sprint: shift\ninteract: e / enter   map: m\nhelp: h',
    controlsMobile: 'move: d-pad   sprint: x   interact: a\nclose: b   help: y',
    dialogueCloseKeyboard: 'enter / space closes',
    dialogueCloseMobile: 'A or B closes',
    finalGuide: 'Final Guide',
    guideAcceptKeyboard: 'enter / space accepts',
    guideAcceptMobile: 'A accepts',
    guideBeginKeyboard: 'enter / space begins',
    guideBeginMobile: 'A begins',
    guideContinueKeyboard: 'enter / space continues',
    guideContinueMobile: 'A continues',
    guideLight: 'Guide Light',
    guideTitle: 'Mysterious Guide',
    houseLabels: {
      'projects-house': 'Projects House',
      'about-house': 'Education House',
      'skills-house': 'Gym House',
      'contact-dock': 'Contact Dock',
    },
    lightCalls: 'light calls',
    mapCloseHint: 'press m to close',
    mapTitle: 'field map',
    promptKeyboard: (label: string) => `press e: ${label}`,
    promptMobile: (label: string) => `press A: ${label}`,
    trialWaits: 'trial waits',
    welcome: (visitorName: string) => `welcome, ${visitorName}`,
    you: 'you',
  },
  es: {
    collected: 'recolectado',
    controlsKeyboard:
      'mover: wasd/flechas   correr: shift\ninteractuar: e / enter   mapa: m\nayuda: h',
    controlsMobile: 'mover: d-pad   correr: x   interactuar: a\ncerrar: b   ayuda: y',
    dialogueCloseKeyboard: 'enter / espacio cierra',
    dialogueCloseMobile: 'A o B cierra',
    finalGuide: 'Guía Final',
    guideAcceptKeyboard: 'enter / espacio acepta',
    guideAcceptMobile: 'A acepta',
    guideBeginKeyboard: 'enter / espacio comienza',
    guideBeginMobile: 'A comienza',
    guideContinueKeyboard: 'enter / espacio continúa',
    guideContinueMobile: 'A continúa',
    guideLight: 'Luz del Guía',
    guideTitle: 'Guía Misterioso',
    houseLabels: {
      'projects-house': 'Casa de Proyectos',
      'about-house': 'Casa de Educación',
      'skills-house': 'Gimnasio',
      'contact-dock': 'Muelle de Contacto',
    },
    lightCalls: 'la luz llama',
    mapCloseHint: 'presiona m para cerrar',
    mapTitle: 'mapa de campo',
    promptKeyboard: (label: string) => `presiona e: ${label}`,
    promptMobile: (label: string) => `presiona A: ${label}`,
    trialWaits: 'prueba pendiente',
    welcome: (visitorName: string) => `bienvenido, ${visitorName}`,
    you: 'tú',
  },
  'pt-BR': {
    collected: 'coletado',
    controlsKeyboard:
      'mover: wasd/setas   correr: shift\ninteragir: e / enter   mapa: m\najuda: h',
    controlsMobile: 'mover: d-pad   correr: x   interagir: a\nfechar: b   ajuda: y',
    dialogueCloseKeyboard: 'enter / espaço fecha',
    dialogueCloseMobile: 'A ou B fecha',
    finalGuide: 'Guia Final',
    guideAcceptKeyboard: 'enter / espaço aceita',
    guideAcceptMobile: 'A aceita',
    guideBeginKeyboard: 'enter / espaço começa',
    guideBeginMobile: 'A começa',
    guideContinueKeyboard: 'enter / espaço continua',
    guideContinueMobile: 'A continua',
    guideLight: 'Luz do Guia',
    guideTitle: 'Guia Misterioso',
    houseLabels: {
      'projects-house': 'Casa de Projetos',
      'about-house': 'Casa de Educação',
      'skills-house': 'Academia',
      'contact-dock': 'Doca de Contato',
    },
    lightCalls: 'a luz chama',
    mapCloseHint: 'aperte m para fechar',
    mapTitle: 'mapa do campo',
    promptKeyboard: (label: string) => `aperte e: ${label}`,
    promptMobile: (label: string) => `aperte A: ${label}`,
    trialWaits: 'prova pendente',
    welcome: (visitorName: string) => `bem-vindo, ${visitorName}`,
    you: 'você',
  },
}

const interiorTextByLanguage: Record<LanguageCode, InteriorText> = {
  en: {
    challengeConfirmKeyboard: 'enter challenges',
    challengeConfirmMobile: 'A challenges',
    closes: 'closes',
    confirmKeyboard: 'enter confirms',
    confirmMobile: 'A confirms',
    controlsKeyboard: 'move: wasd/arrows   sprint: shift\ninteract: e / enter   help: h',
    controlsMobile: 'move: d-pad   sprint: x   interact: a\nclose: b   help: y',
    defaultCloseKeyboard: 'enter / space closes',
    defaultCloseMobile: 'A or B closes',
    inspect: 'inspect',
    labels: {
      'Project Curator': 'Project Curator',
      'Projects Board': 'Projects Board',
      'House Guide': 'House Guide',
      'Biography Note': 'Biography Note',
      'Workout Buddy': 'Workout Buddy',
      'Hobbies Note': 'Hobbies Note',
    },
    nextKeyboard: 'enter next',
    nextMobile: 'A next',
    no: 'No',
    previous: 'previous',
    promptKeyboard: (label: string) => `press e: ${label}`,
    promptMobile: (label: string) => `press A: ${label}`,
    rematchQuestion: 'Would you like to battle again for fun?',
    selectKeyboard: 'arrows / wasd select',
    selectMobile: 'd-pad selects',
    titles: {
      projects: 'Projects House',
      about: 'Education House',
      skills: 'Gym House',
    },
    yes: 'Yes',
  },
  es: {
    challengeConfirmKeyboard: 'enter desafía',
    challengeConfirmMobile: 'A desafía',
    closes: 'cierra',
    confirmKeyboard: 'enter confirma',
    confirmMobile: 'A confirma',
    controlsKeyboard: 'mover: wasd/flechas   correr: shift\ninteractuar: e / enter   ayuda: h',
    controlsMobile: 'mover: d-pad   correr: x   interactuar: a\ncerrar: b   ayuda: y',
    defaultCloseKeyboard: 'enter / espacio cierra',
    defaultCloseMobile: 'A o B cierra',
    inspect: 'inspeccionar',
    labels: {
      'Project Curator': 'Curador de Proyectos',
      'Projects Board': 'Tablero de Proyectos',
      'House Guide': 'Guía de la Casa',
      'Biography Note': 'Nota Biográfica',
      'Workout Buddy': 'Compañero de Entrenamiento',
      'Hobbies Note': 'Nota de Pasatiempos',
    },
    nextKeyboard: 'enter siguiente',
    nextMobile: 'A siguiente',
    no: 'No',
    previous: 'anterior',
    promptKeyboard: (label: string) => `presiona e: ${label}`,
    promptMobile: (label: string) => `presiona A: ${label}`,
    rematchQuestion: '¿Te gustaría pelear otra vez por diversión?',
    selectKeyboard: 'flechas / wasd seleccionan',
    selectMobile: 'd-pad selecciona',
    titles: {
      projects: 'Casa de Proyectos',
      about: 'Casa de Educación',
      skills: 'Gimnasio',
    },
    yes: 'Sí',
  },
  'pt-BR': {
    challengeConfirmKeyboard: 'enter desafia',
    challengeConfirmMobile: 'A desafia',
    closes: 'fecha',
    confirmKeyboard: 'enter confirma',
    confirmMobile: 'A confirma',
    controlsKeyboard: 'mover: wasd/setas   correr: shift\ninteragir: e / enter   ajuda: h',
    controlsMobile: 'mover: d-pad   correr: x   interagir: a\nfechar: b   ajuda: y',
    defaultCloseKeyboard: 'enter / espaço fecha',
    defaultCloseMobile: 'A ou B fecha',
    inspect: 'inspecionar',
    labels: {
      'Project Curator': 'Curador de Projetos',
      'Projects Board': 'Quadro de Projetos',
      'House Guide': 'Guia da Casa',
      'Biography Note': 'Nota Biográfica',
      'Workout Buddy': 'Parceiro de Treino',
      'Hobbies Note': 'Nota de Hobbies',
    },
    nextKeyboard: 'enter próximo',
    nextMobile: 'A próximo',
    no: 'Não',
    previous: 'anterior',
    promptKeyboard: (label: string) => `aperte e: ${label}`,
    promptMobile: (label: string) => `aperte A: ${label}`,
    rematchQuestion: 'Você gostaria de batalhar de novo por diversão?',
    selectKeyboard: 'setas / wasd selecionam',
    selectMobile: 'd-pad seleciona',
    titles: {
      projects: 'Casa de Projetos',
      about: 'Casa de Educação',
      skills: 'Academia',
    },
    yes: 'Sim',
  },
}

const battleSceneTextByLanguage: Record<LanguageCode, BattleSceneText> = {
  en: {
    attackDamage: (damage: number) => `You attack for ${damage} damage.`,
    enemyCounter: (enemyName: string, damage: number) =>
      `${enemyName} counters for ${damage} damage.`,
    focusedTrialLog: 'The guide keeps the trial focused.',
    magicDamage: (damage: number) => `You cast Focus Spark for ${damage} damage.`,
    noPotionRemains: 'No field potion remains.',
    notEnoughMp: 'Not enough MP.',
    playerDefeatLog: 'You fall back from the trial.',
    playerName: 'Traveler',
    potionHeal: (healed: number) => `You use a field potion and recover ${healed} HP.`,
    potionSteady: 'You use a field potion, but you were already steady.',
  },
  es: {
    attackDamage: (damage: number) => `Atacas e infliges ${damage} de daño.`,
    enemyCounter: (enemyName: string, damage: number) =>
      `${enemyName} contraataca e inflige ${damage} de daño.`,
    focusedTrialLog: 'El guía mantiene la prueba enfocada.',
    magicDamage: (damage: number) => `Lanzas Chispa de Enfoque e infliges ${damage} de daño.`,
    noPotionRemains: 'No queda ninguna poción de campo.',
    notEnoughMp: 'No tienes suficiente MP.',
    playerDefeatLog: 'Retrocedes ante la prueba.',
    playerName: 'Viajero',
    potionHeal: (healed: number) => `Usas una poción de campo y recuperas ${healed} HP.`,
    potionSteady: 'Usas una poción de campo, pero ya estabas estable.',
  },
  'pt-BR': {
    attackDamage: (damage: number) => `Você ataca e causa ${damage} de dano.`,
    enemyCounter: (enemyName: string, damage: number) =>
      `${enemyName} contra-ataca e causa ${damage} de dano.`,
    focusedTrialLog: 'O guia mantém a prova focada.',
    magicDamage: (damage: number) => `Você lança Faísca de Foco e causa ${damage} de dano.`,
    noPotionRemains: 'Não resta nenhuma poção de campo.',
    notEnoughMp: 'MP insuficiente.',
    playerDefeatLog: 'Você recua diante da prova.',
    playerName: 'Viajante',
    potionHeal: (healed: number) => `Você usa uma poção de campo e recupera ${healed} HP.`,
    potionSteady: 'Você usa uma poção de campo, mas já estava firme.',
  },
}

const crystalRewardTextByLanguage: Record<LanguageCode, CrystalRewardText> = {
  en: {
    allReady: (totalCrystalCount: number) =>
      `All ${totalCrystalCount} crystals are ready to unlock a surprise.`,
    answersAgain: (crystalName: string) => `The ${crystalName} answers your call again.`,
    collectAll: (totalCrystalCount: number) =>
      `Collect all ${totalCrystalCount} crystals to unlock a surprise.`,
    continueHint: 'enter / space continues',
    received: (crystalName: string) => `You received the ${crystalName}`,
    shinesAgain: (crystalName: string) => `The ${crystalName} shines again`,
    takeCrystal: (crystalName: string) => `Take this ${crystalName}.`,
  },
  es: {
    allReady: (totalCrystalCount: number) =>
      `Los ${totalCrystalCount} cristales están listos para desbloquear una sorpresa.`,
    answersAgain: (crystalName: string) => `El ${crystalName} responde otra vez a tu llamada.`,
    collectAll: (totalCrystalCount: number) =>
      `Recolecta los ${totalCrystalCount} cristales para desbloquear una sorpresa.`,
    continueHint: 'enter / espacio continúa',
    received: (crystalName: string) => `Has recibido: ${crystalName}`,
    shinesAgain: (crystalName: string) => `El ${crystalName} vuelve a brillar`,
    takeCrystal: (crystalName: string) => `Toma este ${crystalName}.`,
  },
  'pt-BR': {
    allReady: (totalCrystalCount: number) =>
      `Os ${totalCrystalCount} cristais estão prontos para desbloquear uma surpresa.`,
    answersAgain: (crystalName: string) => `O ${crystalName} responde ao seu chamado outra vez.`,
    collectAll: (totalCrystalCount: number) =>
      `Colete os ${totalCrystalCount} cristais para desbloquear uma surpresa.`,
    continueHint: 'enter / espaço continua',
    received: (crystalName: string) => `Você recebeu: ${crystalName}`,
    shinesAgain: (crystalName: string) => `O ${crystalName} brilha novamente`,
    takeCrystal: (crystalName: string) => `Pegue este ${crystalName}.`,
  },
}

const finalPrizeTextByLanguage: Record<LanguageCode, FinalPrizeText> = {
  en: {
    body:
      'You gathered every crystal and passed the final trial. The final prize is a direct path to Felipe Kummer.',
    downloadPdf: 'Download PDF',
    hint: 'enter opens calendar   esc returns',
    scheduleCall: 'Schedule a 15 minute call',
    title: 'Mysterious Guide',
  },
  es: {
    body:
      'Reuniste todos los cristales y superaste la prueba final. El premio final es un camino directo hacia Felipe Kummer.',
    downloadPdf: 'Descargar PDF',
    hint: 'enter abre el calendario   esc vuelve',
    scheduleCall: 'Agenda una llamada de 15 minutos',
    title: 'Guía Misterioso',
  },
  'pt-BR': {
    body:
      'Você reuniu todos os cristais e passou pela prova final. O prêmio final é um caminho direto até Felipe Kummer.',
    downloadPdf: 'Baixar PDF',
    hint: 'enter abre o calendário   esc volta',
    scheduleCall: 'Agendar uma chamada de 15 minutos',
    title: 'Guia Misterioso',
  },
}

export function getWorldText(language: LanguageCode) {
  return worldTextByLanguage[language]
}

export function getInteriorText(language: LanguageCode) {
  return interiorTextByLanguage[language]
}

export function getBattleSceneText(language: LanguageCode) {
  return battleSceneTextByLanguage[language]
}

export function getCrystalRewardText(language: LanguageCode) {
  return crystalRewardTextByLanguage[language]
}

export function getFinalPrizeText(language: LanguageCode) {
  return finalPrizeTextByLanguage[language]
}

export function getInteriorDialogueHint(
  language: LanguageCode,
  options: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    isChallenge: boolean
    isMobile: boolean
    isRematchChoice: boolean
    pageText: string
  },
) {
  const text = getInteriorText(language)
  const previousOrClose = options.hasPreviousPage ? text.previous : text.closes

  if (options.isRematchChoice) {
    return options.isMobile
      ? `${options.pageText}${text.selectMobile}   ${text.confirmMobile}   B ${text.previous}`
      : `${options.pageText}${text.selectKeyboard}   ${text.confirmKeyboard}   esc ${text.previous}`
  }

  if (options.hasNextPage) {
    return options.isMobile
      ? `${options.pageText}${text.nextMobile}   B ${previousOrClose}`
      : `${options.pageText}${text.nextKeyboard}   esc ${previousOrClose}`
  }

  if (options.isChallenge) {
    return options.isMobile
      ? `${options.pageText}${text.challengeConfirmMobile}   B ${previousOrClose}`
      : `${options.pageText}${text.challengeConfirmKeyboard}   esc ${previousOrClose}`
  }

  return options.isMobile
    ? `${options.pageText}A ${text.closes}   B ${previousOrClose}`
    : `${options.pageText}enter ${text.closes}   esc ${previousOrClose}`
}

export function getWorldDialogueHint(
  language: LanguageCode,
  options: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    isMobile: boolean
    pageText: string
  },
) {
  const previous = language === 'en' ? 'previous' : language === 'es' ? 'anterior' : 'anterior'
  const closes = language === 'en' ? 'closes' : language === 'es' ? 'cierra' : 'fecha'
  const previousOrClose = options.hasPreviousPage ? previous : closes

  if (options.hasNextPage) {
    if (language === 'es') {
      return options.isMobile
        ? `${options.pageText}A siguiente   B ${previousOrClose}`
        : `${options.pageText}enter siguiente   esc ${previousOrClose}`
    }

    if (language === 'pt-BR') {
      return options.isMobile
        ? `${options.pageText}A próximo   B ${previousOrClose}`
        : `${options.pageText}enter próximo   esc ${previousOrClose}`
    }

    return options.isMobile
      ? `${options.pageText}A next   B ${previousOrClose}`
      : `${options.pageText}enter next   esc ${previousOrClose}`
  }

  return options.isMobile
    ? `${options.pageText}A ${closes}   B ${previousOrClose}`
    : `${options.pageText}enter ${closes}   esc ${previousOrClose}`
}
