import type { LanguageCode } from '../store/sessionStore'

export const portfolioContact = {
  cvPath: '/assets/docs/Felipe_Kummer_CV_2026_v2.pdf',
  email: 'felipe.s.kummer@gmail.com',
  github: 'github.com/FsKummer',
  githubUrl: 'https://github.com/FsKummer',
  linkedIn: 'linkedin.com/in/felipe-kummer-dev',
  linkedInUrl: 'https://linkedin.com/in/felipe-kummer-dev',
} as const

export type PortfolioDialogues = {
  aboutNpc: string
  aboutNpcChallenge: string
  aboutSign: string
  contactSign: string
  finalGuideChallenge: (visitorName: string) => string[]
  projectsNpc: string
  projectsNpcChallenge: string
  projectsSign: string
  questGuide: (visitorName: string) => string[]
  skillsNpc: string
  skillsNpcChallenge: string
  skillsSign: string
}

const englishPortfolioDialogues: PortfolioDialogues = {
  questGuide: (visitorName: string) => [
    `${visitorName}, this island tells Felipe Kummer's path from LNG ships to software systems.`,
    'The Ruby Craft Crystal waits in the Projects House. The AWS Knowledge Crystal waits in the Education House. The Emerald Vitality Crystal waits in the Gym House.',
    'Speak with each guardian to learn about his SaaS work, maritime background, technical stack, awards, languages, and way of working.',
    'Take this map. Press M in the world to see your position and where each crystal waits.',
  ],
  finalGuideChallenge: (visitorName: string) => [
    `${visitorName}, every crystal now answers your call.`,
    'You have crossed product craft, operational discipline, and cloud engineering. The island recognizes you as its hero.',
    'One final prize remains, but it is not handed away freely.',
    'Face me in a final battle. Win, and I will open the path to Felipe Kummer.',
  ],
  projectsNpc:
    `Felipe works at Runa building payroll and HR technology for businesses across Mexico.

His project work spans APIs, business logic, tax automation, compliance workflows, reporting, integrations, and production reliability.`,
  projectsNpcChallenge:
    'A product only counts when it works under pressure. Win this quick trial, and I will hand you a crystal from the project room.',
  projectsSign:
    'Freelance and side work: travel booking platforms, Slack integrations, AWS monitoring automation, Spotify-related apps, and cloud-native web systems.',
  aboutNpc:
    `This house keeps Felipe's origin story.

Before software, he was a Nautical Officer aboard LNG carriers at Golar LNG, handling navigation, cargo operations, safety, emergency response, and multinational crews.

That chapter taught him discipline, risk management, clear communication, and respect for complex systems.`,
  aboutNpcChallenge:
    'Knowledge has a price in this school. Win a quick trial battle, and I will tell you how Felipe rebuilt his career.',
  aboutSign:
    `Education: EFOMM Maritime Studies, Harvard CS50, Le Wagon Full Stack Web Development, and Le Wagon Data Engineering.

Languages: Portuguese native, English fluent, Spanish fluent.`,
  skillsNpc:
    `This gym remembers another side of Felipe: the athlete who grew up around sports.

Basketball was his main game through school and college, where he competed, trained with teams, and earned many medals along the way.`,
  skillsNpcChallenge:
    'Discipline is tested one round at a time. Beat this gym trial, and the room will grant you a crystal.',
  skillsSign:
    `Core stack: Ruby on Rails, React, TypeScript, PostgreSQL, AWS, Kubernetes, Docker, MongoDB, Redis, Python, and Go.

He also works with Datadog, CI/CD, ETL, Spark, BigQuery, and data warehousing.

Recognized at Runa with MVP Award 2023, Everyday Hero 2024, and MVP Award 2025.`,
  contactSign:
    `Email: ${portfolioContact.email}\nLinkedIn: ${portfolioContact.linkedIn}\nGitHub: ${portfolioContact.github}`,
}

