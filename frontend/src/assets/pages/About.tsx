import React from 'react';
import { motion } from "framer-motion";
import "../../index.css"

const About: React.FC = () => {
    const features = [
        { label: "Income", color: "text-cyan-400" },
        { label: "Debt", color: "text-sky-400" },
        { label: "Credit History", color: "text-blue-400" },
        { label: "Dependents", color: "text-cyan-300" }
    ];

    const assistantFeatures = [
        { label: "Income", color: "text-cyan-400" },
        { label: "Debt", color: "text-sky-400" },
        { label: "Credit History", color: "text-blue-400" },
        { label: "FICO Score", color: "text-cyan-300" }
    ];

    return (
        <main className="min-h-screen  bg-gradient-to-br from-sky-950 to-sky-900 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Section 1: SmartLoanPred */}
            <section className="relative min-h-screen flex items-center py-20 px-6">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="inline-block"
                            >
                                <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/30 backdrop-blur-sm">
                                    <span className="text-cyan-400 font-semibold text-sm tracking-wider">INTELLIGENT PREDICTION</span>
                                </div>
                            </motion.div>

                            {/* Title */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="text-6xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-300 to-sky-500 bg-clip-text text-transparent leading-tight"
                            >
                                SmartLoanPred
                            </motion.h1>

                            {/* Description */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="space-y-4 text-gray-300 text-lg leading-relaxed"
                            >
                                <p>
                                    Powered with <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">advanced Machine Learning</span>, SmartLoanPred analyzes your financial profile in real-time to forecast your <span className="text-cyan-400 font-semibold">Loan Approval Rate</span> with confidence.
                                </p>

                                <p>
                                    Whether you're applying for a personal, home, or business loan, our model evaluates key indicators — {features.map((feature, idx) => (
                                        <span key={idx}>
                                            <span className={`${feature.color} font-semibold`}>{feature.label}</span>
                                            {idx < features.length - 1 ? ', ' : ' '}
                                        </span>
                                    ))}— to ensure fast, accurate, and bias-free predictions.
                                </p>

                                <p>
                                    With our built-in <span className='text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent'>Intelligence Assistant</span>, you'll also receive a personalized AI-generated report outlining your credit score, estimated approval rate, and tailored recommendations to help improve your <span className="text-cyan-400 font-semibold">FICO score</span> and future loan eligibility.
                                </p>

                                <p className="text-white font-semibold text-xl pt-4">
                                    Experience clarity, trust, and speed — all in one smart click.
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative group"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative bg-slate-900/50 p-2 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
                                <img
                                    src="../../about_image.png"
                                    className="w-full h-auto rounded-xl transform transition duration-500 group-hover:scale-[1.02]"
                                    alt="SmartLoanPred Dashboard"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-cyan-500/20"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-slate-950 px-6 py-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse"></div>
                    </span>
                </div>
            </div>

            {/* Section 2: Smart Assistant */}
            <section className="relative min-h-screen flex items-center py-20 px-6">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Image - Order First on Desktop */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative group order-2 md:order-1"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative bg-slate-900/50 p-2 rounded-2xl border border-blue-500/30 backdrop-blur-sm">
                                <img
                                    src="../../about_image_2.png"
                                    className="w-full h-auto rounded-xl transform transition duration-500 group-hover:scale-[1.02]"
                                    alt="Smart Assistant Interface"
                                />
                            </div>
                        </motion.div>

                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6 order-1 md:order-2"
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="inline-block"
                            >
                                <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-sky-500/20 rounded-full border border-blue-500/30 backdrop-blur-sm">
                                    <span className="text-blue-400 font-semibold text-sm tracking-wider">AI-POWERED ASSISTANT</span>
                                </div>
                            </motion.div>

                            {/* Title */}
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-500 bg-clip-text text-transparent leading-tight"
                            >
                                Smart Assistant
                            </motion.h2>

                            {/* Description */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="space-y-4 text-gray-300 text-lg leading-relaxed"
                            >
                                <p>
                                    This version comes with a smart assistant <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">with AI optimized with RAG</span>, designed to help and assist you with bank loan approval and financial wealth management with confidence.
                                </p>

                                <p>
                                    Our assistant is a smart, banking knowledge-based model that can help with your queries on {assistantFeatures.map((feature, idx) => (
                                        <span key={idx}>
                                            <span className={`${feature.color} font-semibold`}>{feature.label}</span>
                                            {idx < assistantFeatures.length - 1 ? ', ' : ' '}
                                        </span>
                                    ))}— ensuring you have a secure future with higher chances for loans.
                                </p>

                                {/* Feature Cards */}
                                <div className="grid grid-cols-2 gap-4 pt-6">
                                    <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-500/50 transition-all duration-300">
                                        {/* <div className="text-3xl mb-2">🤖</div> */}
                                        <h4 className="text-cyan-400 font-bold mb-1">RAG-Powered</h4>
                                        <p className="text-sm text-gray-400">Advanced retrieval augmented generation</p>
                                    </div>
                                    <div className="bg-slate-900/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300">
                                        {/* <div className="text-3xl mb-2">💡</div> */}
                                        <h4 className="text-blue-400 font-bold mb-1">Smart Insights</h4>
                                        <p className="text-sm text-gray-400">Personalized financial guidance</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Bottom Spacing */}
            <div className="h-20"></div>
        </main>
    );
};

export default About;





{/* <motion.div className="max-w-4xl mx-auto px-6 py-12 text-gray-200 font-sans leading-relaxed" variants={containerprops} initial ="hidden" animate={control1}>
                <motion.h2 className="mt-10 text-4xl font-bold mb-6 text-center text-blue-400" variants={paraprops} >About This Project</motion.h2>

                <motion.p className=" text-lg font-sans text-center mb-4" variants={paraprops} >
                    This Loan Prediction platform is a full-stack machine learning application designed to assess loan eligibility using modern predictive analytics and automated intelligence assistance.
                </motion.p>

                <motion.p className="text-lg font-sans text-center mb-4" variants={paraprops} >
                    Built with <span className="font-semibold text-blue-300">FastAPI</span> and <span className="font-semibold text-blue-300">React + TypeScript</span>, it integrates a trained machine learning model that evaluates key financial indicators—like risk score, income-to-debt ratio, and loan amount—to provide accurate predictions. The backend handles API requests, prediction logic, and LLM-generated explanations to ensure transparency and guidance.
                </motion.p>

                <motion.p className="text-lg font-sans text-center mb-4" variants={paraprops}>
                    The frontend ensures an intuitive and responsive user interface using <span className="font-semibold text-blue-300">Tailwind CSS</span> and animations via <span className="font-semibold text-blue-300">Framer Motion</span>. Results are not only data-driven but enriched with AI-generated feedback, helping users understand and improve their creditworthiness.
                </motion.p>

                <motion.h3 className="text-4xl font-bold text-center text-blue-400 mt-10 mb-3" variants={paraprops}>Behind the Project</motion.h3>

                <motion.p className="text-lg font-sans text-center mb-4" variants={paraprops}>
                    I'm <span className="font-bold text-blue-300">Ajitkumar</span>, a passionate Machine Learning & AI enthusiast. This project is a practical demonstration of my skills in predictive modeling, API design, full-stack deployment, and AI integration. My mission is to turn intelligent systems into real-world solutions that empower users and solve meaningful problems.
                </motion.p>

                <motion.p className="text-sm font-sans text-center font-bold " variants={paraprops} >
                    Thank you for exploring this app. Your feedback is always welcome and appreciated!
                </motion.p>
            </motion.div> */}