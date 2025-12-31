import { createSlice } from "@reduxjs/toolkit";

/**
 * 中文：UI 切片，保存全局 UI 状态（例如语言）
 * English: UI slice storing global UI state (e.g., language)
 */
const initialState = {
	lang: "zh",
	theme: "light",
	notifications: 4,
	messages: 3,
	sidebarCollapsed: false,
	toasts: [],
	modal: null,
	emailTemplatesAll: [],
};

const slice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		setLang(state, action) {
			state.lang = action.payload || "zh";
		},
		setTheme(state, action) {
			state.theme = action.payload || "light";
		},
		setNotifications(state, action) {
			state.notifications = Number(action.payload || 0);
		},
		setMessages(state, action) {
			state.messages = Number(action.payload || 0);
		},
		toggleSidebar(state, action) {
			if (action.payload !== undefined) {
				state.sidebarCollapsed = Boolean(action.payload);
			} else {
				state.sidebarCollapsed = !state.sidebarCollapsed;
			}
		},
		setSidebarCollapsed(state, action) {
			state.sidebarCollapsed = !!action.payload;
		},
		addToast(state, action) {
			state.toasts.push(action.payload);
		},
		removeToast(state, action) {
			state.toasts = state.toasts.filter((t) => t.id !== action.payload);
		},
		setModal(state, action) {
			state.modal = action.payload || null;
		},
		clearModal(state) {
			state.modal = null;
		},
		setEmailTemplatesAll(state, action) {
			state.emailTemplatesAll = Array.isArray(action.payload) ? action.payload : [];
		},
	},
});

export const { setLang, setTheme, setNotifications, setMessages, toggleSidebar, setSidebarCollapsed, addToast, removeToast, setModal, clearModal, setEmailTemplatesAll } = slice.actions;
export default slice.reducer;
