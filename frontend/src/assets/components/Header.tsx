import React from "react";
import { useNavigate } from "react-router-dom";
import Loginsymbol from "./Login";
import {useRole} from "../../../context/RoleContext";
import Logoutsymbol from "./Logout";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const {role} = useRole();
  const {logout} = useRole();

 


  return (
    <header className="z-50 min-w-screen fixed top-0 bg-gradient-to-t from-sky-950 to-gray-900 text-gray-300 py-6 shadow-inner">
      <div className="max-w-7xl w-full mx-auto px-6 flex items-center justify-between">
        
        
        <div onClick={() => navigate("/")}
        className="text-sm font-extrabold font-sans bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent cursor-pointer md:text-2xl hover:scale-110">
          <img src="../../logo.png" className="w-20 h-10 rounded-md"/>
        </div>

        {/* Right: Nav Items */}
        <ul className="flex space-x-8">
          <li
            onClick={() => navigate("/about")}
            className="text-sm font-extrabold font-sans bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent md:text-xl cursor-pointer hover:scale-110"
          >
            About
          </li>
          <li
            onClick={() => navigate("/policy")}
            className="text-sm font-extrabold font-sans bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent md:text-xl cursor-pointer hover:scale-110"
          >
            Policy
          </li>
          <li
            onClick={() => navigate("/versions")}
            className="text-sm font-extrabold font-sans bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent md:text-xl cursor-pointer hover:scale-110"
          >
            Versions
          </li>
         
          {(role === "user" || role ==="admin" ) && (
            <>
             <li
          onClick={() => navigate("/assistant")}
          className="text-sm font-extrabold font-sans md:text-xl bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent cursor-pointer hover:scale-110"
        >
          Assistant
        </li>
          <li
            onClick={() => navigate("/predict")}
            className="text-sm font-extrabold font-sans md:text-xl bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent cursor-pointer hover:scale-110"
          >
            Predictor
          </li>

         
        </>
        )
}        
          {(role ==="guest" ) && (
          <li onClick ={() => navigate("/login")}
            className="bg-gradient-to-r from-cyan-400 to-blue-600 cursor-pointer hover:scale-110">
            <Loginsymbol  className="w-6 h-6 border border-rounded "/>
          </li>)
        
} 
          {(role === "user" || role ==="admin") && (
            <li className="bg-gradient-to-r from-cyan-400 to-blue-600 cursor-pointer hover:scale-110">
            <Logoutsymbol  className="w-6 h-6 border border-rounded " onclick = {()=> { logout();
            navigate('/');
              
            }}/>
             
          </li>

          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
