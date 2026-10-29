import { CalendarClock, MessageCircle, Users, ClipboardCheck } from 'lucide-react'

export default function SummaryCards({
  assignedCount,
  attentionCount,
  meetingsThisWeek,
  followUpsDue,
}) {
  const cards = [
    {
      label: 'Assigned students',
      value: assignedCount,
      hint: 'Your mentoring caseload',
      icon: Users,
    },
    {
      label: 'Need attention',
      value: attentionCount,
      hint: 'Alerts based on attendance, marks, or LMS',
      icon: MessageCircle,
    },
    {
      label: 'Meetings this week',
      value: meetingsThisWeek,
      hint: 'Logged conversations since Monday',
      icon: CalendarClock,
    },
    {
      label: 'Follow-ups due',
      value: followUpsDue,
      hint: 'Actions whose follow-up date is today or earlier',
      icon: ClipboardCheck,
    },
  ]

  return (
    <section className="summary-grid" aria-label="Summary">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <article key={card.label} className="summary-card">
            <div className="summary-icon" aria-hidden="true">
              <Icon size={18} />
            </div>
            <p className="summary-label">{card.label}</p>
            <p className="summary-value">{card.value}</p>
            <p className="summary-hint">{card.hint}</p>
          </article>
        )
      })}
    </section>
  )
}
