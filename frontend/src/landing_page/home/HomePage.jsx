import React from "react";
import Hero from "./Hero";      
import Contant from "./content"; 
import Section from "./section"; 
import Photo from "./Photo";    


function HomePage() {
  return (
    <div>
      <Hero />
      <Contant />
      <Section />
      <Photo />
    </div>
  );
}

export default HomePage;