const spanishPortfolioDialogues: PortfolioDialogues = {
  questGuide: (visitorName: string) => [
    `${visitorName}, esta isla cuenta el camino de Felipe Kummer desde los buques de GNL hasta los sistemas de software.`,
    'El Cristal Ruby Craft espera en la Casa de Proyectos. El Cristal de Conocimiento AWS espera en la Casa de Educación. El Cristal de Vitalidad Esmeralda espera en el Gimnasio.',
    'Habla con cada guardián para conocer su trabajo en SaaS, su pasado marítimo, su stack técnico, premios, idiomas y forma de trabajar.',
    'Toma este mapa. Presiona M en el mundo para ver tu posición y dónde espera cada cristal.',
  ],
  finalGuideChallenge: (visitorName: string) => [
    `${visitorName}, ahora todos los cristales responden a tu llamada.`,
    'Has cruzado el oficio de producto, la disciplina operativa y la ingeniería en la nube. La isla te reconoce como su héroe.',
    'Queda un premio final, pero no se entrega sin una última prueba.',
    'Enfréntame en una batalla final. Gana, y abriré el camino hacia Felipe Kummer.',
  ],
  projectsNpc:
    `Felipe trabaja en Runa construyendo tecnología de nómina y recursos humanos para empresas en México.

Su trabajo de producto vive donde se encuentran negocio, cumplimiento y operación: APIs, reglas fiscales, automatización de nómina, reportes, integraciones, confiabilidad de producción y soporte a sistemas que deben funcionar bajo presión.`,
  projectsNpcChallenge:
    'Un producto solo cuenta cuando funciona bajo presión. Gana esta prueba rápida y te entregaré un cristal de la sala de proyectos.',
  projectsSign:
    'Trabajo freelance y proyectos paralelos: plataformas de reserva de viajes, integraciones con Slack, automatización de monitoreo en AWS, aplicaciones relacionadas con Spotify y sistemas web cloud-native.',
  aboutNpc:
    `Esta casa guarda la historia de origen de Felipe.

Desde joven mostró talento natural para matemáticas, física e idiomas, además de una gran facilidad para aprender cuando un desafío despertaba su curiosidad.

Antes del software, fue Oficial de Náutica en buques metaneros de Golar LNG, trabajando con navegación, operaciones de carga, seguridad, respuesta a emergencias y tripulaciones multinacionales.

Esa etapa le enseñó disciplina, gestión de riesgo, comunicación clara y respeto por sistemas complejos.`,
  aboutNpcChallenge:
    'El conocimiento tiene un precio en esta escuela. Gana una batalla rápida y te contaré cómo Felipe reconstruyó su carrera.',
  aboutSign:
    `Educación: EFOMM Estudios Marítimos, Harvard CS50, Le Wagon Full Stack Web Development y Le Wagon Data Engineering.

Idiomas: portugués nativo, inglés fluido, español fluido.`,
  skillsNpc:
    `Este gimnasio recuerda otro lado de Felipe: el atleta que siempre estuvo cerca del deporte.

El básquetbol fue su juego principal en la escuela y la universidad, donde compitió, entrenó con equipos y ganó muchas medallas por el camino.

Hoy todavía disfruta un partido ocasional, pero mantiene la forma con una rutina constante de gimnasio.`,
  skillsNpcChallenge:
    'La disciplina se prueba una ronda a la vez. Gana esta prueba del gimnasio y la sala te concederá un cristal.',
  skillsSign:
    `Stack principal: Ruby on Rails, React, TypeScript, PostgreSQL, AWS, Kubernetes, Docker, MongoDB, Redis, Python y Go.

También trabaja con Datadog, CI/CD, ETL, Spark, BigQuery y data warehousing.

Reconocido en Runa con MVP Award 2023, Everyday Hero 2024 y MVP Award 2025.`,
  contactSign:
    `Email: ${portfolioContact.email}\nLinkedIn: ${portfolioContact.linkedIn}\nGitHub: ${portfolioContact.github}`,
}

