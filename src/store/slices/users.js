import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  list: [],
  loading: false,
  error: null,
  page: 1,
  pageSize: 10,
  total: 0,
  allUsers: [], // Cached full user list
}

const slice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setLoading(state, action) { state.loading = !!action.payload },
    setError(state, action) { state.error = action.payload || null },
    setList(state, action) { state.list = action.payload || [] },
    setTotal(state, action) { state.total = Number(action.payload || 0) },
    setPage(state, action) { state.page = Number(action.payload || 1) },
    setPageSize(state, action) { state.pageSize = Number(action.payload || 10) },
    setAllUsers(state, action) { state.allUsers = action.payload || [] },
  },
})

export const { setLoading, setError, setList, setTotal, setPage, setPageSize, setAllUsers } = slice.actions
export default slice.reducer
