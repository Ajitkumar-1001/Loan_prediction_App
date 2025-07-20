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
       
       
        transition: {
            duration: 1.3,
            ease: "easeInOut",
           
        }
  },

}), []);

    useEffect(() => {
        control1.start("hover");
    }, [control1]);


    const email = "sachinajitkumarpr@gmail.com";

    return (
        <footer className="bg-gradient-to-t from-sky-950 to-gray-900 text-gray-300 py-12 shadow-outer mt-auto text-sm">
        <div className=" max-w-10rem mx-auto px-6 gap-5">
          <div className="flex flex-col md:flex-row justify-evenly items-center md:items-start gap-5">
            
            {/* Left: Personal Info */}
            <div className="text-left md:text-left max-w-md">
              <h1 className="text-sm md:text-sm font-extrabold  text-white">
                Designed & Built by
                <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent ml-2">
                  Ajitkumar
                </span>
              </h1>
              <p className="text-gray-400 mt-3 text-sm md:text-base">
                A Future Machine Learning / AI engineer! Turning AI into hands-on Projects!
              </p>
            </div>
      
            {/* Right: Social Links */}
            <div className="flex2 flex-row items-center md:items-end space-y-3">
              <h2 className="text-white text-xl md:text-2xl font-bold">Connect with me:</h2>
              <div className="flex flex-rowjustify-self-end items-center gap-6">
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.name}
                    className="text-white hover:text-cyan-400 transition-colors duration-300 text-4xl"
                    variants={scaleup}
                    initial="hidden"
                    whileHover={control1}
                  >
                    {link.icon}
                  </motion.a>
                ))}
                <motion.a
                  href={`mailto:${email}`}
                  aria-label="Email"
                  className="text-white hover:text-cyan-400 transition-colors duration-300 text-4xl"
                  variants={scaleup}
                  initial="hidden"
                  whileHover={control1}
                >
                  <FaEnvelope />
                </motion.a>
              </div>
            </div>
      
          </div>
      
          {/* Footer Bottom */}
          <div className="fixed-bottom mt-10 pt-6 border-t border-gray-700 text-center text-gray-500">
            <p className="text-sm">&copy; {new Date().getFullYear()} Ajitkumar. All Rights Reserved.</p>
            <p className="text-xs mt-1">Licensed under the MIT License.</p>
          </div>
        </div>
      </footer>
      
    );
};

export default Footer;