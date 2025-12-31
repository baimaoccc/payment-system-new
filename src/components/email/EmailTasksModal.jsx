import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Pagination } from "../common/Pagination.jsx";
import { EmailTaskListTable } from "./EmailTaskListTable.jsx";
import { fetchEmailTasks } from "../../controllers/emailController.js";
import { useI18n } from "../../plugins/i18n/index.jsx";

export function EmailTasksModal({ isOpen, onClose, orderNo, t, templates }) {
	const [list, setList] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen && orderNo) {
			setPage(1);
			refresh(1);
		} else {
			setList([]);
			setTotal(0);
		}
	}, [isOpen, orderNo]);

	const refresh = async (currentPage = page) => {
		if (!orderNo) return;
		setLoading(true);
		const res = await fetchEmailTasks({ page: currentPage, per_page: pageSize, orderNo });
		setLoading(false);
		if (res.ok) {
			const data = res.data?.data || {};
			setList(data.list || []);
			setTotal(data.total || 0);
		} else {
			// Handle error if needed, maybe just empty list
			setList([]);
			setTotal(0);
		}
	};

	const handlePageChange = (newPage) => {
		setPage(newPage);
		refresh(newPage);
	};

	const handlePageSizeChange = (newSize) => {
		setPageSize(newSize);
		setPage(1);
		// Effect will trigger refresh because of page change? No, page change effect isn't there.
		// So we need to call refresh manually or add effect on page/pageSize.
		// Let's use effect on page/pageSize to be consistent with other views.
	};

	useEffect(() => {
		if (isOpen && orderNo) {
			refresh();
		}
	}, [page, pageSize]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
				<div className="flex items-center justify-between p-6 border-b border-gray-100">
					<h3 className="text-xl font-bold text-gray-800">
						{t("emailTaskHistory") || "Email Task History"} - {orderNo}
					</h3>
					<button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-6">
					{loading ? (
						<div className="p-12 text-center text-gray-400">
							<FontAwesomeIcon icon={faSpinner} spin className="text-3xl mb-3" />
							<p>{t("loading")}</p>
						</div>
					) : (
						<EmailTaskListTable list={list} t={t} templates={templates} showActions={false} />
					)}
				</div>

				<div className="border-t border-gray-100 bg-gray-50/30 p-4 rounded-b-xl">
					<Pagination page={page} pageSize={pageSize} total={total} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} />
				</div>
			</div>
		</div>
	);
}
