import React, { useEffect , useMemo } from 'react';
import { motion, useAnimation }  from "framer-motion";



const About: React.FC = () => {

    const control1 = useAnimation();
    const control2 = useAnimation();

    

    const containerprops : any = useMemo(() =>({ 
        hidden : {opacity: 0, x :-20},
        visible : {opacity:1 , x : 0, transition : {duration:0.5, staggerChildren : 0.6}}
    }),[]);

    const paraprops : any = useMemo(() => ({hidden: {opacity: 0 , x: 10},
        visible: {opacity :1 , x : 0 , transition : {duration: 0.6}}
    }), []);

    
    

    useEffect(() => { 

        const sequence = async() =>{
            await control1.start("visible");
            await new Promise((res)=> {setTimeout(res,1000)});
            await control2.start("visible");
        };

        sequence();

    }, [control1, control2]);
    

    return( 
        
        <div className="min-w-screen min-h-screen flex flex-col md:flex-row gap-6 items-center justify-center bg-gradient-to-br from-sky-950 to-blue-350">
            <motion.div className="max-w-4xl mx-auto px-6 py-12 text-gray-200 font-sans leading-relaxed" variants={containerprops} initial ="hidden" animate={control1}>
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
            </motion.div>
        </div>
        
    )

};

export default About;