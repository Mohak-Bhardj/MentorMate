import { Menu, Search, X } from 'lucide-react'
import { formatLongDate } from '../services/mentorService'

const PAGE_TITLES = {
  overview: 'Overview',
  students: 'My Students',
  meetings: 'Meetings',
  register: 'Mentoring Register',
  'log-meeting': 'Log a meeting',
}

export default function Header({
  page,
  mentor,
  search,
  onSearchChange,
  navOpen,
  onToggleNav,
}) {
  return (
    <header className="topbar">
      <div className="topbar-main">
        <button
          type="button"
          className="icon-button menu-toggle"
          aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={navOpen}
          aria-controls="app-sidebar"
          onClick={onToggleNav}
        >
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div>
          <p className="eyebrow">MentorMate</p>
          <h1>{PAGE_TITLES[page] ?? 'Overview'}</h1>
          <p className="greeting">
            Hello, {mentor.name}. {formatLongDate()}
          </p>
        </div>
      </div>

      <label className="search-field">
        <Search size={16} aria-hidden="true" />
        <span className="sr-only">Search students</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, ID, or department"
        />
      </label>
    </header>
  )
}
