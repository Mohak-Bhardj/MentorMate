import { ChevronRight } from 'lucide-react'
import { getStudentAlerts } from '../utils/alerts'

export default function AttentionList({ students, onSelect }) {
  if (students.length === 0) {
    return (
      <p className="muted">
        No students currently match the alert rules, or your search hid the list.
      </p>
    )
  }

  return (
    <ul className="attention-list">
      {students.map((student) => {
        const alerts = getStudentAlerts(student)
        return (
          <li key={student.id}>
            <button
              type="button"
              className="attention-item"
              onClick={() => onSelect(student.id)}
            >
              <div>
                <p className="student-name">{student.name}</p>
                <p className="student-meta">
                  {student.id} · {student.department}
                </p>
                <ul className="alert-reasons">
                  {alerts.map((alert) => (
                    <li key={alert.id}>{alert.message}</li>
                  ))}
                </ul>
              </div>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
