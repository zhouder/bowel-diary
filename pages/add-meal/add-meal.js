const { combineLocal, nowParts } = require('../../utils/date')
const { updateData } = require('../../utils/storage')
const { mealOptions } = require('../../utils/stats')

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function clamp(value, fallback, min, max) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }
  return Math.min(Math.max(parsed, min), max)
}

function defaultForm() {
  const now = nowParts()
  return {
    date: now.date,
    time: now.time,
    mealIndex: 0,
    mealLabel: mealOptions[0].label,
    foods: '',
    waterMl: '300',
    fiberGram: '4',
    fruitVeg: true,
    caffeine: false,
    dairy: false,
    spicy: false,
    fried: false,
    notes: '',
  }
}

Page({
  data: {
    mealOptions,
    form: defaultForm(),
  },

  onDateChange(event) {
    this.setData({ 'form.date': event.detail.value })
  },

  onTimeChange(event) {
    this.setData({ 'form.time': event.detail.value })
  },

  onMealChange(event) {
    const index = Number(event.detail.value)
    this.setData({
      'form.mealIndex': index,
      'form.mealLabel': mealOptions[index].label,
    })
  },

  onFoodsInput(event) {
    this.setData({ 'form.foods': event.detail.value })
  },

  onWaterInput(event) {
    this.setData({ 'form.waterMl': event.detail.value })
  },

  onFiberInput(event) {
    this.setData({ 'form.fiberGram': event.detail.value })
  },

  onNotesInput(event) {
    this.setData({ 'form.notes': event.detail.value })
  },

  toggleFlag(event) {
    const key = event.currentTarget.dataset.key
    this.setData({ [`form.${key}`]: !this.data.form[key] })
  },

  save() {
    const form = this.data.form
    if (!String(form.foods || '').trim()) {
      wx.showToast({ title: '先写吃了什么', icon: 'none' })
      return
    }

    const entry = {
      id: makeId(),
      consumedAt: combineLocal(form.date, form.time),
      meal: mealOptions[form.mealIndex].value,
      foods: String(form.foods || '').trim(),
      waterMl: clamp(form.waterMl, 0, 0, 5000),
      fiberGram: clamp(form.fiberGram, 0, 0, 80),
      fruitVeg: form.fruitVeg,
      caffeine: form.caffeine,
      dairy: form.dairy,
      spicy: form.spicy,
      fried: form.fried,
      notes: String(form.notes || '').trim(),
    }

    updateData((current) => ({
      ...current,
      meals: [entry, ...current.meals],
    }))

    wx.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => {
      wx.reLaunch({ url: '/pages/dashboard/dashboard' })
    }, 450)
  },
})
