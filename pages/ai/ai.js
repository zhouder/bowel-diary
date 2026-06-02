const { requestAiAdvice, buildAiContext } = require('../../utils/ai')
const { loadData } = require('../../utils/storage')

Page({
  data: {
    contextCount: {
      bowels: 0,
      meals: 0,
    },
    answer: '',
    error: '',
    loading: false,
    hasSettings: false,
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const data = loadData()
    const context = buildAiContext(data)
    this.setData({
      contextCount: {
        bowels: context.bowels.length,
        meals: context.meals.length,
      },
      hasSettings: Boolean(data.settings.endpoint && data.settings.model && data.settings.apiKey),
    })
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  },

  generate() {
    const data = loadData()
    this.setData({ loading: true, answer: '', error: '' })
    wx.showLoading({ title: '生成中' })

    requestAiAdvice(data, data.settings)
      .then((answer) => {
        this.setData({ answer })
      })
      .catch((error) => {
        this.setData({ error: error.message || 'AI 请求失败' })
      })
      .finally(() => {
        wx.hideLoading()
        this.setData({ loading: false })
      })
  },
})
