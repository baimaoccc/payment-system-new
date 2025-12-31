import { useWindowSize } from "./useWindowSize";

export function useResponsive() {
	const { width } = useWindowSize();

	const isMobile = width <= 768;
	const isTablet = width > 768 && width <= 1024;
	const isPC = width > 1024;

	return {
		width,
		isMobile,
		isTablet,
		isPC,
	};
}
