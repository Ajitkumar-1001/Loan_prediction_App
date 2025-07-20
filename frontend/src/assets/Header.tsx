import React from "react";
import { useNavigate } from "react-router-dom";
import Loginsymbol from "./Login";
import {useRole} from "../../context/RoleContext";


const Header: React.FC = () => {
  const navigate = useNavigate();
  const {role} = useRole();

 


  return (
    <header className="bg-gradient-to-t from-sky-950 to-gray-900 text-gray-300 py-6 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        
        <h3 onClick={() => navigate("/")}
        className="text-2xl font-extrabold font-sans bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
          SmartLoanPredictor
        </h3>

        {/* Right: Nav Items */}
        <ul className="flex space-x-8">
          <li
            onClick={() => navigate("/about")}
            className="text-xl font-extrabold font-sans bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent cursor-pointer hover:underline"
          >
            About
          </li>
          {(role === "user" ||role === "admin") && (
          <li
            onClick={() => navigate("/predict")}
            className="text-xl font-extrabold font-sans bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent cursor-pointer hover:underline"
          >
            Predictor
          </li>)
}
          <li onClick ={() => navigate("/login")}
            className="bg-gradient-to-r from-cyan-400 to-blue-600 cursor-pointer animate-transition-scale-1.5">
            <Loginsymbol  className="w-6 h-6 border border-rounded "/>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
