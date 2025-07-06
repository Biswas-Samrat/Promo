import React from "react";
import image1 from "../../../public/img/image (1).jpg";
import image2 from "../../../public/img/image (2).jpg";
import image3 from "../../../public/img/image (3).jpg";
import image4 from "../../../public/img/image (4).jpg";

// Import your CSS file
import './Section.css'; 

function Section() {
  return (
    <div className="custom-container"> 

     
      <div className="custom-row">
        <div className="custom-col-left"> 
          <h1>Discover Your Ideal Partner</h1>
          <p>
            Our smart matching algorithm connects brands with influencers based
            on audience, niche, and goals. Filter by platform, budget, or
            engagement to find the perfect fit for your campaign.
          </p>
        </div>
        <div className="custom-col-right"> 
          <img
            src={image1}
            alt="Illustration of discovering ideal partners"
            className="responsive-image"
          />
        </div>
      </div>

 
      <div className="custom-row reverse-on-desktop"> 
        <div className="custom-col-left">
          <h1>Create and Manage Campaigns Effortlessly</h1>
          <p>
            Build campaigns, set budgets, and track progress in one place.
            Communicate directly with your partner and monitor real-time results
            to ensure success.
          </p>
        </div>
        <div className="custom-col-right">
          <img
            src={image2}
            alt="Illustration of creating and managing campaigns"
            className="responsive-image"
          />
        </div>
      </div>


      <div className="custom-row">
        <div className="custom-col-left">
          <h1>Product Promotion & Seamless Invoice Management</h1>
          <p>
            From Strategic Partnerships to Prompt Invoice Processing: Empowering Businesses in the Creator Economy.
          </p>
        </div>
        <div className="custom-col-right">
          <img
            src={image3}
            alt="Illustration of product promotion and invoice management"
            className="responsive-image"
          />
        </div>
      </div>

  
      <div className="custom-row reverse-on-desktop">
        <div className="custom-col-left">
          <h1>Reach Out to Influence, Your First Message Matters</h1>
          <p>
            Crafting the Perfect Pitch: Connecting with Influencers in Satkhira for Authentic Product Promotion.
          </p>
        </div>
        <div className="custom-col-right">
          <img
            src={image4}
            alt="Illustration of sending a first message to an influencer"
            className="responsive-image"
          />
        </div>
      </div>

    </div>
  );
}

export default Section;
