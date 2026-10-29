
const STORAGE_KEY = 'mentormate.meetings.v1'

function canUseStorage() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
  } catch {
    return false
  }
}

function normalizeMeeting(meeting) {
  if (!meeting || typeof meeting !== 'object') return null
  if (!meeting.studentId) return null

  return {
    ...meeting,
    id: meeting.id || `MTG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    studentId: String(meeting.studentId),
    meetingDate: normalizeDateOnly(meeting.meetingDate),
    summary: String(meeting.summary ?? ''),
    agreedAction: String(meeting.agreedAction ?? ''),
    followUpDate: normalizeDateOnly(meeting.followUpDate),
  }
}

function normalizeDateOnly(value) {
  if (!value) return ''

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ''
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, '0'),
      String(value.getDate()).padStart(2, '0'),
    ].join('-')
  }

  const text = String(value).trim()

  // Preserve date-only values without timezone conversion.
  const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnly) {
    const [, year, month, day] = dateOnly
    const check = new Date(Number(year), Number(month) - 1, Number(day))

    if (
      check.getFullYear() !== Number(year) ||
      check.getMonth() !== Number(month) - 1 ||
      check.getDate() !== Number(day)
    ) {
      return ''
    }

    return text
  }

  // Handle older ISO date-time values by keeping their written date.
  const isoDateTime = text.match(/^(\d{4}-\d{2}-\d{2})T/)
  if (isoDateTime) return normalizeDateOnly(isoDateTime[1])

  return ''
}

export function loadMeetings() {
  if (!canUseStorage()) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const meetings = parsed.map(normalizeMeeting).filter(Boolean)

    // Save the cleaned, consistent records for subsequent reads.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings))

    return meetings
  } catch {
    return []
  }
}

export function saveMeetings(meetings) {
  const normalized = Array.isArray(meetings)
    ? meetings.map(normalizeMeeting).filter(Boolean)
    : []

  if (!canUseStorage()) return normalized

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  } catch (error) {
    console.error('Could not save MentorMate meetings:', error)
  }

  return normalized
}

export function addMeeting(meetings, draft) {
  const next = [
    {
      id: `MTG-${Date.now()}`,
      studentId: draft.studentId,
      meetingDate: normalizeDateOnly(draft.meetingDate),
      summary: String(draft.summary ?? '').trim(),
      agreedAction: String(draft.agreedAction ?? '').trim(),
      followUpDate: normalizeDateOnly(draft.followUpDate),
    },
    ...meetings,
  ]

  return saveMeetings(next)
}

export function escapeCsvValue(value) {
  const text = value == null ? '' : String(value)

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

export function meetingsToCsv(meetings, students) {
  const header = [
    'student_id',
    'student_name',
    'meeting_date',
    'summary',
    'agreed_action',
    'follow_up_date',
  ]

  const rows = meetings.map((meeting) => {
    const student = students.find(
      (item) => String(item.id) === String(meeting.studentId),
    )

    return [
      meeting.studentId,
      student?.name ?? '',
      normalizeDateOnly(meeting.meetingDate),
      meeting.summary,
      meeting.agreedAction,
      normalizeDateOnly(meeting.followUpDate),
    ].map(escapeCsvValue)
  })

  return [
    header.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\r\n')
}

export function downloadMeetingsCsv(meetings, students) {
  const csv = meetingsToCsv(meetings, students)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'mentormate-register.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function startOfWeek(date = new Date()) {
  const value = new Date(date)
  const day = value.getDay()
  const diff = day === 0 ? 6 : day - 1

  value.setHours(0, 0, 0, 0)
  value.setDate(value.getDate() - diff)

  return value
}

export function endOfWeek(date = new Date()) {
  const value = startOfWeek(date)
  value.setDate(value.getDate() + 6)
  value.setHours(23, 59, 59, 999)

  return value
}

export function parseDateOnly(value) {
  const normalized = normalizeDateOnly(value)
  if (!normalized) return null

  const [year, month, day] = normalized.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null
  }

  return parsed
}

export function isMeetingThisWeek(meeting, now = new Date()) {
  const meetingDate = parseDateOnly(meeting.meetingDate)
  if (!meetingDate) return false

  return meetingDate >= startOfWeek(now) &&
    meetingDate <= endOfWeek(now)
}

export function isFollowUpDue(meeting, now = new Date()) {
  const followUp = parseDateOnly(meeting.followUpDate)
  if (!followUp) return false

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  return followUp <= today
}

export function formatDisplayDate(value) {
  const date = parseDateOnly(value)
  if (!date) return 'Not set'

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatLongDate(date = new Date()) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function todayIsoDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function matchesSearch(student, query) {
  const term = query.trim().toLowerCase()
  if (!term) return true

  return [student.name, student.id, student.department]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(term))
}
