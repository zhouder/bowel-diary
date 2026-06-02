function pad(value) {
  return String(value).padStart(2, '0')
}

function partsFromDate(date) {
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  }
}

function nowParts() {
  return partsFromDate(new Date())
}

function combineLocal(dateText, timeText) {
  const dateParts = String(dateText || '').split('-').map(Number)
  const timeParts = String(timeText || '').split(':').map(Number)
  const date = new Date(
    dateParts[0],
    (dateParts[1] || 1) - 1,
    dateParts[2] || 1,
    timeParts[0] || 0,
    timeParts[1] || 0,
    0,
    0,
  )
  return date.toISOString()
}

function dateKey(input) {
  const date = input instanceof Date ? input : new Date(input)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatDateTime(iso) {
  const date = new Date(iso)
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDateLabel(input) {
  const date = input instanceof Date ? input : new Date(input)
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function daysAgo(count) {
  const date = startOfToday()
  date.setDate(date.getDate() - count)
  return date
}

module.exports = {
  combineLocal,
  dateKey,
  daysAgo,
  formatDateLabel,
  formatDateTime,
  nowParts,
  partsFromDate,
}
