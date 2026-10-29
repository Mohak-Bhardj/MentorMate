
import { useMemo, useState } from 'react'
import { getStudentAlerts, studentNeedsConversation } from '../utils/alerts'
import { isFollowUpDue, isMeetingThisWeek } from '../services/mentorService'

const COLORS = {
  navy: '#172554',
  teal: '#0d9488',
  blue: '#3b82f6',
  orange: '#f59e0b',
  purple: '#8b5cf6',
  muted: '#64748b',
}

const ALERT_TYPES = [
  { id: 'attendance', label: 'Low attendance', color: COLORS.orange },
  { id: 'marks', label: 'Marks drop', color: COLORS.blue },
  { id: 'lms', label: 'LMS inactivity', color: COLORS.purple },
]

const ATTENDANCE_BANDS = [
  { id: 'below60', label: 'Below 60%', min: 0, max: 60, color: '#ef4444' },
  { id: '60to74', label: '60–74%', min: 60, max: 75, color: COLORS.orange },
  { id: '75to89', label: '75–89%', min: 75, max: 90, color: COLORS.blue },
  { id: '90to100', label: '90–100%', min: 90, max: 101, color: COLORS.teal },
]

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <section className={`analytics-panel ${className}`}>
      <div className="analytics-panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function MetricCard({ icon, label, value, note, tone, onClick }) {
  return (
    <button
      type="button"
      className={`metric-card metric-${tone}`}
      onClick={onClick}
      aria-label={`${label}: ${value}. Click to explore.`}
    >
      <span className="metric-icon" aria-hidden="true">{icon}</span>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-note">{note}</span>
      <span className="metric-link">Explore <span aria-hidden="true">↗</span></span>
    </button>
  )
}

function DonutChart({ values, selected, onSelect }) {
  const total = values.reduce((sum, item) => sum + item.count, 0)
  const circumference = 2 * Math.PI * 66
  let offset = 0

  if (!total) {
    return (
      <div className="donut-wrap">
        <div className="donut-empty">No alerts recorded</div>
      </div>
    )
  }

  return (
    <div className="donut-layout">
      <div className="donut-wrap">
        <svg
          viewBox="0 0 180 180"
          role="img"
          aria-label="Breakdown of student alert types"
        >
          <circle
            cx="90"
            cy="90"
            r="66"
            fill="none"
            stroke="#edf1f7"
            strokeWidth="22"
          />

          {values.filter((item) => item.count > 0).map((item) => {
            const length = (item.count / total) * circumference
            const dashOffset = -offset
            offset += length

            return (
              <circle
                key={item.id}
                cx="90"
                cy="90"
                r="66"
                fill="none"
                stroke={item.color}
                strokeWidth={selected === item.id ? 27 : 22}
                strokeDasharray={`${Math.max(0, length - 2)} ${circumference}`}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 90 90)"
                className="donut-segment"
              />
            )
          })}

          <text x="90" y="84" textAnchor="middle" className="donut-total">
            {total}
          </text>
          <text x="90" y="105" textAnchor="middle" className="donut-caption">
            alerts
          </text>
        </svg>
      </div>

      <div className="donut-legend">
        {values.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`legend-row ${selected === item.id ? 'legend-selected' : ''}`}
            onClick={() => onSelect(selected === item.id ? null : item.id)}
            aria-pressed={selected === item.id}
          >
            <span
              className="legend-dot"
              style={{ background: item.color }}
            />
            <span className="legend-name">{item.label}</span>
            <strong>{item.count}</strong>
          </button>
        ))}
        <p className="chart-hint">Select a category to filter the student list.</p>
      </div>
    </div>
  )
}

function AttendanceChart({ students, selectedBand, onSelectBand }) {
  const recorded = students.filter(
    (student) =>
      typeof student.attendance_pct === 'number' &&
      Number.isFinite(student.attendance_pct),
  )

  const data = ATTENDANCE_BANDS.map((band) => ({
    ...band,
    count: recorded.filter(
      (student) =>
        student.attendance_pct >= band.min &&
        student.attendance_pct < band.max,
    ).length,
  }))

  const maxCount = Math.max(1, ...data.map((item) => item.count))

  return (
    <div className="bar-chart">
      {data.map((item) => (
        <button
          type="button"
          key={item.id}
          className={`bar-column ${selectedBand === item.id ? 'bar-column-selected' : ''}`}
          onClick={() =>
            onSelectBand(selectedBand === item.id ? null : item.id)
          }
          aria-pressed={selectedBand === item.id}
          aria-label={`${item.label}: ${item.count} students. Click to filter the list.`}
          title={`Show students with attendance ${item.label}`}
        >
          <span className="bar-number">{item.count}</span>

          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                height: `${(item.count / maxCount) * 100}%`,
                background: item.color,
              }}
            />
          </div>

          <span className="bar-label">{item.label}</span>
        </button>
      ))}

      <p className="chart-footnote">
        {recorded.length} of {students.length} students have attendance data.
        Select a bar to filter students below.
      </p>
    </div>
  )
}

