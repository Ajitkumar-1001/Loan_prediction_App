import React from "react";

interface loggprop { 
    className ? : string;
    onclick? : () => void;
};

const Logoutsymbol: React.FC<loggprop> = ({className, onclick}) => { 

    return(
        
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} onClick = {onclick}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3-3l3-3m0 0l-3-3m3 3H3" />
    </svg>
          );
    
};

export default Logoutsymbol;


