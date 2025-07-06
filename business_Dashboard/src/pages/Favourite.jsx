import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProposalForm from "./ProposalForm";

function DetailsModal({ show, onClose, influencer }) {
  if (!influencer) {
    return null;
  }

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Influencer Details: {influencer.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-3">
          <img
            src={influencer.profilePicture}
            alt={influencer.name}
            className="rounded-circle mb-3"
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
          />
        </div>
        <p>
          <strong>Name:</strong> {influencer.name}
        </p>
        {influencer.email && (
          <p>
            <strong>Email:</strong> {influencer.email}
          </p>
        )}
        <p>
          <strong>Bio:</strong> {influencer.bio || "No bio available."}
        </p>

        {influencer.socialMedia && influencer.socialMedia.length > 0 && (
          <>
            <h6 className="mt-3">Niches:</h6>
            <p>
              {influencer.socialMedia
                .flatMap((s) => s.niche || [])
                .filter((value, index, self) => self.indexOf(value) === index)
                .join(", ") || "N/A"}
            </p>

            <h6 className="mt-3">Social Media Profiles:</h6>
            <ul className="list-unstyled">
              {influencer.socialMedia.map((social) => (
                <li key={social._id || social.platform} className="mb-2">
                  <strong>{social.platform}:</strong>{" "}
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.url}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// --- Proposal Modal Component ---
function ProposalModal({ show, onClose, influencer, onSendProposal }) {
  return (
    <Modal show={show} onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Send Proposal to {influencer?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProposalForm
          influencer={influencer}
          onClose={onClose}
          onSendProposal={onSendProposal}
        />
      </Modal.Body>
    </Modal>
  );
}

// --- Main Favourite Component ---
function Favourite() {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [connections, setConnections] = useState([]);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const fetchFavorites = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/favorites",
        getAuthHeaders()
      );
      setFavorites(res.data.favorites || []);
    } catch (err) {
      console.error("Failed to load favorites", err);
      setError("Unable to fetch favorites. Please try again later.");
      toast.error("Failed to load favorites.");
    }
  };

  // Fetch current user's connections on component mount
  useEffect(() => {
    const fetchUserConnections = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/me",
          getAuthHeaders()
        );
        setConnections(res.data.connections || []);
      } catch (err) {
        console.error("Error loading user connections:", err);
        toast.error("Failed to load connection status.");
      }
    };

    if (localStorage.getItem("token")) {
      fetchUserConnections();
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleUnfavorite = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/favorite/${id}`,
        getAuthHeaders()
      );
      setFavorites((prev) => prev.filter((inf) => inf._id !== id));
      toast.success("Influencer unfavorited successfully!");
    } catch (err) {
      console.error("Failed to unfavorite:", err);
      toast.error("Failed to unfavorite influencer.");
    }
  };

  const handleShowDetails = (influencer) => {
    setSelectedInfluencer(influencer);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedInfluencer(null);
    setShowDetailsModal(false);
  };

  const handleShowProposal = (influencer) => {
    setSelectedInfluencer(influencer);
    setShowProposalModal(true);
  };

  const handleCloseProposal = () => {
    setSelectedInfluencer(null);
    setShowProposalModal(false);
  };

  const sendProposalToBackend = async (influencerId, proposalFormData) => {
    try {
      await axios.post(
        "http://localhost:5000/api/proposals",
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
    }
  };

  const handleConnect = async (id) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/connect",
        { influencerId: id },
        getAuthHeaders()
      );

      if (response.status === 200) {
        // Only show "Connection successful" if it's a new connection client-side
        if (!connections.includes(id)) {
          setConnections((prevConnections) => [...prevConnections, id]);
          toast.success("Connection successful!");
        } else {
          // This message appears if the button wasn't disabled for some reason
          // or if the connection was made externally.
          toast.info("Already connected or pending connection with this influencer.");
        }
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

  return (
    <div className="container py-4">
      {/* ToastContainer configured for top-center position */}
      <ToastContainer
        position="top-center" // <-- Changed from "top-right" to "top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <h2 className="mb-4 text-center">Your Favorite Influencers</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          No favorite influencers found. Start adding some!
        </div>
      ) : (
        <div className="row mt-5">
          {favorites.map((inf) => (
            <div key={inf._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src={inf.profilePicture}
                  alt={inf.name}
                  className="card-img-top"
                  style={{ height: "150px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-primary mb-2">
                    Name: {inf.name}
                  </h5>
                  {inf.email && (
                    <p className="card-text mb-3">
                      <strong>Email:</strong> {inf.email}
                    </p>
                  )}

                  <div className="mt-auto d-flex justify-content-between align-items-center gap-2 ">
                    <button
                      className="btn "
                      onClick={() => handleUnfavorite(inf._id)}
                      title="Unfavorite"
                    >
                      <i
                        className="fa-solid fa-heart-circle-xmark fa-xl"
                        style={{ color: "red" }}
                      ></i>
                      <p style={{ fontSize: "10px" }}>Delete</p>
                    </button>

                    <button
                      className="btn "
                      onClick={() => handleShowProposal(inf)}
                      title="Send Proposal"
                    >
                      <i
                        className="fa-regular fa-paper-plane fa-lg"
                        style={{ color: "green" }}
                      ></i>
                      <p style={{ fontSize: "10px" }}>Send</p>
                    </button>

                    <button
                      className="btn "
                      onClick={() => handleConnect(inf._id)}
                      disabled={connections.includes(inf._id)}
                    >
                      <i
                        className="fa-solid fa-link"
                        style={{ color: "blue" }}
                      ></i>
                      <p style={{ fontSize: "10px" }}>
                        {connections.includes(inf._id) ? "Connected" : "Connect"}
                      </p>
                    </button>

                    <button
                      className="btn btn-link btn-sm flex-grow-1 text-decoration-none"
                      onClick={() => handleShowDetails(inf)}
                      title="View Details"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DetailsModal
        show={showDetailsModal}
        onClose={handleCloseDetails}
        influencer={selectedInfluencer}
      />

      {selectedInfluencer && (
        <ProposalModal
          show={showProposalModal}
          onClose={handleCloseProposal}
          influencer={selectedInfluencer}
          onSendProposal={sendProposalToBackend}
        />
      )}
    </div>
  );
}

export default Favourite;