function MarksChart({ students }) {
  const data = students
    .filter(
      (student) =>
        typeof student.previous_marks === 'number' &&
        typeof student.current_marks === 'number',
    )
    .sort(
      (a, b) =>
        (b.previous_marks - b.current_marks) -
        (a.previous_marks - a.current_marks),
    )
    .slice(0, 6)

  if (!data.length) {
    return (
      <p className="chart-empty">
        No comparable marks have been recorded yet.
      </p>
    )
  }

  return (
    <div className="marks-chart">
      {data.map((student) => {
        const drop = student.previous_marks - student.current_marks

        return (
          <div className="marks-row" key={student.id}>
            <div className="marks-student">
              <span>{student.name}</span>
              <small>{student.id}</small>
            </div>

            <div className="marks-bars">
              <div className="marks-bar-line">
                <span className="marks-bar-label">Previous</span>
                <div className="marks-track">
                  <div
                    className="marks-fill marks-previous"
                    style={{
                      width: `${Math.min(100, Math.max(0, student.previous_marks))}%`,
                    }}
                  />
                </div>
                <strong>{student.previous_marks}%</strong>
              </div>

              <div className="marks-bar-line">
                <span className="marks-bar-label">Current</span>
                <div className="marks-track">
                  <div
                    className={`marks-fill ${drop >= 15 ? 'marks-warning' : 'marks-current'}`}
                    style={{
                      width: `${Math.min(100, Math.max(0, student.current_marks))}%`,
                    }}
                  />
                </div>
                <strong>{student.current_marks}%</strong>
              </div>
            </div>
          </div>
        )
      })}

      <p className="chart-footnote">
        Showing the six largest recorded drops among comparable records,
        not a student ranking.
      </p>
    </div>
  )
}

