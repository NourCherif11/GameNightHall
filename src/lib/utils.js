import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatPrice(dinars) {
  const value = dinars ?? 0
  return `${value.toFixed(2)} TND`
}

export function calculatePrice(seconds, hourlyRate = 10) {
  const hours = seconds / 3600
  return Math.ceil(hours * hourlyRate * 100) / 100
}

/**
 * Calculate price based on counter settings
 * @param {number} seconds - Total elapsed time in seconds
 * @param {object} settings - Counter pricing settings
 * @param {number} settings.startingValue - Initial price (TND)
 * @param {number} settings.incrementAmount - Amount to add per interval (TND)
 * @param {number} settings.incrementInterval - Seconds between increments
 * @param {number} settings.gracePeriod - Free seconds at start
 * @param {number} multiplier - Price multiplier (default 1)
 * @returns {number} - Calculated price in TND
 */
export function calculateCounterPrice(seconds, settings, multiplier = 1) {
  const { startingValue = 0, incrementAmount = 2, incrementInterval = 900, gracePeriod = 300 } = settings

  // Apply multiplier to pricing values
  const adjustedStartingValue = startingValue * multiplier
  const adjustedIncrementAmount = incrementAmount * multiplier

  // If no grace period, calculate intervals normally from start
  if (gracePeriod === 0) {
    const intervals = Math.floor(seconds / incrementInterval)
    return adjustedStartingValue + (intervals * adjustedIncrementAmount)
  }

  // During grace period, only charge starting value
  if (seconds <= gracePeriod) {
    return adjustedStartingValue
  }

  // After grace period, first increment happens immediately
  // Then each subsequent increment happens every incrementInterval seconds
  const secondsAfterGrace = seconds - gracePeriod
  const intervals = Math.ceil(secondsAfterGrace / incrementInterval)

  // Calculate total price
  const totalPrice = adjustedStartingValue + (intervals * adjustedIncrementAmount)

  return Math.max(0, totalPrice)
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`
}

export function getDayName(date) {
  return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' })
}

export function getWeekNumber(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}
