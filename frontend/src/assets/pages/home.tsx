import React , {useEffect, useMemo} from "react";
import {motion, useAnimation} from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRole } from '../../../context/RoleContext';

const Home: React.FC =()=>{ 

    const control1 = useAnimation();
    const control2 = useAnimation();
    const nav = useNavigate();
    const {role} = useRole();

    const containerprops : any = useMemo(() =>({ 
        hidden : {opacity: 0, x :-20},
        visible : {opacity:1 , x : 0, transition : {duration:0.5, staggerChildren : 0.6}}
    }),[]);

    const paraprops : any = useMemo(() => ({hidden: {opacity: 0 , x: 10},
        visible: {opacity :1 , x : 0 , transition : {duration: 0.6 }}
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
        <div  className="min-w-screen min-h-screen flex flex-col md:flex-row gap-6 p-5 items-top bg-gradient-to-br from-sky-950 to-blue-350 space-y-10">
        <motion.div className="max-w-4xl m-10 mx-auto px-6 py-12 text-gray-200 font-sans mt-50 leading-relaxed" variants={containerprops} initial ="hidden" animate={control1}>
                <motion.h2 className="text-4xl font-bold mb-6 text-center text-blue-400" variants={paraprops} >Hey ! Welcome to the SmartLoanPredictor app</motion.h2>

                <motion.p className="font-bold text-xl mb-4" variants={paraprops} >
                    I am pleased to welcome you to explore my work !, please feel free to ping me regarding any discussions and ideas to improve this project ! down below in the footer !! <br></br>
                 </motion.p>
                 <motion.p className="font-bold text-xl mb-4 m-15" variants={paraprops} >
                    Please visit{" "}
                    <span
                        onClick={() => nav("/about")}
                        className="text-2xl font-extrabold text-center mb-8 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent cursor-pointer"
                    >
                        About
                    </span>{" "}
                    to Know the Tech Stack and about the project in detail. <br />
                 </motion.p>
                 <motion.p className="font-bold text-xl mb-4 m-15" variants={paraprops} >
                    Please visit{" "}
                    <span
                        onClick={() => {if(role==="guest"){nav("/login")}else{
                            nav("/predict")
                        }}}
                        className="text-2xl font-extrabold text-center mb-8 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent cursor-pointer"
                    >
                        Predictor
                    </span>{" "}
                    to Know your credit eligibility!. <br />
                 </motion.p>
                </motion.div>
        </div>
    );
};

export default Home;