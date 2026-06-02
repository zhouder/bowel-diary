const { loadData, updateData } = require('../../utils/storage')
const { decorateBowels, decorateMeals } = require('../../utils/stats')

Page({
  data: {
    bowels: [],
    meals: [],
    active: 'bowels',
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const data = loadData()
    this.setData({
      bowels: decorateBowels(data.bowelEntries),
      meals: decorateMeals(data.meals),
    })
  },

  switchTab(event) {
    this.setData({ active: event.currentTarget.dataset.tab })
  },

  addBowel() {
    wx.navigateTo({ url: '/pages/add-bowel/add-bowel' })
  },

  addMeal() {
    wx.navigateTo({ url: '/pages/add-meal/add-meal' })
  },

  removeBowel(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({
      title: '删除这条排便记录？',
      content: '删除后不可恢复。',
      confirmText: '删除',
      confirmColor: '#b94a4a',
      success: (result) => {
        if (!result.confirm) return
        updateData((current) => ({
          ...current,
          bowelEntries: current.bowelEntries.filter((entry) => entry.id !== id),
        }))
        this.refresh()
      },
    })
  },

  removeMeal(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({
      title: '删除这条饮食记录？',
      content: '删除后不可恢复。',
      confirmText: '删除',
      confirmColor: '#b94a4a',
      success: (result) => {
        if (!result.confirm) return
        updateData((current) => ({
          ...current,
          meals: current.meals.filter((entry) => entry.id !== id),
        }))
        this.refresh()
      },
    })
  },
})
