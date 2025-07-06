import React from "react";
import "./Photo.css";

function Photo() {
  const aspectRatioBoxStyle = {
    position: "relative",
    width: "100%",
    height: "10rem",
    paddingBottom: "177.78%",
    overflow: "hidden",
    borderRadius: "2rem",
    objectFit: "cover",
    
    
  };

  return (
    <div className="container-fluid mb-5 Photo_filr_cntainer">
      <div className="row g-3 mt-5">
        <div className="col-3">
          <div style={aspectRatioBoxStyle} className="Photo_1 mt-5"></div>
        </div>
        <div className="col-3">
          <div style={aspectRatioBoxStyle} className="Photo_2 mt-5"></div>
        </div>
        <div className="col-3">
          <div style={aspectRatioBoxStyle} className="Photo_3 mt-5"></div>
        </div>
        <div className="col-3">
          <div style={aspectRatioBoxStyle} className="Photo_4 mt-5"></div>
        </div>

        <h1 className="text-center mt-5 text-center-photo">Find The Perfect Match For You</h1>
        
      </div>
    </div>
  );
}

export default Photo;
