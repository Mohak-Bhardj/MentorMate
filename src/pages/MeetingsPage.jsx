import EmptyState from '../components/EmptyState'
import { formatDisplayDate } from '../services/mentorService'

export default function MeetingsPage({ meetings, students, onLogMeeting, onSelectStudent }) {
  if (meetings.length === 0) {
    return (
      <EmptyState
        title="No meetings logged yet"
        message="After you speak with a student, save a short record so follow-ups and the register stay complete."
        action={
          <button type="button" className="button-primary" onClick={() => onLogMeeting()}>
            Log a meeting
          </button>
        }
      />
    )
  }

  return (
    <div className="page-stack">
      <div className="toolbar">
        <p className="muted">
          {meetings.length} saved {meetings.length === 1 ? 'record' : 'records'}.
        </p>
        <button type="button" className="button-primary" onClick={() => onLogMeeting()}>
          Log a meeting
        </button>
      </div>
      <ul className="meeting-list">
        {meetings.map((meeting) => {
          const student = students.find((item) => item.id === meeting.studentId)
          return (
            <li key={meeting.id} className="card meeting-card">
              <div className="meeting-card-head">
                <button type="button" className="text-link" onClick={() => student && onSelectStudent(student.id)}>
                  {student?.name ?? 'Unknown student'}
                </button>
                <p className="muted">{formatDisplayDate(meeting.meetingDate)}</p>
              </div>
              <p>{meeting.summary}</p>
              <p>
                <strong>Agreed action:</strong> {meeting.agreedAction}
              </p>
              <p className="muted">Follow-up: {formatDisplayDate(meeting.followUpDate)}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