function DepartmentChart({ students }) {
  const departments = useMemo(() => {
    const names = [
      ...new Set(students.map((student) => student.department)),
    ]

    return names.map((name) => {
      const group = students.filter(
        (student) => student.department === name,
      )

      const recorded = group.filter(
        (student) =>
          typeof student.attendance_pct === 'number' &&
          Number.isFinite(student.attendance_pct),
      )

      const average = recorded.length
        ? Math.round(
            recorded.reduce(
              (sum, student) => sum + student.attendance_pct,
              0,
            ) / recorded.length,
          )
        : null

      return {
        name,
        count: group.length,
        average,
        recorded: recorded.length,
      }
    })
  }, [students])

  return (
    <div className="department-chart">
      {departments.map((department) => (
        <div className="department-row" key={department.name}>
          <div className="department-topline">
            <span>{department.name}</span>
            <strong>
              {department.average === null
                ? 'N/A'
                : `${department.average}%`}
            </strong>
          </div>

          <div
            className="department-track"
            role="progressbar"
            aria-label={`${department.name} average attendance`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={department.average ?? 0}
          >
            <div
              className="department-fill"
              style={{ width: `${department.average ?? 0}%` }}
            />
          </div>

          <small>
            {department.count} assigned · {department.recorded} with attendance data
          </small>
        </div>
      ))}
    </div>
  )
}

export default function OverviewPage({
  students,
  meetings,
  search,
  onSelectStudent,
}) {
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [selectedAttendanceBand, setSelectedAttendanceBand] = useState(null)

  const alertData = useMemo(() => {
    const counts = { attendance: 0, marks: 0, lms: 0 }

    students.forEach((student) => {
      getStudentAlerts(student).forEach((alert) => {
        if (Object.hasOwn(counts, alert.type)) {
          counts[alert.type] += 1
        }
      })
    })

    return ALERT_TYPES.map((type) => ({
      ...type,
      count: counts[type.id],
    }))
  }, [students])

  const attentionStudents = useMemo(
    () => students.filter(studentNeedsConversation),
    [students],
  )

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()

    return attentionStudents.filter((student) => {
      const matchesQuery =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.id.toLowerCase().includes(query) ||
        student.department.toLowerCase().includes(query)

      const matchesAlert =
        !selectedAlert ||
        getStudentAlerts(student).some(
          (alert) => alert.type === selectedAlert,
        )

      const attendance = student.attendance_pct

      const matchesAttendance =
        !selectedAttendanceBand ||
        (
          typeof attendance === 'number' &&
          Number.isFinite(attendance) &&
          (() => {
            const band = ATTENDANCE_BANDS.find(
              (item) => item.id === selectedAttendanceBand,
            )

            return band
              ? attendance >= band.min && attendance < band.max
              : true
          })()
        )

      return matchesQuery && matchesAlert && matchesAttendance
    })
  }, [
    attentionStudents,
    search,
    selectedAlert,
    selectedAttendanceBand,
  ])

  const meetingsThisWeek = meetings.filter(isMeetingThisWeek).length
  const followUpsDue = meetings.filter(isFollowUpDue).length

  const studentsWithAttendance = students.filter(
    (student) =>
      typeof student.attendance_pct === 'number' &&
      Number.isFinite(student.attendance_pct),
  )

  const averageAttendance = studentsWithAttendance.length
    ? Math.round(
        studentsWithAttendance.reduce(
          (sum, student) => sum + student.attendance_pct,
          0,
        ) / studentsWithAttendance.length,
      )
    : null

  const studentsWithMarks = students.filter(
    (student) =>
      typeof student.current_marks === 'number' &&
      Number.isFinite(student.current_marks),
  )

  const averageMarks = studentsWithMarks.length
    ? Math.round(
        studentsWithMarks.reduce(
          (sum, student) => sum + student.current_marks,
          0,
        ) / studentsWithMarks.length,
      )
    : null

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function selectAlert(type) {
    setSelectedAlert((current) => current === type ? null : type)
    scrollTo('attention-students')
  }

  function selectAttendanceBand(band) {
    setSelectedAttendanceBand(band)
    scrollTo('attention-students')
  }

  function clearFilters() {
    setSelectedAlert(null)
    setSelectedAttendanceBand(null)
  }

  const hasActiveFilters = Boolean(
    selectedAlert || selectedAttendanceBand,
  )

  return (
    <div className="page-stack mentor-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">MENTORING OVERVIEW</span>
          <h2>Your students, at a glance.</h2>
          <p>
            Spot a change, start a conversation, and keep every follow-up moving.
          </p>
        </div>

        <div className="welcome-status">
          <span className="status-pulse" />
          Using recorded student data
        </div>
      </section>

      <section className="analytics-metrics" aria-label="Mentoring summary">
        <MetricCard
          icon="♧"
          label="Assigned students"
          value={students.length}
          note="Your current caseload"
          tone="teal"
          onClick={() => {
            clearFilters()
            scrollTo('attention-students')
          }}
        />

        <MetricCard
          icon="!"
          label="Need attention"
          value={attentionStudents.length}
          note="Based on explainable rules"
          tone="orange"
          onClick={() => {
            clearFilters()
            scrollTo('attention-students')
          }}
        />

        <MetricCard
          icon="↗"
          label="Average attendance"
          value={averageAttendance === null ? 'N/A' : `${averageAttendance}%`}
          note={`${studentsWithAttendance.length} records available`}
          tone="blue"
          onClick={() => scrollTo('attendance-analytics')}
        />

        <MetricCard
          icon="✓"
          label="Average current marks"
          value={averageMarks === null ? 'N/A' : `${averageMarks}%`}
          note={`${studentsWithMarks.length} records available`}
          tone="purple"
          onClick={() => scrollTo('marks-analytics')}
        />
      </section>

      <section className="analytics-grid">
        <Panel
          title="Attendance distribution"
          subtitle="Explore recorded attendance across your caseload"
          className="analytics-panel-wide"
        >
          <div id="attendance-analytics">
            <AttendanceChart
              students={students}
              selectedBand={selectedAttendanceBand}
              onSelectBand={selectAttendanceBand}
            />
          </div>
        </Panel>

        <Panel
          title="Why students need attention"
          subtitle="Counts of triggered rules; a student may have more than one"
        >
          <DonutChart
            values={alertData}
            selected={selectedAlert}
            onSelect={selectAlert}
          />
        </Panel>

        <Panel
          title="Internal marks comparison"
          subtitle="Previous versus current marks, where both are recorded"
          className="analytics-panel-wide"
        >
          <div id="marks-analytics">
            <MarksChart students={students} />
          </div>
        </Panel>

        <Panel
          title="Department snapshot"
          subtitle="Average attendance by department"
        >
          <DepartmentChart students={students} />
        </Panel>
      </section>

      <section className="analytics-bottom-grid">
        <Panel
          title="Students to check in with"
          subtitle="Each alert explains the rule and recorded value behind it"
          className="attention-panel"
        >
          <div id="attention-students" className="attention-toolbar">
            <div className="filter-chips">
              <button
                type="button"
                className={`filter-chip ${!selectedAlert ? 'filter-chip-active' : ''}`}
                onClick={() => setSelectedAlert(null)}
              >
                All alert types
              </button>

              {ALERT_TYPES.map((type) => (
                <button
                  type="button"
                  key={type.id}
                  className={`filter-chip ${selectedAlert === type.id ? 'filter-chip-active' : ''}`}
                  onClick={() => selectAlert(type.id)}
                  aria-pressed={selectedAlert === type.id}
                >
                  <span
                    className="legend-dot"
                    style={{ background: type.color }}
                  />
                  {type.label}
                </button>
              ))}
            </div>

            <span className="result-count">
              {filteredStudents.length} students
            </span>
          </div>

          {selectedAttendanceBand && (
            <div className="active-filter-note">
              Attendance: {
                ATTENDANCE_BANDS.find(
                  (band) => band.id === selectedAttendanceBand,
                )?.label
              }
              {' '}
              <button
                type="button"
                className="dashboard-text-button"
                onClick={() => setSelectedAttendanceBand(null)}
              >
                Remove
              </button>
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              className="dashboard-text-button"
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          )}

          {filteredStudents.length === 0 ? (
            <div className="dashboard-empty">
              <span>✓</span>
              <strong>No matching students</strong>
              <p>
                No students needing attention match these filters.
                Try another category or clear the filters.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="dashboard-text-button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="attention-table-wrap">
              <table className="attention-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Department</th>
                    <th>Reason for check-in</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => {
                    const alerts = getStudentAlerts(student).filter(
                      (alert) =>
                        !selectedAlert || alert.type === selectedAlert,
                    )

                    return (
                      <tr key={student.id}>
                        <td>
                          <button
                            type="button"
                            className="student-name-button"
                            onClick={() => onSelectStudent(student.id)}
                          >
                            {student.name}
                          </button>
                          <small>{student.id}</small>
                        </td>

                        <td>{student.department}</td>

                        <td>
                          <div className="student-alert-tags">
                            {alerts.map((alert) => (
                              <span
                                className={`alert-tag alert-${alert.type}`}
                                key={alert.id}
                                title={alert.message}
                              >
                                {alert.label}
                              </span>
                            ))}
                          </div>

                          <small className="alert-explanation">
                            {alerts.map((alert) => alert.message).join(' ')}
                          </small>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="view-student-button"
                            onClick={() => onSelectStudent(student.id)}
                            aria-label={`View ${student.name}`}
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="dashboard-side-stack">
          <Panel
            title="Mentoring activity"
            subtitle="Your recorded meeting activity"
          >
            <div className="activity-summary">
              <div className="activity-number">
                <strong>{meetingsThisWeek}</strong>
                <span>Meetings this week</span>
              </div>

              <div className="activity-number">
                <strong>{followUpsDue}</strong>
                <span>Follow-ups due</span>
              </div>
            </div>

            <p className="chart-footnote">
              Totals come from saved meeting records. No historical trend is assumed.
            </p>
          </Panel>

          <Panel
            title="Quick insight"
            subtitle="A useful starting point for this week"
          >
            <div className="insight-card">
              <span className="insight-icon">✦</span>

              <strong>
                {attentionStudents.length
                  ? `${attentionStudents.length} students have at least one alert`
                  : 'No current alerts'}
              </strong>

              <p>
                {alertData.some((item) => item.count > 0)
                  ? `The most frequent alert type is ${
                      [...alertData].sort((a, b) => b.count - a.count)[0].label.toLowerCase()
                    }. Review the recorded values before deciding on a follow-up.`
                  : 'Keep logging check-ins and reviewing student progress.'}
              </p>
            </div>
          </Panel>
        </div>
      </section>
    </div>
  )
}
