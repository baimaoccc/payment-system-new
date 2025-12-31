import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

export function EmailTaskListTable({ list, t, templates, onView, onEdit, onDelete, showActions = true }) {
	const formatDate = (ts) => {
		if (!ts) return "-";
		return new Date(ts * 1000).toLocaleString();
	};

	const getTemplateName = (templateId) => {
		const item = templates.find((tpl) => String(tpl.id) === String(templateId));
		return item ? item.name || item.title || `#${item.id}` : templateId;
	};

	const renderStatus = (status) => {
		const value = String(status);
		if (value === "1")
			return {
				txt: t("taskStatus_sent"),
				bg: "bg-action-green-30 text-action-green",
			};
		if (value === "2" || value === "待发")
			return {
				txt: t("taskStatus_pending"),
				bg: "bg-action-yellow-30 text-action-yellow",
			};
		if (value === "3")
			return {
				txt: t("taskStatus_cancelled"),
				bg: "bg-grey-2 text-grey-12",
			};
		if (value === "4" || value === "失败")
			return {
				txt: t("taskStatus_failed"),
				bg: "bg-action-red-30 text-action-red",
			};
		return { txt: status, bg: "bg-gray-100 text-gray-700" };
	};

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full text-xs">
				<thead className="bg-gray-100">
					<tr>
						<th className="px-3 py-3 text-left font-medium text-gray-700 w-16">ID</th>
						<th className="px-3 py-3 text-left font-medium text-gray-700 w-1/5">{t("orderNo")}</th>
						<th className="px-3 py-3 text-left font-medium text-gray-700 w-1/5">{t("emailTemplate")}</th>
						<th className="px-3 py-3 text-left font-medium text-gray-700 w-24">{t("status")}</th>
						<th className="px-3 py-3 text-left font-medium text-gray-700 w-1/6">{t("timeline")}</th>
						{showActions && <th className="px-3 py-3 text-left font-medium text-gray-700 w-24">{t("actions")}</th>}
					</tr>
				</thead>
				<tbody>
					{list.length > 0 ? (
						list.map((item) => {
							const { txt, bg } = renderStatus(item.status);
							return (
								<tr key={item.id} className="border-t hover:bg-gray-50">
									<td className="p-3 align-top font-mono text-gray-500">#{item.id}</td>
									<td className="p-3 align-top">
										<div className="text-gray-800 text-xs truncate max-w-xs" title={item.orderNo || item.order_no}>
											{item.orderNo || item.order_no}
										</div>
									</td>
									<td className="p-3 align-top">
										<div className="text-gray-800 text-xs truncate max-w-xs" title={getTemplateName(item.template_id)}>
											{getTemplateName(item.template_id)}
										</div>
									</td>
									<td className="p-3 align-top">
										<div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${bg}`}>{txt}</div>
									</td>
									<td className="p-3 align-top">
										<div className="text-gray-500 text-[11px]">
											{t("crt")}: {formatDate(item.createtime)}
										</div>
										<div className="text-gray-500 text-[11px]">
											{t("upd")}: {formatDate(item.updatetime)}
										</div>
									</td>
									{showActions && (
										<td className="p-3 align-top">
											<div className="flex items-center gap-3">
												{onView && (
													<button type="button" onClick={() => onView(item)} className="text-gray-600 hover:text-gray-800" title={t("view")}>
														<FontAwesomeIcon icon={faEye} />
													</button>
												)}
												{onEdit && (
													<button type="button" onClick={() => onEdit(item)} className="text-indigo-600 hover:text-indigo-800" title={t("edit")}>
														<FontAwesomeIcon icon={faPen} />
													</button>
												)}
												{onDelete && (
													<button type="button" onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700" title={t("delete")}>
														<FontAwesomeIcon icon={faTrash} />
													</button>
												)}
											</div>
										</td>
									)}
								</tr>
							);
						})
					) : (
						<tr>
							<td colSpan={showActions ? "6" : "5"} className="px-4 py-8 text-center text-gray-400">
								{t("noData")}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
