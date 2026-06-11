import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";

export function NavMenu({ items, collapsed, role, onExpandRequest, onLeafClick }) {
	const { t } = useI18n();
	const location = useLocation();
	const [expanded, setExpanded] = useState({});

	const toggleExpand = (label) => {
		setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
	};

	const hasPermission = (item) => {
		if (!item.roles || item.roles.length === 0) return true;
		return item.roles.includes(role);
	};

	const renderMenuItem = (item) => {
		if (!hasPermission(item)) return null;

		if (item.children) {
			const isExpanded = expanded[item.label];
			const isActive = item.children.some((child) => location.pathname.startsWith(child.path));

			return (
				<div key={item.label}>
					<div
						className={`text-sm relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-medium my-1 cursor-pointer
						${isActive ? "text-brand bg-blue-50 dark:bg-gray-700 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-brand dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"}
						${collapsed ? "justify-center" : "gap-3 justify-between"}`}
						onClick={(e) => {
							e.stopPropagation();
							toggleExpand(item.label);
						}}
						title={collapsed ? t(item.label) : ""}>
						<div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
							{item.isCustomIcon ? (
								<div className={`${collapsed ? "w-5 h-5" : "w-6 h-6"} flex items-center justify-center`}>
									<item.icon />
								</div>
							) : (
								<FontAwesomeIcon icon={item.icon} className={`${collapsed ? "text-xl" : "text-lg"} w-6 text-center`} />
							)}
							{!collapsed && <span>{t(item.label)}</span>}
						</div>
						{!collapsed && <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} className="text-xs opacity-50" />}
					</div>

					{/* Sub-menu */}
					{/* Show sub-menu if expanded, regardless of collapsed state */}
					{isExpanded && (
						<div className={`${collapsed ? "pl-0 flex flex-col items-center bg-gray-50/50 dark:bg-gray-700 py-2 rounded-lg mt-1 mx-1" : "pl-4 space-y-1 mt-1"}`}>
							{item.children.map((child) => renderMenuItem(child))}
						</div>
					)}
				</div>
			);
		}

		// Leaf Item
		return (
			<NavLink
				key={item.path}
				to={item.path}
				onClick={onLeafClick}
				title={collapsed ? t(item.label) : ""}
				className={({ isActive }) => `
                    text-sm relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-medium my-1
                    ${isActive ? "bg-brand text-white shadow-lg shadow-blue-200 dark:shadow-none dark:bg-blue-600" : "text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-brand dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-400"} 
                    ${collapsed ? "justify-center" : "gap-3"}
                `}>
				{item.isCustomIcon ? (
					<div className={`${collapsed ? "w-5 h-5" : "w-6 h-6"} flex items-center justify-center`}>
						<item.icon />
					</div>
				) : item.icon ? (
					<FontAwesomeIcon icon={item.icon} className={`${collapsed ? "text-xl" : "text-lg"} w-6 text-center`} />
				) : (
					<div className="w-6" />
				)}
				{!collapsed && <span>{t(item.label)}</span>}
			</NavLink>
		);
	};

	return <div className="space-y-1">{items.map(renderMenuItem)}</div>;
}
