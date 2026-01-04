import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { useSelector } from "react-redux";
import { ROLE_MAP } from "./menuConfig";
import { useMenu } from "../../hooks/useMenu";
import { NavMenu } from "./NavMenu";
import { Logo } from "../common/Logo.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import BrandTextImg from "../../assets/brand-text.png";

export function MobileSidebar({ isOpen, onClose }) {
	const user = useSelector((s) => s.auth.user);
	const authRole = useSelector((s) => s.auth.role);
	const currentRole = user?.juese_id ? ROLE_MAP[user.juese_id] : authRole || "guest";
	const menuItems = useMenu();

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

	if (!isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 z-[9999] flex">
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

			{/* Drawer */}
			<div className="relative flex flex-col w-64 h-full bg-white shadow-xl animate-page">
				<div className="flex items-center justify-between h-16 px-4 border-b">
					<Logo size={36}/>
					<img src={BrandTextImg} alt="text" className="w-auto h-[28px]" />
					<button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
					<NavMenu items={menuItems} collapsed={false} role={currentRole} onLeafClick={onClose} />
				</div>
			</div>
		</div>,
		document.body
	);
}
