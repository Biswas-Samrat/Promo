// src/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MessageModal from "../../components/MessageModal"; // Import the MessageModal

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'danger'
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleMessageClose = () => {
    setShowMessageModal(false);
    setMessage("");
    setMessageType("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setShowMessageModal(false);
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login", // Backend login URL
        formData // Send email and password
      );

      // Handle successful login
      setMessage(response.data.message || "Login successful!");
      setMessageType("success");
      setShowMessageModal(true);

      // Store the JWT token
      localStorage.setItem("token", response.data.token);
      console.log("Login successful! Token:", response.data.token);

      // Navigate based on role after a short delay for message visibility
      setTimeout(() => {
        if (response.data.user.role === "business") {
           const token = response.data.token;
             window.location.href = `http://localhost:5174/dashboard?token=${token}`
        } else {
           const token = response.data.token;
          window.location.href = `http://localhost:5175/Proposals?token=${token}`;
        }
      }, 1500); // Give user time to see success message

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
      setMessage(errorMessage);
      setMessageType("danger");
      setShowMessageModal(true);
      console.error("Login error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>
              {/* Message Modal */}
              <MessageModal
                show={showMessageModal}
                message={message}
                type={messageType}
                onClose={handleMessageClose}
              />
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>{" "}
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
