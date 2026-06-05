const { loadData } = require('../../utils/storage')
const { buildStats } = require('../../utils/stats')

function fallbackStats() {
  return {
    daysSinceLastText: '暂无',
    lastBowelText: '还没有记录',
    last7BowelCount: 0,
    avgBristolText: '暂无',
    hardRateText: '0%',
    avgWaterText: '0 ml',
    avgFiberText: '0.0 g',
    dailyRows: [],
    recentBowels: [],
    recentMeals: [],
  }
}

Page({
  data: {
    stats: fallbackStats(),
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    try {
      this.setData({
        stats: buildStats(loadData()),
      })
    } catch (error) {
      console.error('refresh dashboard failed', error)
      this.setData({
        stats: fallbackStats(),
      })
    }
  },

  goAddBowel() {
    wx.navigateTo({ url: '/pages/add-bowel/add-bowel' })
  },

  goAddMeal() {
    wx.navigateTo({ url: '/pages/add-meal/add-meal' })
  },

  goRecords() {
    wx.navigateTo({ url: '/pages/records/records' })
  },

  goAi() {
    wx.navigateTo({ url: '/pages/ai/ai' })
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  },
})
