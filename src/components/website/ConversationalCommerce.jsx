import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWaveSquare, faMagic, faArrowRight, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useI18n } from "../../plugins/i18n/index.jsx";

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

export default function ConversationalCommerce() {
	const { t } = useI18n();
	return (
		<div className="relative flex justify-center items-center py-10">
			<RevealOnScroll className="relative">
				{/* Background Glow */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/20 blur-[100px] rounded-full pointer-events-none"></div>

				{/* Phone Container - Added floating animation */}
				<div className="relative w-[320px] h-[640px] bg-white border-[10px] border-slate-900 rounded-[3rem] shadow-2xl overflow-hidden z-10 animate-float">
					{/* Notch */}
					<div className="absolute top-[-2px] left-1/2 transform -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-xl z-20"></div>

					{/* Screen Content */}
					<div className="w-full h-full bg-slate-50 relative pt-14 px-4 flex flex-col">
						{/* Status Bar */}
						<div className="w-full h-5 mb-2 flex justify-between items-center px-2 opacity-50">
							<span className="text-[10px] font-bold text-slate-900">9:41</span>
							<div className="flex gap-1">
								<div className="w-4 h-2.5 bg-slate-900 rounded-sm"></div>
							</div>
						</div>

						{/* Chat Interface */}
						<div className="flex-1 space-y-6">
							{/* User Message - Voice Note */}
							<div className="flex items-start gap-3 opacity-0 animate-slide-up-fade" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
								<div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
									<div className="w-4 h-4 bg-slate-400 rounded-full"></div>
								</div>
								<div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[80%]">
									<div className="flex items-center gap-2 mb-1">
										<FontAwesomeIcon icon={faWaveSquare} className="text-blue-500 animate-pulse" />
										<span className="text-xs font-bold text-slate-400">{t("landing.mockup.chat.voiceNote")}</span>
									</div>
									<div className="flex items-center gap-1 h-4">
										{[1, 2, 3, 4, 5, 4, 3, 2].map((h, i) => (
											<div key={i} className="w-1 bg-slate-300 rounded-full animate-wave" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
										))}
									</div>
									<p className="text-slate-700 text-sm font-medium mt-2">{t("landing.mockup.chat.userMessage")}</p>
								</div>
							</div>

							{/* Bot Message */}
							<div className="flex flex-col items-end gap-2 opacity-0 animate-slide-up-fade" style={{ animationDelay: "1.5s", animationFillMode: "forwards" }}>
								<div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-md max-w-[85%] text-white relative">
									<FontAwesomeIcon icon={faMagic} className="absolute -left-2 -top-2 text-yellow-300 text-lg drop-shadow-sm animate-bounce" />
									<p className="text-sm font-medium">{t("landing.mockup.chat.botMessage")}</p>
								</div>

								{/* Product Card */}
								<div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100 w-[220px] transform hover:scale-105 transition-transform duration-300 cursor-pointer opacity-0 animate-slide-up-fade" style={{ animationDelay: "2s", animationFillMode: "forwards" }}>
									<div className="w-full h-28 bg-slate-100 rounded-lg mb-3 overflow-hidden relative group">
										<img src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Dress" className="w-full h-full object-cover" />
										<div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-slate-900 shadow-sm">{t("landing.mockup.chat.newArrival")}</div>
									</div>
									<h4 className="text-sm font-bold text-slate-900">{t("landing.mockup.chat.productName")}</h4>
									<p className="text-xs text-slate-500 mb-3">{t("landing.mockup.chat.collection")}</p>
									<div className="flex justify-between items-center">
										<span className="text-sm font-bold text-blue-600">$138.00</span>
										<button className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/20">{t("landing.mockup.chat.add")}</button>
									</div>
								</div>
							</div>
						</div>

						{/* Bottom Input Area */}
						<div className="absolute bottom-6 left-4 right-4 h-14 bg-white rounded-full shadow-lg border border-slate-100 flex items-center px-5 justify-between z-20">
							<span className="text-slate-400 text-sm">Type a message...</span>
							<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm shadow-md hover:scale-105 transition-transform cursor-pointer">
								<FontAwesomeIcon icon={faArrowRight} />
							</div>
						</div>
						<div className="w-32 h-1 bg-slate-300 rounded-full mx-auto absolute bottom-2 left-1/2 transform -translate-x-1/2"></div>
					</div>
				</div>

				{/* Floating Notification - Payment Approved */}
				<div className="absolute top-[20%] -right-12 z-20 hidden md:block opacity-0 animate-slide-in-right" style={{ animationDelay: "3s", animationFillMode: "forwards" }}>
					<div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 border border-slate-100">
						<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
							<FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
						</div>
						<div>
							<div className="text-xs text-slate-400 font-bold">Payment Status</div>
							<div className="text-sm font-bold text-slate-900">Approved</div>
						</div>
					</div>
				</div>
			</RevealOnScroll>
			<style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes slide-up-fade {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-right {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-slide-up-fade {
          animation: slide-up-fade 0.6s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out forwards;
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
		</div>
	);
}
