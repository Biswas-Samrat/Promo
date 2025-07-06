import React from "react";
import "./Features.css";

function body() {
  return (
    <div className="container">
      <div className="row mt-5 mb-5">
        <div className="col-md-6 px-4 px-md-5">
          <h3 className="text-center text-md-start mb-3 h4">
            Star-Based Search
          </h3>
          <p className="text-center text-md-start lead">
            Business owners can filter influencers by star ratings, niche, and
            audience size to find the perfect match.
            <br className="d-none d-md-block" />
          </p>
          <p>Saves time and ensures quality partnerships.</p>
          <div className="photo" >
        

          </div>
        </div>

        <div className="col-md-6 px-4 px-md-5">
          <h3 className="text-center text-md-start mb-3 h4">
            Direct Messaging
          </h3>
          <p className="text-center text-md-start lead">
            Communicate in real-time with potential partners to discuss
            campaigns and ideas.
            <br className="d-none d-md-block" />
          </p>
          <p>Streamlines communication without leaving the platform.</p>
                    <div className="photo2" >
        

          </div>
        </div>

        <div className="col-md-6 px-4 px-md-5 mt-5">
          <h3 className="text-center text-md-start mb-3 h4">
            Proposal & Invoice System
          </h3>
          <p className="text-center text-md-start lead">
            Send professional proposals and invoices to finalize deals quickly
            and securely.
            <br className="d-none d-md-block" />
          </p>
          <p>Simplifies the business side of collaborations.</p>
                    <div className="photo3" >
        

          </div>
        </div>

        <div className="col-md-6 px-4 px-md-5 mt-5">
          <h3 className="text-center text-md-start mb-3 h4">Mutual Reviews</h3>
          <p className="text-center text-md-start lead">
            After a project, both parties can leave star ratings and reviews to
            build trust and credibility
            <br className="d-none d-md-block" />
          </p>
          <p>Enhances transparency and helps users stand out.</p>
                    <div className="photo4" >
        

          </div>
        </div>
      </div>
      <hr className="mb-5"></hr>
    </div>
  );
}

export default body;
