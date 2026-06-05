const {
  DEFAULT_AI_ENDPOINT,
  DEFAULT_AI_MODEL,
  exportDataWithoutKey,
  loadData,
  normalizeData,
  saveData,
  updateData,
} = require('../../utils/storage')

Page({
  data: {
    settings: {
      endpoint: DEFAULT_AI_ENDPOINT,
      model: DEFAULT_AI_MODEL,
      apiKey: '',
    },
    defaults: {
      endpoint: DEFAULT_AI_ENDPOINT,
      model: DEFAULT_AI_MODEL,
    },
    showKey: false,
  },

  onShow() {
    this.setData({ settings: loadData().settings })
  },

  onInput(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ [`settings.${key}`]: event.detail.value })
  },

  toggleKey() {
    this.setData({ showKey: !this.data.showKey })
  },

  useTokenPlanDefaults() {
    this.setData({
      'settings.endpoint': DEFAULT_AI_ENDPOINT,
      'settings.model': DEFAULT_AI_MODEL,
    })
  },

  saveSettings() {
    const settings = this.data.settings
    updateData((current) => ({
      ...current,
      settings: {
        endpoint: String(settings.endpoint || '').trim(),
        model: String(settings.model || '').trim(),
        apiKey: String(settings.apiKey || '').trim(),
      },
    }))
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  copyBackup() {
    const backup = JSON.stringify(exportDataWithoutKey(), null, 2)
    wx.setClipboardData({
      data: backup,
      success() {
        wx.showToast({ title: '已复制备份', icon: 'success' })
      },
    })
  },

  importFromClipboard() {
    wx.getClipboardData({
      success: (result) => {
        try {
          const current = loadData()
          const imported = normalizeData(JSON.parse(result.data))
          saveData({
            bowelEntries: imported.bowelEntries,
            meals: imported.meals,
            settings: {
              endpoint: imported.settings.endpoint || current.settings.endpoint,
              model: imported.settings.model || current.settings.model,
              apiKey: current.settings.apiKey,
            },
          })
          this.setData({ settings: loadData().settings })
          wx.showToast({ title: '已导入', icon: 'success' })
        } catch (error) {
          wx.showToast({ title: '剪贴板不是备份 JSON', icon: 'none' })
        }
      },
    })
  },

  clearRecords() {
    wx.showModal({
      title: '清空所有记录？',
      content: '只会清空排便和饮食记录，API 设置会保留。',
      confirmText: '清空',
      confirmColor: '#b94a4a',
      success: (result) => {
        if (!result.confirm) return
        const current = loadData()
        saveData({
          bowelEntries: [],
          meals: [],
          settings: current.settings,
        })
        wx.showToast({ title: '已清空', icon: 'success' })
      },
    })
  },
})
