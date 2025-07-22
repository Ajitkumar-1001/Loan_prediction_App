import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {  motion, useAnimation } from "framer-motion";
import { useRole } from "../../../context/RoleContext";



interface signupprops {
  firstname: string,
  middlename: string,
  lastname: string,
  email: string,
  password: string,
  confirm_password: string
}

interface SignupResult {
  firstname: string,
  middlename?: string | null,
  lastname: string,
  email: string,
  isAdmin: boolean,
  role?: string
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<signupprops>({
    firstname: "",
    middlename: "",
    lastname: "",
    email: "",
    password: "",
    confirm_password: ""
  });

  const [error, setError] = useState<string>("");
  const { setRole } = useRole();
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const navigator = useNavigate();
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const formref = useRef<HTMLFormElement>(null);
  const fieldRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const control1 = useAnimation();
  const control2 = useAnimation();
  const control3 = useAnimation();
  const location = useLocation();

  useEffect(() => {
    const sequence = async () => {
      if (location.pathname === "/signup") {
        await control1.start("visible");
        await new Promise((res) => setTimeout(res, 100));
        await control2.start("visible");
        await new Promise((res) => setTimeout(res, 50));
        await control3.start("visible");
        await new Promise((res) => setTimeout(res, 50));
      }
    };
    sequence();
  }, [location.pathname]);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.0, ease: 'easeOut', staggerChildren: 0.2 }
    }
  }), []);

  const headingvariant = useMemo(() => ({
    hidden: { opacity: 0, x: 50, y: 50 },
    visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    hover: { scale: 1.25, textShadow: '5px 5px 5px rgba(0,0,0,0.2)' }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, x: 5, y: 10 },
    visible: { opacity: 1, x: 0, y: 0, transition: { duration: 1.0, ease: 'easeOut', staggerchildren: 0.1 } }
  }), []);

  const buttonVariants = useMemo(() => ({
    hover: { scale: 1.05, boxShadow: '5px 5px 5px rgba(0,0,0,0.2)' },
    tap: { scale: 0.95 },
  }), []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setError("");

    if (!formData.firstname.trim() || !formData.lastname.trim() || !formData.email.trim() || !formData.password || !formData.confirm_password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Signup failed. Please try again.");
      }

      const data: SignupResult = await response.json();

      if (data.role == "user" || data.role == "admin") {
        setRole(data.role);
      } else {
        throw new Error("User role is missing in response.");
      }

      setRedirecting(true);
      setTimeout(() => navigator("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Signup failed.");
    }
  };

  const shakeField = (ref: HTMLInputElement | null) => {
    if (ref) {
      ref.style.animation = "shake 0.3s ease-in-out";
      setTimeout(() => {
        ref.style.animation = "";
      }, 400);
    }
  };

  useEffect(() => {
    if (!hasSubmitted) return;
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "middlename") return;
      const ref = fieldRefs.current[key];
      if (!ref) return;
      const isEmpty = !value.trim();
      if (isEmpty) {
        ref.classList.add("border-red-500");
        ref.classList.remove("border-green-500");
        shakeField(ref);
      } else {
        ref.classList.remove("border-red-500");
        ref.classList.add("border-green-500");
      }
    });
  }, [formData, hasSubmitted]);

  useEffect(() => {
    if (!hasSubmitted) return;
    const isPasswordEmpty = !formData.password.trim();
    const isConfirmEmpty = !formData.confirm_password.trim();
    const doPasswordsMatch = formData.password === formData.confirm_password;

    if (ref1.current) {
      if (isPasswordEmpty || !doPasswordsMatch) {
        ref1.current.style.animation = "shake 0.3s ease-in-out";
        ref1.current.classList.add("border-red-500");
        ref1.current.classList.remove("border-green-500");
      } else {
        ref1.current.classList.remove("border-red-500");
        ref1.current.classList.add("border-green-500");
      }
    }

    if (ref2.current) {
      if (isConfirmEmpty || !doPasswordsMatch) {
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
  }, [formData.password, formData.confirm_password, hasSubmitted]);

  useEffect(()=>{
     
  },[redirecting]);

  return (
    <div className='min-w-screen min-h-screen flex flex-col md:flex-row gap-6 items-center justify-center bg-gradient-to-br from-sky-950 to-blue-350'>
      <motion.div className="w-full max-w-md md:max-w-xl border-2 border-silver-500 rounded-2xl shadow-3xl bg-gradient-to-br from-sky-950 to-blue-350 hover:bg-gradient-to-t from-sky-950 to-gray-900 p-6 mx-auto mt-20 " variants={containerVariants as any} initial="hidden" animate ={control1} >
        <motion.h2 className='text-xl md:text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent' variants={headingvariant as any}>Sign up!</motion.h2>
        <form ref={formref} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(formData).map(([key, _value]) => (
            <motion.div key={key} variants={itemVariants as any}>
              <label htmlFor={key} className="block text-sm font-medium text-gray-300 mb-1">
                {key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/\b\w/g, (l) => l.toUpperCase())}
              </label>
              <input
                ref={(el) => {
                  if (key === "password") ref1.current = el;
                  else if (key === "confirm_password") ref2.current = el;
                  else fieldRefs.current[key] = el;
                }}
                type={key.toLowerCase().includes("password") ? "password" : key === "email" ? "email" : "text"}
                name={key}
                value={formData[key as keyof signupprops]}
                onChange={handleChange}
                placeholder={`Enter ${key}`}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition duration-200"
              />
            </motion.div>
          ))}
        </form>
        <motion.button
          type="submit"
          onClick={handleSubmit}
          className="flex flex-col justify-center items-center mx-auto w-40 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 mt-10"
          variants={buttonVariants as any}
          whileHover="hover"
          whileTap="tap"
          
        >
          Register
        </motion.button>
        {redirecting && (
                  <>
                      <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1, rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="flex justify-center mt-4"
                      >
                          <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                      </motion.div>

                      <p className='flex flex-col items-center justify-center text-sm font-sans text-center text-green-500 mt-2'>
                          .....Redirecting to Login
                      </p>
                  </>
              )}

        {error && <p className="text-red-500 font-medium text-sm mt-2 text-center px-2">{error}</p>}
      </motion.div>
    </div>
  );
};

export default Signup;


