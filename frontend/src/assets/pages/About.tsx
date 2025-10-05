import React, { useEffect, useMemo } from 'react';
import { motion, useAnimation } from "framer-motion";
import "../../index.css"
// import CardSwap from '../components/Cardswap';

const About: React.FC = () => {

    const control1 = useAnimation();
    const control2 = useAnimation();
    const control3 = useAnimation();
    const control4 = useAnimation();



    const containerprops: any = useMemo(() => ({
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, staggerChildren: 0.6 } }
    }), []);

    const paraprops: any = useMemo(() => ({
        hidden: { opacity: 0, x: 10 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
    }), []);




    useEffect(() => {

        const sequence = async () => {
            await control1.start("visible");
            await new Promise((res) => { setTimeout(res, 1000) });
            await control2.start("visible");
            await new Promise((res) => { setTimeout(res, 200) });
            await control3.start("visible");
            await new Promise((res) => { setTimeout(res, 300) });
            await control4.start("visible")
        };

        sequence();

    }, [control1, control2, control3, control4]);


    return (
        <main className="bg-gradient-to-br from-sky-950 to-sky-900">
        <div className="min-w-screen min-h-screen flex flex-col md:flex-row gap-6 items-center justify-center bg-gradient-to-br from-sky-950 to-sky-900">

            {/* Left side: Text */}
            <motion.div className="flex flex-col  items-start space-y-7 m-15 p-3 w-full md:w-1/2" variants={containerprops as any} initial="hidden" animate={control2}>
                <div className="max-w-4xl w-full bg-transparent m-3 p-3">
                    <motion.h1
                        className="text-7xl font-sans font-extrabold bg-gradient-to-tr from-cyan-400 via-white-300 to-blue-600 bg-clip-text text-transparent text-center  mb-6"
                        variants={paraprops as any}
                    >
                        SmartLoanPred
                    </motion.h1>

                    <motion.p
                        className="text-lg font-sans font-bold text-slate-200 leading-relaxed"
                        variants={paraprops as any}
                    >  Powered with 
                        <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent capitalize"> advanced Machine Learning</span>, SmartLoanPred analyzes your financial profile in real-time to forecast your <span className="text-amber-300 font-semibold">Loan Approval Rate</span> with confidence.
                        <br /><br />
                        Whether you're applying for a personal, home, or business loan, our model evaluates key indicators — <span className="text-emerald-400">income</span>, <span className="text-emerald-400">debt</span>, <span className="text-emerald-400">credit history</span>, and <span className="text-emerald-400">dependents</span> — to ensure fast, accurate, and bias-free predictions.
                        <br /><br />
                        With our built-in <span className='text-3xl font-bold bg-gradient-to-b from-blue-700  to-indigo-700 bg-clip-text text-transparent brightness-200'>Intelligence Assistant</span> You’ll also receive a personalized AI-generated report outlining your credit score, estimated approval rate, and tailored recommendations to help improve your <span className="text-amber-300">FICO score</span> and future loan eligibility.
                        <br /><br />
                        <span className="font-semibold text-white">With SmartLoanPred, experience clarity, trust, and speed — all in one smart click.</span>
                    </motion.p>
                </div>

            </motion.div>


            <motion.div className="flex justify-center items-center m-2 w-full md:w-1/2" variants={containerprops as any} initial="hidden" animate={control2}>
                <motion.div className="max-w-2xl w-full shadow-lg" variants={paraprops as any}>
                    <img src="../../about_image.png" className="w-full w-[60rem] h-[40rem] hover:scale-110 object-stretch rounded-xl shadow-lg" alt="SmartLoanPred Image" />
                </motion.div>
            </motion.div>
        </div>

        <div className=" relative min-h-screen flex flex-col md:flex-row gap-6 items-center justify-center bg-transparent">

           
            <motion.div className="flex flex-col  items-start space-y-7 m-15 p-3 w-full md:w-1/2" variants={containerprops as any} initial="hidden" animate={control2}>
                <div className="max-w-4xl w-full bg-transparent m-3 p-3">
                    <motion.h1
                        className="text-7xl font-sans font-extrabold bg-gradient-to-tr from-cyan-400 via-white-300 to-blue-600 bg-clip-text text-transparent text-center  mb-6"
                        variants={paraprops as any}
                    >
                        Smart Assistant 

                    </motion.h1>

                    <motion.p
                        className="text-lg font-sans font-bold text-slate-200 leading-relaxed"
                        variants={paraprops as any}
                    >  This version comes with a smart assistant 
                        <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent capitalize"> with AI optimized with RAG </span>, can helps and assist you in the regard of the bank loan approval and financial wealth <span className="text-amber-300 font-semibold">Loan Approval Rate</span> with confidence.
                        <br /><br />
                        Our assistant is a smart and banking knowledge based model that can help with your queries on  — <span className="text-emerald-400">income</span>, <span className="text-emerald-400">debt</span>, <span className="text-emerald-400">credit history</span>, and even with your <span className="text-emerald-400">CIBIL score</span> — to ensure you have a secure future with higher chances for loans .
                        <br /><br />
                       
                    </motion.p>
                </div>

            </motion.div>


            <motion.div className="flex justify-center items-center m-2 w-full md:w-1/2" variants={containerprops as any} initial="hidden" animate={control2}>
                <motion.div className="max-w-2xl w-full shadow-lg" variants={paraprops as any}>
                    <img src="../../about_image_2.png" className="w-full w-[60rem] h-[40rem] hover:scale-110 object-stretch rounded-xl shadow-lg border-2 border-cyan-200" alt="SmartLoanPred Image" />
                </motion.div>
            </motion.div>
        </div>
        
        </main>

    )

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