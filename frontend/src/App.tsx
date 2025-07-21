import { Routes, Route } from "react-router-dom";

import Header from "./assets/Header";
import Footer from "./assets/footer";
import About from "./assets/About";
import Predict from "./assets/Predict";
import Home from "./assets/home";
import {useRole} from "../context/RoleContext";
import LoginPage from "./assets/Loginpage";
import Signup from "./assets/Signup";

function App() {
  const {role} = useRole();
  return (
    <>
      <Header />
      <Routes>
        <Route path ="/" element ={<Home />} />
        <Route path="/about" element={<About />} />
        { (role==="user" || role ==="admin") && (
        <Route path="/predict" element={<Predict />} /> )}
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/signup" element={<Signup/>} />

        
      </Routes>

      <Footer />
    </>
  );
}

export default App;
