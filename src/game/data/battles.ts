import type { InteriorDefinition } from './interiors'
import type { LanguageCode } from '../store/sessionStore'

export type BattleActionId = 'attack' | 'magic' | 'item'

export type BattleActionEffect =
  | {
      amount: number
      kind: 'damage'
      mpCost?: number
    }
  | {
      amount: number
      itemKey: 'field-potion'
      kind: 'heal'
    }

export type BattleAction = {
  effect: BattleActionEffect
  id: BattleActionId
  label: string
}

export type BattleParticipant = {
  attackDamage: number
  id: string
  maxHp: number
  maxMp: number
  name: string
  spriteKey: 'alex-idle' | 'bob-idle' | 'mystic-guide'
}

export type BattleTilePosition = {
  x: number
  y: number
}

export type BattleField = {
  backgroundOffset: {
    x: number
    y: number
  }
  backgroundScale?: number
  characterScale?: number
  enemyTile: BattleTilePosition
  imageKey?: 'world-map'
  interiorId?: InteriorDefinition['id']
  playerTile: BattleTilePosition
}

export type CrystalBattleEncounterId =
  | 'project-curator-trial'
  | 'school-guide-trial'
  | 'workout-buddy-trial'

export type FinalBattleEncounterId = 'mystic-guide-final'

export type BattleEncounterId = CrystalBattleEncounterId | FinalBattleEncounterId

export type CrystalBattleReward = {
  crystal: {
    colors: {
      body: number
      detail: number
      edge: number
      glow: number
    }
    id: string
    name: string
  }
  defeatedBattleId: CrystalBattleEncounterId
  kind: 'crystal'
  unlockedMessage: string
}

export type FinalBattleReward = {
  defeatedBattleId: FinalBattleEncounterId
  kind: 'final'
  scheduleUrl: string
  unlockedMessage: string
}

export type BattleReward = CrystalBattleReward | FinalBattleReward

export type BattleEncounter = {
  actions: BattleActionId[]
  battlefield: BattleField
  defeatMessage: string
  enemy: BattleParticipant
  id: BattleEncounterId
  introLog: string
  reward: BattleReward
  title: string
  victoryLog: string
}

export const SCHEDULE_CALL_URL = 'https://calendar.app.google/C7M4Y6x4j3RpTKV76'

export const FINAL_GUIDE_ENCOUNTER_ID: FinalBattleEncounterId = 'mystic-guide-final'

export const CRYSTAL_BATTLE_ENCOUNTER_IDS: CrystalBattleEncounterId[] = [
  'project-curator-trial',
  'school-guide-trial',
  'workout-buddy-trial',
]

export const BATTLE_ACTIONS: Record<BattleActionId, BattleAction> = {
  attack: {
    id: 'attack',
    label: 'Attack',
    effect: {
      kind: 'damage',
      amount: 16,
    },
  },
  magic: {
    id: 'magic',
    label: 'Magic',
    effect: {
      kind: 'damage',
      amount: 28,
      mpCost: 8,
    },
  },
  item: {
    id: 'item',
    label: 'Item',
    effect: {
      kind: 'heal',
      amount: 30,
      itemKey: 'field-potion',
    },
  },
}

