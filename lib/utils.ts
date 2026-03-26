import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function normalizeEpoch(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return value

  if (value < 1e10) return value * 1000 // seconds
  if (value < 1e13) return value // milliseconds
  if (value < 1e16) return Math.round(value / 1000) // microseconds
  if (value < 1e19) return Math.round(value / 1_000_000) // nanoseconds

  return value
}

export function parseDateValue(value: string | number | Date | null | undefined): Date | null {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return null
    if (value.getFullYear() > 2100 || value.getFullYear() < 1900) {
      const fromEpoch = normalizeEpoch(value.valueOf())
      const alt = new Date(fromEpoch)
      if (Number.isFinite(alt.getTime()) && alt.getFullYear() >= 1900 && alt.getFullYear() <= 2100) {
        return alt
      }
      return null
    }
    return value
  }

  if (typeof value === 'number') {
    const epoch = normalizeEpoch(value)
    const date = new Date(epoch)
    return Number.isFinite(date.getTime()) ? date : null
  }

  const trimmed = value.trim()
  if (!trimmed) return null

  const parsedNumber = Number(trimmed)
  if (!Number.isNaN(parsedNumber)) {
    return parseDateValue(parsedNumber)
  }

  const parts = trimmed.split('/')
  if (parts.length === 2) {
    const month = Number(parts[0])
    const year = Number(parts[1])
    if (!Number.isNaN(month) && !Number.isNaN(year) && month >= 1 && month <= 12 && year >= 1900 && year < 10000) {
      return new Date(year, month - 1, 1)
    }
  }

  const monthNames = {
    janeiro: 1,
    fevereiro: 2,
    marco: 3,
    março: 3,
    abril: 4,
    maio: 5,
    junho: 6,
    julho: 7,
    agosto: 8,
    setembro: 9,
    outubro: 10,
    novembro: 11,
    dezembro: 12,
  }

  const words = trimmed.toLowerCase().replace(/\s+de\s+/g, '/').split('/')
  if (words.length === 2) {
    const month = monthNames[words[0] as keyof typeof monthNames]
    const year = Number(words[1])
    if (month && !Number.isNaN(year) && year >= 1900 && year < 10000) {
      return new Date(year, month - 1, 1)
    }
  }

  const date = new Date(trimmed)
  if (Number.isFinite(date.getTime())) {
    return date
  }

  return null
}

export function normalizeDateValue(value: string | number | Date | null | undefined): Date {
  const parsed = parseDateValue(value)
  return parsed || new Date()
}

export function formatMonthYear(date: Date): string {
  const monthName = date.toLocaleDateString('pt-BR', { month: 'long' })
  const year = date.getFullYear()
  return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)}/${year}`
}
