import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

export function ActionDropdown({ actions }) {
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const buttonRef = useRef(null);
	const dropdownRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			// If clicking on the button, don't close (let the button click handler toggle it)
			if (buttonRef.current && buttonRef.current.contains(event.target)) {
				return;
			}
			// If clicking outside the dropdown, close it
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			// Calculate position
			if (buttonRef.current) {
				const rect = buttonRef.current.getBoundingClientRect();
				const scrollY = window.scrollY || window.pageYOffset;
				const scrollX = window.scrollX || window.pageXOffset;

				// Default to opening to the left
				let left = rect.right - 160 + scrollX; // 160 is approx width (w-40)
				let top = rect.bottom + 8 + scrollY;

				// Adjust if off screen (simple check)
				if (left < 0) left = rect.left + scrollX;

				setPosition({ top, left });
			}
		}

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	// Update position on scroll or resize when open
	useEffect(() => {
		if (!isOpen) return;

		const handleScrollOrResize = () => {
			if (buttonRef.current) {
				const rect = buttonRef.current.getBoundingClientRect();
				// Close if button moves significantly or just recalculate (simpler to close for now to avoid floating weirdness)
				setIsOpen(false);
			}
		};

		window.addEventListener("scroll", handleScrollOrResize, true);
		window.addEventListener("resize", handleScrollOrResize);

		return () => {
			window.removeEventListener("scroll", handleScrollOrResize, true);
			window.removeEventListener("resize", handleScrollOrResize);
		};
	}, [isOpen]);

	const toggleOpen = (e) => {
		e.stopPropagation();
		setIsOpen(!isOpen);
	};

	return (
		<>
			<button ref={buttonRef} onClick={toggleOpen} className="flex items-center justify-center text-gray-500 transition-colors text-xs h-6 w-6 rounded-full hover:bg-gray-100">
				<FontAwesomeIcon icon={faEllipsisV} />
			</button>

			{isOpen &&
				createPortal(
					<div ref={dropdownRef} className="fixed bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-[9999] focus:outline-none py-1 w-42" style={{ top: position.top, left: position.left }}>
						{actions.map((action, index) => (
							<button
								key={index}
								onClick={(e) => {
									e.stopPropagation();
									setIsOpen(false);
									action.onClick();
								}}
								className={`w-full flex items-center text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${action.className || ""}`}>
								{action.icon && <span className="mr-2">{action.icon}</span>}
								{action.label}
							</button>
						))}
					</div>,
					document.body
				)}
		</>
	);
}
