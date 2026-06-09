export const portfolioDialogues = {
  questGuide: (visitorName: string) => [
    `${visitorName}, this island answers to three portfolio crystals.`,
    'The Ruby Craft Crystal waits in the Projects House. The Azure Knowledge Crystal waits in the Education House. The Emerald Vitality Crystal waits in the Gym House.',
    'Speak with each guardian, face their trial, and claim every crystal. Move with WASD or arrows, sprint with Shift, and interact with E, Enter, or Space.',
    'Take this map. Press M in the world to see your position and where each crystal waits.',
  ],
  finalGuideChallenge: (visitorName: string) => [
    `${visitorName}, every crystal now answers your call.`,
    'You have crossed craft, knowledge, and discipline. The island recognizes you as its hero.',
    'One final prize remains, but it is not handed away freely.',
    'Face me in a final battle. Win, and I will open the path to Felipe Kummer.',
  ],
  projectsNpc:
    'Felipe likes building polished product surfaces with game feel, strong interaction detail, and clean engineering under the hood.',
  projectsNpcChallenge:
    'A project only counts when it works under pressure. Win this quick trial, and I will hand you a crystal from the project room.',
  projectsSign:
    'Featured projects will live here. This room is reserved for playable case studies, selected builds, and deeper technical breakdowns.',
  aboutNpc:
    'Felipe is a software engineer focused on memorable interfaces and practical architecture.\nHe builds products that feel intentional from the first interaction.',
  aboutNpcChallenge:
    'Knowledge has a price in this school. Win a quick trial battle, and I will tell you more about Felipe Kummer.',
  aboutSign:
    "This room covers Felipe's background, philosophy, and the context behind the work.",
  skillsNpc:
    'Outside software, Felipe likes staying active and using the gym as a reset.\nThis room is for hobbies, discipline, and the parts of life that keep the work balanced.',
  skillsNpcChallenge:
    'Discipline is tested one round at a time. Beat this gym trial, and the room will grant you a crystal.',
  skillsSign:
    "This room covers Felipe's hobbies, training routine, and the interests he keeps outside software.",
  contactSign:
    'The dock is the contact point. Later this will open links, contact methods, and a message flow for visitors.',
} as const
