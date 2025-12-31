import React from "react";
import { Sidebar } from "./Sidebar.jsx";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { Outlet, useLocation } from "react-router-dom";

/**
 * 应用布局：左侧导航 + 顶部栏 + 内容区域
 */
export function AppLayout() {
	const location = useLocation();
	return (
		<div className="h-screen bg-gray-50 overflow-hidden">
			<div className="flex h-full">
				<Sidebar />
				<div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
					<Header />
					<div className="flex-1 space-y-6 overflow-y-auto flex flex-col">
						<div key={location.pathname} className="animate-page flex-1">
							<Outlet />
						</div>
						<Footer />
					</div>
				</div>
			</div>
		</div>
	);
}
