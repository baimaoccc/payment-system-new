import { createSlice } from "@reduxjs/toolkit";

/**
 * 中文：认证切片，保存会话与角色
 * English: Auth slice storing session and role
 */
const initialState = {
	isAuthed: false,
	user: null,
	role: null,
	merchantId: null,
	token: null,
	loading: false,
	error: null,
};

const slice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setLoading(state, action) {
			state.loading = !!action.payload;
		},
		setError(state, action) {
			state.error = action.payload || null;
		},
		setSession(state, action) {
			const { user, role, merchantId, token } = action.payload || {};
			state.isAuthed = !!user;
			state.user = user || null;
			state.role = role || null;
			state.merchantId = merchantId || null;
			state.token = token || null;
		},
		clearSession(state) {
			Object.assign(state, initialState);
		},
	},
});

export const { setLoading, setError, setSession, clearSession } = slice.actions;
export default slice.reducer;
