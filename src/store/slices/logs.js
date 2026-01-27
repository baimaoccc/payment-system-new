import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  list: [],
  loading: false,
  error: null,
  page: 1,
  pageSize: 20,
  total: 0,
}

const slice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    setLoading(state, action) { state.loading = !!action.payload },
    setError(state, action) { state.error = action.payload || null },
    setList(state, action) { state.list = action.payload || [] },
    setTotal(state, action) { state.total = Number(action.payload || 0) },
    setPage(state, action) { state.page = Number(action.payload || 1) },
    setPageSize(state, action) { state.pageSize = Number(action.payload || 20) },
    resetState() { return initialState },
  },
})

export const { setLoading, setError, setList, setTotal, setPage, setPageSize, resetState } = slice.actions
export default slice.reducer
