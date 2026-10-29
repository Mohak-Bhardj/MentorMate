import { X } from 'lucide-react'
import { formatDays, formatPercent, getStudentAlerts } from '../utils/alerts'
import { formatDisplayDate } from '../services/mentorService'

export default function StudentPanel({ student, meetings, onClose, onLogMeeting }) {
  if (!student) return null

  const alerts = getStudentAlerts(student)
  const studentMeetings = meetings.filter((meeting) => meeting.studentId === student.id)

  return (
    <div className="panel-backdrop" onClick={onClose}>
      <aside
        className="student-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-panel-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">{student.id}</p>
            <h2 id="student-panel-title">{student.name}</h2>
            <p className="muted">{student.department}</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close student details">
            <X size={18} />
          </button>
        </div>

        <section>
          <h3>Academic indicators</h3>
          <dl className="indicator-grid">
            <div>
              <dt>Attendance</dt>
              <dd>{formatPercent(student.attendance_pct)}</dd>
            </div>
            <div>
              <dt>Previous marks</dt>
              <dd>{formatPercent(student.previous_marks)}</dd>
            </div>
            <div>
              <dt>Current marks</dt>
              <dd>{formatPercent(student.current_marks)}</dd>
            </div>
            <div>
              <dt>LMS inactivity</dt>
              <dd>{formatDays(student.lms_days_inactive)}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h3>Why a conversation may help</h3>
          {alerts.length === 0 ? (
            <p className="muted">No current alerts. Check in if the student asks for support.</p>
          ) : (
            <ul className="alert-reasons">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <strong>{alert.label}:</strong> {alert.message}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3>Previous mentoring meetings</h3>
          {studentMeetings.length === 0 ? (
            <p className="muted">No meetings have been logged for this student yet.</p>
          ) : (
            <ul className="meeting-mini-list">
              {studentMeetings.map((meeting) => (
                <li key={meeting.id}>
                  <p className="meeting-date">{formatDisplayDate(meeting.meetingDate)}</p>
                  <p>{meeting.summary}</p>
                  <p className="muted">Action: {meeting.agreedAction}</p>
                  <p className="muted">Follow-up: {formatDisplayDate(meeting.followUpDate)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <button type="button" className="button-primary" onClick={() => onLogMeeting(student.id)}>
          Log a meeting
        </button>
      </aside>
    </div>
  )
}
