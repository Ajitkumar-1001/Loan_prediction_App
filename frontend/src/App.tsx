import { Routes, Route } from "react-router-dom";

import Header from "./assets/Header";
import Footer from "./assets/footer";
import About from "./assets/About";
import Predict from "./assets/Predict";
import Home from "./assets/home";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path ="/" element ={<Home />} />
        <Route path="/about" element={<About />} />
      
        <Route path="/predict" element={<Predict />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
