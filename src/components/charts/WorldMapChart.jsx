import React, { useMemo, useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { useI18n } from "../../plugins/i18n/index.jsx";
import worldMapData from "../../assets/map/world.json";

// Map ISO-2 codes to Echarts world map names
const iso2ToEcharts = {
	US: "United States",
	GB: "United Kingdom",
	CN: "China",
	JP: "Japan",
	DE: "Germany",
	FR: "France",
	IT: "Italy",
	CA: "Canada",
	AU: "Australia",
	IN: "India",
	BR: "Brazil",
	RU: "Russia",
	ZA: "South Africa",
	MX: "Mexico",
	KR: "Korea",
	ES: "Spain",
	ID: "Indonesia",
	SA: "Saudi Arabia",
	TR: "Turkey",
	NL: "Netherlands",
	CH: "Switzerland",
	SE: "Sweden",
	PL: "Poland",
	BE: "Belgium",
	NO: "Norway",
	AT: "Austria",
	DK: "Denmark",
	FI: "Finland",
	SG: "Singapore",
	NZ: "New Zealand",
	IE: "Ireland",
	IL: "Israel",
	PT: "Portugal",
	GR: "Greece",
	CZ: "Czech Rep.",
	RO: "Romania",
	HU: "Hungary",
	SK: "Slovakia",
	BG: "Bulgaria",
	HR: "Croatia",
	RS: "Serbia",
	SI: "Slovenia",
	LT: "Lithuania",
	EE: "Estonia",
	LV: "Latvia",
	AE: "United Arab Emirates",
	GM: "Gambia",
	LU: "Luxembourg",
	PR: "Puerto Rico",
	// Fallback to Intl.DisplayNames if missing
};

export function WorldMapChart({ data = [], isDark = false }) {
	const { t } = useI18n();
	const [mapRegistered, setMapRegistered] = useState(false);

	useEffect(() => {
		if (!echarts.getMap("world")) {
			echarts.registerMap("world", worldMapData);
		}
		setMapRegistered(true);
	}, []);

	const chartData = useMemo(() => {
		// Use Intl API for mapping codes if not in dictionary
		let getCountryName = (code) => iso2ToEcharts[code];
		try {
			const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
			getCountryName = (code) => iso2ToEcharts[code] || displayNames.of(code);
		} catch (e) {
			// Ignore
		}

		return data.map((item) => {
			const name = getCountryName(item.countryCode) || item.countryCode;
			return {
				name,
				value: item.orderNum,
				amount: item.amount,
				countryCode: item.countryCode,
			};
		});
	}, [data]);

	const option = useMemo(() => {
		let maxVal = 0;
		chartData.forEach((d) => {
			if (d.value > maxVal) maxVal = d.value;
		});

		return {
			tooltip: {
				trigger: "item",
				formatter: (params) => {
					const dataItem = params.data || {};
					const val = dataItem.value || 0;
					const amt = dataItem.amount || 0;
					return `${params.name}<br/>${t("orderNum") || "Orders"}: <b>${val}</b><br/>${t("salesAmount") || "Sales"}: <b>$${amt.toLocaleString()}</b>`;
				},
				backgroundColor: isDark ? "rgba(31, 41, 55, 0.9)" : "rgba(255, 255, 255, 0.9)",
				borderColor: isDark ? "#374151" : "#e5e7eb",
				textStyle: {
					color: isDark ? "#f3f4f6" : "#1f2937",
				},
			},
			visualMap: {
				min: 0,
				max: maxVal > 0 ? maxVal : 100,
				text: [t("high") || "High", t("low") || "Low"],
				realtime: false,
				calculable: true,
				inRange: {
					color: isDark ? ["#374151", "#3b82f6", "#1d4ed8"] : ["#e0f2fe", "#3b82f6", "#1e3a8a"],
				},
				textStyle: {
					color: isDark ? "#9ca3af" : "#6b7280",
				},
				left: "left",
				bottom: "bottom",
				itemWidth: 12,
				itemHeight: 100,
			},
			series: [
				{
					name: t("orderNum") || "Orders",
					type: "map",
					map: "world",
					roam: true, // Allow zoom/pan
					zoom: 2, // Initial zoom level (1 is default, >1 is zoomed in)
					center: [10, 30], // Center map roughly between US and Europe to show the most relevant data clearly
					scaleLimit: {
						min: 1,
						max: 5,
					},
					itemStyle: {
						areaColor: isDark ? "#1f2937" : "#f3f4f6",
						borderColor: isDark ? "#374151" : "#d1d5db",
						borderWidth: 0.5,
					},
					emphasis: {
						itemStyle: {
							areaColor: "#60a5fa",
						},
						label: {
							show: false,
						},
					},
					data: chartData,
				},
			],
		};
	}, [chartData, isDark, t]);

	if (!mapRegistered) return null;

	return <ReactECharts option={option} style={{ height: "100%", minHeight: "350px", width: "100%" }} className="w-full h-full min-h-[350px] md:min-h-[400px]" />;
}
