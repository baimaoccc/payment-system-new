import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "../../components/ui/Card.jsx";
import ReactECharts from "echarts-for-react";
import { DonutChart } from "../../components/charts/DonutChart.jsx";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { useResponsive } from "../../hooks/useResponsive";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends, faCopy, faBoxes, faChartLine, faUndo, faEllipsisH, faEdit, faTrash, faDownload, faFilter, faChevronDown, faChevronUp, faTimes, faCheckCircle, faTimesCircle, faCalendarCheck, faMoneyBillWave, faHistory } from "@fortawesome/free-solid-svg-icons";
import { Select } from "../../components/ui/Select.jsx";
import { fetchUserListN } from "../../controllers/usersController.js";
import { fetchOrderGraphData, fetchOrderData, fetchRecentOrders } from "../../controllers/dashboardController.js";
import { renderOrderStatus } from "../../utils/orderStatusRender.jsx";
import dashboardImg from "../../assets/dashboard-1.png";
import { setAllUsers } from "../../store/slices/users.js";

/**
 * 首页仪表盘视图：采用抽象组件拼装，便于复用与维护
 */
export function DashboardView() {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const { isMobile, isTablet } = useResponsive();
	const user = useSelector((s) => s.auth.user);
	const allUsers = useSelector((s) => s.users.allUsers);
	const [showFilters, setShowFilters] = useState(false);
	const filterRef = useRef(null);
	const [userOptions, setUserOptions] = useState([]);
	const [expandedOrderId, setExpandedOrderId] = useState(null);

	const handleCopy = (text) => {
		if (navigator.clipboard && text) {
			navigator.clipboard.writeText(text);
			// Optional: Toast
		}
	};

	const [stats, setStats] = useState({
		success: 0,
		failed: 0,
		total_order_amount: 0,
		paid_today_order_num: 0,
		paid_today_order_amount: 0,
		paid_yesterday_order_num: 0,
		paid_yesterday_order_amount: 0,
		paid_order_amount: 0,
		failed_today_order_num: 0,
	});

	// Helper to format date as YYYY-MM-DD
	const formatDate = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	// Default date range (last 30 days)
	const getDefaultRange = () => {
		const end = new Date();
		const start = new Date();
		start.setDate(end.getDate() - 29);
		return {
			startTime: formatDate(start),
			endTime: formatDate(end),
		};
	};

	// Filters state
	const [filters, setFilters] = useState({
		...getDefaultRange(),
		// currency: "",
		user: "",
	});

	// const currencyOptions = [
	// 	{ value: "USD", label: "USD" },
	// 	{ value: "EUR", label: "EUR" },
	// 	{ value: "GBP", label: "GBP" },
	// 	{ value: "AUD", label: "AUD" },
	// 	{ value: "CAD", label: "CAD" },
	// 	{ value: "JPY", label: "JPY" },
	// 	{ value: "CNY", label: "CNY" },
	// ];

	// Load users for filter
	useEffect(() => {
		if (allUsers.length > 0) {
			const opts = allUsers.map((u) => ({ value: u.id, label: u.username }));
			setUserOptions(opts);
		} else {
			fetchUserListN().then((res) => {
				if (res.ok) {
					const list = Array.isArray(res.data) ? res.data : res.data?.list || [];
					dispatch(setAllUsers(list));
					// Local update via effect dependency
				}
			});
		}
	}, [allUsers]);

	// Graph Data State
	const [graphData, setGraphData] = useState({
		categories: [],
		success: [],
		failed: [],
	});
	const [loadingGraph, setLoadingGraph] = useState(false);
	const [recentOrders, setRecentOrders] = useState([]);
	const [loadingRecent, setLoadingRecent] = useState(false);

	// Close filters when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (filterRef.current && !filterRef.current.contains(event.target)) {
				setShowFilters(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const isFetching = useRef(false);

	// Fetch Graph Data
	const fetchGraphData = async (currentFilters) => {
		if (isFetching.current) return;
		isFetching.current = true;
		setLoadingGraph(true);
		setLoadingRecent(true);
		try {
			// Calculate timestamps
			let end = currentFilters.endTime ? new Date(currentFilters.endTime) : new Date();
			let start = currentFilters.startTime ? new Date(currentFilters.startTime) : new Date();

			// If string format (YYYY-MM-DD), parse as local time to avoid UTC offset issues
			if (typeof currentFilters.endTime === "string" && currentFilters.endTime.includes("-")) {
				const [y, m, d] = currentFilters.endTime.split("-").map(Number);
				end = new Date(y, m - 1, d);
			}
			if (typeof currentFilters.startTime === "string" && currentFilters.startTime.includes("-")) {
				const [y, m, d] = currentFilters.startTime.split("-").map(Number);
				start = new Date(y, m - 1, d);
			}

			// If no start time provided, default to 30 days before end
			if (!currentFilters.startTime) {
				start = new Date(end);
				start.setDate(end.getDate() - 29);
			}

			// Set start to beginning of day, end to end of day
			start.setHours(0, 0, 0, 0);
			end.setHours(23, 59, 59, 999);

			const startTs = Math.floor(start.getTime() / 1000);
			const endTs = Math.floor(end.getTime() / 1000);

			const [resSuccess, resFailed, resStats, resRecent] = await Promise.all([
				fetchOrderGraphData({
					start_date: startTs,
					end_date: endTs,
					status: 1,
					user_id: currentFilters.user || null,
					frequency: "month",
				}),
				fetchOrderGraphData({
					start_date: startTs,
					end_date: endTs,
					status: 6,
					user_id: currentFilters.user || null,
					frequency: "month",
				}),
				fetchOrderData({
					start_date: startTs,
					end_date: endTs,
					user_id: currentFilters.user || null,
				}),
				fetchRecentOrders({
					limit: 5,
					user_id: currentFilters.user || null,
				}),
			]);

			// Process Recent Orders
			if (resRecent.ok) {
				const list = resRecent.data && resRecent.data.data && resRecent.data.data.list && Array.isArray(resRecent.data.data.list) ? resRecent.data.data.list : [];
				setRecentOrders(list);
			} else {
				setRecentOrders([]);
			}

			// Process Stats
			if (resStats.ok && resStats.data?.data) {
				const d = resStats.data.data;
				const success = parseInt(d.successful_order_num || d.Successful_order_num || 0);
				const failed = parseInt(d.failed_order_num || d.Failed_order_num || 0);
				setStats({
					success,
					failed,
					total_order_amount: parseFloat(d.total_order_amount || d.Total_order_amount || 0),
					paid_today_order_num: parseInt(d.paid_today_order_num || d.Paid_today_order_num || d.today_paid_order_num || 0),
					paid_today_order_amount: parseFloat(d.paid_today_order_amount || d.Paid_today_order_amount || d.today_paid_order_amount || 0),
					paid_yesterday_order_num: parseInt(d.paid_yesterday_order_num || d.Paid_yesterday_order_num || d.yesterday_paid_order_num || 0),
					paid_yesterday_order_amount: parseFloat(d.paid_yesterday_order_amount || d.Paid_yesterday_order_amount || d.yesterday_paid_order_amount || 0),
					paid_order_amount: parseFloat(d.paid_order_amount || 0),
					failed_today_order_num: parseInt(d.failed_today_order_num || d.Failed_today_order_num || d.today_failed_order_num || 0),
				});
			}

			// API returns { code: 0, data: { list: { date: count } } }
			// baseAPI returns { ok: true, data: responseBody }
			const successList = (resSuccess.ok && resSuccess.data?.data?.list) || {};
			const failedList = (resFailed.ok && resFailed.data?.data?.list) || {};

			// Merge keys and sort
			const allDates = new Set([...Object.keys(successList), ...Object.keys(failedList)]);
			let sortedDates = Array.from(allDates).sort();

			// Fallback: if empty, generate dates from start to end
			if (sortedDates.length === 0) {
				const dates = [];
				let curr = new Date(start);
				while (curr <= end) {
					dates.push(curr.toISOString().slice(0, 10));
					curr.setDate(curr.getDate() + 1);
				}
				sortedDates = dates;
			}

			const successSeries = sortedDates.map((d) => successList[d] || 0);
			const failedSeries = sortedDates.map((d) => failedList[d] || 0);

			setGraphData({
				categories: sortedDates,
				success: successSeries,
				failed: failedSeries,
			});
		} catch (error) {
			console.error("Failed to load graph data", error);
		} finally {
			setLoadingGraph(false);
			setLoadingRecent(false);
			isFetching.current = false;
		}
	};

	// Load data on mount
	useEffect(() => {
		fetchGraphData(filters);
	}, []);

	const handleSearch = () => {
		setShowFilters(false);
		fetchGraphData(filters);
	};

	const handleResetClick = () => {
		const emptyFilters = { ...getDefaultRange(), currency: "", user: "" };
		setFilters(emptyFilters);
		fetchGraphData(emptyFilters);
		setShowFilters(false);
	};

	const totalOrders = stats.success + stats.failed;
	const successPct = totalOrders > 0 ? ((stats.success / totalOrders) * 100).toFixed(2) : "0.00";
	const failedPct = totalOrders > 0 ? ((stats.failed / totalOrders) * 100).toFixed(2) : "0.00";

	const option = {
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow",
			},
		},
		legend: {
			data: [t("successOrder"), t("failedOrder")],
			top: 10,
			left: "center",
		},
		toolbox: {
			show: true,
			orient: "vertical",
			left: "right",
			top: "center",
			feature: {
				mark: { show: true },
				dataView: { show: true, readOnly: false },
				magicType: { show: true, type: ["line", "bar"] },
				// restore: { show: true },
				saveAsImage: { show: true },
			},
		},
		xAxis: [
			{
				type: "category",
				// axisTick: { show: false },
				data: graphData.categories,
			},
		],
		yAxis: [
			{
				type: "value",
			},
		],
		grid: {
			bottom: "10%",
			// left: "3%",
			// right: "4%",
			// containLabel: true,
		},
		series: [
			{
				name: t("successOrder"),
				type: "bar",
				stack: "total",
				barWidth: "46%",
				// barGap: 0,
				// label: labelOption,
				// emphasis: {
				//     focus: 'series'
				// },
				data: graphData.success,
				itemStyle: {
					normal: {
						color: "#7B68EE",
					},
				},
			},
			{
				name: t("failedOrder"),
				type: "bar",
				stack: "total",
				barWidth: "46%",
				// barGap: 0,
				// label: labelOption,
				// emphasis: {
				//     focus: 'series'
				// },
				data: graphData.failed,
				itemStyle: {
					normal: {
						color: "#40E0D0",
					},
				},
			},
		],
	};

	const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
		<div className="flex flex-col gap-1">
			<label className="text-[11px] font-medium text-gray-500">{label}</label>
			<input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full h-8 px-3 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors" />
		</div>
	);

	return (
		<div className="space-y-6 p-6">
			{/* Grid container: Auto height on mobile, fixed 200px on desktop */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:h-[200px]">
				{/* Card 1: Total Sales (Redesigned) */}
				<Card className="col-span-1 bg-white !p-0 overflow-hidden relative h-full rounded-lg ">
					<div className="flex justify-between items-center p-6 h-full relative z-10">
						<div className="flex-0 flex flex-col justify-center h-full min-h-[140px]">
							<h3 className="text-gray-500 text-sm font-medium mb-1 font-knewave break-all">Congratulation {user?.username || "User"}!</h3>
							<div className="flex items-baseline gap-2">
								<span className="text-2xl font-bold text-gray-900">${stats.paid_order_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
								{/* <span className="text-green-500 text-xs font-semibold">+9%</span> */}
							</div>
						</div>
						<div className="flex-1 w-32 h-32 md:w-40 md:h-40 pointer-events-none">
							<img src={dashboardImg} alt="Illustration" className="w-full h-full object-contain object-bottom" />
						</div>
					</div>
				</Card>

				{/* Card 2: Stats Grid */}
				<Card className="col-span-1 bg-white !p-0 overflow-hidden relative h-full">
					<div className="grid grid-cols-2 gap-2 h-full">
						{[
							{ label: t("todayOrders"), value: stats.paid_today_order_num, icon: faCalendarCheck, color: "text-blue-600", bg: "bg-blue-50" },
							{ label: t("todaySales"), value: `$${stats.paid_today_order_amount.toLocaleString()}`, icon: faMoneyBillWave, color: "text-green-600", bg: "bg-green-50" },
							{ label: t("yesterdayOrders"), value: stats.paid_yesterday_order_num, icon: faHistory, color: "text-orange-600", bg: "bg-orange-50" },
							{ label: t("yesterdaySales"), value: `$${stats.paid_yesterday_order_amount.toLocaleString()}`, icon: faMoneyBillWave, color: "text-purple-600", bg: "bg-purple-50" },
						].map((item, i) => (
							<div key={i} className="flex flex-col justify-center gap-1 p-4 rounded-lg shadow-xl transition-shadow">
								<div className="flex items-center gap-2">
									<div className={`w-6 h-6 rounded-full ${item.bg} flex items-center justify-center ${item.color} text-sm`}>
										<FontAwesomeIcon icon={item.icon} />
									</div>
									<div className="text-xs text-gray-500 font-medium">{item.label}</div>
								</div>
								<div className="text-lg font-bold text-gray-900 pl-1">{item.value}</div>
							</div>
						))}
					</div>
				</Card>

				{/* Card 3: Donut Chart (Success vs Failed Today) */}
				<Card className="col-span-1 bg-white !p-0 overflow-hidden relative h-full rounded-lg">
					<div className="flex items-center gap-4 justify-center h-full p-4">
						<DonutChart
							size={80}
							thickness={12}
							segments={
								stats.paid_today_order_num + stats.failed_today_order_num > 0
									? [
											{ value: stats.paid_today_order_num, color: "#10B981" }, // Green for success
											{ value: stats.failed_today_order_num, color: "#EF4444" }, // Red for failed
									  ]
									: [{ value: 1, color: "#E5E7EB" }]
							}
						/>
						<div className="flex-1">
							<div className="text-xs text-gray-600 font-medium mb-6 text-center">{t("orderRatio")}</div>
							<ul className="space-y-2">
								<li className="flex items-center justify-between">
									<div className="flex items-center text-xs text-gray-600">
										<span className="w-2.5 h-2.5 rounded-full bg-[#10B981] mr-2" />
										{t("successOrder")}
									</div>
									<span className="text-sm font-bold text-gray-900">{stats.paid_today_order_num}</span>
								</li>
								<li className="flex items-center justify-between">
									<div className="flex items-center text-xs text-gray-600">
										<span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] mr-2" />
										{t("failedOrder")}
									</div>
									<span className="text-sm font-bold text-gray-900">{stats.failed_today_order_num}</span>
								</li>
							</ul>
						</div>
					</div>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white rounded-xl">
				<div className="lg:col-span-3 relative">
					<Card
						title={t("orders")}
						action={
							<div className="flex items-center gap-3">
								<div className="hidden md:flex items-center gap-2">
									{(filters.startTime || filters.endTime) && (
										<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
											<FontAwesomeIcon icon={faCalendarCheck} className="text-gray-400" />
											{filters.startTime} - {filters.endTime}
										</span>
									)}
									{filters.user && (
										<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
											<FontAwesomeIcon icon={faUserFriends} className="text-indigo-400" />
											{userOptions.find((u) => u.value === filters.user)?.label || filters.user}
										</span>
									)}
								</div>
								<button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${showFilters ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
									<FontAwesomeIcon icon={faFilter} className="text-xs" />
									<span className="text-xs font-medium">{t("filters")}</span>
									<FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform ${showFilters ? "rotate-180" : ""}`} />
								</button>
							</div>
						}
						className="overflow-visible h-full">
						{/* Absolute Filter Popup */}
						{showFilters && (
							<div ref={filterRef} className="absolute top-14 right-4 z-50 w-72 bg-white rounded-lg shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200">
								<div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
									<h3 className="text-xs font-semibold text-gray-700">{t("moreFilters")}</h3>
									<button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
										<FontAwesomeIcon icon={faTimes} />
									</button>
								</div>
								<div className="space-y-3">
									<InputField label={t("startTime")} type="date" value={filters.startTime} onChange={(e) => setFilters({ ...filters, startTime: e.target.value })} />
									<InputField label={t("endTime")} type="date" value={filters.endTime} onChange={(e) => setFilters({ ...filters, endTime: e.target.value })} />
									{/* <div className="flex flex-col gap-1">
									<label className="text-[11px] font-medium text-gray-500">{t("orderCurrency")}</label>
									<Select value={filters.currency} options={currencyOptions} onChange={(val) => setFilters({ ...filters, currency: val })} placeholder={t("pleaseSelect")} isClearable />
								</div> */}
									<div className="flex flex-col gap-1">
										<label className="text-[11px] font-medium text-gray-500">{t("orderUser")}</label>
										<Select
											className="hs-custom-select"
											value={filters.user}
											options={userOptions}
											onChange={(val) => {
												console.log(val);
												setFilters({ ...filters, user: val });
											}}
											placeholder={t("pleaseSelect")}
											isClearable
										/>
									</div>
									<div className="pt-2 flex gap-2">
										<button onClick={handleSearch} disabled={loadingGraph} className="flex-1 bg-brand text-white py-1.5 rounded text-xs font-medium hover:bg-brand-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
											{loadingGraph && <FontAwesomeIcon icon={faSpinner} spin />}
											{t("search")}
										</button>
										<button onClick={handleResetClick} disabled={loadingGraph} className="flex-1 bg-gray-100 text-gray-600 py-1.5 rounded text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
											{t("reset")}
										</button>
									</div>
								</div>
							</div>
						)}

						<div className="mt-2 relative w-full">
							{loadingGraph && (
								<div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
								</div>
							)}
							<ReactECharts option={option} className="!h-[300px]" />
						</div>
					</Card>
				</div>
				<div className="flex flex-col gap-6 h-full justify-center p-4">
					<Card className="flex flex-col justify-center shadow-xl rounded-sm">
						<div className="flex justify-between items-start mb-2">
							<div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("successOrder")}</div>
							<div className="text-xs font-bold text-indigo-600">{successPct}%</div>
						</div>
						<div className="flex items-center">
							<div className="text-2xl font-bold mr-6 text-gray-900">{stats.success}</div>
							<div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
								<div className="h-full rounded-full bg-indigo-500" style={{ width: `${successPct}%` }} />
							</div>
						</div>

						<div className="text-[10px] text-gray-400 mb-4">Measures the ratio of successful orders.</div>
					</Card>
					<Card className="flex flex-col justify-center shadow-xl rounded-sm">
						<div className="flex justify-between items-start mb-2">
							<div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("failedOrder")}</div>
							<div className="text-xs font-bold text-red-500">{failedPct}%</div>
						</div>
						<div className="flex items-center">
							<div className="text-2xl font-bold mr-6 text-gray-900">{stats.failed}</div>
							<div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
								<div className="h-full rounded-full bg-red-400" style={{ width: `${failedPct}%` }} />
							</div>
						</div>

						<div className="text-[10px] text-gray-400 mb-4">Measures the ratio of failed orders.</div>
					</Card>
				</div>
			</div>

			<Card
				className="bg-white p-4 rounded-xl"
				title={t("recentOrders")}
				action={
					<div className="flex items-center gap-2">
						{/* <span className="text-xs text-gray-500">{t("pending")}</span>
						<span className="px-2 py-1 bg-brand text-white rounded text-xs">{t("active")}</span> */}
					</div>
				}>
				{loadingRecent ? (
					<div className="flex justify-center items-center py-10">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
					</div>
				) : recentOrders.length > 0 ? (
					isMobile ? (
						<div className="flex flex-col gap-3">
							{recentOrders.map((o, i) => {
								const createDate = o.createtime || "-";
								const updateDate = o.updatetime || "-";
								const isExpanded = expandedOrderId === i;

								return (
									<div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100 transition-all">
										{/* Header: Site & Status */}
										<div className="flex justify-between items-start mb-2">
											<div className="flex-1 min-w-0 mr-2">
												<div className="font-bold text-gray-900 text-sm truncate" title={o.url}>
													{o.url || "-"}
												</div>
												<div className="text-xs text-gray-500 truncate">{o.comment || t("untitledChannel")}</div>
											</div>
											<div className="flex-shrink-0">{renderOrderStatus(o, t, false)}</div>
										</div>

										{/* Amount & Customer */}
										<div className="flex justify-between items-center mb-2">
											<div className="font-bold text-gray-900 text-sm">
												{o.amount} <span className="text-xs font-normal text-gray-500">{o.currency}</span>
											</div>
											<div className="text-xs text-gray-700 font-medium">
												{o.first_name} {o.last_name}
											</div>
										</div>

										{/* Footer: Date & Expand */}
										<div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
											<div className="text-[10px] text-gray-400">{updateDate.split(" ")[0]}</div>
											<button onClick={() => setExpandedOrderId(isExpanded ? null : i)} className={`flex items-center gap-1 text-xs font-medium transition-colors ${isExpanded ? "text-brand" : "text-gray-500 hover:text-gray-700"}`}>
												{isExpanded ? t("collapse") || "Collapse" : t("details") || "Details"}
												<FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="text-[10px]" />
											</button>
										</div>

										{/* Expanded Content */}
										<div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}>
											<div className="overflow-hidden">
												<div className="space-y-2 text-xs text-gray-600 bg-white p-3 rounded border border-gray-100">
													{/* Ref No */}
													{o.client_orderNo && (
														<div className="flex flex-col gap-0.5">
															<span className="text-[10px] text-gray-400">{t("ref")}</span>
															<div className="font-mono bg-gray-50 px-1.5 py-0.5 rounded flex items-center justify-between cursor-pointer active:bg-gray-100" onClick={() => handleCopy(o.client_orderNo)}>
																<span className="truncate">{o.client_orderNo}</span>
																<FontAwesomeIcon icon={faCopy} className="text-gray-400 text-[10px]" />
															</div>
														</div>
													)}

													{/* Customer Details */}
													<div className="flex flex-col gap-0.5">
														<span className="text-[10px] text-gray-400">{t("customer")}</span>
														<div className="truncate">{o.email}</div>
														{o.phone && <div className="truncate text-gray-500">{o.phone}</div>}
														{o.country && (
															<div className="truncate text-gray-500">
																{o.country} {o.ip ? `(${o.ip})` : ""}
															</div>
														)}
													</div>

													{/* Amount Details */}
													{(o.jine || o.bizhong) && (
														<div className="flex flex-col gap-0.5">
															<span className="text-[10px] text-gray-400">{t("amount")}</span>
															<div>
																≈ {o.jine} {o.bizhong}
															</div>
														</div>
													)}

													{/* Timeline */}
													<div className="flex flex-col gap-0.5">
														<span className="text-[10px] text-gray-400">{t("timeline")}</span>
														<div className="flex justify-between">
															<span>{t("upd")}:</span>
															<span>{updateDate}</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="text-gray-400 text-xs border-b border-gray-100">
										<th className="p-3 font-medium">{t("orderDetailsAndChannel")}</th>
										<th className="p-3 font-medium">{t("customer")}</th>
										<th className="p-3 font-medium">{t("amount")}</th>
										<th className="p-3 font-medium">{t("status")}</th>
										{!isTablet && <th className="p-3 font-medium">{t("timeline")}</th>}
									</tr>
								</thead>
								<tbody className="text-xs">
									{recentOrders.map((o, i) => {
										const createDate = o.createtime || "-";
										const updateDate = o.updatetime || "-";

										return (
											<tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
												{/* Order Info */}
												<td className="p-3 align-top">
													<div className="flex flex-col gap-1">
														<div className="font-bold text-gray-900 text-sm truncate" title={o.url}>
															<span className="font-medium text-gray-600">{t("site")}: </span> {o.url || "-"}
														</div>
														<div className="text-gray-500 truncate text-xs" title={`Channel: ${o.comment || "-"}`}>
															<span className="font-medium">{t("paymentChannel") || "Payment Channel"}:</span> {o.comment || t("untitledChannel")}
														</div>

														{o.client_orderNo && (
															<div className="flex items-center gap-1 text-[10px] text-gray-400">
																<span className="font-medium">{t("ref")}:</span>
																<span className="font-mono bg-gray-50 px-1 rounded truncate max-w-[100px] cursor-pointer hover:bg-gray-100 transition-colors" title={`${o.client_orderNo} (${t("clickToCopy")})`} onClick={() => handleCopy(o.client_orderNo)}>
																	{o.client_orderNo}
																</span>
															</div>
														)}
													</div>
												</td>

												{/* User Info */}
												<td className="p-3 align-top">
													<div className="flex flex-col gap-1">
														<div className="font-medium text-gray-800">
															{o.first_name} {o.last_name}
														</div>
														<div className="text-gray-500">{o.email}</div>
														{o.phone && <div className="text-gray-400 text-[10px]">{o.phone}</div>}
														{o.country && (
															<div className="text-gray-400 text-[10px]">
																{o.country} {o.ip ? `(${o.ip})` : ""}
															</div>
														)}
													</div>
												</td>

												{/* Amount */}
												<td className="p-3 align-top">
													<div className="flex flex-col gap-1">
														<div className="font-bold text-gray-900 text-sm">
															{o.amount} <span className="text-xs font-normal text-gray-500">{o.currency}</span>
														</div>
														{(o.jine || o.bizhong) && (
															<div className="text-gray-500">
																≈ {o.jine} <span className="text-[10px]">{o.bizhong}</span>
															</div>
														)}
													</div>
												</td>

												{/* Status */}
												<td className="p-3 align-middle">{renderOrderStatus(o, t, false)}</td>

												{/* Timeline - Hidden on Tablet */}
												{!isTablet && (
													<td className="p-3 align-middle">
														<div className="flex flex-col gap-1 text-gray-500">
															<div title={`Updated: ${updateDate}`}>
																<span className="text-gray-400 text-[10px]">{t("upd")}:</span> {updateDate.split(" ")[0]}
																<div className="text-[10px] pl-5">{updateDate.split(" ")[1]}</div>
															</div>
														</div>
													</td>
												)}
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)
				) : (
					<div className="py-10 text-center text-gray-500 text-sm">{t("noData")}</div>
				)}
			</Card>
		</div>
	);
}
