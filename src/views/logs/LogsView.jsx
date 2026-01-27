import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { setPage, setPageSize } from "../../store/slices/logs.js";
import { fetchLogs, getLogDetails } from "../../controllers/logController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { LogDetailModal } from "../../components/logs/LogDetailModal.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";

export function LogsView() {
	const dispatch = useDispatch();
	const { t } = useI18n();
	const { list, loading, page, pageSize, total } = useSelector((s) => s.logs);
	const currentUser = useSelector((s) => s.auth.user);

	const [searchTerm, setSearchTerm] = useState("");
	const [detailId, setDetailId] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);

	// Security check: Only Super Admin (1) and Admin (4) can access logs
	const canAccess = currentUser && [1, 4].includes(Number(currentUser.juese_id));

	const refresh = () => {
		if (canAccess) {
			fetchLogs({ dispatch, page, per_page: pageSize, search: searchTerm });
		}
	};

	useEffect(() => {
		refresh();
	}, [dispatch, page, pageSize, canAccess]); // Add searchTerm to deps if auto-search is desired, or keep manual

	if (!canAccess) {
		return (
			<div className="flex items-center justify-center min-h-[60vh] text-gray-500">
				<div className="text-center">
					<h2 className="text-xl font-bold mb-2">{t("accessDenied")}</h2>
					<p>{t("accessDeniedHint")}</p>
				</div>
			</div>
		);
	}

	const handleSearch = (e) => {
		e.preventDefault();
		if (page === 1) {
			refresh();
		} else {
			dispatch(setPage(1)); // This will trigger effect to refresh
		}
	};

	const openDetails = (id) => {
		setDetailId(id);
		setModalOpen(true);
	};

	const onPageChange = (p) => dispatch(setPage(p));
	const onPageSizeChange = (n) => {
		dispatch(setPageSize(n));
		dispatch(setPage(1));
	};

	const safeList = Array.isArray(list) ? list : [];

	const formatDate = (ts) => {
		if (!ts) return "-";
		return new Date(ts * 1000).toLocaleString();
	};

	return (
		<div className="p-4 md:p-6 max-w-[1600px] mx-auto">
			<LogDetailModal open={modalOpen} logId={detailId} onClose={() => setModalOpen(false)} t={t} />

			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">{t("logManagement")}</h1>
					<p className="text-sm text-gray-500 mt-1">{t("logManagementHint")}</p>
				</div>
			</div>

			{/* Search Bar */}
			<div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
				<form onSubmit={handleSearch} className="flex gap-4">
					<div className="flex-1 relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<FontAwesomeIcon icon={faSearch} className="text-gray-400" />
						</div>
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder={t("searchLogByEmail")}
							className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
						/>
					</div>
					<button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
						{t("search")}
					</button>
				</form>
			</div>

			{/* Desktop Table */}
			<div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				{loading ? (
					<div className="p-12 text-center text-gray-500">
						<FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
						{t("loading")}
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50/50 border-b border-gray-100 text-left">
								<tr>
									<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("log_id")}</th>
									<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("username")}</th>
									<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("log_title")}</th>
									<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("log_link")}</th>
									<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("log_ip")}</th>
									<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("log_user_agent")}</th>
									<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("log_createtime")}</th>
									<th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t("actions")}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100 text-[13px]">
								{safeList.map((log) => (
									<tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
										<td className="py-3 px-6 text-gray-500 font-mono text-xs">#{log.id}</td>
										<td className="py-3 px-6 text-gray-900 whitespace-nowrap">
											<div className="font-medium">{log.username || "-"}</div>
											<div className="text-xs text-gray-400">ID: {log.user_id}</div>
										</td>
										<td className="py-3 px-6 text-gray-900 max-w-[150px] truncate" title={log.title}>
											{log.title || "-"}
										</td>
										<td className="py-3 px-6 text-blue-600 max-w-[150px] truncate" title={log.link}>
											{log.link || "-"}
										</td>
										<td className="py-3 px-6 text-gray-500 whitespace-nowrap text-xs font-mono">{log.ip || "-"}</td>
										<td className="py-3 px-6 text-gray-500 max-w-[150px] truncate text-xs" title={log.user_agent}>
											{log.user_agent || "-"}
										</td>
										<td className="py-3 px-6 text-gray-500 whitespace-nowrap">{formatDate(log.createtime)}</td>
										<td className="py-3 px-6 text-right">
											<button onClick={() => openDetails(log.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t("viewDetails")}>
												<FontAwesomeIcon icon={faEye} />
											</button>
										</td>
									</tr>
								))}
								{safeList.length === 0 && (
									<tr>
										<td colSpan="8" className="py-12 text-center text-gray-400">
											{t("noData")}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}
				<div className="p-4 border-t border-gray-100">
					<Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
				</div>
			</div>

			{/* Mobile View */}
			<div className="lg:hidden space-y-4">
				{loading ? (
					<div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
						<FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
						{t("loading")}
					</div>
				) : safeList.length === 0 ? (
					<div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">{t("noData")}</div>
				) : (
					safeList.map((log) => (
						<div key={log.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
							<div className="flex justify-between items-start mb-2">
								<div className="flex items-center gap-2">
									<span className="text-xs font-mono text-gray-400">#{log.id}</span>
									<span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{log.username || log.user_id}</span>
								</div>
								<span className="text-xs text-gray-500">{formatDate(log.createtime)}</span>
							</div>
							<div className="mb-2 text-sm font-medium text-gray-900 break-words">{log.title}</div>
							<div className="mb-3 text-xs text-gray-500 break-all font-mono bg-gray-50 p-2 rounded">{log.link}</div>
							<div className="flex justify-end pt-2 border-t border-gray-50">
								<button onClick={() => openDetails(log.id)} className="flex items-center gap-1 text-sm text-blue-600 font-medium px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
									<FontAwesomeIcon icon={faEye} />
									{t("viewDetails") || "查看详情"}
								</button>
							</div>
						</div>
					))
				)}
				{!loading && safeList.length > 0 && (
					<div className="mt-4">
						<Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
					</div>
				)}
			</div>
		</div>
	);
}
