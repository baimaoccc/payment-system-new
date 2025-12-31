import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	list: [],
	page: 1,
	pageSize: 20,
	total: 0,
	loading: false,
	error: null,
	filters: {},
};

const slice = createSlice({
	name: "blacklist",
	initialState,
	reducers: {
		setList(state, action) {
			state.list = action.payload;
		},
		setTotal(state, action) {
			state.total = action.payload;
		},
		setPage(state, action) {
			state.page = action.payload;
		},
		setPageSize(state, action) {
			state.pageSize = action.payload;
		},
		setLoading(state, action) {
			state.loading = action.payload;
		},
		setError(state, action) {
			state.error = action.payload;
		},
		setFilters(state, action) {
			state.filters = action.payload;
		},
	},
});

export const { setList, setTotal, setPage, setPageSize, setLoading, setError, setFilters } = slice.actions;
export default slice.reducer;
