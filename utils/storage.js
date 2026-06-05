const STORAGE_KEY = 'llw_bowel_diary_v1'
const DEFAULT_AI_ENDPOINT = 'https://token-plan-cn.xiaomimimo.com/v1'
const DEFAULT_AI_MODEL = 'mimo-v2.5'

const defaultData = {
  bowelEntries: [],
  meals: [],
  settings: {
    endpoint: DEFAULT_AI_ENDPOINT,
    model: DEFAULT_AI_MODEL,
    apiKey: '',
  },
}

function normalizeData(value) {
  if (!value || typeof value !== 'object') {
    return { ...defaultData, settings: { ...defaultData.settings } }
  }

  return {
    bowelEntries: Array.isArray(value.bowelEntries) ? value.bowelEntries : [],
    meals: Array.isArray(value.meals) ? value.meals : [],
    settings: {
      endpoint: value.settings && value.settings.endpoint ? value.settings.endpoint : DEFAULT_AI_ENDPOINT,
      model: value.settings && value.settings.model ? value.settings.model : DEFAULT_AI_MODEL,
      apiKey: value.settings && value.settings.apiKey ? value.settings.apiKey : '',
    },
  }
}

function loadData() {
  try {
    return normalizeData(wx.getStorageSync(STORAGE_KEY))
  } catch (error) {
    return { ...defaultData, settings: { ...defaultData.settings } }
  }
}

function saveData(data) {
  const next = normalizeData(data)
  wx.setStorageSync(STORAGE_KEY, next)
  return next
}

function updateData(updater) {
  const current = loadData()
  const next = updater(current)
  return saveData(next)
}

function exportDataWithoutKey() {
  const data = loadData()
  return {
    bowelEntries: data.bowelEntries,
    meals: data.meals,
    settings: {
      endpoint: data.settings.endpoint,
      model: data.settings.model,
      apiKey: '',
    },
    exportedAt: new Date().toISOString(),
  }
}

module.exports = {
  DEFAULT_AI_ENDPOINT,
  DEFAULT_AI_MODEL,
  exportDataWithoutKey,
  loadData,
  normalizeData,
  saveData,
  updateData,
}
