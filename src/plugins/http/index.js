/**
 * 中文：HTTP 适配器，统一请求与错误处理；此处提供模拟数据
 * English: HTTP adapter with unified request and error handling; mock data here
 */
export async function request({ url, method = 'GET', data, headers = {} }) {
  try {
    if (/^https?:\/\//.test(url)) {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: method === 'GET' ? undefined : JSON.stringify(data || {})
      })
      let json = null
      try { json = await res.json() } catch { json = null }
      if (!res.ok) throw errorFactory({ code: 'HTTP', message: (json && (json.msg || json.message)) || res.statusText })
      return { ok: true, data: json }
    }
    if (url === '/api/login' && method === 'POST') {
      const { username, password } = data || {}
      if (!username || !password) throw errorFactory({ code: 'VALIDATION', message: 'Missing credentials' })
      const roleMap = { admin: 'admin', merchant: 'merchant', cs: 'cs', adv: 'adv' }
      const role = roleMap[username] || 'merchant'
      return { ok: true, data: { user: { username }, role, merchantId: role === 'admin' ? null : 'm-001' } }
    }
    if (url === '/api/orders' && method === 'GET') {
      const now = Date.now()
      const sample = [
        { id: 'O-1001', websiteUrl: 'www.intermarche-smeg.it.com', channelNote: 'should@miraberry.shop', email: 'jociane.monteiro@icloud.com', createdAt: now - 86400000, amount: 4900, currency: '€', status: 'paid' },
        { id: 'O-1002', websiteUrl: 'www.heart-link.it.com', channelNote: 'needu@dexterous.site', email: 'cbrumley59@yahoo.com', createdAt: now - 3600000, amount: 610, currency: '$', status: 'paid' },
        { id: 'O-1003', websiteUrl: 'www.heart-link.it.com', channelNote: 'tracx@fentonwolf.online', email: 'cbrumley59@yahoo.com', createdAt: now - 1800000, amount: 505, currency: '$', status: 'failed' },
        { id: 'O-1004', websiteUrl: 'www.heart-link.it.com', channelNote: 'getit@megmstone.online', email: 'alphadog9@aol.com', createdAt: now - 7200000, amount: 2510, currency: '$', status: 'failed' },
        { id: 'O-1005', websiteUrl: 'www.heart-link.it.com', channelNote: 'needu@dexterous.site', email: 'rosenasankar@gmail.com', createdAt: now - 5400000, amount: 1010, currency: '$', status: 'paid' },
        { id: 'O-1006', websiteUrl: 'www.heartslink.it.com', channelNote: 'getit@megmstone.online', email: 'befesssdbnn@outlesfsdfsdfook.com', createdAt: now - 180000, amount: 2020, currency: '$', status: 'pending' },
      ]
      return { ok: true, data: sample }
    }
    throw errorFactory({ code: 'NOT_FOUND', message: `Unknown endpoint ${url}` })
  } catch (e) {
    return { ok: false, error: toUserError(e) }
  }
}

/** 中文/English：错误工厂 / error factory */
export function errorFactory({ code = 'UNKNOWN', message = 'Unknown error' } = {}) { const err = new Error(message); err.code = code; return err }
export function toUserError(e) { return { code: e.code || 'UNKNOWN', message: e.message || 'Unknown error' } }
