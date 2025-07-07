import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Spinner, Alert, Col, Row, Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify'; // Import toast for notifications

// --- Proposal Details Modal Component ---
function ProposalDetailsModal({ show, onClose, proposal }) {
  if (!proposal) {
    return null; // Don't render if no proposal is selected
  }

  // Helper function to format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Proposal Details: {proposal.campaignName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={4} className="text-center">
            <img
              src={proposal.receiver?.profilePicture || "https://via.placeholder.com/150x150?text=No+Image"}
              alt={proposal.receiver?.name || "Influencer"}
              className="rounded-circle mb-2"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
            />
            <h5>{proposal.receiver?.name || "Unknown Influencer"}</h5>
            {proposal.receiver?.email && <p className="text-muted">{proposal.receiver.email}</p>}
          </Col>
          <Col md={8}>
            <p><strong>Campaign Name:</strong> {proposal.campaignName}</p>
            <p><strong>Description:</strong> {proposal.description}</p>
            <p><strong>Budget:</strong> ${proposal.budget.toLocaleString()}</p>
            <p><strong>Status:</strong> <span className={`badge bg-${
              proposal.status === 'accepted' ? 'success' :
              proposal.status === 'rejected' ? 'danger' :
              proposal.status === 'completed' ? 'info' : 'warning'
            }`}>{proposal.status.toUpperCase()}</span></p>
            <p><strong>Timeline:</strong> {formatDate(proposal.timeline.startDate)} to {formatDate(proposal.timeline.endDate)}</p>
            <p><strong>Sent On:</strong> {formatDate(proposal.createdAt)}</p>
          </Col>
        </Row>

        <h6 className="mt-3">Deliverables:</h6>
        {proposal.deliverables && proposal.deliverables.length > 0 ? (
          <ul>
            {proposal.deliverables.map((deliverable, index) => (
              <li key={index}>{deliverable}</li>
            ))}
          </ul>
        ) : (
          <p>No specific deliverables listed.</p>
        )}

        {proposal.receiver?.socialMedia && proposal.receiver.socialMedia.length > 0 && (
          <>
            <h6 className="mt-3">Influencer's Social Media:</h6>
            <ul className="list-unstyled">
              {proposal.receiver.socialMedia.map((social, index) => (
                <li key={social._id || index} className="mb-1">
                  <strong>{social.platform}:</strong>{" "}
                  <a href={social.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    {social.url}
                  </a>
                  {social.niche && social.niche.length > 0 && (
                    <span className="ms-2 text-muted">({social.niche.join(', ')})</span>
                  )}
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


// --- Main Proposal Component ---
function Proposal() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);


  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const fetchSentProposals = async () => {
    setLoading(true);
    setError(""); // Clear previous errors
    try {
      const res = await axios.get(
        "https://promo-ke7k.onrender.com/api/proposals/sent",
        getAuthHeaders()
      );
      setProposals(res.data.proposals || []);
      toast.success("Sent proposals loaded successfully!");
    } catch (err) {
      console.error("Failed to load sent proposals:", err);
      setError("Unable to fetch sent proposals. Please try again.");
      toast.error("Failed to load sent proposals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentProposals();
  }, []); // Run once on component mount

  const handleShowDetails = (proposal) => {
    setSelectedProposal(proposal);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedProposal(null);
    setShowDetailsModal(false);
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Your Sent Proposals</h2>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading proposals...</span>
          </Spinner>
          <p className="mt-2">Loading your sent proposals...</p>
        </div>
      )}

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      {!loading && !error && proposals.length === 0 ? (
        <Alert variant="info" className="text-center">
          You haven't sent any proposals yet.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4"> {/* Responsive grid */}
          {proposals.map((proposal) => (
            <Col key={proposal._id}>
              <Card className="h-100 shadow-sm">
                <Card.Header className="d-flex align-items-center">
                  <img
                    src={proposal.receiver?.profilePicture || "https://via.placeholder.com/50x50?text=No+Image"}
                    alt={proposal.receiver?.name || "Influencer"}
                    className="rounded-circle me-3"
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                  <div>
                    <Card.Title className="mb-0">
                      Proposal to: {proposal.receiver?.name || "Unknown Influencer"}
                    </Card.Title>
                    <Card.Subtitle className="text-muted small">
                      {proposal.receiver?.email || "No Email"}
                    </Card.Subtitle>
                  </div>
                </Card.Header>
                <Card.Body className="d-flex flex-column">
                  <h6 className="card-subtitle mb-2 text-primary">{proposal.campaignName}</h6>
                  <p className="card-text mb-1">
                    <strong>Budget:</strong> ${proposal.budget.toLocaleString()}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Status:</strong>{" "}
                    <span className={`badge bg-${
                      proposal.status === 'accepted' ? 'success' :
                      proposal.status === 'rejected' ? 'danger' :
                      proposal.status === 'completed' ? 'info' : 'warning'
                    }`}>
                      {proposal.status.toUpperCase()}
                    </span>
                  </p>
                  <p className="card-text mb-2">
                    <strong>Timeline:</strong> {formatDate(proposal.timeline.startDate)} - {formatDate(proposal.timeline.endDate)}
                  </p>
                  <div className="mt-auto d-flex justify-content-end">
                    <Button variant="outline-primary" size="sm" onClick={() => handleShowDetails(proposal)}>
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Proposal Details Modal */}
      <ProposalDetailsModal
        show={showDetailsModal}
        onClose={handleCloseDetails}
        proposal={selectedProposal}
      />
    </div>
  );
}

export default Proposal;
