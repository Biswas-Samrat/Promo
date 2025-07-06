import React, { useState, useEffect, useRef } from "react";
import "./Style.css";

function Hero() {
  const videoRef = useRef(null); 
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTextFading, setIsTextFading] = useState(false);

  
  const videoTextContent = [
    {
      time: 0, 
      header: "Ignite the journey together",
      subheading: "Kickstart your path to success with tailored resources for business and influence",
    },
    {
      time: 4, 
      header: "Empower Your Success: Build, Connect, Influence",
      subheading: "Join a vibrant community of entrepreneurs and influencers for collaboration",
    },
    {
      time: 8, 
      header: "Join the Community",
      subheading: "Sign up today to access free resources",
    },
  ];


  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const currentTime = videoElement.currentTime;

      const newTextIndex = videoTextContent.findIndex((content, index) => {
       
        return currentTime >= content.time &&
               (index === videoTextContent.length - 1 || currentTime < videoTextContent[index + 1].time);
      });

      if (newTextIndex !== -1 && newTextIndex !== currentTextIndex) {

        setIsTextFading(true); 

        setTimeout(() => {
          setCurrentTextIndex(newTextIndex);
          setIsTextFading(false); 
        }, 500); 
      }
    };

   
    videoElement.addEventListener("timeupdate", handleTimeUpdate);




    

    
    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [currentTextIndex, videoTextContent]); 


  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.loop = true;
      videoElement.muted = true; 
      videoElement.play().catch(error => console.error("Video auto-play failed:", error)); 
    }
  }, []); 

  const currentHeaderText = videoTextContent[currentTextIndex].header;
  const currentSubheadingText = videoTextContent[currentTextIndex].subheading;

  return (
    <div className="outer-div">
      <div className="inner-div">
        <video
          ref={videoRef}
          src="/video/1.mp4"
          autoPlay
          muted
          loop
          playsInline 
          
        ></video>

        <div className={`text-overlay ${isTextFading ? "fade-out-text" : "fade-in-text"}`}>
          <h1 className="hero-heading">{currentHeaderText}</h1>
          <p className="hero-subheading">{currentSubheadingText}</p>
        </div>

        
        <button className="cta-button">Learn More</button>
      </div>
    </div>
  );
}

export default Hero;
