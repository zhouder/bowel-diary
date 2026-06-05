const { dateKey, daysAgo, formatDateLabel, formatDateTime } = require('./date')

const DAY_MS = 24 * 60 * 60 * 1000

const bristolOptions = [
  { value: 1, label: '1 干硬颗粒' },
  { value: 2, label: '2 块状偏硬' },
  { value: 3, label: '3 成形裂纹' },
  { value: 4, label: '4 柔软成形' },
  { value: 5, label: '5 软块' },
  { value: 6, label: '6 糊状' },
  { value: 7, label: '7 水样' },
]

const easeOptions = [
  { value: 1, label: '1 很费力' },
  { value: 2, label: '2 偏费力' },
  { value: 3, label: '3 一般' },
  { value: 4, label: '4 顺畅' },
  { value: 5, label: '5 很顺畅' },
]

const mealOptions = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'snack', label: '加餐' },
]

function findLabel(options, value) {
  for (let index = 0; index < options.length; index += 1) {
    if (options[index].value === value) {
      return options[index].label
    }
  }
  return String(value || '')
}

function bristolLabel(value) {
  return findLabel(bristolOptions, Number(value))
}

function mealLabel(value) {
  return findLabel(mealOptions, value)
}

function sortByDateDesc(items, field) {
  return [...items].sort((left, right) => new Date(right[field]).getTime() - new Date(left[field]).getTime())
}

function summarizeSymptoms(entry) {
  const symptoms = [
    entry.straining && '费力',
    entry.pain && '疼痛',
    entry.bloating && '腹胀',
    entry.incomplete && '未尽感',
  ].filter(Boolean)
  return symptoms.length ? symptoms.join(' / ') : '无明显不适'
}

function summarizeMealFlags(entry) {
  const flags = [
    entry.fruitVeg && '蔬果',
    entry.caffeine && '咖啡因',
    entry.dairy && '乳制品',
    entry.spicy && '辛辣',
    entry.fried && '油炸',
  ].filter(Boolean)
  return flags.length ? flags.join(' / ') : '普通餐食'
}

function decorateBowels(entries) {
  return sortByDateDesc(entries, 'occurredAt').map((entry) => ({
    ...entry,
    bristolText: bristolLabel(entry.bristol),
    timeText: formatDateTime(entry.occurredAt),
    symptomText: summarizeSymptoms(entry),
    detailText: `${summarizeSymptoms(entry)}${entry.notes ? ` · ${entry.notes}` : ''}`,
  }))
}

function decorateMeals(entries) {
  return sortByDateDesc(entries, 'consumedAt').map((entry) => ({
    ...entry,
    mealText: mealLabel(entry.meal),
    timeText: formatDateTime(entry.consumedAt),
    flagText: summarizeMealFlags(entry),
    detailText: `${entry.foods} · ${summarizeMealFlags(entry)}${entry.notes ? ` · ${entry.notes}` : ''}`,
  }))
}

function buildStats(data) {
  const now = new Date()
  const sortedBowels = decorateBowels(data.bowelEntries)
  const lastBowel = sortedBowels[0] || null
  const last7Start = daysAgo(6)
  const last14Start = daysAgo(13)

  const last7Bowels = data.bowelEntries.filter((entry) => new Date(entry.occurredAt) >= last7Start)
  const last14Bowels = data.bowelEntries.filter((entry) => new Date(entry.occurredAt) >= last14Start)
  const last7Meals = data.meals.filter((entry) => new Date(entry.consumedAt) >= last7Start)

  const daysSinceLast = lastBowel
    ? Math.max(0, Math.floor((now.getTime() - new Date(lastBowel.occurredAt).getTime()) / DAY_MS))
    : null
  const avgBristol =
    last14Bowels.length > 0
      ? last14Bowels.reduce((sum, entry) => sum + Number(entry.bristol || 0), 0) / last14Bowels.length
      : 0
  const hardCount = last14Bowels.filter((entry) => Number(entry.bristol) <= 2).length
  const avgWater = last7Meals.reduce((sum, entry) => sum + Number(entry.waterMl || 0), 0) / 7
  const avgFiber = last7Meals.reduce((sum, entry) => sum + Number(entry.fiberGram || 0), 0) / 7

  const dailyRows = []
  for (let index = 0; index < 7; index += 1) {
    const date = daysAgo(6 - index)
    const key = dateKey(date)
    const bowelCount = data.bowelEntries.filter((entry) => dateKey(entry.occurredAt) === key).length
    const meals = data.meals.filter((entry) => dateKey(entry.consumedAt) === key)
    const water = meals.reduce((sum, entry) => sum + Number(entry.waterMl || 0), 0)
    const fiber = meals.reduce((sum, entry) => sum + Number(entry.fiberGram || 0), 0)

    dailyRows.push({
      key,
      label: formatDateLabel(date),
      bowelCount,
      water,
      fiber,
      bowelHeight: Math.min(92, 16 + bowelCount * 26),
      waterHeight: Math.min(92, 12 + water / 28),
      fiberHeight: Math.min(92, 12 + fiber * 3),
    })
  }

  return {
    daysSinceLastText: daysSinceLast === null ? '暂无' : `${daysSinceLast} 天前`,
    lastBowelText: lastBowel ? lastBowel.timeText : '还没有记录',
    last7BowelCount: last7Bowels.length,
    avgBristolText: avgBristol ? avgBristol.toFixed(1) : '暂无',
    hardRateText: `${Math.round((last14Bowels.length ? hardCount / last14Bowels.length : 0) * 100)}%`,
    avgWaterText: `${Math.round(avgWater)} ml`,
    avgFiberText: `${avgFiber.toFixed(1)} g`,
    dailyRows,
    recentBowels: sortedBowels.slice(0, 4),
    recentMeals: decorateMeals(data.meals).slice(0, 4),
  }
}

module.exports = {
  bristolLabel,
  bristolOptions,
  buildStats,
  decorateBowels,
  decorateMeals,
  easeOptions,
  mealLabel,
  mealOptions,
  summarizeMealFlags,
  summarizeSymptoms,
}
