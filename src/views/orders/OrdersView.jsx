import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchOrders } from "../../controllers/ordersController.js";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { canViewMerchantColumn, canViewCSColumn, canViewAdvColumn } from "../../plugins/rbac/index.js";
import { OrdersFilters } from "../../components/orders/OrdersFilters.jsx";
import { OrdersTable } from "../../components/orders/OrdersTable.jsx";
import { Pagination } from "../../components/common/Pagination.jsx";
import { setPage, setPageSize, setTotal, setFilters } from "../../store/slices/orders.js";
import { db } from "../../utils/indexedDB.js";

const getChinaDate = () => {
	const now = new Date();
	const chinaTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 8 * 3600 * 1000);
	const year = chinaTime.getFullYear();
	const month = String(chinaTime.getMonth() + 1).padStart(2, "0");
	const day = String(chinaTime.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const dateValueToTimestamp = (dateString, isEnd = false) => {
	if (!dateString) return "";
	const [year, month, day] = dateString.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	if (isEnd) {
		date.setHours(23, 59, 59, 999);
	} else {
		date.setHours(0, 0, 0, 0);
	}
	return Math.floor(date.getTime() / 1000);
};

/**
 * 订单管理视图：顶部指标卡片 + 表格
 */
export function OrdersView() {
	const dispatch = useDispatch();
	const { t } = useI18n();
	const [searchParams, setSearchParams] = useSearchParams();
	const [isInitialized, setIsInitialized] = useState(false);

	const { list, loading, filters, page, pageSize, total } = useSelector((s) => ({
		list: s.orders.list,
		loading: s.orders.loading,
		filters: s.orders.filters,
		page: s.orders.page,
		pageSize: s.orders.pageSize,
		total: s.orders.total,
	}));
	const role = useSelector((s) => s.auth.role);

	// 1. Initialize state from URL and Cache on mount
	useEffect(() => {
		const init = async () => {
			let targetPage = 1;
			let targetPageSize = 10;
			let targetFilters = { ...filters };

			// 1. Try to load from Cache
			try {
				const cached = await db.get("orders_view_cache");
				if (cached) {
					// if (cached.page) targetPage = cached.page;
					// if (cached.pageSize) targetPageSize = cached.pageSize;
					// Comment out filters cache logic to allow default range logic to take precedence
					// if (cached.filters) targetFilters = { ...targetFilters, ...cached.filters };
				}
			} catch (error) {
				console.error("Failed to load orders cache:", error);
			}

			// 2. Override with URL params (higher priority)
			// const p = searchParams.get("page");
			// const ps = searchParams.get("pageSize");
			const s = searchParams.get("status");
			const q = searchParams.get("query");
			// Check if time range is in URL (not implemented in this file's URL sync yet, but good to be safe)
			// If not, we will apply default range below

			// if (p) targetPage = Number(p);
			// if (ps) targetPageSize = Number(ps);

			if (s) targetFilters.status = s === "null" ? null : s;
			if (q) targetFilters.query = q;

			// 3. Apply Default Time Range if not present
			if (!targetFilters.range || (!targetFilters.range.start && !targetFilters.range.end)) {
				const today = getChinaDate();
				const startTs = dateValueToTimestamp(today, false);
				const endTs = dateValueToTimestamp(today, true);
				targetFilters.range = { start: startTs, end: endTs };
			}

			// 4. Dispatch updates
			if (targetPage !== page) dispatch(setPage(targetPage));
			if (targetPageSize !== pageSize) dispatch(setPageSize(targetPageSize));
			// Simple check if filters changed is hard, just dispatch
			dispatch(setFilters(targetFilters));

			setIsInitialized(true);
		};
		init();
	}, []);

	// 2. Fetch orders when state changes (guarded by isInitialized)
	useEffect(() => {
		console.log("变化------");
		console.log(filters);
		if (!isInitialized) return;
		fetchOrders({ dispatch, page, pageSize, filters });
	}, [dispatch, page, pageSize, filters, isInitialized]);

	// 3. Sync URL and Cache when state changes (guarded by isInitialized)
	useEffect(() => {
		if (!isInitialized) return;

		// Sync URL
		const params = new URLSearchParams(searchParams);

		// Removed page/pageSize sync to URL as requested
		// if (page !== 1) params.set("page", page);
		// else params.delete("page");
		// if (pageSize !== 10) params.set("pageSize", pageSize);
		// else params.delete("pageSize");
		params.delete("page");
		params.delete("pageSize");

		if (filters.status && filters.status !== "all") params.set("status", filters.status);
		else params.delete("status");
		if (filters.query) params.set("query", filters.query);
		else params.delete("query");

		setSearchParams(params, { replace: true });

		// Sync Cache (Optional: still caching but not loading on mount if we commented out load logic)
		const cacheData = { filters, page, pageSize };
		db.set("orders_view_cache", cacheData);
	}, [page, pageSize, filters, isInitialized]);

	const onPageChange = (p) => dispatch(setPage(p));
	const onPageSizeChange = (n) => {
		dispatch(setPageSize(n));
		dispatch(setPage(1));
	};

	return (
		<div className="p-4">
			<div className="bg-white rounded-2xl shadow p-3">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-sm font-semibold text-gray-900">{t("orders")}</h3>
				</div>
				<OrdersFilters />
				{loading ? <div className="p-3 text-sm">{t("loading")}</div> : <OrdersTable rows={list} />}
				<div className="mt-3">
					<Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
				</div>
			</div>
		</div>
	);
}