export const BATTLE_ENCOUNTERS: Record<BattleEncounterId, BattleEncounter> = {
  'project-curator-trial': {
    id: 'project-curator-trial',
    title: 'Project Curator Trial',
    actions: ['attack', 'magic', 'item'],
    battlefield: {
      interiorId: 'projects',
      backgroundOffset: { x: 280, y: 0 },
      characterScale: 3,
      enemyTile: { x: 7, y: 3 },
      playerTile: { x: 8, y: 8 },
    },
    introLog: 'The project curator tests your eye for finished work.',
    victoryLog: 'The curator smiles. The first portfolio crystal is yours.',
    defeatMessage:
      'The curator closes the case file. "Rework the plan and try the trial again."',
    enemy: {
      id: 'project-curator',
      name: 'Project Curator',
      spriteKey: 'alex-idle',
      maxHp: 80,
      maxMp: 0,
      attackDamage: 10,
    },
    reward: {
      kind: 'crystal',
      crystal: {
        id: 'craft-crystal',
        name: 'Ruby Craft Crystal',
        colors: {
          body: 0xff8ca0,
          detail: 0xd9446a,
          edge: 0xffd1d8,
          glow: 0xff6f8f,
        },
      },
      defeatedBattleId: 'project-curator-trial',
      unlockedMessage:
        `Felipe's craft crystal is not about one feature. At Runa, he builds and operates payroll and HR systems that real companies depend on.

His work lives where product, compliance, and operations meet: Rails services, React interfaces, database changes, reports, tax rules, integrations, CI/CD, observability, and production support.

The curator calls that craft: understand the business problem, ship the smallest reliable fix, watch the system in production, and keep improving the tool for the people who depend on it.`,
    },
  },
  'school-guide-trial': {
    id: 'school-guide-trial',
    title: 'School Guide Trial',
    actions: ['attack', 'magic', 'item'],
    battlefield: {
      interiorId: 'about',
      backgroundOffset: { x: 0, y: -448 },
      characterScale: 5.6,
      enemyTile: { x: 22, y: 13 },
      playerTile: { x: 20, y: 18 },
    },
    introLog: 'The school guide tests whether you are ready to hear more.',
    victoryLog: 'The guide nods. You earned the next page of Felipe Kummer.',
    defeatMessage:
      'The guide lowers his book. "Close, but not yet. Come back when you are ready to ask again."',
    enemy: {
      id: 'school-guide',
      name: 'School Guide',
      spriteKey: 'bob-idle',
      maxHp: 90,
      maxMp: 0,
      attackDamage: 12,
    },
    reward: {
      kind: 'crystal',
      crystal: {
        id: 'knowledge-crystal',
        name: 'AWS Knowledge Crystal',
        colors: {
          body: 0xffb84d,
          detail: 0xff9900,
          edge: 0xffe3a3,
          glow: 0xffa329,
        },
      },
      defeatedBattleId: 'school-guide-trial',
      unlockedMessage:
        `Felipe's story starts long before code. Since he was young, he showed a natural talent for math, physics, and languages, and an unusual ability to learn quickly when a challenge caught his attention.

As a young man, he set his sights on becoming an Officer of the Merchant Navy. He earned his place through a difficult and competitive entrance exam, then trained for a life where discipline, precision, and responsibility matter every day.

At sea, he became a Nautical Officer aboard LNG carriers. Navigation, cargo operations, safety procedures, emergency response, and multinational crews taught him to stay calm, communicate clearly, and respect complex systems.

In 2022, he chose a new horizon: technology. He began with Harvard's CS50, building the fundamentals that later carried him into Le Wagon's full stack web development bootcamp.

Since then, he has kept moving: React, Go, mobile development, DevOps, Python, cloud infrastructure, and whatever the next problem required. He enjoys learning because every new tool is another way to solve a real problem.

In 2024, he returned to Le Wagon for Data Engineering, expanding his knowledge of data pipelines, warehouses, analytics, and the infrastructure around modern data work.`,
    },
  },
  'workout-buddy-trial': {
    id: 'workout-buddy-trial',
    title: 'Workout Buddy Trial',
    actions: ['attack', 'magic', 'item'],
    battlefield: {
      interiorId: 'skills',
      backgroundOffset: { x: 160, y: -32 },
      characterScale: 3.6,
      enemyTile: { x: 15, y: 4 },
      playerTile: { x: 12, y: 9 },
    },
    introLog: 'The workout buddy turns discipline into a friendly spar.',
    victoryLog: 'The workout buddy nods. Another crystal joins your path.',
    defeatMessage:
      'The workout buddy offers a hand. "Reset your stance and challenge me again."',
    enemy: {
      id: 'workout-buddy',
      name: 'Workout Buddy',
      spriteKey: 'alex-idle',
      maxHp: 95,
      maxMp: 0,
      attackDamage: 14,
    },
    reward: {
      kind: 'crystal',
      crystal: {
        id: 'vitality-crystal',
        name: 'Emerald Vitality Crystal',
        colors: {
          body: 0x9dffb0,
          detail: 0x52d67c,
          edge: 0xf0ffe8,
          glow: 0x76ff9d,
        },
      },
      defeatedBattleId: 'workout-buddy-trial',
      unlockedMessage:
        `Felipe's vitality crystal comes from more than code. He has always been drawn to sports, especially basketball.

Through school and college, he played competitive basketball, built discipline with his teams, and earned many medals along the way.

The game taught him timing, resilience, communication, and how to stay useful under pressure - habits that still show up in his engineering work.

Nowadays he still enjoys an occasional game, but most days the routine is simpler: show up at the gym, train consistently, and keep the body ready for the next challenge.`,
    },
  },
  'mystic-guide-final': {
    id: 'mystic-guide-final',
    title: 'Mysterious Guide Trial',
    actions: ['attack', 'magic', 'item'],
    battlefield: {
      imageKey: 'world-map',
      backgroundOffset: { x: 280, y: 88 },
      backgroundScale: 4,
      characterScale: 3.4,
      enemyTile: { x: 5.833, y: 3.5 },
      playerTile: { x: 7, y: 8 },
    },
    introLog: 'The mysterious guide raises the final light.',
    victoryLog: 'The guide bows. The final prize is yours.',
    defeatMessage:
      'The guide steadies the light. "Your crystals are true. Return when your focus is sharper."',
    enemy: {
      id: 'mystic-guide',
      name: 'Mysterious Guide',
      spriteKey: 'mystic-guide',
      maxHp: 112,
      maxMp: 0,
      attackDamage: 12,
    },
    reward: {
      kind: 'final',
      defeatedBattleId: 'mystic-guide-final',
      scheduleUrl: SCHEDULE_CALL_URL,
      unlockedMessage:
        'The guide opens the last path: contact Felipe by email, LinkedIn, GitHub, CV, or a 15 minute call.',
    },
  },
}

