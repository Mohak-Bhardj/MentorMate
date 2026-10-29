import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import StudentPanel from './components/StudentPanel'
import MeetingForm from './components/MeetingForm'
import OverviewPage from './pages/OverviewPage'
import StudentsPage from './pages/StudentsPage'
import MeetingsPage from './pages/MeetingsPage'
import RegisterPage from './pages/RegisterPage'
import { CURRENT_MENTOR, mockStudents } from './data/mockStudents'
import { addMeeting, loadMeetings } from './services/mentorService'

function App() {
  const students = useMemo(
    () => mockStudents.filter((student) => student.mentor_id === CURRENT_MENTOR.id),
    [],
  )
  const [page, setPage] = useState('overview')
  const [search, setSearch] = useState('')
  const [navOpen, setNavOpen] = useState(false)
  const [meetings, setMeetings] = useState(() => loadMeetings())
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [meetingStudentId, setMeetingStudentId] = useState(null)

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setSelectedStudentId(null)
        setNavOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function openMeetingForm(studentId) {
    setMeetingStudentId(studentId ?? selectedStudentId ?? '')
    setSelectedStudentId(null)
    setPage('log-meeting')
    setNavOpen(false)
  }

  function handleSaveMeeting(draft) {
    setMeetings((current) => addMeeting(current, draft))
    setPage('meetings')
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      {navOpen ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <Sidebar
        page={page === 'log-meeting' ? 'meetings' : page}
        onNavigate={setPage}
        mentor={CURRENT_MENTOR}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      <div className="app-main">
        <Header
          page={page}
          mentor={CURRENT_MENTOR}
          search={search}
          onSearchChange={setSearch}
          navOpen={navOpen}
          onToggleNav={() => setNavOpen((open) => !open)}
        />

        <main id="main-content">
          {page === 'overview' ? (
            <OverviewPage
              students={students}
              meetings={meetings}
              search={search}
              onSelectStudent={setSelectedStudentId}
            />
          ) : null}
          {page === 'students' ? (
            <StudentsPage
              students={students}
              search={search}
              onSelectStudent={setSelectedStudentId}
            />
          ) : null}
          {page === 'meetings' ? (
            <MeetingsPage
              meetings={meetings}
              students={students}
              onLogMeeting={openMeetingForm}
              onSelectStudent={setSelectedStudentId}
            />
          ) : null}
          {page === 'register' ? (
            <RegisterPage meetings={meetings} students={students} />
          ) : null}
          {page === 'log-meeting' ? (
            <MeetingForm
              students={students}
              initialStudentId={meetingStudentId}
              onSave={handleSaveMeeting}
              onCancel={() => setPage('meetings')}
            />
          ) : null}
        </main>
      </div>

      {selectedStudent ? (
        <StudentPanel
          student={selectedStudent}
          meetings={meetings}
          onClose={() => setSelectedStudentId(null)}
          onLogMeeting={openMeetingForm}
        />
      ) : null}
    </div>
  )
}

export default App
