import React from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();

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
          <li
            onClick={() => navigate("/predict")}
            className="text-xl font-extrabold font-sans bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent cursor-pointer hover:underline"
          >
            Predictor
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
