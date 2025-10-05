import React from "react";

const Policy: React.FC = () => {
    const policies = [
        {
            icon: "🔒",
            title: "Privacy First",
            description: "This app is completely stateless and no data has been transferred or stored internally for research purposes. In the future with improvements, it can be implemented only if the user agrees by checking out the checkbox!",
            color: "from-cyan-500 to-blue-500",
            iconBg: "bg-cyan-500/20",
            borderColor: "border-cyan-500/30"
        },
        {
            icon: "🤖",
            title: "Machine Learning Technology",
            description: "This is a Full-stack ML app, which has supervised learning tasks such as classification and prediction of the outcomes. This predicts the risk score by collecting the user's financial entries!",
            color: "from-blue-500 to-sky-500",
            iconBg: "bg-blue-500/20",
            borderColor: "border-blue-500/30",
            highlights: [
                { text: "Full-stack ML app", color: "from-cyan-500 to-blue-500" },
                { text: "supervised learning", color: "from-cyan-500 to-blue-500" },
                { text: "risk score", color: "from-cyan-500 to-blue-500" }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-950 to-sky-900 relative overflow-hidden py-35">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Content */}
            <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
                <div className="max-w-5xl w-full space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/30 backdrop-blur-sm mb-4">
                            <span className="text-cyan-400 font-semibold text-sm tracking-wider">TRANSPARENCY & TRUST</span>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-300 to-sky-500 bg-clip-text text-transparent leading-tight">
                            Our Policy
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Your privacy and trust are our top priorities
                        </p>
                    </div>

                    {/* Policy Cards */}
                    <div className="space-y-8">
                        {policies.map((policy, index) => (
                            <div key={index} className="group relative">
                                {/* Glow Effect */}
                                <div className={`absolute -inset-1 bg-gradient-to-r ${policy.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500`}></div>

                                {/* Card */}
                                <div className={`relative bg-slate-900/70 backdrop-blur-xl rounded-2xl border ${policy.borderColor} p-8 transition-all duration-300 group-hover:border-opacity-100 group-hover:scale-[1.02]`}>
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-16 h-16 ${policy.iconBg} rounded-2xl flex items-center justify-center text-4xl border ${policy.borderColor}`}>
                                            {policy.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-3">
                                            <h3 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${policy.color} bg-clip-text text-transparent`}>
                                                {policy.title}
                                            </h3>
                                            <p className="text-gray-300 text-lg leading-relaxed">
                                                {policy.highlights ? (
                                                    <>
                                                        This is a <span className={`font-bold bg-gradient-to-r ${policy.highlights[0].color} bg-clip-text text-transparent`}>{policy.highlights[0].text}</span>, which has <span className={`font-bold capitalize bg-gradient-to-r ${policy.highlights[1].color} bg-clip-text text-transparent`}>{policy.highlights[1].text}</span> tasks such as classification and prediction of the outcomes. This predicts the <span className={`font-bold capitalize bg-gradient-to-r ${policy.highlights[2].color} bg-clip-text text-transparent`}>{policy.highlights[2].text}</span> by collecting the user's financial entries!
                                                    </>
                                                ) : (
                                                    policy.description
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info Grid */}
                    <div className="grid md:grid-cols-3 gap-6 pt-8">
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 text-center hover:border-cyan-500/40 transition-all duration-300">
                            <div className="text-3xl mb-3">🛡️</div>
                            <h4 className="text-cyan-400 font-bold text-lg mb-2">Secure Processing</h4>
                            <p className="text-gray-400 text-sm">All data processing happens securely</p>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 text-center hover:border-blue-500/40 transition-all duration-300">
                            <div className="text-3xl mb-3">⚡</div>
                            <h4 className="text-blue-400 font-bold text-lg mb-2">Real-time Analysis</h4>
                            <p className="text-gray-400 text-sm">Instant predictions with ML models</p>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-sm border border-sky-500/20 rounded-xl p-6 text-center hover:border-sky-500/40 transition-all duration-300">
                            <div className="text-3xl mb-3">✨</div>
                            <h4 className="text-sky-400 font-bold text-lg mb-2">No Data Storage</h4>
                            <p className="text-gray-400 text-sm">Completely stateless application</p>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="text-center pt-8">
                        <p className="text-gray-500 text-sm">
                            Have questions about our policy? Feel free to reach out to us.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Policy;