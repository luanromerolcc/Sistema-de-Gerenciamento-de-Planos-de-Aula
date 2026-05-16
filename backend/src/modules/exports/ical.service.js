
function escapeIcal(str) {
  return String(str || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function formatDate(date) {
  return new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function generateIcal(plan) {
  const uid = `${plan.id}@lesson-plan-manager`
  const now = formatDate(new Date())
  const start = formatDate(plan.scheduledAt)
  // Default duration: 1 hour
  const endDate = new Date(plan.scheduledAt)
  endDate.setHours(endDate.getHours() + 1)
  const end = formatDate(endDate)

  const description = [
    `Objetivo: ${plan.objective}`,
    `Disciplina: ${plan.discipline}`,
    plan.tags?.length ? `Tags: ${plan.tags.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lesson Plan Manager//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcal(plan.title)}`,
    `DESCRIPTION:${escapeIcal(description)}`,
    `CATEGORIES:${escapeIcal(plan.discipline)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
