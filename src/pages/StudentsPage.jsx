import { getStudentAlerts } from '../utils/alerts'
import { matchesSearch } from '../services/mentorService'
import EmptyState from '../components/EmptyState'

export default function StudentsPage({ students, search, onSelectStudent }) {
  const visible = students.filter((student) => matchesSearch(student, search))

  if (visible.length === 0) {
    return (
      <EmptyState
        title="No matching students"
        message="Try a different name, student ID, or department."
      />
    )
  }

  return (
    <div className="card">
      <div className="section-heading">
        <div>
          <h2>Assigned students</h2>
          <p className="muted">{visible.length} of {students.length} students shown.</p>
        </div>
      </div>
      <ul className="student-grid">
        {visible.map((student) => {
          const alerts = getStudentAlerts(student)
          return (
            <li key={student.id}>
              <button type="button" className="student-card" onClick={() => onSelectStudent(student.id)}>
                <p className="student-name">{student.name}</p>
                <p className="student-meta">
                  {student.id} · {student.department}
                </p>
                {alerts.length > 0 ? (
                  <p className="alert-count">
                    {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
                  </p>
                ) : (
                  <p className="ok-count">No current alerts</p>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
