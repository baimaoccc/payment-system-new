import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { MENU_CONFIG, ROLE_MAP } from "../layout/menuConfig";
import { useI18n } from "../../plugins/i18n/index.jsx";

/**
 * 中文：受保护路由；未登录跳转登录页；检查角色权限
 * English: Protected route; redirect to login if unauthenticated; check role permissions
 */
export function GuardedRoute({ children }) {
	const { t } = useI18n();
	const isAuthed = useSelector((s) => s.auth.isAuthed);
	const user = useSelector((s) => s.auth.user);
	const authRole = useSelector((s) => s.auth.role);
	const location = useLocation();

	if (!isAuthed) return <Navigate to="/login" replace state={{ from: location }} />;

	// 1. Determine current role
	const currentRole = user?.juese_id ? ROLE_MAP[user.juese_id] : authRole || "guest";

	// 2. Permission check logic
	const hasPermission = (path) => {
		// Recursive search for path in MENU_CONFIG
		const findItem = (items) => {
			for (const item of items) {
				if (item.path === path) return item;
				if (item.children) {
					const found = findItem(item.children);
					if (found) return found;
				}
			}
			return null;
		};

		const item = findItem(MENU_CONFIG);
		// If item not found or no roles defined, allowed for all
		if (!item || !item.roles || item.roles.length === 0) return true;

		return item.roles.includes(currentRole);
	};

	// 3. Check permission for current path
	if (!hasPermission(location.pathname)) {
		// If blocked, redirect to dashboard.
		// If dashboard is also blocked (unlikely), show error.
		if (location.pathname !== "/dashboard") {
			return <Navigate to="/dashboard" replace />;
		}
		return <div className="flex items-center justify-center h-screen text-gray-500">{t("accessDenied")}</div>;
	}

	return children;
}
