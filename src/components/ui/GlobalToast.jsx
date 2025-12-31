import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeToast } from "../../store/slices/ui.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationTriangle, faInfoCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

function ToastItem({ item, onClose }) {
	React.useEffect(() => {
		const t = setTimeout(() => onClose(item.id), 2500);
		return () => clearTimeout(t);
	}, [item.id, onClose]);
	const type = item.type || "info";
	const bg = type === "error" ? "bg-action-red-30" : type === "success" ? "bg-action-green-30" : type === "warning" ? "bg-action-yellow-30" : type === "info" ? "bg-action-yellow-30" : "bg-white";
	const border = type === "error" ? "border-action-red" : type === "success" ? "border-action-green" : type === "warning" ? "border-action-yellow" : type === "info" ? "border-action-yellow" : "border-grey-3";
	const iconColor = type === "error" ? "text-action-red" : type === "success" ? "text-action-green" : type === "warning" ? "text-action-yellow" : "text-action-yellow";
	const icon = type === "error" ? faTimesCircle : type === "success" ? faCheckCircle : type === "warning" ? faExclamationTriangle : faInfoCircle;
	return (
		<div className={`rounded-md px-3 py-2 shadow-lg border ${bg} text-gray-900 text-xs font-normal z-[1000001]`}>
			<span className="inline-flex items-center gap-2">
				<FontAwesomeIcon icon={icon} className={`text-[12px] ${iconColor}`} />
				<span>{item.message}</span>
			</span>
		</div>
	);
}

export function GlobalToast() {
	const dispatch = useDispatch();
	const toasts = useSelector((s) => s.ui.toasts);
	const onClose = (id) => dispatch(removeToast(id));
	return (
		<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 flex flex-col items-center z-[1000000]">
			{toasts.map((t) => (
				<ToastItem key={t.id} item={t} onClose={onClose} />
			))}
		</div>
	);
}