const brazilianPortuguesePortfolioDialogues: PortfolioDialogues = {
  questGuide: (visitorName: string) => [
    `${visitorName}, esta ilha conta a jornada de Felipe Kummer dos navios de GNL aos sistemas de software.`,
    'O Cristal Ruby Craft espera na Casa de Projetos. O Cristal de Conhecimento AWS espera na Casa de Educação. O Cristal de Vitalidade Esmeralda espera na Academia.',
    'Fale com cada guardião para conhecer seu trabalho em SaaS, sua experiência marítima, stack técnico, prêmios, idiomas e forma de trabalhar.',
    'Pegue este mapa. Aperte M no mundo para ver sua posição e onde cada cristal espera.',
  ],
  finalGuideChallenge: (visitorName: string) => [
    `${visitorName}, agora todos os cristais respondem ao seu chamado.`,
    'Você atravessou o ofício de produto, a disciplina operacional e a engenharia em nuvem. A ilha reconhece você como seu herói.',
    'Resta um prêmio final, mas ele não é entregue sem uma última prova.',
    'Enfrente-me em uma batalha final. Vença, e abrirei o caminho até Felipe Kummer.',
  ],
  projectsNpc:
    `Felipe trabalha na Runa construindo tecnologia de folha de pagamento e RH para empresas no México.

Seu trabalho de produto fica onde negócio, compliance e operação se encontram: APIs, regras fiscais, automação de folha, relatórios, integrações, confiabilidade em produção e suporte a sistemas que precisam funcionar sob pressão.`,
  projectsNpcChallenge:
    'Um produto só conta quando funciona sob pressão. Vença esta prova rápida e eu entregarei um cristal da sala de projetos.',
  projectsSign:
    'Freelance e projetos paralelos: plataformas de reserva de viagens, integrações com Slack, automação de monitoramento na AWS, apps relacionados ao Spotify e sistemas web cloud-native.',
  aboutNpc:
    `Esta casa guarda a história de origem de Felipe.

Desde jovem ele mostrou talento natural para matemática, física e idiomas, além de uma grande capacidade de aprender quando um desafio despertava sua curiosidade.

Antes do software, foi Oficial de Náutica em navios metaneiros da Golar LNG, lidando com navegação, operações de carga, segurança, resposta a emergências e tripulações multinacionais.

Essa fase ensinou disciplina, gestão de risco, comunicação clara e respeito por sistemas complexos.`,
  aboutNpcChallenge:
    'Conhecimento tem um preço nesta escola. Vença uma batalha rápida e eu contarei como Felipe reconstruiu sua carreira.',
  aboutSign:
    `Educação: EFOMM Estudos Marítimos, Harvard CS50, Le Wagon Full Stack Web Development e Le Wagon Data Engineering.

Idiomas: português nativo, inglês fluente, espanhol fluente.`,
  skillsNpc:
    `Esta academia lembra outro lado de Felipe: o atleta que sempre esteve ligado aos esportes.

O basquete foi seu principal jogo na escola e na faculdade, onde competiu, treinou com equipes e conquistou muitas medalhas pelo caminho.

Hoje ele ainda curte uma partida ocasional, mas mantém a forma com uma rotina constante de academia.`,
  skillsNpcChallenge:
    'Disciplina se testa uma rodada por vez. Vença esta prova da academia e a sala concederá um cristal.',
  skillsSign:
    `Stack principal: Ruby on Rails, React, TypeScript, PostgreSQL, AWS, Kubernetes, Docker, MongoDB, Redis, Python e Go.

Ele também trabalha com Datadog, CI/CD, ETL, Spark, BigQuery e data warehousing.

Reconhecido na Runa com MVP Award 2023, Everyday Hero 2024 e MVP Award 2025.`,
  contactSign:
    `Email: ${portfolioContact.email}\nLinkedIn: ${portfolioContact.linkedIn}\nGitHub: ${portfolioContact.github}`,
}

const portfolioDialoguesByLanguage: Record<LanguageCode, PortfolioDialogues> = {
  en: englishPortfolioDialogues,
  es: spanishPortfolioDialogues,
  'pt-BR': brazilianPortuguesePortfolioDialogues,
}

export const portfolioDialogues = englishPortfolioDialogues

export function getPortfolioDialogues(language: LanguageCode) {
  return portfolioDialoguesByLanguage[language]
}
