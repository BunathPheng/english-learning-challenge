export function getTodayDateString(): string {
  const today = new Date()
  return today.toISOString().split("T")[0] // Format as YYYY-MM-DD
}

export function formatDateDisplay(dateString: string): string {
  const [year, month, day] = dateString.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
}

export function getMondayOfCurrentWeek(): string {
  const today = new Date()
  const dayOfWeek = today.getDay() // Sunday - 0, Monday - 1, ..., Saturday - 6
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust to Monday (1)
  const monday = new Date(today.setDate(diff))
  monday.setHours(0, 0, 0, 0) // Normalize to start of day
  return monday.toISOString().split("T")[0]
}

export function getDayName(dateString: string): string {
  const [year, month, day] = dateString.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
  return date.toLocaleDateString("en-US", { weekday: "long" })
}
