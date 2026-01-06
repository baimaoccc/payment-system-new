import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheckCircle, faGlobeAmericas, faShieldAlt, faBolt, faChartLine, faCreditCard, faMobileAlt, faCode, faTerminal, faMobile, faExchangeAlt, faFileInvoiceDollar, faEnvelopeOpenText, faIdCard, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { useI18n } from "../../plugins/i18n/index.jsx";
import HeroDashboardMockup from "../../components/website/HeroDashboardMockup";
import ConversationalCommerce from "../../components/website/ConversationalCommerce";

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

export function LandingPage() {
	const { t } = useI18n();
	const navigate = useNavigate();
	const telegram = "@ACeo_Pay";
	const telegramLink = "https://t.me/ACeo_Pay";

	const products = [
		{
			id: "gateway",
			title: t("landing.products.gateway.title"),
			icon: faCreditCard,
			description: t("landing.products.gateway.desc"),
			features: [t("landing.products.gateway.feat1"), t("landing.products.gateway.feat2"), t("landing.products.gateway.feat3")],
			color: "bg-blue-600",
		},
		{
			id: "risk",
			title: t("landing.products.risk.title"),
			icon: faShieldAlt,
			description: t("landing.products.risk.desc"),
			features: [t("landing.products.risk.feat1"), t("landing.products.risk.feat2"), t("landing.products.risk.feat3")],
			color: "bg-indigo-600",
		},
		{
			id: "connect",
			title: t("landing.products.connect.title"),
			icon: faCode,
			description: t("landing.products.connect.desc"),
			features: [t("landing.products.connect.feat1"), t("landing.products.connect.feat2"), t("landing.products.connect.feat3")],
			color: "bg-cyan-600",
		},
		{
			id: "terminal",
			title: t("landing.products.terminal.title"),
			icon: faTerminal,
			description: t("landing.products.terminal.desc"),
			features: [t("landing.products.terminal.feat1"), t("landing.products.terminal.feat2"), t("landing.products.terminal.feat3")],
			color: "bg-teal-600",
		},
		{
			id: "mobile",
			title: t("landing.products.mobile.title"),
			icon: faMobile,
			description: t("landing.products.mobile.desc"),
			features: [t("landing.products.mobile.feat1"), t("landing.products.mobile.feat2"), t("landing.products.mobile.feat3")],
			color: "bg-purple-600",
		},
		{
			id: "payouts",
			title: t("landing.products.payouts.title"),
			icon: faExchangeAlt,
			description: t("landing.products.payouts.desc"),
			features: [t("landing.products.payouts.feat1"), t("landing.products.payouts.feat2"), t("landing.products.payouts.feat3")],
			color: "bg-pink-600",
		},
	];

	return (
		<div className="bg-white">
			{/* Hero Section - Light Theme */}
			<section className="relative bg-white text-slate-900 pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
				{/* Abstract Background Shapes - Light Theme */}
				<div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full transform translate-x-1/3 -translate-y-1/4 blur-3xl opacity-60"></div>
				<div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-tr from-cyan-100 to-transparent rounded-tr-full transform -translate-x-1/4 translate-y-1/4 blur-2xl opacity-60"></div>

				<div className="container mx-auto px-6 relative z-10">
					<div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
						<div className="lg:w-1/2 text-center lg:text-left">
							<RevealOnScroll>
								<h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
									{t("landing.hero.title1")} <br />
									<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{t("landing.hero.title2")}</span>
								</h1>
								<p className="text-xl md:text-lg text-slate-600 mb-10 font-medium leading-relaxed">{t("landing.hero.description")}</p>
								<div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
									<Link to="/login" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-500/20 hover:scale-105 flex items-center">
										{t("landing.hero.startNow")} <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
									</Link>
									<Link
										to="#products"
										className="px-8 py-4 bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full font-bold text-lg transition-all"
										onClick={(e) => {
											e.preventDefault();
											document.getElementById("solutions")?.scrollIntoView({ behavior: "smooth" });
										}}>
										{t("landing.hero.exploreProducts")}
									</Link>
								</div>
							</RevealOnScroll>
						</div>
						<div className="lg:w-1/2 w-full max-w-lg lg:max-w-none">
							<ConversationalCommerce />
						</div>
					</div>
				</div>

				<div className="container mx-auto px-6">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
						{[
							{ label: t("landing.stats.transactions"), value: "1B+" },
							{ label: t("landing.stats.uptime"), value: "95.99%" },
							{ label: t("landing.stats.currencies"), value: "135+" },
							{ label: t("landing.stats.customers"), value: "50k+" },
						].map((stat, idx) => (
							<RevealOnScroll key={idx} className={`delay-[${idx * 100}ms]`}>
								<div className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">{stat.value}</div>
								<div className="text-sm font-semibold uppercase tracking-wider text-slate-500">{stat.label}</div>
							</RevealOnScroll>
						))}
					</div>
				</div>
				{/* Bottom Wave Transition - Rotate 180 (Wavy Top, Flat Bottom to simulate White rising up) */}
				<div className="absolute -bottom-[1px] left-0 w-full overflow-hidden leading-[0] z-[1000]">
					<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[50px] transform rotate-180">
						<path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-900"></path>
					</svg>
				</div>
			</section>

			{/* Stats Section */}
			{/* <section className="py-12 border-slate-100 relative"></section> */}

			{/* Featured Solutions Section (New) */}
			<section id="solutions" className="py-24 bg-slate-900 relative z-20">
				<div className="container mx-auto px-6">
					<RevealOnScroll className="text-center mb-16">
						<span className="text-blue-600 font-bold uppercase tracking-wider text-sm">{t("landing.solutions.subtitle")}</span>
						<h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-6">{t("landing.solutions.title")}</h2>
						<p className="text-xl text-white max-w-2xl mx-auto">{t("landing.solutions.description")}</p>
					</RevealOnScroll>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* 1. Global Payment Gateway */}
						<RevealOnScroll className="delay-0">
							<div className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-slate-200/60 hover:border-blue-100 h-full flex flex-col">
								<div className="flex items-center gap-4 mb-6">
									<div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
										<FontAwesomeIcon icon={faGlobe} />
									</div>
									<h3 className="text-2xl font-bold text-slate-900">{t("landing.featured.gateway.title")}</h3>
								</div>
								<p className="text-slate-600 mb-6 flex-grow leading-relaxed">{t("landing.featured.gateway.desc")}</p>
								<ul className="space-y-2 mb-6">
									{[t("landing.featured.gateway.feat1"), t("landing.featured.gateway.feat2"), t("landing.featured.gateway.feat3")].map((feat, i) => (
										<li key={i} className="flex items-center text-sm text-slate-500 font-medium">
											<FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" /> {feat}
										</li>
									))}
								</ul>
							</div>
						</RevealOnScroll>

						{/* 2. Invoice & Billing Suite */}
						<RevealOnScroll className="delay-100">
							<div className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-slate-200/60 hover:border-[#5556fd]/30 h-full flex flex-col">
								<div className="flex items-center gap-4 mb-6">
									<div className="w-14 h-14 bg-[#5556fd]/10 text-[#5556fd] rounded-xl flex items-center justify-center text-2xl group-hover:bg-[#5556fd] group-hover:text-white transition-colors">
										<FontAwesomeIcon icon={faFileInvoiceDollar} />
									</div>
									<h3 className="text-2xl font-bold text-slate-900">{t("landing.featured.invoice.title")}</h3>
								</div>
								<p className="text-slate-600 mb-6 flex-grow leading-relaxed">{t("landing.featured.invoice.desc")}</p>
								<ul className="space-y-2 mb-6">
									{[t("landing.featured.invoice.feat1"), t("landing.featured.invoice.feat2"), t("landing.featured.invoice.feat3")].map((feat, i) => (
										<li key={i} className="flex items-center text-sm text-slate-500 font-medium">
											<FontAwesomeIcon icon={faCheckCircle} className="text-[#5556fd] mr-2" /> {feat}
										</li>
									))}
								</ul>
							</div>
						</RevealOnScroll>

						{/* 3. Logistics & Mail System */}
						<RevealOnScroll className="delay-200">
							<div className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-slate-200/60 hover:border-[#4d2a8a]/30 h-full flex flex-col">
								<div className="flex items-center gap-4 mb-6">
									<div className="w-14 h-14 bg-[#4d2a8a]/10 text-[#4d2a8a] rounded-xl flex items-center justify-center text-2xl group-hover:bg-[#4d2a8a] group-hover:text-white transition-colors">
										<FontAwesomeIcon icon={faEnvelopeOpenText} />
									</div>
									<h3 className="text-2xl font-bold text-slate-900">{t("landing.featured.logistics.title")}</h3>
								</div>
								<p className="text-slate-600 mb-6 flex-grow leading-relaxed">{t("landing.featured.logistics.desc")}</p>
								<ul className="space-y-2 mb-6">
									{[t("landing.featured.logistics.feat1"), t("landing.featured.logistics.feat2"), t("landing.featured.logistics.feat3")].map((feat, i) => (
										<li key={i} className="flex items-center text-sm text-slate-500 font-medium">
											<FontAwesomeIcon icon={faCheckCircle} className="text-[#4d2a8a] mr-2" /> {feat}
										</li>
									))}
								</ul>
							</div>
						</RevealOnScroll>

						{/* 4. Global Account Solutions */}
						<RevealOnScroll className="delay-300">
							<div className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-slate-200/60 hover:border-blue-100 h-full flex flex-col">
								<div className="flex items-center gap-4 mb-6">
									<div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
										<FontAwesomeIcon icon={faIdCard} />
									</div>
									<h3 className="text-2xl font-bold text-slate-900">{t("landing.featured.account.title")}</h3>
								</div>
								<p className="text-slate-600 mb-6 flex-grow leading-relaxed">{t("landing.featured.account.desc")}</p>
								<ul className="space-y-2 mb-6">
									{[t("landing.featured.account.feat1"), t("landing.featured.account.feat2"), t("landing.featured.account.feat3")].map((feat, i) => (
										<li key={i} className="flex items-center text-sm text-slate-500 font-medium">
											<FontAwesomeIcon icon={faCheckCircle} className="text-purple-500 mr-2" /> {feat}
										</li>
									))}
								</ul>
							</div>
						</RevealOnScroll>
					</div>
				</div>
			</section>

			{/* Products Section (Ecosystem) */}
			<section id="products" className="py-20 bg-white text-slate-900 relative">
				{/* Custom Styles for this section */}
				<style>{`
					@keyframes float-slow {
						0%, 100% { transform: translateY(0px); }
						50% { transform: translateY(-8px); }
					}
					.animate-float-slow {
						animation: float-slow 5s ease-in-out infinite;
					}
				`}</style>
				{/* Top Wave Transition - No Rotation (Flat Top, Wavy Bottom to simulate Light dripping into Dark) */}
				<div className="absolute -top-[0.1rem] left-0 w-full overflow-hidden leading-[0] z-30">
					<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[50px]">
						<path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-900"></path>
					</svg>
				</div>
				<div className="container mx-auto px-6 relative z-10">
					<RevealOnScroll className="text-center mb-20">
						<span className="text-blue-600 font-bold uppercase tracking-wider text-sm">{t("landing.ecosystem.subtitle")}</span>
						<h2 className="text-3xl md:text-5xl font-bold mt-3 mb-6 text-slate-900">
							{t("landing.ecosystem.title1")} <br />
							<span className="text-blue-600">{t("landing.ecosystem.title2")}</span>
						</h2>
						<p className="text-xl text-slate-500 max-w-2xl mx-auto">{t("landing.ecosystem.description")}</p>
					</RevealOnScroll>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{products.map((product, idx) => (
							<RevealOnScroll key={product.id} className={`delay-[${idx * 100}ms] h-full`}>
								<div onClick={() => navigate("/")} className="bg-slate-50 rounded-2xl p-8 shadow-sm hover:shadow-2xl hover:bg-white transition-all duration-300 border border-slate-100 hover:border-blue-200 group h-full hover:-translate-y-2">
									<div className={`w-14 h-14 rounded-xl ${product.color} text-white flex items-center justify-center text-2xl mb-6 shadow-md transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 animate-float-slow`} style={{ animationDelay: `${idx * 0.5}s` }}>
										<FontAwesomeIcon icon={product.icon} />
									</div>
									<h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{product.title}</h3>
									<p className="text-slate-500 mb-6 min-h-[3rem] group-hover:text-slate-600 transition-colors">{product.description}</p>
									<div className="space-y-3 mb-8">
										{product.features.map((feature, idx) => (
											<div key={idx} className="flex items-center text-sm text-slate-500 font-medium">
												<div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 group-hover:bg-green-400 transition-colors"></div>
												{feature}
											</div>
										))}
									</div>
									<Link to="#" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors group/link">
										{t("landing.ecosystem.learnMore")} <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-sm transform group-hover/link:translate-x-1 transition-transform" />
									</Link>
								</div>
							</RevealOnScroll>
						))}
					</div>
				</div>
			</section>

			{/* Feature Highlight Section (formerly Conversational Commerce) */}
			<section id="analytics" className="py-20 bg-white relative overflow-hidden">
				<div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 blur-3xl rounded-l-full"></div>
				<div className="container mx-auto px-6 relative z-10">
					<div className="flex flex-col md:flex-row items-center gap-16">
						<div className="md:w-1/2">
							<RevealOnScroll>
								<div className="inline-block px-4 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-bold mb-6">{t("landing.analytics.badge")}</div>
								<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
									{t("landing.analytics.title1")} <br />
									<span className="text-blue-600">{t("landing.analytics.title2")}</span>
								</h2>
								<p className="text-xl text-slate-600 mb-8 leading-relaxed">{t("landing.analytics.description")}</p>
								<ul className="space-y-4 mb-10">
									{[t("landing.analytics.feat1"), t("landing.analytics.feat2"), t("landing.analytics.feat3"), t("landing.analytics.feat4")].map((item, i) => (
										<li key={i} className="flex items-center text-slate-700 font-medium">
											<div className="w-6 h-6 rounded-full bg-green-100 text-green-500 flex items-center justify-center mr-3 text-xs">
												<FontAwesomeIcon icon={faCheckCircle} />
											</div>
											{item}
										</li>
									))}
								</ul>
								<Link to="#" className="text-blue-600 font-bold hover:text-blue-700 flex items-center group">
									{t("landing.analytics.explore")}
									<FontAwesomeIcon icon={faArrowRight} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
								</Link>
							</RevealOnScroll>
						</div>

						<div className="md:w-1/2 flex justify-center w-full">
							<HeroDashboardMockup />
						</div>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section id="features" className="py-20 bg-website-dark text-white relative">
				{/* Top Wave Transition - No Rotation (Flat Top, Wavy Bottom to simulate White dripping into Dark) */}
				<div className="absolute -top-[0.05rem] left-0 w-full overflow-hidden leading-[0]">
					<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[50px]">
						<path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
					</svg>
				</div>
				<div className="container mx-auto px-6 relative z-10 pt-10">
					<RevealOnScroll className="text-center mb-20">
						<span className="text-blue-400 font-bold uppercase tracking-wider text-sm">{t("landing.features.subtitle")}</span>
						<h2 className="text-3xl md:text-5xl font-bold mt-3 mb-6">{t("landing.features.title")}</h2>
						<p className="text-xl text-slate-400 max-w-2xl mx-auto">{t("landing.features.description")}</p>
					</RevealOnScroll>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-10">
						{[
							{ icon: faGlobeAmericas, title: t("landing.features.grid.global.title"), desc: t("landing.features.grid.global.desc") },
							{ icon: faShieldAlt, title: t("landing.features.grid.fraud.title"), desc: t("landing.features.grid.fraud.desc") },
							{ icon: faBolt, title: t("landing.features.grid.payouts.title"), desc: t("landing.features.grid.payouts.desc") },
							{ icon: faChartLine, title: t("landing.features.grid.analytics.title"), desc: t("landing.features.grid.analytics.desc") },
							{ icon: faCreditCard, title: t("landing.features.grid.local.title"), desc: t("landing.features.grid.local.desc") },
							{ icon: faMobileAlt, title: t("landing.features.grid.mobile.title"), desc: t("landing.features.grid.mobile.desc") },
						].map((feature, idx) => (
							<RevealOnScroll key={idx} className="h-full">
								<div className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:shadow-2xl transition-all duration-300 border border-white/10 group h-full">
									<div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
										<FontAwesomeIcon icon={feature.icon} />
									</div>
									<h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
									<p className="text-slate-400 leading-relaxed">{feature.desc}</p>
								</div>
							</RevealOnScroll>
						))}
					</div>
				</div>
				{/* Bottom Wave Transition - Rotate 180 (Wavy Top, Flat Bottom to simulate Dark rising up) */}
				<div className="absolute -bottom-[1px] left-0 w-full overflow-hidden leading-[0] z-30">
					<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[50px] transform rotate-180">
						<path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
					</svg>
				</div>
			</section>

			{/* Trust Section */}
			<section id="trust" className="py-24 bg-white relative z-20">
				<div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
					<div className="md:w-1/2 mb-12 md:mb-0 pr-0 md:pr-12">
						<RevealOnScroll>
							<h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">{t("landing.trust.title")}</h2>
							<div className="space-y-6">
								{[t("landing.trust.item1"), t("landing.trust.item2"), t("landing.trust.item3"), t("landing.trust.item4")].map((item, idx) => (
									<div key={idx} className="flex items-start">
										<FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1 mr-4" />
										<span className="text-lg text-slate-600">{item}</span>
									</div>
								))}
							</div>
							{/* <div className="mt-10">
								<Link to="#" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center">
									View our certifications <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
								</Link>
							</div> */}
						</RevealOnScroll>
					</div>
					<div className="md:w-1/2 relative">
						<RevealOnScroll className="delay-200">
							<div className="absolute inset-0 bg-blue-100 rounded-full filter blur-[100px] opacity-50"></div>
							<div className="w-[340px] sm:w-auto relative bg-white/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-200 shadow-2xl">
								<div className="grid grid-cols-2 gap-4">
									{[1, 2, 3, 4].map((i) => (
										<div key={i} className="h-24 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
											<span className="text-slate-400 font-bold text-xl">LOGO {i}</span>
										</div>
									))}
								</div>
								<div className="mt-8 pt-8 border-t border-slate-100">
									<div className="flex items-center justify-between">
										<div>
											<div className="text-3xl font-bold text-slate-900">2M+</div>
											<div className="text-sm text-slate-500">{t("landing.trust.transactions")}</div>
										</div>
										<div>
											<div className="text-3xl font-bold text-slate-900">$50B+</div>
											<div className="text-sm text-slate-500">{t("landing.trust.volume")}</div>
										</div>
									</div>
								</div>
							</div>
						</RevealOnScroll>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24 bg-website-dark relative overflow-hidden">
				{/* <div className="absolute -top-[0.1rem] left-0 w-full overflow-hidden leading-[0] z-30">
					<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" shapeRendering="geometricPrecision" className="relative block w-[calc(100%+1.3px)] h-[50px]">
						<path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
					</svg>
				</div> */}
				<div className="absolute inset-0 from-blue-900/20 to-purple-900/20"></div>
				<div className="container mx-auto px-6 relative z-10 text-center">
					<RevealOnScroll>
						<h2 className="text-4xl md:text-6xl font-bold text-white mb-8">{t("landing.cta.title")}</h2>
						<p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">{t("landing.cta.description")}</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link to="/" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-900/50">
								{t("landing.cta.getStart")}
							</Link>
							{/* <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 group">
								<FontAwesomeIcon icon={faTelegram} className="text-xl group-hover:scale-110 transition-transform" />
								<span>
									{t("landing.cta.contactSales")}: {telegram}
								</span>
							</a> */}
						</div>
					</RevealOnScroll>
				</div>
			</section>
		</div>
	);
}
