import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner, Alert, Card, Container, Badge, Col, Row, Button, Modal, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import moment from 'moment';

function HistoryPage() {
  const [historyProjects, setHistoryProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // State for the modal (reused logic from ProjectsPage)
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const authToken = localStorage.getItem('token');

  // Function to fetch completed projects from the /api/history endpoint
  const fetchHistoryProjects = async () => {
    if (!authToken) {
      setError("You must be logged in to view history.");
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
      console.log("[HistoryPage] Sending request to /api/history...");
      // This endpoint specifically fetches projects with status 'completed'
      const response = await axios.get('https://promo-ke7k.onrender.com/api/history', config);
      console.log("[HistoryPage] Response data received:", response.data);
      setHistoryProjects(response.data);
      
      try {
        const decodedToken = JSON.parse(atob(authToken.split('.')[1]));
        setCurrentUserRole(decodedToken.role);
      } catch (decodeError) {
        console.error("[HistoryPage] Error decoding token:", decodeError);
        setCurrentUserRole(null);
      }

    } catch (err) {
      console.error("Error fetching history projects:", err);
      setError("Failed to load project history. Please try again.");
      toast.error("Failed to load project history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryProjects();
  }, [authToken]);

  const getStatusVariant = (status) => {
    // For history, status should always be 'completed', but this function is general
    return status === "completed" ? "success" : "secondary";
  };

  const handleShowDetails = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleCloseDetails = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  return (
    <Container className="my-4">
      <h1 className="display-4 text-center mb-4">Your Project History</h1>
      <p className="lead text-center">These are your completed collaboration projects.</p>
      <hr className="mb-5" />

      {isLoading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading your project history...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : historyProjects.length === 0 ? (
        <Alert variant="info" className="text-center">You don't have any completed projects yet.</Alert>
      ) : (
        <Row className="g-4">
          {historyProjects.map((project) => (
            <Col md={6} lg={4} key={project._id}>
              <Card className="h-100 shadow-sm">
                <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center"> {/* Changed header color to match 'completed' status */}
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
                    Completed On: {moment(project.updatedAt).format('MMMM Do,YYYY, h:mm a')} {/* Text changed to Completed On */}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-end">
                  <Button variant="outline-success" size="sm" onClick={() => handleShowDetails(project)}> {/* Button variant changed */}
                    View Details
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Project Details Modal (reused from ProjectsPage) */}
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
          {/* Note: No "Mark as Completed" button here, as this is the history page */}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default HistoryPage;
