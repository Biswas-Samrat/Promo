import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Keep this import
import MessageModal from "../../components/MessageModal.jsx";

function Join() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "business",
    bio: "",
    companyName: "",
    socialMedia: [{ platform: "", url: "", niche: [] }],
    profilePicture: null,
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'danger'
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const nicheOptions = [
    "Gaming",
    "Beauty & Fashion",
    "Food & Cooking",
    "Travel",
    "Fitness & Health",
    "Education & Tutorials",
    "Personal Finance & Investing",
    "Comedy & Entertainment",
    "Vlogging & Daily Life",
    "Arts & Crafts / DIY",
  ];

  const handleMessageClose = () => {
    setShowMessageModal(false);
    setMessage("");
    setMessageType("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSocialMediaChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedSocialMedia = [...formData.socialMedia];

    if (name === "niche") {
      const currentNiches = updatedSocialMedia[index].niche;
      if (checked) {
        updatedSocialMedia[index] = {
          ...updatedSocialMedia[index],
          niche: [...currentNiches, value],
        };
      } else {
        updatedSocialMedia[index] = {
          ...updatedSocialMedia[index],
          niche: currentNiches.filter((n) => n !== value),
        };
      }
    } else {
      updatedSocialMedia[index] = {
        ...updatedSocialMedia[index],
        [name]: value,
      };
    }
    setFormData({ ...formData, socialMedia: updatedSocialMedia });
  };

  const addSocialMedia = () => {
    setFormData({
      ...formData,
      socialMedia: [
        ...formData.socialMedia,
        { platform: "", url: "", niche: [] },
      ],
    });
  };

  const removeSocialMedia = (index) => {
    const updatedSocialMedia = formData.socialMedia.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, socialMedia: updatedSocialMedia });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setShowMessageModal(false);
    setIsLoading(true);

    // Frontend validation
    if (formData.role === "business" && !formData.companyName) {
      setMessage("Company name is required for businessmen.");
      setMessageType("danger");
      setShowMessageModal(true);
      setIsLoading(false);
      return;
    }

    if (formData.role === "influencer") {
      if (formData.socialMedia.some((sm) => !sm.platform || !sm.url)) {
        setMessage("All social media entries must have a platform and URL.");
        setMessageType("danger");
        setShowMessageModal(true);
        setIsLoading(false);
        return;
      }

      if (formData.socialMedia.some((sm) => sm.niche.length === 0)) {
        setMessage("Please select at least one niche for each social media entry.");
        setMessageType("danger");
        setShowMessageModal(true);
        setIsLoading(false);
        return;
      }
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", formData.role);
    data.append("bio", formData.bio);
    if (formData.profilePicture) {
      data.append("profilePicture", formData.profilePicture);
    }
    if (formData.role === "business") {
      data.append("companyName", formData.companyName);
    }
    if (formData.role === "influencer") {
      // Stringify the array of objects before appending
      data.append("socialMedia", JSON.stringify(formData.socialMedia));
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/register", // Backend signup URL
        data,
        {
          headers: { "Content-Type": "multipart/form-data" }, // Important for file uploads
        }
      );

      // Handle successful registration
      setMessage(response.data.message || "Registration successful!");
      setMessageType("success");
      setShowMessageModal(true);

      // Store the JWT token
      localStorage.setItem("token", response.data.token);
      console.log("Registration successful! Token:", response.data.token);

      // Navigate based on role using navigate from react-router-dom
      setTimeout(() => {
        if (response.data.user.role === "business") {
          // Use navigate directly, no token in URL
          navigate("/dashboard");
        } else {
          // Use navigate directly, no token in URL
          navigate("/Proposals");
        }
      }, 1500);

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      console.log(errorMessage)
      setMessage(errorMessage);
      setMessageType("danger");
      setShowMessageModal(true);
      console.error("Registration error:", err.response?.data || err.message);
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
              <h2 className="card-title text-center mb-4">Create Account</h2>
              {/* Message Modal */}
              <MessageModal
                show={showMessageModal}
                message={message}
                type={messageType}
                onClose={handleMessageClose}
              />
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
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
                <div className="mb-3">
                  <label className="form-label">Enter Your Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="business">Businessman</option>
                    <option value="influencer">Influencer</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Give a Short Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="form-control"
                  />
                </div>

                {formData.role === "business" && (
                  <div className="mb-3">
                    <label className="form-label">Your Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                )}

                {formData.role === "influencer" && (
                  <div className="mb-3">
                    <label className="form-label">Social Media</label>
                    {formData.socialMedia.map((sm, index) => (
                      <div key={index} className="mb-2 border p-3 rounded">
                        <select
                          name="platform"
                          value={sm.platform}
                          onChange={(e) => handleSocialMediaChange(index, e)}
                          className="form-select mb-2"
                          required
                        >
                          <option value="">Select Platform</option>
                          <option value="Facebook">Facebook</option>
                          <option value="YouTube">YouTube</option>
                          <option value="Instagram">Instagram</option>
                          <option value="TikTok">TikTok</option>
                          <option value="Twitter">Twitter</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Snapchat">Snapchat</option>
                        </select>
                        <input
                          type="text"
                          name="url"
                          value={sm.url}
                          onChange={(e) => handleSocialMediaChange(index, e)}
                          placeholder="Social Media URL"
                          className="form-control mb-2"
                          required
                        />

                        <label className="form-label mt-2">
                          Niche(s) (Select at least one)
                        </label>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {nicheOptions.map((option) => (
                            <div className="form-check" key={option}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`niche-${index}-${option}`}
                                name="niche"
                                value={option}
                                checked={sm.niche.includes(option)}
                                onChange={(e) =>
                                  handleSocialMediaChange(index, e)
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`niche-${index}-${option}`}
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>

                        {formData.socialMedia.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSocialMedia(index)}
                            className="btn btn-danger btn-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSocialMedia}
                      className="btn btn-primary mt-2"
                    >
                      Add Another Social Media
                    </button>
                  </div>
                )}

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
                      Registering...
                    </>
                  ) : (
                    "Register"
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

export default Join;
