export type AvatarChoice = 'boy' | 'girl'

export type VisitorProgress = {
  crystalIds: string[]
  defeatedBattleIds: string[]
}

export type VisitorProfile = {
  avatar: AvatarChoice | null
  progress: VisitorProgress
  visitorName: string
}

const STORAGE_KEY = 'felipe-kummer-portfolio-profile'

const DEFAULT_PROFILE: VisitorProfile = {
  avatar: null,
  progress: {
    crystalIds: [],
    defeatedBattleIds: [],
  },
  visitorName: '',
}

function createDefaultProfile(): VisitorProfile {
  return {
    avatar: DEFAULT_PROFILE.avatar,
    progress: {
      crystalIds: [...DEFAULT_PROFILE.progress.crystalIds],
      defeatedBattleIds: [...DEFAULT_PROFILE.progress.defeatedBattleIds],
    },
    visitorName: DEFAULT_PROFILE.visitorName,
  }
}

function normalizeProgress(progress: Partial<VisitorProgress> | undefined): VisitorProgress {
  const crystalIds = Array.isArray(progress?.crystalIds)
    ? progress.crystalIds.filter((crystalId) => typeof crystalId === 'string')
    : DEFAULT_PROFILE.progress.crystalIds
  const defeatedBattleIds = Array.isArray(progress?.defeatedBattleIds)
    ? progress.defeatedBattleIds.filter((battleId) => typeof battleId === 'string')
    : DEFAULT_PROFILE.progress.defeatedBattleIds

  return {
    crystalIds: Array.from(new Set(crystalIds)),
    defeatedBattleIds: Array.from(new Set(defeatedBattleIds)),
  }
}

export function loadVisitorProfile(): VisitorProfile {
  if (typeof window === 'undefined') {
    return createDefaultProfile()
  }

  const storedProfile = window.localStorage.getItem(STORAGE_KEY)

  if (!storedProfile) {
    return createDefaultProfile()
  }

  try {
    const parsedProfile = JSON.parse(storedProfile) as Partial<VisitorProfile>

    return {
      visitorName:
        typeof parsedProfile.visitorName === 'string'
          ? parsedProfile.visitorName
          : DEFAULT_PROFILE.visitorName,
      avatar:
        parsedProfile.avatar === 'boy' || parsedProfile.avatar === 'girl'
          ? parsedProfile.avatar
          : DEFAULT_PROFILE.avatar,
      progress: normalizeProgress(parsedProfile.progress),
    }
  } catch {
    return createDefaultProfile()
  }
}

export function saveVisitorProfile(profile: VisitorProfile) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function updateVisitorProfile(partialProfile: Partial<VisitorProfile>) {
  const currentProfile = loadVisitorProfile()
  const nextProfile = {
    ...currentProfile,
    ...partialProfile,
    progress: normalizeProgress({
      ...currentProfile.progress,
      ...partialProfile.progress,
    }),
  }

  saveVisitorProfile(nextProfile)

  return nextProfile
}

export function hasDefeatedBattle(battleId: string) {
  return loadVisitorProfile().progress.defeatedBattleIds.includes(battleId)
}

export function markBattleDefeated(battleId: string) {
  const currentProfile = loadVisitorProfile()

  if (currentProfile.progress.defeatedBattleIds.includes(battleId)) {
    return currentProfile
  }

  return updateVisitorProfile({
    progress: {
      ...currentProfile.progress,
      defeatedBattleIds: [...currentProfile.progress.defeatedBattleIds, battleId],
    },
  })
}

export function hasCrystal(crystalId: string) {
  return loadVisitorProfile().progress.crystalIds.includes(crystalId)
}

export function collectCrystal(crystalId: string) {
  const currentProfile = loadVisitorProfile()

  if (currentProfile.progress.crystalIds.includes(crystalId)) {
    return currentProfile
  }

  return updateVisitorProfile({
    progress: {
      ...currentProfile.progress,
      crystalIds: [...currentProfile.progress.crystalIds, crystalId],
    },
  })
}
