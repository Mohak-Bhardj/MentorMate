import EmptyState from '../components/EmptyState'
import { downloadMeetingsCsv, formatDisplayDate } from '../services/mentorService'

export default function RegisterPage({ meetings, students }) {
  if (meetings.length === 0) {
    return (
      <EmptyState
        title="Register is empty"
        message="Logged meetings will appear here as a clean table you can export for accreditation."
      />
    )
  }

  return (
    <div className="card">
      <div className="section-heading">
        <div>
          <h2>Accreditation register</h2>
          <p className="muted">Export a CSV of mentoring conversations, actions, and follow-up dates.</p>
        </div>
        <button
          type="button"
          className="button-secondary"
          onClick={() => downloadMeetingsCsv(meetings, students)}
        >
          Export CSV
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <caption className="sr-only">Mentoring register</caption>
          <thead>
            <tr>
              <th scope="col">Student ID</th>
              <th scope="col">Student name</th>
              <th scope="col">Meeting date</th>
              <th scope="col">Summary</th>
              <th scope="col">Agreed action</th>
              <th scope="col">Follow-up date</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => {
              const student = students.find((item) => item.id === meeting.studentId)
              return (
                <tr key={meeting.id}>
                  <td data-label="Student ID">{meeting.studentId}</td>
                  <td data-label="Student name">{student?.name ?? '—'}</td>
                  <td data-label="Meeting date">{formatDisplayDate(meeting.meetingDate)}</td>
                  <td data-label="Summary">{meeting.summary}</td>
                  <td data-label="Agreed action">{meeting.agreedAction}</td>
                  <td data-label="Follow-up date">{formatDisplayDate(meeting.followUpDate)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
