import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./landing_Page/home/HomePage";
import Abaout from "./landing_Page/abaout/abaoutPage";
import Contact from "./landing_Page/contact/contactPage";
import Features from "./landing_Page/features/featurePage";
import JoinPage from "./landing_page/creatAccaount/Join"
import Login from "./landing_page/login/Login"
import Nav from "./landing_page/navbar"



createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <Nav />
    <Routes>
      <Route path="/" element={<HomePage />}></Route>
      <Route path="/Abaout" element={<Abaout />}></Route>
      <Route path="/Contact" element={<Contact />}></Route>
      <Route path="/Features" element={<Features />}></Route>
       <Route path="/JoinPage" element={<JoinPage />}></Route>
        <Route path="/Login" element={<Login />}></Route>
   
    </Routes>
  </BrowserRouter>
);
