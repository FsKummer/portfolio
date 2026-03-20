export type AvatarChoice = 'boy' | 'girl'

export type VisitorProfile = {
  visitorName: string
  avatar: AvatarChoice | null
}

const STORAGE_KEY = 'felipe-kummer-portfolio-profile'

const DEFAULT_PROFILE: VisitorProfile = {
  visitorName: '',
  avatar: null,
}

export function loadVisitorProfile(): VisitorProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE
  }

  const storedProfile = window.localStorage.getItem(STORAGE_KEY)

  if (!storedProfile) {
    return DEFAULT_PROFILE
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
    }
  } catch {
    return DEFAULT_PROFILE
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
  }

  saveVisitorProfile(nextProfile)

  return nextProfile
}
