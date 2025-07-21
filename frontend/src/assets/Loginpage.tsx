import React, { useState, useMemo, useEffect, useRef } from "react";
import { useAnimation, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import Signup from "./Signup";

interface Loginprops {
  email: string;
  password: string;
}

interface Loginresult {
  accesstoken: string;
  bearer?: string;
  role?: string;
}

const LoginPage: React.FC = () => {
  const [formdata, setFormData] = useState<Loginprops>({ email: "", password: "" });
  const { setRole } = useRole();
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const control1 = useAnimation();
  const control2 = useAnimation();
  const location = useLocation();

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, x: 35 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeInOut" } },
    }),
    []
  );

  useEffect(() => {
    const sequence = async () => {
      if (location.pathname === "/login") {
        await control1.start("visible");
        await new Promise((res) => setTimeout(res, 1000));
        await control2.start("visible");
      }
    };
    sequence();
  }, [location.pathname]);

  useEffect(() => {
    if (!hasSubmitted) return;

    if (ref1.current) {
      if (!formdata.email) {
        ref1.current.style.animation = "shake 0.3s ease-in-out";
        ref1.current.classList.add("border-red-500");
        ref1.current.classList.remove("border-green-500");
      } else {
        ref1.current.classList.remove("border-red-500");
        ref1.current.classList.add("border-green-500");
      }
    }

    if (ref2.current) {
      if (!formdata.password) {
        ref2.current.style.animation = "shake 0.3s ease-in-out";
        ref2.current.classList.add("border-red-500");
        ref2.current.classList.remove("border-green-500");
      } else {
        ref2.current.classList.remove("border-red-500");
        ref2.current.classList.add("border-green-500");
      }
    }

    const clearAnimation = () => {
      if (ref1.current) ref1.current.style.animation = "";
      if (ref2.current) ref2.current.style.animation = "";
    };

    const timeout = setTimeout(clearAnimation, 500);
    return () => clearTimeout(timeout);
  }, [formdata.email, formdata.password, hasSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formdata),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid credentials. Please try again.");
      }

      const data: Loginresult = await response.json();

      if (data.role) {
        setRole(data.role);
      } else {
        throw new Error("User role is missing in response.");
      }

      setRedirecting(true);
      setTimeout(() => {
        navigate("/predict");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Login failed.");
    }
  };

  useEffect(()=>{
     
  },[redirecting])

  return (
    <div className="min-w-screen min-h-screen bg-gradient-to-br from-sky-950 to-blue-350 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md p-6 border rounded-2xl shadow-3xl bg-gradient-to-br from-sky-950 to-blue-350 hover:bg-gradient-to-t from-sky-950 to-gray-900"
        variants={containerVariants as any}
        initial="hidden"
        animate={control1}
      >
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center justify-center space-y-5"
        >
          <h1 className="text-4xl font-extrabold  bg-gradient-to-r from-cyan-400 to-blue-600 text-center bg-clip-text text-transparent hover:scale-110 transition">
            Login!
          </h1>

          <label className="text-xl font-bold text-white">Email Address</label>
          <input
            ref={ref1}
            type="email"
            name="email"
            value={formdata.email}
            onChange={(e) => setFormData({ ...formdata, email: e.target.value })}
            placeholder="Enter your email"
            className="w-72 sm:w-80 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />

          <label className="text-xl font-bold text-white">Password</label>
          <input
            ref={ref2}
            type="password"
            name="password"
            value={formdata.password}
            onChange={(e) => setFormData({ ...formdata, password: e.target.value })}
            placeholder="Enter your password"
            className="w-72 sm:w-80 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />
        <div className="flex md:flex-row flex-row space-evenly items-center justify-center space-x-4">
          <button
            type="submit"
            className="w-40 mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
          >
            Login
          </button>

          <button onClick={()=> {
           
            navigate("/signup")
          }}
            type="submit"
            className="w-40 mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
          >
            Sign up 
          </button>

          </div>
                  {redirecting && (
                      <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1, rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="flex justify-center mt-4"
                      >
                          <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                      </motion.div>
                  )}


          {error && (
            <p className="text-red-500 font-sans font-bold font-medium text-sm mt-2 text-center px-2">{error}</p>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
