const { combineLocal, nowParts } = require('../../utils/date')
const { updateData } = require('../../utils/storage')
const { bristolOptions, easeOptions } = require('../../utils/stats')

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
    bristolIndex: 1,
    bristolLabel: bristolOptions[1].label,
    easeIndex: 2,
    easeLabel: easeOptions[2].label,
    minutes: '10',
    straining: false,
    pain: false,
    bloating: false,
    incomplete: false,
    notes: '',
  }
}

Page({
  data: {
    bristolOptions,
    easeOptions,
    form: defaultForm(),
  },

  onDateChange(event) {
    this.setData({ 'form.date': event.detail.value })
  },

  onTimeChange(event) {
    this.setData({ 'form.time': event.detail.value })
  },

  onBristolChange(event) {
    const index = Number(event.detail.value)
    this.setData({
      'form.bristolIndex': index,
      'form.bristolLabel': bristolOptions[index].label,
    })
  },

  onEaseChange(event) {
    const index = Number(event.detail.value)
    this.setData({
      'form.easeIndex': index,
      'form.easeLabel': easeOptions[index].label,
    })
  },

  onMinutesInput(event) {
    this.setData({ 'form.minutes': event.detail.value })
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
    const entry = {
      id: makeId(),
      occurredAt: combineLocal(form.date, form.time),
      bristol: bristolOptions[form.bristolIndex].value,
      ease: easeOptions[form.easeIndex].value,
      minutes: clamp(form.minutes, 10, 0, 120),
      straining: form.straining,
      pain: form.pain,
      bloating: form.bloating,
      incomplete: form.incomplete,
      notes: String(form.notes || '').trim(),
    }

    updateData((current) => ({
      ...current,
      bowelEntries: [entry, ...current.bowelEntries],
    }))

    wx.showToast({ title: '已保存', icon: 'success' })
    this.setData({ form: defaultForm() })
  },
})
