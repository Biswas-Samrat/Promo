import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const Hero = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: 'Business',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {

      console.log('Form submitted:', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', userType: 'Business', message: '' });
      setErrors({});
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <div className="font-sans">


     
      <section className="py-5 bg-light"> 
        <div className="container px-4"> 
          <h1 className="display-4 text-center text-dark mb-4">Get in Touch with Promo</h1>
          <p className="lead text-center text-secondary mb-5">Have questions? We’re here to help you succeed.</p> 

        
          <div className="card shadow-lg mx-auto" style={{ maxWidth: '500px' }}> 
            <div className="card-body p-4"> 
            {submitted && (
              <div className="alert alert-success mb-4" role="alert"> 
                Thank you for your message! We’ll get back to you soon.
              </div>
            )}
            <form onSubmit={handleSubmit}>
           
              <div className="mb-3"> 
                <label htmlFor="name" className="form-label text-dark">Name</label> 
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Enter your name"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>} 
              </div>

    
              <div className="mb-3">
                <label htmlFor="email" className="form-label text-dark">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

     
              <div className="mb-3">
                <label htmlFor="userType" className="form-label text-dark">I am a...</label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="form-select" 
                >
                  <option value="Business">Business Owner</option>
                  <option value="Influencer">Influencer</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="message" className="form-label text-dark">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                  rows="5"
                  placeholder="Tell us how we can help"
                ></textarea>
                {errors.message && <div className="invalid-feedback">{errors.message}</div>}
              </div>


              <button
                type="submit"
                className="btn btn-primary w-100" 
              >
                Send Message
              </button>
            </form>
            </div>
          </div>

       
          <div className="mt-5 text-center"> 
            <h2 className="h3 text-dark mb-3">Other Ways to Reach Us</h2> 
            <p className="lead text-secondary mb-2">Email: <a href="mailto:support@promoapp.com" className="text-primary">support@promoapp.com</a></p> 
            <p className="lead text-secondary mb-2">Phone: <a href="tel:+18007766627" className="text-primary">+1-800-PROMO-APP</a></p>
            <div className="d-flex justify-content-center space-x-4 mt-4"> 
              <a href="" className="text-primary me-3">Twitter</a> 
              <a href="" className="text-primary me-3">Instagram</a>
              <a href="" className="text-primary">LinkedIn</a>
            </div>
          </div>

          
          <div className="mt-5 text-center">
            <h2 className="h3 text-dark mb-3">Ready to Join Promo?</h2>
            <div className="d-flex justify-content-center gap-3"> 
              <Link to="/Join" className="btn btn-primary rounded-pill px-4 py-2">Create Account</Link> 

            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Hero;