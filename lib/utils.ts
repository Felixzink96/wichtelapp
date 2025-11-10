// Utility functions for the app

/**
 * Generate a random alphanumeric code
 */
export function generateCode(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Format date to German format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Wichtel drawing algorithm (Fisher-Yates with constraints)
 * Ensures no one draws themselves
 */
export function performDraw(participantIds: string[]): Map<string, string> {
  if (participantIds.length < 2) {
    throw new Error('Need at least 2 participants for a draw')
  }

  const n = participantIds.length
  const givers = [...participantIds]
  const receivers = [...participantIds]

  let attempts = 0
  const maxAttempts = 1000

  while (attempts < maxAttempts) {
    // Shuffle receivers
    for (let i = receivers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[receivers[i], receivers[j]] = [receivers[j], receivers[i]]
    }

    // Check if anyone got themselves
    let valid = true
    for (let i = 0; i < n; i++) {
      if (givers[i] === receivers[i]) {
        valid = false
        break
      }
    }

    if (valid) {
      // Create the mapping
      const result = new Map<string, string>()
      for (let i = 0; i < n; i++) {
        result.set(givers[i], receivers[i])
      }
      return result
    }

    attempts++
  }

  throw new Error('Could not find valid draw after max attempts')
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
