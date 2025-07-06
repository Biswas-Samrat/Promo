import React from "react";

function Hero() { 
  return (
    <div className="container-fluid">
      <div
        className="row d-flex justify-content-center align-items-center" 
        style={{
          height: "22rem",
          backgroundColor: "rgb(85, 9, 217)",
        }}
      >
        <div className="col-12 text-center" style={{ color: "white" }}>

          <h1 style={{ fontSize: "3rem", marginTop: "1rem" }}> 
            Connecting Brands and Influencers
          </h1>
          <p className="fs-5 mb-0 mt-3"> 
            “We’re here to make partnerships simple, effective, and rewarding”
          </p>
        
          <div className="d-flex justify-content-center">
            <hr
              style={{
                width: "35rem", 
                borderTop: "2px solid white", 
                opacity: "1",

              }}
              className="my-0 mt-1" 
            />
            
          </div>
       
        </div>
      </div>
    </div>
  );
}

export default Hero;