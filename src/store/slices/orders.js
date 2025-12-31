import { createSlice } from "@reduxjs/toolkit";

/**
 * 中文：订单切片，保存订单列表与筛选条件
 * English: Orders slice storing list and filters
 */
const initialState = {
	list: [],
	filters: {
		query: "",
		status: null,
		firstName: "",
		lastName: "",
		userId: null,
		orderNo: "",
		startTime: null,
		endTime: null,
		email: "",
		country: null,
		comment: "",
		shippingStatus: "all",
		url: "",
		phone: "",
	},
	stats: null, // Statistics from API (tj)
	page: 1,
	pageSize: 10,
	total: 0,
	loading: false,
	error: null,
};

const slice = createSlice({
	name: "orders",
	initialState,
	reducers: {
		setLoading(state, action) {
			state.loading = !!action.payload;
		},
		setError(state, action) {
			state.error = action.payload || null;
		},
		setList(state, action) {
			state.list = action.payload || [];
		},
		setFilters(state, action) {
			state.filters = { ...state.filters, ...(action.payload || {}) };
		},
		setStats(state, action) {
			state.stats = action.payload || null;
		},
		setPage(state, action) {
			state.page = Number(action.payload || 1);
		},
		setPageSize(state, action) {
			state.pageSize = Number(action.payload || 10);
		},
		setTotal(state, action) {
			state.total = Number(action.payload || 0);
		},
	},
});

export const { setLoading, setError, setList, setFilters, setStats, setPage, setPageSize, setTotal } = slice.actions;
export default slice.reducer;
