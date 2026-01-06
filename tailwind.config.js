/**
 * 中文：Tailwind 配置，定义扫描文件路径与主题扩展
 * English: Tailwind config; define content paths and theme extensions
 */
export default {
	content: ["./index.html", "./src/**/*.{js,jsx}"],
	theme: {
		extend: {
			boxShadow: {
				xl: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
			},
			fontFamily: {
				sans: ["Poppins", "system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"],
			},
			keyframes: {
				fadeInUp: {
					"0%": { opacity: "0", transform: "translateY(8px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
			},
			animation: {
				page: "fadeInUp 200ms ease-out",
				"fade-in-up": "fadeInUp 0.5s ease-out forwards",
			},
			colors: {
				welcome: {
					DEFAULT: "#0a1f44",
				},
				website: {
					dark: "#0B1120",
				},
				brand: {
					DEFAULT: "#1E4DB7",
					dark: "#1E4DB7D9",
					85: "#1E4DB7D9",
					30: "#1E4DB74D",
					12: "#e3e9f6",
				},
				secondary: {
					DEFAULT: "#1A9BFC",
					dark: "#1A9BFCD9",
					85: "#1A9BFCD9",
					30: "#1A9BFC4D",
					12: "#1A9BFC1F",
				},
				accent: {
					DEFAULT: "#0BB2FB",
					30: "#0BB2FB4D",
					12: "#0BB2FB1F",
				},
				peach: {
					DEFAULT: "#FC4B6C",
					85: "#FC4B6CD9",
					12: "#FC4B6C1F",
				},
				navy: {
					DEFAULT: "#11142D",
					87: "#11142DDE",
					54: "#11142D8A",
					20: "#11142D33",
					8: "#11142D14",
				},
				action: {
					green: "#39CB7F",
					yellow: "#FEC90F",
					red: "#FC4B6C",
					"green-30": "#C4EFD9",
					"yellow-30": "#FFEFB7",
					"red-30": "#FEC9D3",
				},
				grey: {
					1: "#949DB2",
					2: "#BDBDBD",
					3: "#99ABB4",
					4: "#ECF0F2",
					12: "#B6B6B61F",
				},
			},
		},
	},
	plugins: [],
};
