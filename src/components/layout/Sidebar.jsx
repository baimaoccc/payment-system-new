import React, { useEffect } from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setSidebarCollapsed } from "../../store/slices/ui.js";
import { Logo } from "../common/Logo.jsx";
import { ROLE_MAP } from "./menuConfig";
import { useMenu } from "../../hooks/useMenu";
import { NavMenu } from "./NavMenu";
import BrandText from "../../assets/brand-text.png";

/**
 * 左侧导航：支持 RBAC 权限控制与子菜单
 */
export function Sidebar() {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const collapsed = useSelector((s) => s.ui.sidebarCollapsed);
	const user = useSelector((s) => s.auth.user);
	const authRole = useSelector((s) => s.auth.role);

	// Derive effective role from user.juese_id or fallback to auth.role
	const currentRole = user?.juese_id ? ROLE_MAP[user.juese_id] : authRole || "guest";

	const menuItems = useMenu();

	useEffect(() => {
		const mq = window.matchMedia("(min-width: 1024px)");
		const apply = () => {
			if (!mq.matches && !collapsed) dispatch(setSidebarCollapsed(true));
		};
		apply();
		mq.addEventListener("change", apply);
		return () => mq.removeEventListener("change", apply);
	}, [collapsed, dispatch]);

	return (
		<div className={`hidden md:flex flex-col h-full bg-white border-r transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"}`}>
			<div className="h-16 flex items-center justify-center border-b">
				<Logo collapsed={collapsed} />
				{!collapsed && <img src={BrandText} alt="brand-text" className="ml-2 h-8" />}
			</div>

			<div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
				<NavMenu items={menuItems} collapsed={collapsed} role={currentRole} onExpandRequest={() => dispatch(setSidebarCollapsed(false))} />
			</div>
		</div>
	);
}
