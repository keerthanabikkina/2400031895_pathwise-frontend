import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"

const locales = {
  "en-US": enUS
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
})

export default function CalendarView({ appointments }) {

  const parseDateTime = (date, time) => {
    const [t, modifier] = time.split(" ")
    let [h, m] = t.split(":")

    if (modifier === "PM" && h !== "12") h = +h + 12
    if (modifier === "AM" && h === "12") h = 0

    return new Date(`${date}T${h}:${m}:00`)
  }

  const events = appointments.map(a => {
    const start = parseDateTime(a.date, a.time)

    return {
      title: `${a.counselorName || a.studentName} (${a.status})`,
      start,
      end: new Date(start.getTime() + 30 * 60000)
    }
  })

  return (
    <div style={{ height: "600px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
      />
    </div>
  )
}