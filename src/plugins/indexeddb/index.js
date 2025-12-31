/**
 * 中文：IndexedDB 适配器，提供简单的 get/set 接口
 * English: IndexedDB adapter providing simple get/set APIs
 * @param {string} dbName 数据库名 / database name
 * @param {string} storeName 存储表名 / object store name
 */
export function createIndexedDB({ dbName = 'payment-db', storeName = 'kv' } = {}) {
  let db
  function open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, 1)
      req.onupgradeneeded = () => {
        const d = req.result
        if (!d.objectStoreNames.contains(storeName)) d.createObjectStore(storeName)
      }
      req.onsuccess = () => { db = req.result; resolve(db) }
      req.onerror = () => reject(req.error)
    })
  }
  async function get(key) {
    if (!db) await open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  async function set(key, value) {
    if (!db) await open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.put(value, key)
      req.onsuccess = () => resolve(true)
      req.onerror = () => reject(req.error)
    })
  }
  async function del(key) {
    if (!db) await open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const req = store.delete(key)
      req.onsuccess = () => resolve(true)
      req.onerror = () => reject(req.error)
    })
  }
  return { open, get, set, del }
}

export const idb = createIndexedDB()

