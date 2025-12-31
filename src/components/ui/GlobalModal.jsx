import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearModal } from "../../store/slices/ui.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export function GlobalModal() {
	const dispatch = useDispatch();
	const modal = useSelector((s) => s.ui.modal);
	const [loading, setLoading] = useState(false);

	if (!modal) return null;

	const handleConfirm = async () => {
		if (modal.onConfirm) {
			const result = modal.onConfirm();
			if (result instanceof Promise) {
				setLoading(true);
				try {
					await result;
				} finally {
					setLoading(false);
					dispatch(clearModal());
				}
			} else {
				dispatch(clearModal());
			}
		} else {
			dispatch(clearModal());
		}
	};

	const handleCancel = () => {
		if (loading) return;
		if (modal.onCancel) {
			modal.onCancel();
		}
		dispatch(clearModal());
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
			<div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleCancel} />
			<div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
				<div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
					<h3 className="text-lg font-bold text-gray-900">{modal.title || "Notification"}</h3>
				</div>

				<div className="px-6 py-6 text-gray-600 leading-relaxed">{modal.message || ""}</div>

				<div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
					{modal.showCancel && (
						<button disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleCancel}>
							{modal.cancelText || "Cancel"}
						</button>
					)}
					<button disabled={loading} className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${modal.variant === "danger" ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"}`} onClick={handleConfirm}>
						{loading && <FontAwesomeIcon icon={faSpinner} spin />}
						{modal.confirmText || "OK"}
					</button>
				</div>
			</div>
		</div>
	);
}
