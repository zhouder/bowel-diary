const { loadData } = require('../../utils/storage')
const { buildStats } = require('../../utils/stats')

Page({
  data: {
    stats: buildStats(loadData()),
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    this.setData({
      stats: buildStats(loadData()),
    })
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