type BattleEncounterLocalizedText = {
  crystalName?: string
  defeatMessage: string
  enemyName: string
  introLog: string
  rewardUnlockedMessage: string
  title: string
  victoryLog: string
}

const battleActionLabelsByLanguage: Record<LanguageCode, Record<BattleActionId, string>> = {
  en: {
    attack: 'Attack',
    magic: 'Magic',
    item: 'Item',
  },
  es: {
    attack: 'Atacar',
    magic: 'Magia',
    item: 'Objeto',
  },
  'pt-BR': {
    attack: 'Atacar',
    magic: 'Magia',
    item: 'Item',
  },
}

const battleEncounterTextByLanguage: Record<
  LanguageCode,
  Record<BattleEncounterId, BattleEncounterLocalizedText>
> = {
  en: {
    'project-curator-trial': {
      title: BATTLE_ENCOUNTERS['project-curator-trial'].title,
      introLog: BATTLE_ENCOUNTERS['project-curator-trial'].introLog,
      victoryLog: BATTLE_ENCOUNTERS['project-curator-trial'].victoryLog,
      defeatMessage: BATTLE_ENCOUNTERS['project-curator-trial'].defeatMessage,
      enemyName: BATTLE_ENCOUNTERS['project-curator-trial'].enemy.name,
      crystalName:
        BATTLE_ENCOUNTERS['project-curator-trial'].reward.kind === 'crystal'
          ? BATTLE_ENCOUNTERS['project-curator-trial'].reward.crystal.name
          : undefined,
      rewardUnlockedMessage: BATTLE_ENCOUNTERS['project-curator-trial'].reward.unlockedMessage,
    },
    'school-guide-trial': {
      title: BATTLE_ENCOUNTERS['school-guide-trial'].title,
      introLog: BATTLE_ENCOUNTERS['school-guide-trial'].introLog,
      victoryLog: BATTLE_ENCOUNTERS['school-guide-trial'].victoryLog,
      defeatMessage: BATTLE_ENCOUNTERS['school-guide-trial'].defeatMessage,
      enemyName: BATTLE_ENCOUNTERS['school-guide-trial'].enemy.name,
      crystalName:
        BATTLE_ENCOUNTERS['school-guide-trial'].reward.kind === 'crystal'
          ? BATTLE_ENCOUNTERS['school-guide-trial'].reward.crystal.name
          : undefined,
      rewardUnlockedMessage: BATTLE_ENCOUNTERS['school-guide-trial'].reward.unlockedMessage,
    },
    'workout-buddy-trial': {
      title: BATTLE_ENCOUNTERS['workout-buddy-trial'].title,
      introLog: BATTLE_ENCOUNTERS['workout-buddy-trial'].introLog,
      victoryLog: BATTLE_ENCOUNTERS['workout-buddy-trial'].victoryLog,
      defeatMessage: BATTLE_ENCOUNTERS['workout-buddy-trial'].defeatMessage,
      enemyName: BATTLE_ENCOUNTERS['workout-buddy-trial'].enemy.name,
      crystalName:
        BATTLE_ENCOUNTERS['workout-buddy-trial'].reward.kind === 'crystal'
          ? BATTLE_ENCOUNTERS['workout-buddy-trial'].reward.crystal.name
          : undefined,
      rewardUnlockedMessage: BATTLE_ENCOUNTERS['workout-buddy-trial'].reward.unlockedMessage,
    },
    'mystic-guide-final': {
      title: BATTLE_ENCOUNTERS['mystic-guide-final'].title,
      introLog: BATTLE_ENCOUNTERS['mystic-guide-final'].introLog,
      victoryLog: BATTLE_ENCOUNTERS['mystic-guide-final'].victoryLog,
      defeatMessage: BATTLE_ENCOUNTERS['mystic-guide-final'].defeatMessage,
      enemyName: BATTLE_ENCOUNTERS['mystic-guide-final'].enemy.name,
      rewardUnlockedMessage: BATTLE_ENCOUNTERS['mystic-guide-final'].reward.unlockedMessage,
    },
  },
  es: {
    'project-curator-trial': {
      title: 'Prueba del Curador de Proyectos',
      introLog: 'El curador de proyectos pone a prueba tu ojo para el trabajo terminado.',
      victoryLog: 'El curador sonríe. El primer cristal del portfolio es tuyo.',
      defeatMessage:
        'El curador cierra el expediente. "Replantea el plan y vuelve a intentar la prueba."',
      enemyName: 'Curador de Proyectos',
      crystalName: 'Cristal Ruby Craft',
      rewardUnlockedMessage:
        `El cristal de oficio de Felipe no representa una sola funcionalidad. En Runa, él construye y opera sistemas de nómina y RH de los que dependen empresas reales.

Su trabajo vive donde se cruzan producto, cumplimiento y operación: servicios en Rails, interfaces en React, cambios de base de datos, reportes, reglas fiscales, integraciones, CI/CD, observabilidad y soporte de producción.

El curador llama a eso oficio: entender el problema de negocio, enviar el arreglo confiable más pequeño, observar el sistema en producción y seguir mejorando la herramienta para quienes dependen de ella.`,
    },
    'school-guide-trial': {
      title: 'Prueba del Guía de la Escuela',
      introLog: 'El guía de la escuela prueba si estás listo para escuchar más.',
      victoryLog: 'El guía asiente. Ganaste la siguiente página de Felipe Kummer.',
      defeatMessage:
        'El guía baja su libro. "Cerca, pero todavía no. Vuelve cuando estés listo para preguntar otra vez."',
      enemyName: 'Guía de la Escuela',
      crystalName: 'Cristal de Conocimiento AWS',
      rewardUnlockedMessage:
        `La historia de Felipe empieza mucho antes del código. Desde pequeño mostró talento natural para matemáticas, física e idiomas, además de una capacidad poco común para aprender rápido cuando un desafío captaba su atención.

De joven se propuso convertirse en Oficial de la Marina Mercante. Ganó su lugar mediante un examen de ingreso difícil y competitivo, y luego se preparó para una vida donde la disciplina, la precisión y la responsabilidad importan todos los días.

En el mar se convirtió en Oficial de Náutica a bordo de buques metaneros. Navegación, operaciones de carga, procedimientos de seguridad, respuesta a emergencias y tripulaciones multinacionales le enseñaron a mantener la calma, comunicarse con claridad y respetar sistemas complejos.

En 2022 eligió un nuevo horizonte: tecnología. Empezó con CS50 de Harvard, construyendo los fundamentos que luego lo llevaron al bootcamp de desarrollo web full stack de Le Wagon.

Desde entonces no dejó de avanzar: React, Go, desarrollo móvil, DevOps, Python, infraestructura cloud y cualquier herramienta que el siguiente problema exigiera. Disfruta aprender porque cada herramienta nueva es otra forma de resolver un problema real.

En 2024 volvió a Le Wagon para Data Engineering, ampliando su conocimiento sobre pipelines de datos, warehouses, analítica y la infraestructura alrededor del trabajo moderno con datos.`,
    },
    'workout-buddy-trial': {
      title: 'Prueba del Compañero de Entrenamiento',
      introLog: 'El compañero de entrenamiento convierte la disciplina en un combate amistoso.',
      victoryLog: 'El compañero asiente. Otro cristal se une a tu camino.',
      defeatMessage:
        'El compañero te ofrece una mano. "Reacomoda tu postura y desafíame otra vez."',
      enemyName: 'Compañero de Entrenamiento',
      crystalName: 'Cristal de Vitalidad Esmeralda',
      rewardUnlockedMessage:
        `El cristal de vitalidad de Felipe viene de algo más que el código. Siempre se sintió atraído por el deporte, especialmente el básquetbol.

Durante la escuela y la universidad jugó básquetbol competitivo, construyó disciplina junto a sus equipos y ganó muchas medallas por el camino.

El juego le enseñó ritmo, resiliencia, comunicación y cómo seguir siendo útil bajo presión, hábitos que todavía aparecen en su trabajo de ingeniería.

Hoy todavía disfruta un partido ocasional, pero la rutina de la mayoría de los días es más simple: llegar al gimnasio, entrenar con constancia y mantener el cuerpo listo para el próximo desafío.`,
    },
    'mystic-guide-final': {
      title: 'Prueba del Guía Misterioso',
      introLog: 'El guía misterioso levanta la luz final.',
      victoryLog: 'El guía se inclina. El premio final es tuyo.',
      defeatMessage:
        'El guía estabiliza la luz. "Tus cristales son verdaderos. Vuelve cuando tu enfoque sea más agudo."',
      enemyName: 'Guía Misterioso',
      rewardUnlockedMessage:
        'El guía abre el último camino: contacta a Felipe por email, LinkedIn, GitHub, CV o una llamada de 15 minutos.',
    },
  },
  'pt-BR': {
    'project-curator-trial': {
      title: 'Prova do Curador de Projetos',
      introLog: 'O curador de projetos testa seu olhar para trabalho bem acabado.',
      victoryLog: 'O curador sorri. O primeiro cristal do portfolio é seu.',
      defeatMessage:
        'O curador fecha o arquivo. "Reajuste o plano e tente a prova outra vez."',
      enemyName: 'Curador de Projetos',
      crystalName: 'Cristal Ruby Craft',
      rewardUnlockedMessage:
        `O cristal de ofício de Felipe não representa uma única funcionalidade. Na Runa, ele constrói e opera sistemas de folha de pagamento e RH dos quais empresas reais dependem.

Seu trabalho vive onde produto, compliance e operação se encontram: serviços Rails, interfaces React, mudanças de banco de dados, relatórios, regras fiscais, integrações, CI/CD, observabilidade e suporte em produção.

O curador chama isso de ofício: entender o problema de negócio, enviar o menor ajuste confiável, observar o sistema em produção e continuar melhorando a ferramenta para quem depende dela.`,
    },
    'school-guide-trial': {
      title: 'Prova do Guia da Escola',
      introLog: 'O guia da escola testa se você está pronto para ouvir mais.',
      victoryLog: 'O guia concorda. Você conquistou a próxima página de Felipe Kummer.',
      defeatMessage:
        'O guia abaixa o livro. "Quase, mas ainda não. Volte quando estiver pronto para perguntar de novo."',
      enemyName: 'Guia da Escola',
      crystalName: 'Cristal de Conhecimento AWS',
      rewardUnlockedMessage:
        `A história de Felipe começa muito antes do código. Desde pequeno ele mostrou talento natural para matemática, física e idiomas, além de uma capacidade incomum de aprender rápido quando um desafio prendia sua atenção.

Ainda jovem, decidiu se tornar Oficial da Marinha Mercante. Conquistou sua vaga por meio de uma prova difícil e competitiva, depois se preparou para uma vida em que disciplina, precisão e responsabilidade importam todos os dias.

No mar, tornou-se Oficial de Náutica a bordo de navios metaneiros. Navegação, operações de carga, procedimentos de segurança, resposta a emergências e tripulações multinacionais ensinaram Felipe a manter a calma, comunicar-se com clareza e respeitar sistemas complexos.

Em 2022, escolheu um novo horizonte: tecnologia. Começou pelo CS50 de Harvard, construindo os fundamentos que depois o levaram ao bootcamp de desenvolvimento web full stack da Le Wagon.

Desde então, continuou avançando: React, Go, desenvolvimento mobile, DevOps, Python, infraestrutura cloud e qualquer ferramenta que o próximo problema exigisse. Ele gosta de aprender porque cada nova ferramenta é mais uma forma de resolver um problema real.

Em 2024 voltou à Le Wagon para Data Engineering, ampliando seu conhecimento sobre pipelines de dados, warehouses, analytics e a infraestrutura por trás do trabalho moderno com dados.`,
    },
    'workout-buddy-trial': {
      title: 'Prova do Parceiro de Treino',
      introLog: 'O parceiro de treino transforma disciplina em um combate amistoso.',
      victoryLog: 'O parceiro de treino concorda. Outro cristal entra no seu caminho.',
      defeatMessage:
        'O parceiro oferece uma mão. "Ajuste sua postura e me desafie outra vez."',
      enemyName: 'Parceiro de Treino',
      crystalName: 'Cristal de Vitalidade Esmeralda',
      rewardUnlockedMessage:
        `O cristal de vitalidade de Felipe vem de mais do que código. Ele sempre foi ligado aos esportes, especialmente ao basquete.

Durante a escola e a faculdade, jogou basquete competitivo, construiu disciplina com seus times e conquistou muitas medalhas pelo caminho.

O jogo ensinou timing, resiliência, comunicação e como continuar útil sob pressão, hábitos que ainda aparecem em seu trabalho como engenheiro.

Hoje ele ainda curte uma partida ocasional, mas na maioria dos dias a rotina é mais simples: aparecer na academia, treinar com consistência e manter o corpo pronto para o próximo desafio.`,
    },
    'mystic-guide-final': {
      title: 'Prova do Guia Misterioso',
      introLog: 'O guia misterioso ergue a luz final.',
      victoryLog: 'O guia se curva. O prêmio final é seu.',
      defeatMessage:
        'O guia estabiliza a luz. "Seus cristais são verdadeiros. Volte quando seu foco estiver mais afiado."',
      enemyName: 'Guia Misterioso',
      rewardUnlockedMessage:
        'O guia abre o último caminho: contate Felipe por email, LinkedIn, GitHub, CV ou uma chamada de 15 minutos.',
    },
  },
}

export function getBattleAction(actionId: BattleActionId, language: LanguageCode): BattleAction {
  const action = BATTLE_ACTIONS[actionId]

  return {
    ...action,
    label: battleActionLabelsByLanguage[language][actionId],
  }
}

export function getBattleEncounter(
  encounterId: BattleEncounterId,
  language: LanguageCode,
): BattleEncounter {
  const encounter = BATTLE_ENCOUNTERS[encounterId]
  const localizedText = battleEncounterTextByLanguage[language][encounterId]
  const reward =
    encounter.reward.kind === 'crystal'
      ? {
          ...encounter.reward,
          crystal: {
            ...encounter.reward.crystal,
            name: localizedText.crystalName ?? encounter.reward.crystal.name,
          },
          unlockedMessage: localizedText.rewardUnlockedMessage,
        }
      : {
          ...encounter.reward,
          unlockedMessage: localizedText.rewardUnlockedMessage,
        }

  return {
    ...encounter,
    defeatMessage: localizedText.defeatMessage,
    enemy: {
      ...encounter.enemy,
      name: localizedText.enemyName,
    },
    introLog: localizedText.introLog,
    reward,
    title: localizedText.title,
    victoryLog: localizedText.victoryLog,
  }
}
