import React from "react";

const Versions: React.FC = () => {
    const versions = [
        {
            version: "1.0",
            title: "Foundation Release",
            date: "Initial Launch",
            icon: "🚀",
            color: "from-cyan-500 to-blue-500",
            borderColor: "border-cyan-500/50",
            glowColor: "shadow-cyan-500/50",
            features: [
                "Loan prediction form with essential fields",
                "Machine learning algorithm integration",
                "Real-time approval rate calculation",
                "Clean and intuitive user interface"
            ]
        },
        {
            version: "2.0",
            title: "Ingestion of Intelligence",
            date: "Major Update",
            icon: "!",
            color: "from-blue-500 to-sky-500",
            borderColor: "border-blue-500/50",
            glowColor: "shadow-blue-500/50",
            features: [
                "Integrated smart chat services",
                "Infused with Domain Specific RAG knowledge",
                "Advanced regression model for risk scoring",
    
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-950 to-sky-900 relative overflow-hidden py-35">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <div className="relative pt-20 pb-16 text-center">
                <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/30 backdrop-blur-sm">
                    <span className="text-cyan-400 font-semibold text-sm tracking-wider">RELEASE HISTORY</span>
                </div>
                <h1 className="text-6xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent mb-4 tracking-tight">
                    Version Timeline
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Track the evolution of SmartLoanPred through our major releases
                </p>
            </div>

            {/* Timeline Container */}
            <div className="relative max-w-6xl mx-auto px-6 pb-20">
                {/* Timeline Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500/50 via-blue-500/50 to-transparent transform -translate-x-1/2 hidden md:block"></div>

                {/* Version Cards */}
                <div className="space-y-16">
                    {versions.map((v, index) => (
                        <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col gap-8 group`}>
                            {/* Timeline Node */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block z-10">
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${v.color} flex items-center justify-center text-3xl shadow-lg ${v.glowColor} group-hover:scale-110 transition-transform duration-300`}>
                                    {v.icon}
                                </div>
                            </div>

                            {/* Content Card */}
                            <div className="md:w-[calc(50%-4rem)] w-full">
                                <div className={`relative bg-slate-900/50 backdrop-blur-xl rounded-2xl border ${v.borderColor} shadow-2xl ${v.glowColor} hover:shadow-3xl transition-all duration-500 overflow-hidden group-hover:scale-105 group-hover:border-opacity-100`}>
                                    {/* Gradient Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${v.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                                    {/* Mobile Icon */}
                                    <div className="md:hidden absolute -top-8 left-1/2 transform -translate-x-1/2">
                                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${v.color} flex items-center justify-center text-3xl shadow-lg ${v.glowColor}`}>
                                            {v.icon}
                                        </div>
                                    </div>

                                    <div className="p-8 pt-12 md:pt-8">
                                        {/* Version Badge */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`px-4 py-1.5 bg-gradient-to-r ${v.color} rounded-full text-white font-bold text-sm shadow-lg`}>
                                                v{v.version}
                                            </span>
                                            <span className="text-gray-500 text-sm font-medium">{v.date}</span>
                                        </div>

                                        {/* Title */}
                                        <h3 className={`text-3xl font-bold mb-6 bg-gradient-to-r ${v.color} bg-clip-text text-transparent`}>
                                            {v.title}
                                        </h3>

                                        {/* Features List */}
                                        <div className="space-y-3">
                                            {v.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-start gap-3 group/item">
                                                    <div className={`mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r ${v.color} group-hover/item:scale-150 transition-transform duration-300`}></div>
                                                    <p className="text-gray-300 leading-relaxed group-hover/item:text-white transition-colors duration-300">
                                                        {feature}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Decorative Corner */}
                                    <div className={`absolute -bottom-1 -right-1 w-24 h-24 bg-gradient-to-tl ${v.color} opacity-20 blur-2xl rounded-full`}></div>
                                </div>
                            </div>

                            {/* Spacer for alternating layout */}
                            <div className="md:w-[calc(50%-4rem)] hidden md:block"></div>
                        </div>
                    ))}
                </div>

                {/* Coming Soon Card */}
                <div className="mt-20 relative">
                    <div className="max-w-2xl mx-auto bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-2xl border border-dashed border-gray-600 p-12 text-center">
                        <div className="text-6xl mb-4 animate-bounce">🎯</div>
                        <h3 className="text-2xl font-bold text-gray-300 mb-3">More Innovations Coming Soon</h3>
                        <p className="text-gray-500">Stay tuned for upcoming features and improvements</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Versions;