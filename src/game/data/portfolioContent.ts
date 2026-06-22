export const portfolioContact = {
  cvPath: '/assets/docs/Felipe_Kummer_CV_2026_v2.pdf',
  email: 'felipe.s.kummer@gmail.com',
  github: 'github.com/FsKummer',
  githubUrl: 'https://github.com/FsKummer',
  linkedIn: 'linkedin.com/in/felipe-kummer-dev',
  linkedInUrl: 'https://linkedin.com/in/felipe-kummer-dev',
} as const

export const portfolioDialogues = {
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
} as const
