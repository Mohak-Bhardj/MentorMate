import {
  ClipboardList,
  LayoutDashboard,
  CalendarDays,
  Users,
  GraduationCap,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'My Students', icon: Users },
  { id: 'meetings', label: 'Meetings', icon: CalendarDays },
  { id: 'register', label: 'Mentoring Register', icon: ClipboardList },
]

export default function Sidebar({ page, onNavigate, mentor, open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`} id="app-sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <GraduationCap size={22} />
        </span>
        <div>
          <p className="brand-name">MentorMate</p>
          <p className="brand-tagline">The ten-minute weekly mentor</p>
        </div>
      </div>

      <nav aria-label="Main">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = page === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                onNavigate(item.id)
                onClose()
              }}
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <p className="mentor-chip-label">Signed in as</p>
        <p className="mentor-chip-name">{mentor.name}</p>
        <p className="mentor-chip-role">{mentor.title}</p>
      </div>
    </aside>
  )
}
