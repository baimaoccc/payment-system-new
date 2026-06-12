import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "../../components/ui/Card.jsx";
import ReactECharts from "echarts-for-react";
import { DonutChart } from "../../components/charts/DonutChart.jsx";
import { WorldMapChart } from "../../components/charts/WorldMapChart.jsx";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { useResponsive } from "../../hooks/useResponsive";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends, faCopy, faSpinner, faFilter, faChevronDown, faChevronUp, faTimes, faCalendarCheck, faMoneyBillWave, faHistory, faCrown, faTrophy, faMedal, faGlobe } from "@fortawesome/free-solid-svg-icons";
import Select, { components } from "react-select";
import { fetchUserListN } from "../../controllers/usersController.js";
import { fetchOrderGraphData, fetchOrderData, fetchRecentOrders } from "../../controllers/dashboardController.js";
import { renderOrderStatus } from "../../utils/orderStatusRender.jsx";
import dashboardImg from "../../assets/dashboard-1.png";
import { setAllUsers } from "../../store/slices/users.js";
import { isAdmin } from "../../components/layout/menuConfig.jsx";

/**
 * 首页仪表盘视图：采用抽象组件拼装，便于复用与维护
 */
export function DashboardView() {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const { isMobile, isTablet } = useResponsive();
	const user = useSelector((s) => s.auth.user);
	const { role: authRole } = useSelector((state) => state.auth);
	const allUsers = useSelector((s) => s.users.allUsers);
	const [showFilters, setShowFilters] = useState(false);
	const filterRef = useRef(null);
	const [userOptions, setUserOptions] = useState([]);
	const [expandedOrderId, setExpandedOrderId] = useState(null);

	const canViewStats = isAdmin(authRole);

	const handleCopy = (text) => {
		if (navigator.clipboard && text) {
			navigator.clipboard.writeText(text);
			// Optional: Toast
		}
	};

	const theme = useSelector((s) => s.ui?.theme || "light");
	const isDark = theme === "dark";

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

	// Currency filter options (commented out for now based on original code)
	// const currencyOptions = [ ... ];

	// Shared Select styles
	const selectStyles = {
		control: (base, state) => ({
			...base,
			backgroundColor: isDark ? "rgba(55, 65, 81, 0.5)" : "#f9fafb", // bg-gray-800/50 vs bg-gray-50
			borderColor: isDark ? "rgba(75, 85, 99, 0.5)" : "#f3f4f6", // border-gray-700/50 vs border-gray-100
			boxShadow: "none",
			"&:hover": {
				borderColor: isDark ? "rgba(107, 114, 128, 0.5)" : "#e5e7eb", // border-gray-600/50 vs border-gray-200
			},
			fontSize: "0.75rem", // text-xs
			minHeight: "32px",
			height: "32px",
		}),
		menu: (base) => ({
			...base,
			backgroundColor: isDark ? "#1f2937" : "#ffffff", // bg-gray-800 vs bg-white
			border: isDark ? "1px solid rgba(75, 85, 99, 0.5)" : "1px solid #f3f4f6", // border-gray-700/50 vs border-gray-100
			boxShadow: isDark ? "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // shadow-lg
			zIndex: 50,
			fontSize: "0.75rem", // text-xs
		}),
		menuPortal: (base) => ({
			...base,
			zIndex: 9999,
		}),
		option: (base, state) => ({
			...base,
			backgroundColor: state.isSelected ? (isDark ? "rgba(59, 130, 246, 0.2)" : "#eff6ff") : state.isFocused ? (isDark ? "rgba(55, 65, 81, 1)" : "#f3f4f6") : "transparent",
			color: state.isSelected ? (isDark ? "#60a5fa" : "#2563eb") : isDark ? "#d1d5db" : "#374151",
			"&:active": {
				backgroundColor: isDark ? "rgba(59, 130, 246, 0.3)" : "#dbeafe",
			},
			cursor: "pointer",
		}),
		singleValue: (base) => ({
			...base,
			color: isDark ? "#d1d5db" : "#111827", // text-gray-300 vs text-gray-900
		}),
		placeholder: (base) => ({
			...base,
			color: isDark ? "#9ca3af" : "#9ca3af", // text-gray-400
		}),
		input: (base) => ({
			...base,
			color: isDark ? "#d1d5db" : "#111827", // text-gray-300 vs text-gray-900
		}),
		indicatorSeparator: () => ({
			display: "none",
		}),
		dropdownIndicator: (base) => ({
			...base,
			color: isDark ? "#6b7280" : "#9ca3af", // text-gray-500 vs text-gray-400
			"&:hover": {
				color: isDark ? "#9ca3af" : "#6b7280",
			},
			padding: "4px",
		}),
		clearIndicator: (base) => ({
			...base,
			color: isDark ? "#6b7280" : "#9ca3af", // text-gray-500 vs text-gray-400
			"&:hover": {
				color: isDark ? "#9ca3af" : "#6b7280",
			},
			padding: "4px",
		}),
	};

	const DropdownIndicator = (props) => {
		return (
			<components.DropdownIndicator {...props}>
				<FontAwesomeIcon icon={faChevronDown} className="text-[10px]" />
			</components.DropdownIndicator>
		);
	};

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
	const [detailedUserStats, setDetailedUserStats] = useState([]);
	const [countryStats, setCountryStats] = useState([]);
	const [countrySortType, setCountrySortType] = useState('orders'); // 'orders' or 'amount'

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
					user_id: (currentFilters.user && currentFilters.user.value) || null,
					frequency: "month",
				}),
				fetchOrderGraphData({
					start_date: startTs,
					end_date: endTs,
					status: 6,
					user_id: (currentFilters.user && currentFilters.user.value) || null,
					frequency: "month",
				}),
				fetchOrderData({
					start_date: startTs,
					end_date: endTs,
					user_id: (currentFilters.user && currentFilters.user.value) || null,
				}),
				fetchRecentOrders({
					limit: 8,
					user_id: (currentFilters.user && currentFilters.user.value) || null,
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

			// Process groupUser data for Detailed Stats Table
			if (resSuccess.ok) {
				const groupUser = resSuccess.data?.data?.groupUser || resSuccess.data?.data?.groupUserList || [];

				const finalStats = groupUser.map((item) => {
					// Helper to safely parse string/number
					const parseVal = (val) => parseFloat(val) || 0;
					const parseIntVal = (val) => parseInt(val) || 0;

					// Today Stats from groupUser fields
					const tOrders = parseIntVal(item.today_success_orders);
					const tSuccessRate = parseVal(item.today_total_success_rate);
					const tPaymentRate = parseVal(item.today_payment_rate);
					const tPaidSuccessRate = parseVal(item.today_paid_success_rate);
					const tAmount = parseVal(item.today_success_amount);

					// Yesterday Stats from groupUser fields
					const yOrders = parseIntVal(item.yesterday_success_orders);
					const ySuccessRate = parseVal(item.yesterday_total_success_rate);
					const yPaymentRate = parseVal(item.yesterday_payment_rate);
					const yPaidSuccessRate = parseVal(item.yesterday_paid_success_rate);
					const yAmount = parseVal(item.yesterday_success_amount);

					return {
						username: item.username,
						today: {
							amount: tAmount,
							orders: tOrders,
							totalSuccessRate: tSuccessRate,
							paymentSuccessRate: tPaidSuccessRate,
							paymentRate: tPaymentRate,
						},
						yesterday: {
							amount: yAmount,
							orders: yOrders,
							totalSuccessRate: ySuccessRate,
							paymentSuccessRate: yPaidSuccessRate,
							paymentRate: yPaymentRate,
						},
					};
				});

				// Sort by Today Amount desc
				finalStats.sort((a, b) => b.today.amount - a.today.amount);
				setDetailedUserStats(finalStats);
			} else {
				setDetailedUserStats([]);
			}

			const failedList = (resFailed.ok && resFailed.data?.data?.list) || {};

			// Process Country Stats
			if (resSuccess.ok) {
				const groupCountryList = resSuccess.data?.data?.groupCountryList;
				let countryDataMap = new Map();

				if (groupCountryList) {
					// Merge data from Amount and Count arrays based on country_code
					const amounts = groupCountryList.groupCountryListAmount || [];
					const counts = groupCountryList.groupCountryListCount || [];

					amounts.forEach(item => {
						if (!countryDataMap.has(item.country_code)) {
							countryDataMap.set(item.country_code, { countryCode: item.country_code, orderNum: 0, amount: 0 });
						}
						countryDataMap.get(item.country_code).amount = parseFloat(item.jine || 0);
						// We can also take orderNum from sl if we want, but let's rely on Count list for orders to be safe
						if (!countryDataMap.get(item.country_code).orderNum) {
							countryDataMap.get(item.country_code).orderNum = parseInt(item.sl || 0);
						}
					});

					counts.forEach(item => {
						if (!countryDataMap.has(item.country_code)) {
							countryDataMap.set(item.country_code, { countryCode: item.country_code, orderNum: 0, amount: 0 });
						}
						countryDataMap.get(item.country_code).orderNum = parseInt(item.sl || 0);
						// We can also take amount from jine if it was missing in amounts array
						if (!countryDataMap.get(item.country_code).amount) {
							countryDataMap.get(item.country_code).amount = parseFloat(item.jine || 0);
						}
					});
				}
				
				let formattedCountries = Array.from(countryDataMap.values());
				
				// Generate Mock Data for now if empty (fallback)
				if (formattedCountries.length === 0) {
					formattedCountries = [
						{ countryCode: "US", orderNum: 12500, amount: 250000 },
						{ countryCode: "GB", orderNum: 8400, amount: 168000 },
						{ countryCode: "FR", orderNum: 6200, amount: 124000 },
						{ countryCode: "DE", orderNum: 5800, amount: 116000 },
						{ countryCode: "JP", orderNum: 4200, amount: 84000 },
						{ countryCode: "AU", orderNum: 3100, amount: 62000 },
						{ countryCode: "BR", orderNum: 2500, amount: 50000 },
						{ countryCode: "CA", orderNum: 1800, amount: 36000 },
						{ countryCode: "IT", orderNum: 1500, amount: 30000 },
						{ countryCode: "ES", orderNum: 1200, amount: 24000 },
						{ countryCode: "MX", orderNum: 900, amount: 18000 },
						{ countryCode: "IN", orderNum: 850, amount: 17000 },
						{ countryCode: "KR", orderNum: 600, amount: 12000 },
						{ countryCode: "RU", orderNum: 400, amount: 8000 },
						{ countryCode: "ZA", orderNum: 200, amount: 4000 }
					];
				}

				setCountryStats(formattedCountries);
			} else {
				setCountryStats([]);
			}

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

	// Fetch User Stats Data Removed - Integrated into fetchGraphData

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
			backgroundColor: isDark ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)",
			borderColor: isDark ? "rgba(75, 85, 99, 0.5)" : "#e5e7eb",
			textStyle: { color: isDark ? "#f3f4f6" : "#374151" },
			formatter: function (params) {
				let result = `<div class="font-medium mb-1" style="color: ${isDark ? '#f3f4f6' : '#111827'};">${params[0].name}</div>`;
				let success = 0;
				let failed = 0;

				params.forEach((item) => {
					result += `<div class="flex items-center justify-between gap-4">
						<div class="flex items-center gap-2">
							${item.marker}
							<span class="text-xs" style="color: ${isDark ? '#9ca3af' : '#4b5563'};">${item.seriesName}</span>
						</div>
						<span class="font-bold" style="color: ${isDark ? '#f3f4f6' : '#111827'};">${item.value}</span>
					</div>`;
					if (item.seriesIndex === 0) success = Number(item.value) || 0;
					if (item.seriesIndex === 1) failed = Number(item.value) || 0;
				});

				const total = success + failed;
				const rate = total > 0 ? ((success / total) * 100).toFixed(2) : "0.00";

				result += `<div class="flex items-center justify-between gap-4 mt-1 pt-1" style="border-top: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.5)' : '#f3f4f6'};">
					<div class="flex items-center gap-2">
						<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#F59E0B;"></span>
						<span class="text-xs" style="color: ${isDark ? '#9ca3af' : '#4b5563'};">${t("successRate")}</span>
					</div>
					<span class="font-bold" style="color: ${isDark ? '#f3f4f6' : '#111827'};">${rate}%</span>
				</div>`;

				return result;
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
				axisLine: {
					lineStyle: {
						color: isDark ? "#4B5563" : "#D1D5DB"
					}
				},
				axisLabel: {
					color: isDark ? "#9CA3AF" : "#6B7280"
				}
			},
		],
		yAxis: [
			{
				type: "value",
				splitLine: {
					lineStyle: {
						color: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6"
					}
				},
				axisLabel: {
					color: isDark ? "#9CA3AF" : "#6B7280"
				}
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
			<label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</label>
			<input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full h-8 px-3 border border-gray-200 dark:border-gray-700/50 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 transition-colors" />
		</div>
	);

	return (
		<div className="space-y-4 md:space-y-6 p-3 md:p-6">
			{/* Grid container: Auto height on mobile, fixed height on desktop */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:h-[200px]">
				{/* Card 1: Total Sales (Redesigned) */}
				<Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-white dark:bg-gray-800 !p-0 overflow-hidden relative h-[180px] lg:h-full rounded-lg shadow-sm border border-gray-100 dark:border-gray-700/50">
					<div className="flex justify-between items-center p-6 h-full relative z-10">
						<div className="flex-0 flex flex-col justify-center h-full">
							<h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 font-knewave break-all">Congratulation {user?.username || "User"}!</h3>
							<div className="flex items-baseline gap-2">
								<span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">${stats.paid_order_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
							</div>
						</div>
						<div className="flex-1 w-32 h-32 md:w-40 md:h-40 pointer-events-none absolute right-0 bottom-0 opacity-80 md:opacity-100">
							<img src={dashboardImg} alt="Illustration" className="w-full h-full object-contain object-bottom" />
						</div>
					</div>
				</Card>

				{/* Card 2: Stats Grid */}
				<Card className="col-span-1 bg-white dark:bg-gray-800 !p-0 overflow-hidden relative h-auto lg:h-full shadow-sm border border-gray-100 dark:border-gray-700/50 rounded-lg">
					<div className="grid grid-cols-2 gap-2 h-full p-2">
						{[
							{ label: t("todayOrders"), value: stats.paid_today_order_num, icon: faCalendarCheck, color: "text-blue-600", bg: "bg-blue-50" },
							{ label: t("todaySales"), value: `$${stats.paid_today_order_amount.toLocaleString()}`, icon: faMoneyBillWave, color: "text-green-600", bg: "bg-green-50" },
							{ label: t("yesterdayOrders"), value: stats.paid_yesterday_order_num, icon: faHistory, color: "text-orange-600", bg: "bg-orange-50" },
							{ label: t("yesterdaySales"), value: `$${stats.paid_yesterday_order_amount.toLocaleString()}`, icon: faMoneyBillWave, color: "text-purple-600", bg: "bg-purple-50" },
						].map((item, i) => (
							<div key={i} className="flex flex-col justify-center gap-1 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 transition-colors">
								<div className="flex items-center gap-2">
									<div className={`w-6 h-6 rounded-full ${item.bg} flex items-center justify-center ${item.color} text-xs`}>
										<FontAwesomeIcon icon={item.icon} />
									</div>
									<div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{item.label}</div>
								</div>
								<div className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 pl-1 truncate" title={item.value}>
									{item.value}
								</div>
							</div>
						))}
					</div>
				</Card>

				{/* Card 3: Donut Chart (Success vs Failed Today) */}
				<Card className="col-span-1 bg-white dark:bg-gray-800 !p-0 overflow-hidden relative h-[180px] lg:h-full rounded-lg shadow-sm border border-gray-100 dark:border-gray-700/50">
					<div className="flex items-center gap-2 md:gap-4 justify-center h-full p-4">
						<div className="flex-shrink-0">
							<DonutChart
								size={isMobile ? 70 : 80}
								thickness={isMobile ? 10 : 12}
								segments={
									stats.paid_today_order_num + stats.failed_today_order_num > 0
										? [
												{ value: stats.paid_today_order_num, color: "#10B981", label: t("successOrder") || "Success" }, // Green for success
												{ value: stats.failed_today_order_num, color: "#EF4444", label: t("failedOrder") || "Failed" }, // Red for failed
											]
										: [{ value: 1, color: "#E5E7EB", label: "No Data" }]
								}
							/>
						</div>
						<div className="flex-1 min-w-0">
							<div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-3 md:mb-6 text-center">{t("orderRatio")}</div>
							<ul className="space-y-2">
								<li className="flex items-center justify-between">
									<div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
										<span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#10B981] mr-1.5 md:mr-2" />
										<span className="truncate">{t("successOrder")}</span>
									</div>
									<span className="text-xs md:text-sm font-bold text-gray-900 dark:text-gray-100">{stats.paid_today_order_num}</span>
								</li>
								<li className="flex items-center justify-between">
									<div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
										<span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#EF4444] mr-1.5 md:mr-2" />
										<span className="truncate">{t("failedOrder")}</span>
									</div>
									<span className="text-xs md:text-sm font-bold text-gray-900 dark:text-gray-100">{stats.failed_today_order_num}</span>
								</li>
							</ul>
						</div>
					</div>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
				<div className="lg:col-span-3 relative border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700/50">
					<Card
						title={t("orders")}
						className="shadow-none border-0 h-full"
						action={
							<div className="flex items-center gap-2 md:gap-3">
								<div className="hidden md:flex items-center gap-2">
									{(filters.startTime || filters.endTime) && (
										<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700/50">
											<FontAwesomeIcon icon={faCalendarCheck} className="text-gray-400" />
											<span className="hidden md:inline">
												{filters.startTime} - {filters.endTime}
											</span>
											<span className="md:hidden">Date</span>
										</span>
									)}
									{filters.user && (
										<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 max-w-[120px]">
											<FontAwesomeIcon icon={faUserFriends} className="text-indigo-400" />
											<span className="truncate">{userOptions.find((u) => u.value === filters.user?.value)?.label || filters.user?.label || filters.user}</span>
										</span>
									)}
								</div>
								<button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${showFilters ? "bg-blue-50 text-blue-600" : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700"}`}>
									<FontAwesomeIcon icon={faFilter} className="text-xs" />
									<span className="text-xs font-medium hidden md:inline">{t("filters")}</span>
									<FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform ${showFilters ? "rotate-180" : ""}`} />
								</button>
							</div>
						}>
						{/* Absolute Filter Popup */}
						{showFilters && (
							<>
								<div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setShowFilters(false)} />
								<div ref={filterRef} className="absolute top-14 right-4 md:right-4 z-50 w-[calc(100%-2rem)] md:w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700/50 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
									<div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50 dark:border-gray-700/50">
										<h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t("moreFilters")}</h3>
										<button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
											<FontAwesomeIcon icon={faTimes} />
										</button>
									</div>
									<div className="space-y-3">
										<div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-3">
											<InputField label={t("startTime")} type="date" value={filters.startTime} onChange={(e) => setFilters({ ...filters, startTime: e.target.value })} className="dark:bg-gray-700/50" />
											<InputField label={t("endTime")} type="date" value={filters.endTime} onChange={(e) => setFilters({ ...filters, endTime: e.target.value })} className="dark:bg-gray-700/50" />
										</div>
										<div className="flex flex-col gap-1">
											<label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{t("orderUser")}</label>
											<Select
												className="hs-custom-select"
												value={filters.user}
												options={userOptions}
												onChange={(val) => {
													setFilters({ ...filters, user: val });
												}}
												placeholder={t("pleaseSelect")}
												isClearable
												styles={selectStyles}
												components={{ DropdownIndicator, IndicatorSeparator: () => null }}
												menuPortalTarget={typeof document !== "undefined" ? document.body : null}
											/>
										</div>
										<div className="pt-2 flex gap-2">
											<button onClick={handleSearch} disabled={loadingGraph} className="flex-1 bg-brand text-white py-2 md:py-1.5 rounded text-xs font-medium hover:bg-brand-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
												{loadingGraph && <FontAwesomeIcon icon={faSpinner} spin />}
												{t("search")}
											</button>
											<button onClick={handleResetClick} disabled={loadingGraph} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-2 md:py-1.5 rounded text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
												{t("reset")}
											</button>
										</div>
									</div>
								</div>
							</>
						)}

						<div className="mt-2 relative w-full min-h-[250px] md:min-h-[300px]">
							{loadingGraph && (
								<div className="absolute inset-0 bg-white dark:bg-gray-800/50 z-10 flex items-center justify-center">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
								</div>
							)}
							<ReactECharts option={option} className="!h-[250px] md:!h-[300px]" />
						</div>
					</Card>
				</div>
				<div className="flex flex-col gap-4 md:gap-6 h-full justify-center p-4 lg:p-6 bg-gray-50 dark:bg-gray-700/50">
					<Card className="flex flex-col justify-center shadow-sm border border-gray-100 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-800 p-4">
						<div className="flex justify-between items-start mb-2">
							<div className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("successOrder")}</div>
							<div className="text-xs font-bold text-indigo-600">{successPct}%</div>
						</div>
						<div className="flex items-center">
							<div className="text-xl md:text-2xl font-bold mr-4 md:mr-6 text-gray-900 dark:text-gray-100">{stats.success}</div>
							<div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
								<div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${successPct}%` }} />
							</div>
						</div>

						<div className="text-[10px] text-gray-400 mt-2">{t("successOrderRatioDesc")}</div>
					</Card>
					<Card className="flex flex-col justify-center shadow-sm border border-gray-100 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-800 p-4">
						<div className="flex justify-between items-start mb-2">
							<div className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("failedOrder")}</div>
							<div className="text-xs font-bold text-red-500">{failedPct}%</div>
						</div>
						<div className="flex items-center">
							<div className="text-xl md:text-2xl font-bold mr-4 md:mr-6 text-gray-900 dark:text-gray-100">{stats.failed}</div>
							<div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
								<div className="h-full rounded-full bg-red-400 transition-all duration-500" style={{ width: `${failedPct}%` }} />
							</div>
						</div>

						<div className="text-[10px] text-gray-400 mt-2">{t("failedOrderRatioDesc")}</div>
					</Card>
				</div>
			</div>

			<div className="flex flex-col xl:flex-row gap-6">
				{/* World Map Section */}
				<Card className="flex-1 bg-white dark:bg-gray-800 p-0 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col min-h-[400px]" title={null}>
					<div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-xl">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
								<FontAwesomeIcon icon={faGlobe} className="text-sm" />
							</div>
							<h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base">{t("countryOrderStats") || "Country Stats"}</h3>
						</div>
					</div>
					<div className="flex-1 flex flex-col md:flex-row p-4 gap-6">
						<div className="w-full md:flex-1 h-[450px] md:h-[350px] relative">
							<div className="absolute inset-0">
								<WorldMapChart data={countryStats} isDark={isDark} />
							</div>
						</div>
						<div className="w-full md:w-64 lg:w-72 flex flex-col gap-3">
							<div className="flex items-center justify-between mb-2">
								<h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("top10Countries") || "Top 10 Countries"}</h4>
								<div className="flex items-center bg-gray-100 dark:bg-gray-700 p-0.5 rounded-lg">
									<button 
										onClick={() => setCountrySortType('orders')} 
										className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${countrySortType === 'orders' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
									>
										{t("byOrderNum") || "By Orders"}
									</button>
									<button 
										onClick={() => setCountrySortType('amount')} 
										className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${countrySortType === 'amount' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
									>
										{t("bySalesAmount") || "By Amount"}
									</button>
								</div>
							</div>
							<div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
								{[...countryStats].sort((a, b) => countrySortType === 'orders' ? b.orderNum - a.orderNum : b.amount - a.amount).slice(0, 10).map((item, idx) => (
									<div key={item.countryCode} className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${idx === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500" : idx === 1 ? "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300" : idx === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-500" : "bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
												{idx + 1}
											</div>
											<div className="flex flex-col">
												<span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.countryCode}</span>
											</div>
										</div>
										<span className="text-sm font-bold text-gray-900 dark:text-gray-100">
											{countrySortType === 'orders' ? item.orderNum : `$${item.amount.toLocaleString()}`}
										</span>
									</div>
								))}
								{countryStats.length === 0 && (
									<div className="text-sm text-gray-400 text-center py-4">{t("noData")}</div>
								)}
							</div>
						</div>
					</div>
				</Card>
			</div>

			<div className="flex flex-col gap-6">
				{canViewStats && (
					<div className="w-full">
						<Card className="bg-white dark:bg-gray-800 p-0 rounded-xl flex flex-col overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50" title={null}>
							<div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-20">
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
										<FontAwesomeIcon icon={faTrophy} className="text-sm" />
									</div>
									<h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base">{t("userStats")}</h3>
								</div>
								<div className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded-md">
									{t("top")} {detailedUserStats.length}
								</div>
							</div>

							<div className="hidden xl:block overflow-x-auto custom-scrollbar">
								<table className="w-full text-left border-collapse whitespace-nowrap">
									<thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10 backdrop-blur-sm">
										<tr className="text-gray-500 dark:text-gray-400 text-xs border-b border-gray-100 dark:border-gray-700/50 font-semibold">
											<th className="p-3 md:p-4 pl-4 md:pl-5 sticky left-0 bg-gray-50 dark:bg-gray-700 z-20 min-w-[120px] md:min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{t("username")}</th>
											{/* Today Columns */}
											<th className="p-3 md:p-4 text-right bg-blue-50/30 text-blue-700 min-w-[90px] md:min-w-[100px]">{t("todaySuccessAmount")}</th>
											<th className="p-3 md:p-4 text-right bg-blue-50/30 text-blue-700 min-w-[70px] md:min-w-[80px]">{t("todaySuccessOrders")}</th>
											<th className="p-3 md:p-4 text-right bg-blue-50/30 text-blue-700 min-w-[90px] md:min-w-[100px]">{t("totalSuccessRate")}</th>
											<th className="p-3 md:p-4 text-right bg-blue-50/30 text-blue-700 min-w-[90px] md:min-w-[100px]">{t("paidSuccessRate")}</th>
											<th className="p-3 md:p-4 text-right bg-blue-50/30 text-blue-700 min-w-[70px] md:min-w-[80px] border-r border-gray-100 dark:border-gray-700/50">{t("paymentRate")}</th>
											{/* Yesterday Columns */}
											<th className="p-3 md:p-4 text-right min-w-[90px] md:min-w-[100px]">{t("yesterdaySuccessAmount")}</th>
											<th className="p-3 md:p-4 text-right min-w-[70px] md:min-w-[80px]">{t("yesterdaySuccessOrders")}</th>
											<th className="p-3 md:p-4 text-right min-w-[90px] md:min-w-[100px]">{t("totalSuccessRate")}</th>
											<th className="p-3 md:p-4 text-right min-w-[90px] md:min-w-[100px]">{t("paidSuccessRate")}</th>
											<th className="p-3 md:p-4 text-right min-w-[70px] md:min-w-[80px]">{t("paymentRate")}</th>
										</tr>
									</thead>
									<tbody className="text-xs">
										{detailedUserStats.length > 0 ? (
											detailedUserStats.map((u, i) => {
												// Generate avatar color
												const colors = ["bg-red-50 text-red-600 ring-red-100 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20", "bg-orange-50 text-orange-600 ring-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20", "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20", "bg-green-50 text-green-600 ring-green-100 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20", "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20", "bg-teal-50 text-teal-600 ring-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:ring-teal-500/20", "bg-cyan-50 text-cyan-600 ring-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-400 dark:ring-cyan-500/20", "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20", "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20", "bg-indigo-50 text-indigo-600 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20", "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20", "bg-purple-50 text-purple-600 ring-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20", "bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-100 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 dark:ring-fuchsia-500/20", "bg-pink-50 text-pink-600 ring-pink-100 dark:bg-pink-500/10 dark:text-pink-400 dark:ring-pink-500/20", "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20"];
												let hash = 0;
												for (let j = 0; j < u.username.length; j++) hash = u.username.charCodeAt(j) + ((hash << 5) - hash);
												const colorClass = colors[Math.abs(hash) % colors.length];

												return (
													<tr key={i} className="group hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 transition-all duration-200 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
														<td className="p-3 md:p-3 pl-4 md:pl-5 sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-transparent group-hover:border-gray-100 dark:group-hover:border-gray-600/50">
															<div className="flex items-center gap-2 md:gap-3">
																<div className="relative flex-shrink-0">
																	<div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold ring-2 ring-offset-1 ${colorClass}`}>{u.username.charAt(0).toUpperCase()}</div>
																	{i < 3 && (
																		<div className={`absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full flex items-center justify-center text-[6px] md:text-[8px] border border-white dark:border-gray-800 text-white shadow-sm ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : "bg-orange-400"}`}>
																			<FontAwesomeIcon icon={faCrown} />
																		</div>
																	)}
																</div>
																<div className="flex flex-col min-w-0">
																	<div className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[80px] md:max-w-[120px]" title={u.username}>
																		{u.username}
																	</div>
																	{i < 3 && (
																		<div className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 font-medium">
																			{t("rank")} #{i + 1}
																		</div>
																	)}
																</div>
															</div>
														</td>

														{/* Today Data */}
														<td className="p-3 md:p-3 text-right font-bold text-gray-800 dark:text-gray-200 bg-blue-50/10 dark:bg-blue-900/10 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/30">${u.today.amount?.toLocaleString()}</td>
														<td className="p-3 md:p-3 text-right font-medium text-gray-600 dark:text-gray-400 bg-blue-50/10 dark:bg-blue-900/10 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/30">{u.today.orders?.toLocaleString()}</td>
														<td className="p-3 md:p-3 text-right font-medium bg-blue-50/10 dark:bg-blue-900/10 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/30">
															<span className={`${u.today.totalSuccessRate >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400"}`}>{u.today.totalSuccessRate}%</span>
														</td>
														<td className="p-3 md:p-3 text-right font-medium bg-blue-50/10 dark:bg-blue-900/10 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/30">
															<span className={`${u.today.paymentSuccessRate >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400"}`}>{u.today.paymentSuccessRate}%</span>
														</td>
														<td className="p-3 md:p-3 text-right font-medium text-gray-800 dark:text-gray-200 bg-blue-50/10 dark:bg-blue-900/10 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/30 border-r border-gray-50 dark:border-gray-700/50 group-hover:border-gray-200 dark:group-hover:border-gray-600/50">{u.today.paymentRate}%</td>

														{/* Yesterday Data */}
														<td className="p-3 md:p-3 text-right font-bold text-gray-400 dark:text-gray-500">${u.yesterday.amount?.toLocaleString()}</td>
														<td className="p-3 md:p-3 text-right font-medium text-gray-400 dark:text-gray-500">{u.yesterday.orders?.toLocaleString()}</td>
														<td className="p-3 md:p-3 text-right font-medium text-gray-400 dark:text-gray-500">{u.yesterday.totalSuccessRate}%</td>
														<td className="p-3 md:p-3 text-right font-medium text-gray-400 dark:text-gray-500">{u.yesterday.paymentSuccessRate}%</td>
														<td className="p-3 md:p-3 text-right font-medium text-gray-400 dark:text-gray-500">{u.yesterday.paymentRate}%</td>
													</tr>
												);
											})
										) : (
											<tr>
												<td colSpan="11" className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
													<div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-300">
														<FontAwesomeIcon icon={faUserFriends} className="text-xl" />
													</div>
													<span>{t("noData")}</span>
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>

							{/* Mobile/Tablet Card View */}
							<div className="xl:hidden p-4 bg-gray-50 dark:bg-gray-700/50 min-h-[200px]">
								{detailedUserStats.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{detailedUserStats.map((u, i) => {
											// Generate avatar color
											const colors = ["bg-red-50 text-red-600 ring-red-100 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-900/50", "bg-orange-50 text-orange-600 ring-orange-100 dark:bg-orange-900/40 dark:text-orange-300 dark:ring-orange-900/50", "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-900/40 dark:text-amber-300 dark:ring-amber-900/50", "bg-green-50 text-green-600 ring-green-100 dark:bg-green-900/40 dark:text-green-300 dark:ring-green-900/50", "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-900/50", "bg-teal-50 text-teal-600 ring-teal-100 dark:bg-teal-900/40 dark:text-teal-300 dark:ring-teal-900/50", "bg-cyan-50 text-cyan-600 ring-cyan-100 dark:bg-cyan-900/40 dark:text-cyan-300 dark:ring-cyan-900/50", "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-900/40 dark:text-sky-300 dark:ring-sky-900/50", "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:ring-blue-900/50", "bg-indigo-50 text-indigo-600 ring-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-indigo-900/50", "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-900/40 dark:text-violet-300 dark:ring-violet-900/50", "bg-purple-50 text-purple-600 ring-purple-100 dark:bg-purple-900/40 dark:text-purple-300 dark:ring-purple-900/50", "bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-100 dark:bg-fuchsia-900/40 dark:text-fuchsia-300 dark:ring-fuchsia-900/50", "bg-pink-50 text-pink-600 ring-pink-100 dark:bg-pink-900/40 dark:text-pink-300 dark:ring-pink-900/50", "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-900/40 dark:text-rose-300 dark:ring-rose-900/50"];
											let hash = 0;
											for (let j = 0; j < u.username.length; j++) hash = u.username.charCodeAt(j) + ((hash << 5) - hash);
											const colorClass = colors[Math.abs(hash) % colors.length];

											return (
												<div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-4 relative overflow-hidden hover:shadow-md transition-shadow">
													{/* Rank Badge */}
													{i < 3 && (
														<div className={`absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-bl-xl text-white text-xs shadow-sm ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : "bg-orange-400"}`}>
															<FontAwesomeIcon icon={faCrown} />
														</div>
													)}

													{/* User Info */}
													<div className="flex items-center gap-3 mb-4">
														<div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ring-2 ring-offset-1 ${colorClass}`}>{u.username.charAt(0).toUpperCase()}</div>
														<div className="flex flex-col">
															<div className="font-bold text-gray-900 dark:text-gray-100">{u.username}</div>
															<div className="text-xs text-gray-400 font-medium">Rank #{i + 1}</div>
														</div>
													</div>

													{/* Stats Grid */}
													<div className="space-y-3">
														{/* Today Section */}
														<div className="space-y-2">
															<div className="flex items-center gap-2">
																<div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
																<span className="text-xs font-bold text-gray-900 dark:text-gray-100">{t("today")}</span>
															</div>
															<div className="grid grid-cols-3 gap-2">
																<div className="bg-blue-50/50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-50 dark:border-blue-800/50 flex flex-col items-center justify-center text-center">
																	<span className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mb-1">{t("todaySuccessAmount")}</span>
																	<span className="text-sm font-bold text-blue-900 dark:text-blue-100">${u.today.amount?.toLocaleString()}</span>
																</div>
																<div className="bg-blue-50/50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-50 dark:border-blue-800/50 flex flex-col items-center justify-center text-center">
																	<span className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mb-1">{t("todaySuccessOrders")}</span>
																	<span className="text-sm font-bold text-blue-900 dark:text-blue-100">{u.today.orders?.toLocaleString()}</span>
																</div>
																<div className="bg-blue-50/50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-50 dark:border-blue-800/50 flex flex-col items-center justify-center text-center">
																	<span className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mb-1">{t("totalSuccessRate")}</span>
																	<span className={`text-sm font-bold ${u.today.totalSuccessRate >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-blue-900 dark:text-blue-100"}`}>{u.today.totalSuccessRate}%</span>
																</div>
																<div className="bg-blue-50/50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-50 dark:border-blue-800/50 flex flex-col items-center justify-center text-center">
																	<span className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mb-1">{t("paidSuccessRate")}</span>
																	<span className={`text-sm font-bold ${u.today.paymentSuccessRate >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-blue-900 dark:text-blue-100"}`}>{u.today.paymentSuccessRate}%</span>
																</div>
																<div className="bg-blue-50/50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-50 dark:border-blue-800/50 flex flex-col items-center justify-center text-center">
																	<span className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mb-1">{t("paymentRate")}</span>
																	<span className="text-sm font-bold text-blue-900 dark:text-blue-100">{u.today.paymentRate}%</span>
																</div>
															</div>
														</div>

														{/* Yesterday Section */}
														<div className="space-y-2 pt-1">
															<div className="flex items-center gap-2">
																<div className="w-1.5 h-4 bg-gray-300 rounded-full"></div>
																<span className="text-xs font-bold text-gray-500 dark:text-gray-400">{t("yesterday")}</span>
															</div>
															<div className="grid grid-cols-3 gap-2">
																<div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center text-center">
																	<span className="text-[10px] text-gray-400 mb-1">{t("yesterdaySuccessAmount")}</span>
																	<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">${u.yesterday.amount?.toLocaleString()}</span>
																</div>
																<div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center text-center">
																	<span className="text-[10px] text-gray-400 mb-1">{t("yesterdaySuccessOrders")}</span>
																	<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{u.yesterday.orders?.toLocaleString()}</span>
																</div>
																<div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center text-center">
																	<span className="text-[10px] text-gray-400 mb-1">{t("totalSuccessRate")}</span>
																	<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{u.yesterday.totalSuccessRate}%</span>
																</div>
																<div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center text-center">
																	<span className="text-[10px] text-gray-400 mb-1">{t("paidSuccessRate")}</span>
																	<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{u.yesterday.paymentSuccessRate}%</span>
																</div>
																<div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center text-center">
																	<span className="text-[10px] text-gray-400 mb-1">{t("paymentRate")}</span>
																	<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{u.yesterday.paymentRate}%</span>
																</div>
															</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
										<div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-300">
											<FontAwesomeIcon icon={faUserFriends} className="text-2xl" />
										</div>
										<span className="text-sm font-medium">{t("noData")}</span>
									</div>
								)}
							</div>
						</Card>
					</div>
				)}

				<div className="w-full">
					<Card
						className="bg-white dark:bg-gray-800 p-4 rounded-xl h-full"
						title={t("recentOrders")}
						action={
							<div className="flex items-center gap-2">
								{/* <span className="text-xs text-gray-500 dark:text-gray-400">{t("pending")}</span>
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
											<div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50 transition-all">
												{/* Header: Site & Status */}
												<div className="flex justify-between items-start mb-2">
													<div className="flex-1 min-w-0 mr-2">
														<div className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate" title={o.url}>
															{o.url || "-"}
														</div>
														<div className="text-xs text-gray-500 dark:text-gray-400 truncate">{o.comment || t("untitledChannel")}</div>
													</div>
													<div className="flex-shrink-0">{renderOrderStatus(o, t, false)}</div>
												</div>

												{/* Amount & Customer */}
												<div className="flex justify-between items-center mb-2">
													<div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
														{o.amount} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{o.currency}</span>
													</div>
													<div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
														{o.first_name} {o.last_name}
													</div>
												</div>

												{/* Footer: Date & Expand */}
												<div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600/50">
													<div className="text-[10px] text-gray-400">{updateDate.split(" ")[0]}</div>
													<button onClick={() => setExpandedOrderId(isExpanded ? null : i)} className={`flex items-center gap-1 text-xs font-medium transition-colors ${isExpanded ? "text-brand" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"}`}>
														{isExpanded ? t("collapse") || "Collapse" : t("details") || "Details"}
														<FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="text-[10px]" />
													</button>
												</div>

												{/* Expanded Content */}
												<div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}>
													<div className="overflow-hidden">
														<div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded border border-gray-100 dark:border-gray-700/50">
															{/* Ref No */}
															{o.client_orderNo && (
																<div className="flex flex-col gap-0.5">
																	<span className="text-[10px] text-gray-400">{t("ref")}</span>
																	<div className="font-mono bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded flex items-center justify-between cursor-pointer active:bg-gray-100 dark:bg-gray-700" onClick={() => handleCopy(o.client_orderNo)}>
																		<span className="truncate">{o.client_orderNo}</span>
																		<FontAwesomeIcon icon={faCopy} className="text-gray-400 text-[10px]" />
																	</div>
																</div>
															)}

															{/* Customer Details */}
															<div className="flex flex-col gap-0.5">
																<span className="text-[10px] text-gray-400">{t("customer")}</span>
																<div className="truncate">{o.email}</div>
																{o.phone && <div className="truncate text-gray-500 dark:text-gray-400">{o.phone}</div>}
																{o.country && (
																	<div className="truncate text-gray-500 dark:text-gray-400">
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
											<tr className="text-gray-400 text-xs border-b border-gray-100 dark:border-gray-700/50">
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
													<tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700/50 transition-colors">
														{/* Order Info */}
														<td className="p-3 align-top">
															<div className="flex flex-col gap-1">
																<div className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate max-w-[140px]" title={o.url}>
																	<span className="font-medium text-gray-600 dark:text-gray-400">{t("site")}: </span> {o.url || "-"}
																</div>
																<div className="text-gray-500 dark:text-gray-400 truncate text-xs max-w-[140px]" title={`Channel: ${o.comment || "-"}`}>
																	<span className="font-medium">{t("paymentChannel") || "Payment Channel"}:</span> {o.comment || t("untitledChannel")}
																</div>

																{o.client_orderNo && (
																	<div className="flex items-center gap-1 text-[10px] text-gray-400">
																		<span className="font-medium">{t("ref")}:</span>
																		<span className="font-mono bg-gray-50 dark:bg-gray-700 px-1 rounded truncate max-w-[100px] cursor-pointer hover:bg-gray-100 dark:bg-gray-700 transition-colors" title={`${o.client_orderNo} (${t("clickToCopy")})`} onClick={() => handleCopy(o.client_orderNo)}>
																			{o.client_orderNo}
																		</span>
																	</div>
																)}
															</div>
														</td>

														{/* User Info */}
														<td className="p-3 align-top">
															<div className="flex flex-col gap-1">
																<div className="font-medium text-gray-800 dark:text-gray-200">
																	{o.first_name} {o.last_name}
																</div>
																<div className="text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={o.email}>
																	{o.email}
																</div>
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
																<div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
																	{o.amount} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{o.currency}</span>
																</div>
																{(o.jine || o.bizhong) && (
																	<div className="text-gray-500 dark:text-gray-400">
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
																<div className="flex flex-col gap-1 text-gray-500 dark:text-gray-400">
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
							<div className="py-10 text-center text-gray-500 dark:text-gray-400 text-sm">{t("noData")}</div>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
}
