import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchOrder, fetchOrderCharges } from "../../controllers/ordersController.js";
import { addToast } from "../../store/slices/ui.js";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { renderOrderStatus } from "../../utils/orderStatusRender.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUser, faCreditCard, faDesktop, faList } from "@fortawesome/free-solid-svg-icons";

export default function OrderDetailsView() {
	const { id } = useParams();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { t } = useI18n();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const [charges, setCharges] = useState([]);
	const [loadingCharges, setLoadingCharges] = useState(false);

	useEffect(() => {
		if (id) {
			loadOrder();
			loadCharges();
		}
	}, [id]);

	const loadOrder = async () => {
		const res = await fetchOrder({ dispatch, id });
		if (res.ok) {
			setOrder(res.data);
		}
		setLoading(false);
	};

	const loadCharges = async () => {
		setLoadingCharges(true);
		const res = await fetchOrderCharges({ dispatch, id });
		if (res.ok) {
			setCharges(res.data);
		}
		setLoadingCharges(false);
	};

	const handleCopy = (text) => {
		if (!text || text === "-") return;
		navigator.clipboard
			.writeText(text)
			.then(() => {
				dispatch(addToast({ id: Date.now(), type: "success", message: t("copied") || "Copied" }));
			})
			.catch(() => {
				dispatch(addToast({ id: Date.now(), type: "error", message: t("copyFailed") || "Copy Failed" }));
			});
	};

	if (loading) return <div className="p-8 text-center text-gray-500">{t("loading")}</div>;
	if (!order) return <div className="p-8 text-center text-gray-500">{t("noData")}</div>;

	return (
		<div className="p-4 md:py-6 w-full mx-auto animate-in fade-in duration-300">
			{/* Header */}
			<div className="flex items-center gap-4 mb-6">
				<div className="flex items-center">
					<button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
						<FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
					</button>
					<h1 className="text-2xl font-bold text-gray-900">{t("orderDetails")}</h1>
				</div>

				<p className="text-sm text-gray-500">
					{t("idLabel")}: {order.orderNo || order.id}
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Contact Details Card */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
						<div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
							<FontAwesomeIcon icon={faUser} className="text-xl" />
						</div>
						<div>
							<h2 className="text-lg font-bold text-gray-900">{t("contactDetails")}</h2>
							<p className="text-xs text-gray-500">
								{order.first_name} {order.last_name}
							</p>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-y-6 gap-x-4">
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("mobile")}</label>
							<div className={`text-sm font-medium text-gray-900 break-all ${order.phone ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}`} onClick={() => handleCopy(order.phone)} title={order.phone ? t("clickToCopy") : ""}>
								{order.phone || "-"}
							</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("email")}</label>
							<div className={`text-sm font-medium text-gray-900 break-all ${order.email ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}`} onClick={() => handleCopy(order.email)} title={order.email ? t("clickToCopy") : ""}>
								{order.email || "-"}
							</div>
						</div>
						<div className="col-span-2">
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("billingAddress")}</label>
							<div className="text-sm font-medium text-gray-900">
								{order.address} {order.address2 ? `, ${order.address2}` : ""}
							</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("city")}</label>
							<div className="text-sm font-medium text-gray-900">{order.city || "-"}</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("country")}</label>
							<div className="text-sm font-medium text-gray-900 flex items-center gap-2">
								{order.country_code && <span className="bg-gray-100 px-1.5 rounded text-xs text-gray-600">{order.country_code}</span>}
								{order.state || "-"}
							</div>
						</div>
						<div className="col-span-2">
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("zipcode")}</label>
							<div className="text-sm font-medium text-gray-900">{order.zipcode || "-"}</div>
						</div>
					</div>
				</div>

				{/* Transaction Details Card */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
						<div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
							<FontAwesomeIcon icon={faCreditCard} className="text-xl" />
						</div>
						<div>
							<h2 className="text-lg font-bold text-gray-900">{t("transactionDetails")}</h2>
							<p className="text-xs text-gray-500">
								{t("amount")}: {order.amount} {order.currency}
							</p>
						</div>
						<div className="ml-auto">{renderOrderStatus(order, t, false)}</div>
					</div>

					<div className="grid grid-cols-2 gap-y-6 gap-x-4">
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("amount")}</label>
							<div className="text-xl font-bold text-gray-900">
								{order.amount} <span className="text-sm font-normal text-gray-500">{order.currency}</span>
							</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("ref")}</label>
							<div className={`text-sm font-medium text-gray-900 break-all ${order.client_orderNo ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}`} onClick={() => handleCopy(order.client_orderNo)} title={order.client_orderNo ? t("clickToCopy") : ""}>
								{order.client_orderNo || "-"}
							</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("crt")}</label>
							<div className="text-sm font-medium text-gray-900">{order.createtime ? new Date(order.createtime * 1000).toLocaleString() : "-"}</div>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("upd")}</label>
							<div className="text-sm font-medium text-gray-900">{order.updatetime ? new Date(order.updatetime * 1000).toLocaleString() : "-"}</div>
						</div>
						<div className="col-span-2">
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("site")}</label>
							<a href={order.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all block truncate">
								{order.url || "-"}
							</a>
						</div>
						{order.failure_message && (
							<div className="col-span-2 bg-red-50 p-3 rounded-lg border border-red-100">
								<label className="block text-xs font-bold text-red-600 mb-1">{t("failureMsg")}</label>
								<div className="text-xs text-red-800 break-words">{order.failure_message}</div>
								{order.failure_code && (
									<div className="text-xs text-red-600 mt-1 font-mono">
										{t("codeLabel")}: {order.failure_code}
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Technical Info Card */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2">
					<div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
						<div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
							<FontAwesomeIcon icon={faDesktop} className="text-xl" />
						</div>
						<div>
							<h2 className="text-lg font-bold text-gray-900">{t("technicalDetails")}</h2>
							<p className="text-xs text-gray-500">{t("technicalSub")}</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div>
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("ipAddress")}</label>
							<div className="text-sm font-medium text-gray-900 flex items-center gap-2">
								{order.ip || "-"}
								{order.ipv6 && <span className="text-xs text-gray-400">({t("ipv6")})</span>}
							</div>
						</div>
						<div className="md:col-span-2">
							<label className="block text-xs font-medium text-gray-500 mb-1">{t("userAgent")}</label>
							<div className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded break-all border border-gray-100">{order.user_agent || "-"}</div>
						</div>
					</div>
				</div>

				{/* Charges List Card */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2">
					<div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
						<div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
							<FontAwesomeIcon icon={faList} className="text-xl" />
						</div>
						<div>
							<h2 className="text-lg font-bold text-gray-900">{t("chargesList")}</h2>
							<p className="text-xs text-gray-500">{t("chargesListSub")}</p>
						</div>
					</div>

					{loadingCharges ? (
						<div className="text-center py-8 text-gray-500">{t("loading")}</div>
					) : charges.length === 0 ? (
						<div className="text-center py-8 text-gray-500">{t("noData")}</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm text-left">
								<thead className="bg-gray-50 text-gray-500">
									<tr>
										<th className="px-4 py-3 font-medium rounded-l-lg">{t("amount")}</th>
										<th className="px-4 py-3 font-medium">{t("status")}</th>
										<th className="px-4 py-3 font-medium">{t("paymentMethod")}</th>
										<th className="px-4 py-3 font-medium">{t("date")}</th>
										<th className="px-4 py-3 font-medium">{t("riskScore")}</th>
										<th className="px-4 py-3 font-medium">{t("receipt") || "Receipt"}</th>
										<th className="px-4 py-3 font-medium rounded-r-lg">{t("idLabel")}</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{charges.map((charge, idx) => (
										<tr key={charge.id || idx} className="hover:bg-gray-50 transition-colors">
											<td className="px-4 py-3 font-medium text-gray-900">
												{(charge.amount / 100).toFixed(2)} <span className="text-gray-500 font-normal">{charge.currency?.toUpperCase()}</span>
											</td>
											<td className="px-4 py-3">
												{charge.refunded ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{t("refunded")}</span> : charge.paid ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">{t("succeed")}</span> : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">{t("failed")}</span>}
												{charge.failure_message && (
													<div className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={charge.failure_message}>
														{charge.failure_message}
													</div>
												)}
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center gap-2">
													<span className="uppercase font-medium text-gray-700">{charge.payment_method_details?.card?.brand}</span>
													<span className="text-gray-400">•••• {charge.payment_method_details?.card?.last4}</span>
												</div>
											</td>
											<td className="px-4 py-3 text-gray-500">{new Date(charge.created * 1000).toLocaleString()}</td>
											<td className="px-4 py-3">{charge.outcome?.risk_score !== undefined ? <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${charge.outcome.risk_score < 65 ? "bg-green-100 text-green-800" : charge.outcome.risk_score < 75 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{charge.outcome.risk_score}</span> : "-"}</td>
											<td className="px-4 py-3">
												{charge.receipt_url ? (
													<a href={charge.receipt_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">
														{t("view") || "View"}
													</a>
												) : (
													"-"
												)}
											</td>
											<td className="px-4 py-3 text-gray-400 font-mono text-xs">{charge.id}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
