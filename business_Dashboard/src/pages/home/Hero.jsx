import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Spinner, Card } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Style.css";

import ProposalForm from "../ProposalForm";

function Home() {
  // Initialize state from localStorage or default values
  const [selectedIcons, setSelectedIcons] = useState(() => {
    try {
      const storedIcons = localStorage.getItem("selectedIcons");
      return storedIcons ? JSON.parse(storedIcons) : [];
    } catch (error) {
      console.error("Failed to parse selectedIcons from localStorage", error);
      return [];
    }
  });
  const [selectedNiches, setSelectedNiches] = useState(() => {
    try {
      const storedNiches = localStorage.getItem("selectedNiches");
      return storedNiches ? JSON.parse(storedNiches) : [];
    } catch (error) {
      console.error("Failed to parse selectedNiches from localStorage", error);
      return [];
    }
  });
  const [influencers, setInfluencers] = useState(() => {
    try {
      const storedInfluencers = localStorage.getItem("searchResults");
      return storedInfluencers ? JSON.parse(storedInfluencers) : [];
    } catch (error) {
      console.error("Failed to parse searchResults from localStorage", error);
      return [];
    }
  });
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserFavorites, setCurrentUserFavorites] = useState([]);
  const [connections, setConnections] = useState([]);

  // --- Handlers for Modals ---
  const handleShowProposal = (influencer) => {
    setSelectedInfluencer(influencer);
    setShowProposalModal(true);
  };

  const handleCloseProposal = () => {
    setShowProposalModal(false);
    setSelectedInfluencer(null);
  };

  const handleCloseDetailsModal = () => {
    setSelectedInfluencer(null);
  };

  const getAuthHeaders = () => {
    return {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };
  };

  // Effect to fetch user's favorites and connections on component mount
  useEffect(() => {
    const fetchFavoritesAndConnections = async () => {
      try {
        const res = await axios.get(
          "https://promo-ke7k.onrender.com/api/me",
          getAuthHeaders()
        );
        setCurrentUserFavorites(res.data.favorites || []);
        setConnections(res.data.connections || []);
      } catch (err) {
        console.error("Error loading user data:", err);
        toast.error("Failed to load user favorites/connections.");
      }
    };

    if (localStorage.getItem("token")) {
      fetchFavoritesAndConnections();
    }
  }, []);

  // Effect to trigger search when selected platforms or niches change
  // Also persists filters to localStorage
  useEffect(() => {
    localStorage.setItem("selectedIcons", JSON.stringify(selectedIcons));
    localStorage.setItem("selectedNiches", JSON.stringify(selectedNiches));

    if (selectedIcons.length > 0 || selectedNiches.length > 0) {
      handleSearch();
    } else {
      setInfluencers([]); // Clear influencers if no filters are selected
      localStorage.removeItem("searchResults"); // Clear stored results
    }
    setCurrentPage(1); // Reset to first page on filter change
  }, [selectedIcons, selectedNiches]);

  // Data for social platforms and content niches
  const socialPlatforms = [
    { name: "Facebook", iconClass: "fa-brands fa-facebook" },
    { name: "YouTube", iconClass: "fa-brands fa-youtube" },
    { name: "Instagram", iconClass: "fa-brands fa-instagram" },
    { name: "TikTok", iconClass: "fa-brands fa-tiktok" },
    { name: "Twitter", iconClass: "fa-brands fa-square-x-twitter" },
    { name: "LinkedIn", iconClass: "fa-brands fa-linkedin" },
    { name: "Snapchat", iconClass: "fa-brands fa-snapchat" },
  ];

  const contentNiches = [
    "Gaming", "Beauty & Fashion", "Food & Cooking", "Travel",
    "Fitness & Health", "Education & Tutorials", "Personal Finance & Investing",
    "Comedy & Entertainment", "Vlogging & Daily Life", "Arts & Crafts / DIY",
  ];

  // Handles clicking on social platform icons
  const handleIconClick = (iconName) => {
    setSelectedIcons((prev) =>
      prev.includes(iconName)
        ? prev.filter((name) => name !== iconName)
        : [...prev, iconName]
    );
  };

  // Handles clicking on niche items
  const handleNicheItemClick = (nicheName) => {
    setSelectedNiches((prev) =>
      prev.includes(nicheName)
        ? prev.filter((niche) => niche !== nicheName)
        : [...prev, nicheName]
    );
  };

  // Fetches influencers based on selected filters
  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post("https://promo-ke7k.onrender.com/influencers", {
        selectedPlatforms: selectedIcons,
        selectedNiches,
      });

      const fetched = res.data.map((inf) => ({
        ...inf,
        isFavorited: currentUserFavorites.includes(inf._id),
        isConnected: connections.includes(inf._id),
      }));

      setInfluencers(fetched);
      localStorage.setItem("searchResults", JSON.stringify(fetched)); // Persist search results

      if (fetched.length === 0) {
        toast.info("No influencers found matching your criteria.");
      }
    } catch (err) {
      setError("Failed to fetch influencers. Please try again.");
      toast.error("Failed to fetch influencers.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggles an influencer's favorite status
  const toggleFavorite = async (id) => {
    try {
      await axios.post(
        "https://promo-ke7k.onrender.com/api/favorite",
        { influencerId: id },
        getAuthHeaders()
      );
      // Update local state immediately
      const updatedFavorites = currentUserFavorites.includes(id)
        ? currentUserFavorites.filter((f) => f !== id)
        : [...currentUserFavorites, id];
      setCurrentUserFavorites(updatedFavorites);

      // Also update the isFavorited status directly in the displayed influencers list
      setInfluencers((prevInfluencers) =>
        prevInfluencers.map((inf) =>
          inf._id === id ? { ...inf, isFavorited: !inf.isFavorited } : inf
        )
      );

      toast.success(
        currentUserFavorites.includes(id) // Check based on *previous* state for toast message
          ? "Influencer unfavorited!"
          : "Influencer favorited!"
      );
    } catch (e) {
      console.error("Error toggling favorite:", e);
      toast.error("Error toggling favorite.");
    }
  };

  // --- Handles sending a connection request (Solved for single toast) ---
  const handleConnect = async (id) => {
    // Check if already connected or connection pending
    if (connections.includes(id)) {
      toast.info("Already connected  influencer.");
      return; // Exit the function if already connected/pending
    }

    try {
      const response = await axios.post(
        "https://promo-ke7k.onrender.com/api/connect",
        { influencerId: id },
        getAuthHeaders()
      );

      // Assuming a successful connection (new or existing) results in status 200
      if (response.status === 200) {
        // Only update state and show success toast if it's a *new* connection
        // The previous `if (!prevConnections.includes(id))` check inside `setConnections`
        // was a bit redundant and led to confusion with two toasts.
        // Now, we check *before* the API call.
        setConnections((prevConnections) => [...prevConnections, id]);
        setInfluencers((prevInfluencers) =>
          prevInfluencers.map((inf) =>
            inf._id === id ? { ...inf, isConnected: true } : inf
          )
        );
        toast.success("Connection successful");
      } else {
        // Fallback for non-200 responses that are not errors, if your backend sends them
        toast.info(response.data.message || "Connection status updated.");
      }
    } catch (e) {
      console.error("Error connecting:", e);
      // Display specific error message from backend if available
      toast.error(e.response?.data?.message || "Error sending connection request.");
    }
  };

  // Sends the proposal data to the backend
  const sendProposalToBackend = async (influencerId, proposalFormData) => {
    try {
      await axios.post(
        "https://promo-ke7k.onrender.com/api/proposals",
        {
          receiver: influencerId,
          campaignName: proposalFormData.campaignName,
          description: proposalFormData.description,
          budget: proposalFormData.budget,
          deliverables: proposalFormData.deliverables,
          timeline: proposalFormData.timeline,
        },
        getAuthHeaders()
      );
      toast.success("Proposal sent successfully!");
      handleCloseProposal();
    } catch (e) {
      console.error("Failed to send proposal:", e);
      toast.error("Failed to send proposal. Please try again.");
      throw e;
    }
  };

  // Pagination logic
  const current = influencers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(influencers.length / itemsPerPage);

  return (
    <div className="container py-4">
      {/* --- ToastContainer for top-center notifications --- */}
      <ToastContainer
        position="top-center" // Changed to top-center
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true} // Newest toasts appear on top
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* --- End ToastContainer --- */}

      <h2 className="text-center">Find Influencers</h2>
      <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">
        {socialPlatforms.map((p) => (
          <div
            key={p.name}
            className={`btn btn-outline-primary ${
              selectedIcons.includes(p.name) ? "active" : ""
            }`}
            onClick={() => handleIconClick(p.name)}
          >
            <i className={p.iconClass}></i> {p.name}
          </div>
        ))}
      </div>

      <div className="row mt-4">
        {/* Niche Selection Box */}
        <div className="col-md-4">
          <Card className="shadow-sm mb-3">
            <Card.Header as="h5">Select Niches:</Card.Header>
            <Card.Body>
              {contentNiches.map((niche) => (
                <div
                  key={niche}
                  className={`btn btn-sm me-2 mb-2 ${
                    selectedNiches.includes(niche)
                      ? "btn-success"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => handleNicheItemClick(niche)}
                >
                  {niche}
                </div>
              ))}
            </Card.Body>
          </Card>
        </div>

        {/* Influencer Results Box */}
        <div className="col-md-8">
          <Card className="shadow-sm">
            <Card.Header as="h5">
              Influencer Results{" "}
              {influencers.length > 0 && (
                <span className="badge bg-primary ms-2">
                  {influencers.length} found
                </span>
              )}
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading influencers...</span>
                  </Spinner>
                  <p className="mt-2">Loading influencers...</p>
                </div>
              ) : error ? (
                <p className="text-danger">{error}</p>
              ) : influencers.length === 0 && (selectedIcons.length > 0 || selectedNiches.length > 0) ? (
                <p className="text-info">No influencers found for the selected criteria.</p>
              ) : influencers.length === 0 ? (
                <p className="text-muted">Select social media platforms or niches to find influencers.</p>
              ) : (
                current.map((inf) => (
                  <div key={inf._id} className="card mb-3 shadow-sm">
                    <div className="card-body d-flex align-items-center">
                      <img
                        src={inf.profilePicture || "https://via.placeholder.com/80x80?text=No+Image"}
                        alt={inf.name}
                        width={80}
                        height={80}
                        className="rounded-circle me-3"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <h5 className="mb-1">{inf.name}</h5>
                        <p className="text-muted mb-1">
                          <strong>Bio:</strong> {inf.bio || "No bio available."}
                        </p>
                        <p className="mb-2">
                          <strong>Niches:</strong>{" "}
                          {inf.socialMedia?.flatMap((sm) => sm.niche || []).filter((v, i, a) => a.indexOf(v) === i).join(", ") || "N/A"}
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className={`btn btn-sm ${
                              inf.isFavorited ? "btn-danger" : "btn-outline-danger"
                            }`}
                            onClick={() => toggleFavorite(inf._id)}
                          >
                            <i
                              className={
                                inf.isFavorited ? "fa-solid fa-heart" : "fa-regular fa-heart"
                              }
                            ></i>{" "}
                            {inf.isFavorited ? "Unfavorite" : "Favorite"}
                          </button>
                          <button
                            className={`btn btn-sm ${
                              inf.isConnected ? "btn-success" : "btn-outline-success"
                            }`}
                            onClick={() => handleConnect(inf._id)}
                            disabled={inf.isConnected}
                          >
                            {inf.isConnected ? "Connected" : "Connect"}
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleShowProposal(inf)}
                            title="Send Proposal"
                          >
                            Send Proposal
                          </button>
                          <button
                            className="btn btn-link btn-sm"
                            onClick={() => setSelectedInfluencer(inf)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    {[...Array(totalPages).keys()].map((n) => (
                      <li
                        className={`page-item ${
                          currentPage === n + 1 ? "active" : ""
                        }`}
                        key={n}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(n + 1)}
                        >
                          {n + 1}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Basic Influencer Details Modal */}
      <Modal
        show={!!selectedInfluencer && !showProposalModal}
        onHide={handleCloseDetailsModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedInfluencer?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <img
              src={selectedInfluencer?.profilePicture || "https://via.placeholder.com/100x100?text=No+Image"}
              alt={selectedInfluencer?.name}
              className="rounded-circle"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
          </div>
          <p>
            <strong>Email:</strong> {selectedInfluencer?.email || "N/A"}
          </p>
          <p>
            <strong>Bio:</strong> {selectedInfluencer?.bio || "No bio available."}
          </p>
          <p>
            <strong>Socials:</strong>
          </p>
          <ul>
            {selectedInfluencer?.socialMedia && selectedInfluencer.socialMedia.length > 0 ? (
              selectedInfluencer.socialMedia.map((s, i) => (
                <li key={i}>
                  <strong>{s.platform}:</strong>{" "}
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.url}
                  </a>
                  {s.niche && s.niche.length > 0 && (
                    <span className="ms-2 text-muted">({s.niche.join(', ')})</span>
                  )}
                </li>
              ))
            ) : (
              <li>No social media profiles available.</li>
            )}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseDetailsModal}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Proposal Form Modal */}
      <Modal
        show={showProposalModal}
        onHide={handleCloseProposal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Send Proposal to {selectedInfluencer?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInfluencer && (
            <ProposalForm
              influencer={selectedInfluencer}
              onSendProposal={sendProposalToBackend}
              onClose={handleCloseProposal}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Home;
