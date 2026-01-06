import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faChevronRight, faBars, faTimes, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faLinkedin, faFacebook } from "@fortawesome/free-brands-svg-icons";
import BrandLogo from "../../assets/brand-logo.png";
import BrandTextLogo from "../../assets/brand-text.png";
import { useI18n } from "../../plugins/i18n/index.jsx";

export function OfficialSiteLayout() {
	const { t, lang, setLanguage } = useI18n();
	const [scrolled, setScrolled] = useState(false);
	const [showBackToTop, setShowBackToTop] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [activeSection, setActiveSection] = useState("");
	const location = useLocation();

	// Determine base path: if we are at /website, use /website, otherwise use root /
	const isWebsiteSubpath = location.pathname.startsWith("/website");
	const basePath = isWebsiteSubpath ? "/website" : "";

	const navLinks = [
		{ name: t("nav.solutions"), path: `${basePath}#solutions` },
		{ name: t("nav.ecosystem"), path: `${basePath}#products` },
		{ name: t("nav.analytics"), path: `${basePath}#analytics` },
		{ name: t("nav.features"), path: `${basePath}#features` },
		{ name: t("nav.trust"), path: `${basePath}#trust` },
	];

	useEffect(() => {
		// Handle hash scroll on mount or hash change
		if (location.hash) {
			const id = location.hash.substring(1);
			setTimeout(() => {
				document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
			}, 100);
		}
	}, [location.hash, location.pathname]);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
			setShowBackToTop(window.scrollY > 400);

			// Active section logic
			const sections = navLinks.map((link) => link.path.split("#")[1]).filter((id) => id);
			let current = "";
			for (const id of sections) {
				const element = document.getElementById(id);
				if (element) {
					const rect = element.getBoundingClientRect();
					if (rect.top <= 150 && rect.bottom >= 150) {
						current = `${basePath}#` + id;
					}
				}
			}
			if (current !== activeSection) {
				setActiveSection(current);
			}
		};
		window.addEventListener("scroll", handleScroll);
		handleScroll(); // Initial check
		return () => window.removeEventListener("scroll", handleScroll);
	}, [activeSection]);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	return (
		<div className="min-h-screen font-sans text-slate-900 bg-white selection:bg-blue-100">
			{/* Navigation */}
			<nav className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${scrolled || mobileMenuOpen ? "bg-slate-900/95 backdrop-blur-md shadow-lg py-4" : "bg-transparent py-6"}`}>
				<div className="container mx-auto px-6 flex items-center justify-between">
					<Link to="/website" className={`text-2xl font-bold tracking-tighter flex items-center gap-2 transition-colors duration-300 ${scrolled || mobileMenuOpen ? "text-white" : "text-blue-900"}`}>
						<img src={BrandLogo} alt="logo" className="h-12" />
						<img src={BrandTextLogo} alt="" className="h-8" />
					</Link>

					{/* Desktop Nav */}
					<div className="hidden md:flex items-center space-x-8">
						{navLinks.map((link) => (
							<Link
								key={link.name}
								to={link.path}
								className={`text-sm font-medium transition-colors duration-300 ${activeSection === link.path ? "text-blue-500" : scrolled || mobileMenuOpen ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-blue-600"}`}
								onClick={(e) => {
									if (location.pathname === "/website" && link.path.includes("#")) {
										e.preventDefault();
										const id = link.path.split("#")[1];
										document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
									}
								}}>
								{link.name}
							</Link>
						))}
					</div>

					<div className="hidden md:flex items-center space-x-4">
						<Link to="/login" className={`text-sm font-semibold transition-colors duration-300 ${scrolled || mobileMenuOpen ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-blue-900"}`}>
							{t("nav.login")}
						</Link>
						<Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40">
							{t("nav.getStarted")}
						</Link>
					</div>

					{/* Mobile Menu Button */}
					<button className={`md:hidden text-xl transition-colors duration-300 ${scrolled || mobileMenuOpen ? "text-white" : "text-slate-600"}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
						<FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
					</button>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-t border-slate-800 shadow-xl py-4 px-6 flex flex-col space-y-4">
						{navLinks.map((link) => (
							<Link
								key={link.name}
								to={link.path}
								className={`text-base font-medium py-2 border-b border-slate-800 transition-colors ${activeSection === link.path ? "text-blue-500" : "text-slate-300 hover:text-white"}`}
								onClick={(e) => {
									setMobileMenuOpen(false);
									if (location.pathname === "/website" && link.path.includes("#")) {
										e.preventDefault();
										const id = link.path.split("#")[1];
										document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
									}
								}}>
								{link.name}
							</Link>
						))}
						<div className="pt-4 flex flex-col space-y-3">
							<Link to="/login" className="text-center font-semibold text-slate-300 hover:text-white">
								{t("nav.login")}
							</Link>
							<Link to="/login" className="text-center px-5 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500">
								{t("nav.getStarted")}
							</Link>
						</div>
					</div>
				)}
			</nav>

			{/* Main Content */}
			<main className="pt-0">
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="bg-slate-900 text-white pt-20 pb-10">
				<div className="container mx-auto px-6">
					<div className="flex flex-col items-center text-center mb-16">
						<div className="text-2xl font-bold tracking-tighter mb-6 flex items-center gap-2">
							<img src={BrandLogo} alt="logo" className="h-12" />
							<img src={BrandTextLogo} alt="" className="h-8" />
							{/* <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
								<FontAwesomeIcon icon={faGlobe} />
							</div>
							PAYMENT<span className="text-blue-400">SYS</span> */}
						</div>
						<p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-lg">{t("footer.description")}</p>
						<div className="flex space-x-4">
							{[faTwitter, faLinkedin, faFacebook].map((icon, i) => (
								<a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
									<FontAwesomeIcon icon={icon} />
								</a>
							))}
						</div>
					</div>

					<div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
						<p>{t("footer.copyright")}</p>
						<div className="w-full sm:w-auto flex justify-between items-center flex-wrap  sm:space-x-6 mt-4 md:mt-0">
							<div className="w-full sm:w-auto sm:min-w-[300px] flex justify-between items-center">
								<Link to="/website/privacy-policy" className="hover:text-white transition-colors">
									{t("footer.privacyPolicy")}
								</Link>
								<Link to="/website/terms-of-service" className="hover:text-white transition-colors">
									{t("footer.termsOfService")}
								</Link>
								<Link to="/website/cookie-policy" className="hover:text-white transition-colors">
									{t("footer.cookies")}
								</Link>
							</div>
							<div className="block sm:inline-block flex items-center space-x-2 mt-2 sm:mt-0">
								<button onClick={() => setLanguage("en")} className={`transition-colors ${lang === "en" ? "text-white font-medium" : "hover:text-white"}`}>
									En
								</button>
								<span>/</span>
								<button onClick={() => setLanguage("zh")} className={`transition-colors ${lang === "zh" ? "text-white font-medium" : "hover:text-white"}`}>
									中文
								</button>
							</div>
						</div>
					</div>
				</div>
			</footer>

			{/* Back to Top Button */}
			<button onClick={scrollToTop} className={`fixed bottom-24 right-4 bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-40 ${showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`} aria-label="Back to top">
				<FontAwesomeIcon icon={faArrowUp} />
			</button>
		</div>
	);
}
