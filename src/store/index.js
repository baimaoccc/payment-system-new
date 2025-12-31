import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/auth.js'
import ordersReducer from './slices/orders.js'
import usersReducer from './slices/users.js'
import blacklistReducer from './slices/blacklist.js'
import uiReducer from './slices/ui.js'

/**
 * 中文：创建 Redux store，注册模块化切片
 * English: Create Redux store, register modular slices
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    users: usersReducer,
    blacklist: blacklistReducer,
    ui: uiReducer,
  },
})
