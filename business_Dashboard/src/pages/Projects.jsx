import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner, Alert, Card, Container, Badge, Col, Row, Button, Modal, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import moment from 'moment';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null); // 'influencer' or 'business'

  // State for the project details modal
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null); // Stores the project data for the modal

  const authToken = localStorage.getItem('token');

  // Function to fetch active projects (status: 'accepted')
  const fetchActiveProjects = async () => {
    console.log("[ProjectsPage] useEffect triggered. AuthToken:", authToken ? "Exists" : "Missing");
    if (!authToken) {
      setError("You must be logged in to view projects.");
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
      console.log("[ProjectsPage] Sending request to /api/projects (fetching only 'accepted' projects)...");
      // THIS IS WHERE THE FILTERING HAPPENS ON THE BACKEND
      const response = await axios.get('https://promo-ke7k.onrender.com/api/projects', config); 
      console.log("[ProjectsPage] Response data received:", response.data);
      setProjects(response.data); // This will only contain 'accepted' projects from the backend

      try {
        const decodedToken = JSON.parse(atob(authToken.split('.')[1]));
        setCurrentUserRole(decodedToken.role);
        console.log("[ProjectsPage] Decoded User Role:", decodedToken.role);
      } catch (decodeError) {
        console.error("[ProjectsPage] Error decoding token:", decodeError);
        setCurrentUserRole(null);
      }

    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again.");
      toast.error("Failed to load projects.");
    } finally {
      setIsLoading(false);
      console.log("[ProjectsPage] isLoading set to false.");
    }
  };

  useEffect(() => {
    fetchActiveProjects();
  }, [authToken]);

  const getStatusVariant = (status) => {
    switch (status) {
      case "accepted": return "primary";
      case "completed": return "success"; // This case is relevant for the modal, but not for projects displayed here
      default: return "secondary";
    }
  };

  const handleShowDetails = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleCloseDetails = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  // Function to handle marking a project as completed (ONLY FOR INFLUENCERS)
  const handleMarkCompleted = async (projectId) => {
    if (currentUserRole !== 'influencer') {
      toast.error("Only influencers can mark projects as complete.");
      return;
    }

    try {
      const newStatus = 'completed';
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      };

      toast.info("Marking project as complete...");
      
      const response = await axios.put(`https://promo-ke7k.onrender.com/api/proposals/${projectId}/status`, { status: newStatus }, config);
      
      // THIS LINE REMOVES THE PROJECT FROM THE UI IMMEDIATELY AFTER COMPLETION
      setProjects(prevProjects => prevProjects.filter(p => p._id !== projectId)); 
      
      toast.success("Project marked as completed! It's now in your History tab.");
      
      if (selectedProject && selectedProject._id === projectId) {
        handleCloseDetails();
      }

    } catch (err) {
      console.error("Error marking project as completed:", err);
      toast.error("Failed to mark project as completed. Please try again.");
      fetchActiveProjects(); // Re-fetch in case of error to ensure UI consistency
    }
  };

  return (
    <Container className="my-4">
      <h1 className="display-4 text-center mb-4">Your Active Projects</h1>
      <p className="lead text-center">These are your currently active collaborations (accepted, but not yet completed).</p>
      <hr className="mb-5" />

      {isLoading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading your active projects...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : projects.length === 0 ? (
        <Alert variant="info" className="text-center">You don't have any active projects yet.</Alert>
      ) : (
        <Row className="g-4">
          {projects.map((project) => (
            <Col md={6} lg={4} key={project._id}>
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{project.campaignName}</h5>
                  <Badge bg={getStatusVariant(project.status)} className="p-2">
                    {project.status.toUpperCase()}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  {currentUserRole === 'influencer' ? (
                    <Card.Text>
                      <strong>Business:</strong>{' '}
                      {project.sender?.companyName || project.sender?.name || 'N/A'}
                      {project.sender?.profilePicture && (
                        <img
                          src={project.sender.profilePicture}
                          alt={project.sender.companyName || project.sender.name}
                          width={30}
                          height={30}
                          className="rounded-circle ms-2"
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </Card.Text>
                  ) : (
                    <Card.Text>
                      <strong>Influencer:</strong>{' '}
                      {project.receiver?.name || 'N/A'}
                      {project.receiver?.profilePicture && (
                        <img
                          src={project.receiver.profilePicture}
                          alt={project.receiver.name}
                          width={30}
                          height={30}
                          className="rounded-circle ms-2"
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </Card.Text>
                  )}
                  
                  <Card.Text><strong>Budget:</strong> ${project.budget.toLocaleString()}</Card.Text>
                  <Card.Text><strong>Timeline:</strong> {moment(project.timeline.startDate).format('MMM Do,YYYY')} - {moment(project.timeline.endDate).format('MMM Do,YYYY')}</Card.Text>
                  <Card.Text className="text-muted">
                    Accepted On: {moment(project.updatedAt).format('MMMM Do,YYYY, h:mm a')}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-end gap-2">
                  <Button variant="outline-primary" size="sm" onClick={() => handleShowDetails(project)}>
                    View Details
                  </Button>
                  {/* Mark as Completed button, visible only to influencer for accepted projects */}
                  {currentUserRole === 'influencer' && project.status === 'accepted' && (
                    <Button variant="success" size="sm" onClick={() => handleMarkCompleted(project._id)}>
                      Mark as Completed
                    </Button>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Project Details Modal */}
      <Modal show={showModal} onHide={handleCloseDetails} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Project Details: {selectedProject?.campaignName || "Project Details"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProject ? (
            <Container fluid>
              <Row>
                <Col md={6}>
                  <h5>Description</h5>
                  <p>{selectedProject.description}</p>
                  <hr/>
                  <h5>Budget</h5>
                  <p>${selectedProject.budget?.toLocaleString()}</p>
                  <hr/>
                  <h5>Timeline</h5>
                  <p>
                    {moment(selectedProject.timeline?.startDate).format('MMMM Do,YYYY')} - 
                    {moment(selectedProject.timeline?.endDate).format('MMMM Do,YYYY')}
                  </p>
                  <hr/>
                  <h5>Status</h5>
                  <Badge bg={getStatusVariant(selectedProject.status)} className="p-2">
                    {selectedProject.status?.toUpperCase()}
                  </Badge>
                </Col>
                <Col md={6}>
                  <h5>Deliverables</h5>
                  <ListGroup variant="flush">
                    {selectedProject.deliverables?.length > 0 ? (
                      selectedProject.deliverables.map((item, idx) => (
                        <ListGroup.Item key={idx}>{item}</ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item className="text-muted">No specific deliverables listed.</ListGroup.Item>
                    )}
                  </ListGroup>
                  <hr/>
                  <h5>
                    {currentUserRole === 'influencer' ? 'Business Partner' : 'Influencer Partner'}
                  </h5>
                  <div className="d-flex align-items-center">
                    <img
                      src={
                        (currentUserRole === 'influencer' ? selectedProject.sender?.profilePicture : selectedProject.receiver?.profilePicture) || 
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                      }
                      alt={
                        (currentUserRole === 'influencer' ? selectedProject.sender?.companyName || selectedProject.sender?.name : selectedProject.receiver?.name) || 'Profile'
                      }
                      width={60}
                      height={60}
                      className="rounded-circle me-3"
                      style={{ objectFit: 'cover' }}
                    />
                    <div>
                      <h6>
                        {currentUserRole === 'influencer' ? 
                          (selectedProject.sender?.companyName || selectedProject.sender?.name || 'N/A') : 
                          (selectedProject.receiver?.name || 'N/A')
                        }
                      </h6>
                      <p className="text-muted mb-0">
                        {currentUserRole === 'influencer' ? selectedProject.sender?.email : selectedProject.receiver?.email}
                      </p>
                      {currentUserRole === 'influencer' ? (
                          selectedProject.sender?.bio && <p className="text-muted mb-0">{selectedProject.sender.bio}</p>
                      ) : (
                          selectedProject.receiver?.bio && <p className="text-muted mb-0">{selectedProject.receiver.bio}</p>
                      )}
                      {currentUserRole === 'influencer' && selectedProject.sender?.companyName && (
                        <p className="text-muted mb-0">Company: {selectedProject.sender.companyName}</p>
                      )}
                      {currentUserRole === 'business' && selectedProject.receiver?.socialMedia && (
                        <div className="mt-2">
                            <h6>Social Media:</h6>
                            {selectedProject.receiver.socialMedia.map((sm, index) => (
                                <p key={index} className="mb-0 text-muted">
                                    {sm.platform}: <a href={sm.url} target="_blank" rel="noopener noreferrer">{sm.url}</a> ({sm.niche?.join(', ')})
                                </p>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
              <Row className="mt-4">
                <Col>
                  <p className="text-muted mb-0">
                    Created On: {moment(selectedProject.createdAt).format('MMMM Do,YYYY, h:mm a')}
                  </p>
                  <p className="text-muted mb-0">
                    Last Updated: {moment(selectedProject.updatedAt).format('MMMM Do,YYYY, h:mm a')}
                  </p>
                </Col>
              </Row>
            </Container>
          ) : (
            <Alert variant="info">No project details available.</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetails}>
            Close
          </Button>
          {selectedProject?.status === 'accepted' && currentUserRole === 'influencer' && (
            <Button variant="success" onClick={() => handleMarkCompleted(selectedProject._id)}>
              Mark as Completed
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ProjectsPage;
