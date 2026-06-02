const { daysAgo } = require('./date')
const { bristolLabel, mealLabel, summarizeMealFlags, summarizeSymptoms } = require('./stats')

function sortByDateDesc(items, field) {
  return [...items].sort((left, right) => new Date(right[field]).getTime() - new Date(left[field]).getTime())
}

function normalizeChatEndpoint(endpoint) {
  const trimmed = String(endpoint || '').trim().replace(/\/$/, '')
  if (!trimmed) {
    return ''
  }
  return trimmed.endsWith('/chat/completions') ? trimmed : `${trimmed}/chat/completions`
}

function buildAiContext(data) {
  const start = daysAgo(20)
  const bowels = sortByDateDesc(data.bowelEntries, 'occurredAt')
    .filter((entry) => new Date(entry.occurredAt) >= start)
    .slice(0, 40)
    .map((entry) => ({
      time: entry.occurredAt,
      bristol: bristolLabel(entry.bristol),
      ease: entry.ease,
      minutes: entry.minutes,
      symptoms: summarizeSymptoms(entry),
      notes: entry.notes || '',
    }))

  const meals = sortByDateDesc(data.meals, 'consumedAt')
    .filter((entry) => new Date(entry.consumedAt) >= start)
    .slice(0, 80)
    .map((entry) => ({
      time: entry.consumedAt,
      meal: mealLabel(entry.meal),
      foods: entry.foods,
      waterMl: entry.waterMl,
      fiberGram: entry.fiberGram,
      tags: summarizeMealFlags(entry),
      notes: entry.notes || '',
    }))

  return {
    generatedAt: new Date().toISOString(),
    bowels,
    meals,
  }
}

function parseAiContent(payload) {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const firstChoice = payload.choices && payload.choices[0]
  return (
    (firstChoice && firstChoice.message && firstChoice.message.content) ||
    (firstChoice && firstChoice.text) ||
    payload.output_text ||
    (payload.data && payload.data.content) ||
    ''
  )
}

function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data)
          return
        }
        reject(new Error(`请求失败：${response.statusCode} ${JSON.stringify(response.data || '')}`))
      },
      fail(error) {
        reject(new Error(error.errMsg || '网络请求失败'))
      },
    })
  })
}

function requestAiAdvice(data, settings) {
  const endpoint = normalizeChatEndpoint(settings.endpoint)
  const model = String(settings.model || '').trim()
  const apiKey = String(settings.apiKey || '').trim()
  const context = buildAiContext(data)

  if (!endpoint || !model || !apiKey) {
    return Promise.reject(new Error('请先在设置里填写 API 地址、模型和 Key。'))
  }

  return request({
    url: endpoint,
    method: 'POST',
    timeout: 60000,
    header: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    data: {
      model,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            '你是一个中文饮食与排便记录分析助手。你只提供温和、可执行的生活方式和饮食建议，不诊断疾病，不开药，不替代医生。重点分析饮水、纤维、蔬果、油炸辛辣、咖啡因、乳制品、排便间隔、Bristol 大便形态和不适症状。若记录显示便血、持续腹痛、呕吐、发热、体重明显下降、便秘长期无法通过自我护理改善，必须建议尽快就医。',
        },
        {
          role: 'user',
          content: `请基于以下 JSON 记录给出建议。输出结构：1. 最近规律观察；2. 可能相关饮食；3. 接下来 3 天怎么吃；4. 需要留意的就医信号。记录：${JSON.stringify(
            context,
          )}`,
        },
      ],
    },
  }).then((payload) => {
    const content = parseAiContent(payload).trim()
    if (!content) {
      throw new Error('接口返回里没有可显示的建议内容。')
    }
    return content
  })
}

module.exports = {
  buildAiContext,
  normalizeChatEndpoint,
  requestAiAdvice,
}
