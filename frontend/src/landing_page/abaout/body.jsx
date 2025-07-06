import React from "react";

function Body() {
  return (
    <div
      className="container-fluid py-5" // Added py-5 for vertical padding
      style={{ backgroundColor: "rgba(250, 243, 226, 0.86)", minHeight: "100vh" }} // Changed height to minHeight
    >
      <div className="row">
        <h1 className="text-center mt-3 mb-5 display-4">Why Promo?</h1> {/* Adjusted margin-top and font size */}

        <div className="col-md-6 border-end px-4 px-md-5 mb-5 mb-md-0"> {/* Adjusted padding and margin for small screens */}
          <h3 className="text-center text-md-end mb-3 h4">For Businesses</h3> {/* Aligned text differently on small vs. medium screens, adjusted font size */}
          <p className="text-center text-md-end lead"> {/* Aligned text differently on small vs. medium screens, used lead for larger text */}
            Find influencers who match your brand’s <br className="d-none d-md-block" /> vision with our star-based
            search and build campaigns that deliver results.
          </p>
        </div>

        <div className="col-md-6 px-4 px-md-5">
          <h3 className="text-center text-md-start mb-3 h4">For Influencers</h3> 
          <p className="text-center text-md-start lead"> 
            Showcase your reach, connect with businesses, and monetize your <br className="d-none d-md-block" />
            influence with ease.
          </p>
        </div>

        <div className="col-12 mt-5"> 
          <p className="text-center px-3 px-md-5 lead"> 
            Promo empowers business owners and influencers to form meaningful collaborations that drive growth and visibility.
            Highlight ease of use, transparency (via reviews), and a focus on results-driven partnerships.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Body;