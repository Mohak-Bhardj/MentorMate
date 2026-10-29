import { useState } from 'react'
import { todayIsoDate } from '../services/mentorService'

const EMPTY = {
  studentId: '',
  meetingDate: '',
  summary: '',
  agreedAction: '',
  followUpDate: '',
}

export default function MeetingForm({ students, initialStudentId, onSave, onCancel }) {
  const [form, setForm] = useState({
    ...EMPTY,
    studentId: initialStudentId ?? '',
    meetingDate: todayIsoDate(),
  })
  const [errors, setErrors] = useState({})

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validate() {
    const next = {}
    if (!form.studentId) next.studentId = 'Select a student.'
    if (!form.meetingDate) next.meetingDate = 'Choose a meeting date.'
    if (!form.summary.trim()) next.summary = 'Add a short discussion summary.'
    if (!form.agreedAction.trim()) next.agreedAction = 'Record the agreed action.'
    if (!form.followUpDate) next.followUpDate = 'Choose a follow-up date.'
    if (form.meetingDate && form.followUpDate && form.followUpDate < form.meetingDate) {
      next.followUpDate = 'Follow-up should be on or after the meeting date.'
    }
    return next
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSave(form)
  }

  return (
    <form className="meeting-form card" onSubmit={handleSubmit} noValidate>
      <p className="muted">
        Capture what you discussed so the student file and accreditation register stay current.
      </p>

      <label>
        Student
        <select
          value={form.studentId}
          onChange={(event) => update('studentId', event.target.value)}
          aria-invalid={Boolean(errors.studentId)}
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.id})
            </option>
          ))}
        </select>
        {errors.studentId ? <span className="field-error">{errors.studentId}</span> : null}
      </label>

      <label>
        Meeting date
        <input
          type="date"
          value={form.meetingDate}
          onChange={(event) => update('meetingDate', event.target.value)}
          aria-invalid={Boolean(errors.meetingDate)}
        />
        {errors.meetingDate ? <span className="field-error">{errors.meetingDate}</span> : null}
      </label>

      <label>
        Discussion summary
        <textarea
          rows="4"
          value={form.summary}
          onChange={(event) => update('summary', event.target.value)}
          placeholder="What did you talk about?"
          aria-invalid={Boolean(errors.summary)}
        />
        {errors.summary ? <span className="field-error">{errors.summary}</span> : null}
      </label>

      <label>
        Agreed action
        <textarea
          rows="3"
          value={form.agreedAction}
          onChange={(event) => update('agreedAction', event.target.value)}
          placeholder="What will the student or mentor do next?"
          aria-invalid={Boolean(errors.agreedAction)}
        />
        {errors.agreedAction ? <span className="field-error">{errors.agreedAction}</span> : null}
      </label>

      <label>
        Follow-up date
        <input
          type="date"
          value={form.followUpDate}
          onChange={(event) => update('followUpDate', event.target.value)}
          aria-invalid={Boolean(errors.followUpDate)}
        />
        {errors.followUpDate ? <span className="field-error">{errors.followUpDate}</span> : null}
      </label>

      <div className="form-actions">
        <button type="submit" className="button-primary">
          Save meeting
        </button>
        <button type="button" className="button-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
