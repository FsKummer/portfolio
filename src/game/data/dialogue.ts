export const introDialogue = [
  'hey there traveler.',
  'before you drift into felipe kummer\'s portfolio, i need one thing.',
  'mind to say your name?',
] as const

export const characterSelectPrompt = (visitorName: string) => [
  `${visitorName}, choose the traveler who will carry your story through this world.`,
] as const

export const characterSelectConfirm = (visitorName: string) =>
  `ok welcome to the adventure portfolio of Felipe Kummer, ${visitorName}.`
