export const ATTENDANCE_THRESHOLD = 75
export const MARKS_DROP_THRESHOLD = 15
export const LMS_INACTIVE_DAYS = 7

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

export function getStudentAlerts(student) {
  if (!student) return []

  const alerts = []

  if (
    isFiniteNumber(student.attendance_pct) &&
    student.attendance_pct < ATTENDANCE_THRESHOLD
  ) {
    alerts.push({
      id: `${student.id}-attendance`,
      type: 'attendance',
      label: 'Attendance',
      message: `Attendance is ${student.attendance_pct}%, below the ${ATTENDANCE_THRESHOLD}% threshold.`,
    })
  }

  if (
    isFiniteNumber(student.previous_marks) &&
    isFiniteNumber(student.current_marks)
  ) {
    const drop = student.previous_marks - student.current_marks
    if (drop >= MARKS_DROP_THRESHOLD) {
      alerts.push({
        id: `${student.id}-marks`,
        type: 'marks',
        label: 'Marks drop',
        message: `Internal marks fell from ${student.previous_marks}% to ${student.current_marks}%, a drop of ${drop} percentage points.`,
      })
    }
  }

  if (
    isFiniteNumber(student.lms_days_inactive) &&
    student.lms_days_inactive >= LMS_INACTIVE_DAYS
  ) {
    alerts.push({
      id: `${student.id}-lms`,
      type: 'lms',
      label: 'LMS inactivity',
      message: `No LMS activity recorded for ${student.lms_days_inactive} days.`,
    })
  }

  return alerts
}

export function studentNeedsConversation(student) {
  return getStudentAlerts(student).length > 0
}

export function formatPercent(value) {
  return isFiniteNumber(value) ? `${value}%` : 'Not recorded'
}

export function formatDays(value) {
  if (!isFiniteNumber(value)) return 'Not recorded'
  if (value === 1) return '1 day'
  return `${value} days`
}
