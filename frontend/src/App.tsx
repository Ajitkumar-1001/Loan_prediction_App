import { Routes, Route } from "react-router-dom";

import Header from "./assets/components/Header";
import Footer from "./assets/components/footer";
import About from "./assets/pages/About";
import Predict from "./assets/pages/Predict";
import Home from "./assets/pages/home";
import {useRole} from "../context/RoleContext";
import LoginPage from "./assets/pages/Loginpage";
import Signup from "./assets/pages/Signup";

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
