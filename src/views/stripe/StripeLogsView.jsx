import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { fetchStripeLogs } from "../../controllers/stripeController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

export function StripeLogsView() {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const [list, setList] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [loading, setLoading] = useState(false);
	const [selectedLog, setSelectedLog] = useState(null);

	useEffect(() => {
		loadData();
	}, [page, pageSize]);

	const loadData = async () => {
		setLoading(true);
		const res = await fetchStripeLogs({ page, per_page: pageSize });
		if (res.ok) {
			setList(res.data.list);
			setTotal(res.data.total);
		}
		setLoading(false);
	};

	const onPageChange = (p) => setPage(p);
	const onPageSizeChange = (s) => {
		setPageSize(s);
		setPage(1);
	};

    const handleView = (item) => {
        setSelectedLog(item);
    };

    const closeLogModal = () => {
        setSelectedLog(null);
    };

	return (
		<div className="p-6">
			<div className="bg-white rounded-2xl shadow p-4">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-sm font-semibold text-gray-900">{t("stripeLogs")}</h3>
				</div>

				{loading ? (
					<div className="p-8 text-center text-gray-500">{t("loading")}</div>
				) : (
					<div className="overflow-x-auto mt-3">
						<table className="w-full text-xs table-fixed">
							<thead className="bg-gray-100">
								<tr>
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-[10%]">{t("idLabel")}</th>
                                    <th className="px-3 py-3 text-left font-medium text-gray-700 w-[15%]">{t("account")}</th>
                                    <th className="px-3 py-3 text-left font-medium text-gray-700 w-[15%]">{t("type")}</th>
                                    <th className="px-3 py-3 text-left font-medium text-gray-700 w-[40%]">{t("content")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-[10%]">{t("date")}</th>
                                    <th className="px-3 py-3 text-left font-medium text-gray-700 w-[10%]">{t("actions")}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{list.length === 0 ? (
									<tr>
										<td colSpan="6" className="px-4 py-8 text-center text-gray-400">
											{t("noData")}
										</td>
									</tr>
								) : (
									list.map((item) => {
                                        const createDate = item.createtime ? new Date(item.createtime * 1000).toLocaleString() : "-";
                                        
                                        return (
										<tr key={item.id} className="hover:bg-gray-50 transition-colors border-t">
											<td className="p-3 overflow-hidden text-gray-600 font-mono">
                                                {item.id}
                                            </td>
                                            <td className="p-3 overflow-hidden truncate">
                                                {item.stripe_id || "-"}
                                            </td>
                                            <td className="p-3 overflow-hidden truncate">
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                                    {item.type || "INFO"}
                                                </span>
                                            </td>
                                            <td className="p-3 overflow-hidden truncate font-mono text-gray-500">
                                                {typeof item.content === 'object' ? JSON.stringify(item.content) : item.content}
                                            </td>
                                            <td className="p-3 overflow-hidden truncate text-gray-500">
                                                {createDate}
                                            </td>
                                            <td className="p-3">
                                                <button 
                                                    onClick={() => handleView(item)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors p-1 flex items-center gap-1"
                                                    title={t("view")}>
                                                    <FontAwesomeIcon icon={faEye} size="sm" />
                                                    <span>{t("view")}</span>
                                                </button>
                                            </td>
										</tr>
										);
                                    })
								)}
							</tbody>
						</table>
					</div>
				)}

				<div className="mt-3">
					<Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
				</div>
			</div>

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeLogModal} />
                    <div className="relative overflow-hidden bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col z-10 m-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-bold text-gray-900">{t("logDetails")} #{selectedLog.id}</h3>
                            <button onClick={closeLogModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-gray-50 font-mono text-xs">
                            <pre className="whitespace-pre-wrap break-all">
                                {(() => {
                                    try {
                                        const content = typeof selectedLog.content === 'string' 
                                            ? JSON.parse(selectedLog.content) 
                                            : selectedLog.content;
                                        return JSON.stringify(content, null, 2);
                                    } catch (e) {
                                        return selectedLog.content;
                                    }
                                })()}
                            </pre>
                        </div>
                        <div className="p-4 border-t flex justify-end">
                            <button 
                                onClick={closeLogModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                {t("close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
		</div>
	);
}
