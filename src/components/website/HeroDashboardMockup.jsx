import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { useResponsive } from "../../hooks/useResponsive.js";

// Helper for scroll reveal within the component
function RevealOnScroll({ children, className = "" }) {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				observer.unobserve(ref.current);
			}
		};
	}, []);

	return (
		<div ref={ref} className={`transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}>
			{children}
		</div>
	);
}

export default function HeroDashboardMockup() {
	const { t } = useI18n();
	const { isMobile } = useResponsive();

	return (
		<div className="relative w-full h-90 md:h-96 shadow-2xl rounded-2xl overflow-hidden border border-slate-200/60 bg-white/90 backdrop-blur-xl">
			<RevealOnScroll className="w-full h-full p-6">
				{/* Browser Header */}
				<div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
					<div className="flex gap-2">
						<div className="w-3 h-3 rounded-full bg-red-400"></div>
						<div className="w-3 h-3 rounded-full bg-yellow-400"></div>
						<div className="w-3 h-3 rounded-full bg-green-400"></div>
					</div>
					<div className="bg-slate-50 px-4 py-1.5 rounded-md text-xs font-mono text-slate-400 flex items-center gap-2 border border-slate-100">
						<span className="w-2 h-2 rounded-full bg-green-500"></span>
						https://www.pay.ceo
					</div>
					{!isMobile && <div className="w-16"></div>}
				</div>

				{/* Dashboard Content */}
				<div className="flex gap-6 h-full">
					{/* Sidebar Mockup */}
					<div className="hidden md:flex flex-col gap-3 w-30 border-r border-slate-100 pr-4">
						<div className="h-8 w-24 bg-blue-100 rounded mb-4"></div>
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
								<div className={`w-4 h-4 rounded ${i === 1 ? "bg-blue-500" : "bg-slate-200"}`}></div>
								<div className={`h-2 rounded ${i === 1 ? "w-20 bg-blue-200" : "w-16 bg-slate-100"}`}></div>
							</div>
						))}
					</div>

					{/* Main Content Area */}
					<div className="flex-1">
						<div className="flex justify-between items-end mb-6 flex-wrap">
							<div className="flex-1">
								<div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{t("landing.mockup.dashboard.totalRevenue")}</div>
								<div className="text-3xl font-bold text-slate-800">$1,245,300.00</div>
							</div>
							<div className="flex flex-1 gap-1">
								<div className="p-1 w-[50px] h-[50px] flex justify-center items-center bg-blue-50 text-blue-600 text-xs font-bold rounded-full">+12.5%</div>
								<div className="py-1 px-3 flex items-center justify-center bg-slate-100 text-slate-500 text-xs font-bold rounded-full">{t("landing.mockup.dashboard.last30Days")}</div>
							</div>
						</div>

						{/* Chart Mockup */}
						<div className="relative h-32 w-full flex items-end justify-between gap-1 mb-6">
							{[42, 58, 45, 68, 52, 75, 60, 85, 72, 90, 65, 88, 55, 78, 62, 92, 70, 85, 58, 80, 48, 72, 65, 88, 55, 75, 60, 95, 70, 85, 50, 90].map((h, i) => (
								<div key={i} className="w-full h-full bg-blue-50 rounded-t-sm relative group overflow-hidden">
									<div className="absolute bottom-0 w-full bg-blue-500 transition-all duration-1000 ease-out" style={{ height: `${h}%` }}></div>
								</div>
							))}
						</div>

						{/* Recent Transactions Table Mockup */}
						<div className="space-y-3">
							<div className="flex justify-between text-xs text-slate-400 font-medium border-b border-slate-100 pb-2">
								<span>{t("landing.mockup.dashboard.transactionId")}</span>
								<span>{t("landing.mockup.dashboard.status")}</span>
								<span>{t("landing.mockup.dashboard.amount")}</span>
							</div>
							{[
								{ id: "TRX-8859", label: t("landing.mockup.dashboard.success"), status: "success", amount: "$120.00" },
								{ id: "TRX-8860", label: t("landing.mockup.dashboard.pending"), status: "pending", amount: "$85.50" },
							].map((tx, i) => (
								<div key={i} className="flex justify-between items-center text-sm">
									<div className="font-mono text-slate-600">{tx.id}</div>
									<div className={`px-2 py-0.5 rounded-full text-xs font-bold ${tx.status === "success" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>{tx.label}</div>
									<div className="font-bold text-slate-800">{tx.amount}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</RevealOnScroll>
		</div>
	);
}
