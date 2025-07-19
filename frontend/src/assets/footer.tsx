import React ,{useEffect, useMemo } from 'react';
// Importing icons from react-icons
import { motion, useAnimation } from 'framer-motion';
import { FaGithub,  FaEnvelope } from 'react-icons/fa';

const Footer: React.FC = () => {
 
    const socialLinks = [
        {
            name: 'GitHub',
            icon: <FaGithub />,
            url: 'https://github.com/Ajitkumar-1001' 
        },
        
    ];

    const control1 = useAnimation(); 

    const scaleup : any = useMemo(() => ({
        hidden: {scale : 0.95},
        
        hover : {scale: 1.4,
        y: -5,
       
        transition: {
            duration: 1.3,
            ease: "easeInOut",
            delay: 0.15 
        }
  },

}), []);

    useEffect(() => {
        control1.start("hover");
    }, [control1]);


    const email = "sachinajitkumarpr@gmail.com";

    return (
        <footer className="bg-gradient-to-t from-sky-950 to-gray-900 text-gray-300 py-6 shadow-inner mt-auto">

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    
                    {/* Left Side: Creator Info */}
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold">
                            Designed & Built by 
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent"> Ajitkumar</span>
                        </h1>
                        <p className="text-gray-400 mt-2">A Future Machine Learning / AI engineer! Turning AI into hands on Projects!</p>
                    </div>

                   
                    <div className="flex items-center space-x-6">
                        {socialLinks.map((link) => (
                            <motion.a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.name}
                                className="text-white hover:text-cyan-400 transition-colors duration-300 text-5xl"
                                variants={scaleup}
                                initial = "hidden"
                                 
                                whileHover = {control1}
                            >
                                {link.icon}
                            </motion.a>
                        ))}
                     
                        <motion.a
                            href={`mailto:${email}`}
                            aria-label="Email"
                            className="text-white hover:text-cyan-400 transition-colors duration-300 text-5xl"
                            variants={scaleup}
                            initial = "hidden"
                            whileHover={control1}
                        >
                            <FaEnvelope />
                        </motion.a>
                    </div>

                </div>

         
                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-500">
                    <p className="text-sm">
                        &copy; {new Date().getFullYear()} Ajitkumar. All Rights Reserved.
                    </p>
                    <p className="text-xs mt-1">
                        Licensed under the MIT License.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;