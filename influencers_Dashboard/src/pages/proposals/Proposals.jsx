import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner, Alert, Card, Button, ListGroup, Badge, Collapse, Container } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS for styling
import moment from 'moment';

function Proposals() {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCardId, setOpenCardId] = useState(null);

  const authToken = localStorage.getItem('token');

  // Function to fetch ONLY pending proposals
  const fetchPendingProposals = async () => {
    if (!authToken) {
      setError("You must be logged in to view proposals.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      };
      // This endpoint now explicitly returns ONLY PENDING proposals
      const response = await axios.get('https://promo-ke7k.onrender.com/api/proposals/received', config);
      setProposals(response.data);
    } catch (err) {
      console.error("Error fetching proposals:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Unauthorized. Please log in as an influencer.");
        toast.error("Unauthorized. Please log in.");
      } else {
        setError("Failed to load proposals. Please try again.");
        toast.error("Failed to load proposals.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProposals();
  }, [authToken]); // Re-fetch when auth token changes

  const handleAcceptProposal = async (proposalId) => {
    const newStatus = 'accepted';
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    };

    let loadingToastId = null;

    try {
      // 1. Show an initial "Accepting..." toast that won't auto-close
      loadingToastId = toast.info("Proposal Accepted", { autoClose: true, closeButton: true });

      const response = await axios.put(`https://promo-ke7k.onrender.com/api/proposals/${proposalId}/status`, { status: newStatus }, config);

      // If successful, remove the accepted proposal from the current list (frontend state)
      setProposals(prevProposals =>
        prevProposals.filter(p => p._id !== proposalId)
      );

      // 2. Update the existing toast to a success message
      // Ensure autoClose is set here for the final success message
      toast.update(loadingToastId, {
        render: `Proposal accepted successfully! It's now in your Projects tab.`,
        type: toast.TYPE.SUCCESS, // Change type to success
        autoClose: 3000,          // <-- ENSURE THIS IS A POSITIVE NUMBER (e.g., 3000ms = 3 seconds)
        closeButton: true,        // Add a close button
      });

    } catch (err) {
      console.error("Error accepting proposal:", err);
      // 3. If an error occurs, update the existing toast to an error message
      if (loadingToastId) {
        toast.update(loadingToastId, {
          render: err.response?.data?.message || "Failed to accept proposal. Please try again.",
          type: toast.TYPE.ERROR,
          autoClose: 3000, // Auto-close errors too
          closeButton: true,
        });
      } else {
        toast.error(err.response?.data?.message || "Failed to accept proposal. Please try again.");
      }
      fetchPendingProposals();
    }
  };

  const handleMarkCompleted = async (proposalId) => {
    const newStatus = 'completed';
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    };

    let loadingToastId = null;

    try {
      loadingToastId = toast.info("Marking proposal as completed...", { autoClose: false, closeButton: false });

      const response = await axios.put(`https://promo-ke7k.onrender.com/api/proposals/${proposalId}/status`, { status: newStatus }, config);

      setProposals(prevProposals =>
        prevProposals.filter(p => p._id !== proposalId)
      );

      toast.update(loadingToastId, {
        render: `Project marked as completed!`,
        type: toast.TYPE.SUCCESS,
        autoClose: 3000, // Auto-close
        closeButton: true,
      });

    } catch (err) {
      console.error("Error marking proposal as completed:", err);
      if (loadingToastId) {
        toast.update(loadingToastId, {
          render: err.response?.data?.message || "Failed to mark project as completed. Please try again.",
          type: toast.TYPE.ERROR,
          autoClose: 3000, // Auto-close errors
          closeButton: true,
        });
      } else {
        toast.error(err.response?.data?.message || "Failed to mark project as completed. Please try again.");
      }
      fetchPendingProposals();
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "pending": return "warning";
      case "accepted": return "success";
      case "completed": return "info";
      default: return "secondary";
    }
  };

  return (
    <Container className="my-4">
      {/* ToastContainer MUST be rendered somewhere in your app for toasts to show.
          For immediate demonstration, it's placed here.
          In a larger application, consider placing it in your App.js or a main layout component.
      */}
      <ToastContainer
        position="top-center" // Position at the top center of the display
        autoClose={3000}     // Default auto-close for all toasts unless overridden (3 seconds)
        hideProgressBar={false}
        newestOnTop={true}   // New toasts appear on top of old ones
        closeOnClick         // Close toast on click
        rtl={false}          // No right-to-left support
        pauseOnFocusLoss     // Pause autoClose when window loses focus
        draggable            // Allow dragging toasts
        pauseOnHover         // Pause autoClose when hovering over toast
      />
      
      <h1 className="display-4 text-center mb-4">Your Pending Proposals</h1>
      <p className="lead text-center">Review and accept collaboration proposals from businesses.</p>
      <hr className="mb-5" />

      {isLoading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading your proposals...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : proposals.length === 0 ? (
        <Alert variant="info" className="text-center">You don't have any pending proposals at the moment.</Alert>
      ) : (
        <div className="row g-4">
          {proposals.map((proposal) => (
            <div className="col-12" key={proposal._id}>
              <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                  <h5 className="mb-0">
                    <img
                      src={proposal.sender?.profilePicture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                      alt={proposal.sender?.name}
                      width={40}
                      height={40}
                      className="rounded-circle me-2"
                      style={{ objectFit: 'cover' }}
                    />
                    Proposal from: <strong>{proposal.sender?.companyName || proposal.sender?.name || 'Unknown Business'}</strong>
                  </h5>
                  <Badge bg={getStatusVariant(proposal.status)} className="p-2">
                    {proposal.status.toUpperCase()}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Card.Title className="mb-3">{proposal.campaignName}</Card.Title>
                  <Card.Text><strong>Budget:</strong> ${proposal.budget.toLocaleString()}</Card.Text>
                  <Card.Text><strong>Timeline:</strong> {moment(proposal.timeline.startDate).format('MMM Do,YYYY, h:mm a')} - {moment(proposal.timeline.endDate).format('MMM Do,YYYY, h:mm a')}</Card.Text>
                  <Button
                    onClick={() => setOpenCardId(openCardId === proposal._id ? null : proposal._id)}
                    aria-controls={`collapse-text-${proposal._id}`}
                    aria-expanded={openCardId === proposal._id}
                    variant="link"
                    className="p-0 mb-3"
                  >
                    {openCardId === proposal._id ? 'Hide Details' : 'View Details'}
                  </Button>
                  <Collapse in={openCardId === proposal._id}>
                    <div id={`collapse-text-${proposal._id}`}>
                      <hr />
                      <h6>Description:</h6>
                      <p>{proposal.description}</p>
                      <h6>Deliverables:</h6>
                      <ListGroup variant="flush">
                        {proposal.deliverables.length > 0 ? (
                          proposal.deliverables.map((item, idx) => (
                            <ListGroup.Item key={idx}>{item}</ListGroup.Item>
                          ))
                        ) : (
                          <ListGroup.Item className="text-muted">No specific deliverables listed.</ListGroup.Item>
                        )}
                      </ListGroup>
                      <p className="text-muted mt-3 mb-0">
                        Received: {moment(proposal.createdAt).format('MMMM Do,YYYY, h:mm a')}
                      </p>
                      {proposal.createdAt !== proposal.updatedAt && (
                        <p className="text-muted mb-0">
                          Last Updated: {moment(proposal.updatedAt).format('MMMM Do,YYYY, h:mm a')}
                        </p>
                      )}
                    </div>
                  </Collapse>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-end gap-2">
                  {/* Only show Accept button for pending proposals */}
                  {proposal.status === 'pending' && (
                    <Button variant="success" onClick={() => handleAcceptProposal(proposal._id)}>Accept Proposal</Button>
                  )}
                  {/* Keep "Mark as Completed" if you want it on this page for some reason,
                      but typically, it would be on the "Projects" page */}
                  {proposal.status === 'accepted' && (
                    <Button variant="info" onClick={() => handleMarkCompleted(proposal._id)}>Mark as Completed</Button>
                  )}
                  {proposal.status === 'completed' && (
                    <span className="text-muted fst-italic">
                      This project is Completed.
                    </span>
                  )}
                </Card.Footer>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

export default Proposals;
