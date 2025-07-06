import React, { useState } from "react";
import axios from "axios";
import { Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { toast } from 'react-toastify'; // Import toast for notifications

// This component will be rendered inside a Bootstrap Modal in Favourite.jsx
const ProposalForm = ({ influencer, onClose, onSendProposal }) => {
  // influencer: The full influencer object selected from Favourite.jsx
  // onClose: Function to close the modal (passed from Favourite.jsx)
  // onSendProposal: Function to handle the API call (passed from Favourite.jsx)

  const [formData, setFormData] = useState({
    campaignName: "",
    description: "",
    budget: "",
    deliverables: [""], // Start with one empty deliverable field
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);
  // error state for local form validation errors, not API errors (handled by toast)
  const [localError, setLocalError] = useState("");

  // Handler for all standard text/number inputs
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handler for deliverables array inputs
  const handleDeliverableChange = (index, value) => {
    const updatedDeliverables = [...formData.deliverables];
    updatedDeliverables[index] = value;
    setFormData((prev) => ({ ...prev, deliverables: updatedDeliverables }));
  };

  // Adds a new empty deliverable input field
  const addDeliverable = () => {
    setFormData((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, ""],
    }));
  };

  // Removes a deliverable input field
  const removeDeliverable = (index) => {
    const updatedDeliverables = [...formData.deliverables];
    updatedDeliverables.splice(index, 1);
    // Ensure there's always at least one deliverable input field
    setFormData((prev) => ({
      ...prev,
      deliverables: updatedDeliverables.length === 0 ? [""] : updatedDeliverables,
    }));
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setLocalError(""); // Clear previous local errors

    // Basic client-side validation
    if (!formData.campaignName.trim() || !formData.description.trim() || !formData.budget) {
      setLocalError("Please fill in all required fields (Campaign Name, Description, Budget).");
      toast.warn("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (formData.deliverables.some(item => !item.trim())) {
      setLocalError("Deliverables cannot be empty. Please fill them out or remove empty fields.");
      toast.warn("Please ensure all deliverables are filled or removed.");
      setLoading(false);
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setLocalError("Start Date cannot be after End Date.");
      toast.warn("Start Date cannot be after End Date.");
      setLoading(false);
      return;
    }

    try {
      // Call the onSendProposal function passed from the parent (Favourite.jsx)
      // This function will handle the axios POST request and toast notifications
      await onSendProposal(influencer._id, {
        campaignName: formData.campaignName,
        description: formData.description,
        budget: Number(formData.budget), // Ensure budget is a number
        deliverables: formData.deliverables.filter(d => d.trim() !== ""), // Filter out empty deliverables
        timeline: {
          startDate: formData.startDate,
          endDate: formData.endDate,
        },
      });

      // Reset form on successful submission
      setFormData({
        campaignName: "",
        description: "",
        budget: "",
        deliverables: [""],
        startDate: "",
        endDate: "",
      });
      // onClose(); // onClose is handled by the parent's onSendProposal after success
    } catch (err) {
      // Errors are caught and handled by onSendProposal in Favourite.jsx,
      // but a local catch here ensures setLoading(false) even if onSendProposal throws.
      // toast.error is already handled by the parent
      console.error("Proposal form submission error:", err);
      // No need to set localError here as toast.error will be shown by parent.
    } finally {
      setLoading(false);
    }
  };

  return (
    // The Modal wrapper is removed from here. This component just provides the form content.
    <Form onSubmit={handleSubmit}>
      {localError && <div className="alert alert-danger">{localError}</div>}

      <Form.Group className="mb-3">
        <Form.Label>Campaign Name <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          name="campaignName"
          value={formData.campaignName}
          onChange={handleChange}
          placeholder="e.g., Summer Collection Launch"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description <span className="text-danger">*</span></Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Detailed description of your campaign objectives and requirements."
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Budget (USD) <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="number"
          name="budget"
          min="0"
          value={formData.budget}
          onChange={handleChange}
          placeholder="e.g., 1000"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Deliverables <span className="text-danger">*</span></Form.Label>
        {formData.deliverables.map((item, idx) => (
          <Row key={idx} className="mb-2 align-items-center">
            <Col>
              <Form.Control
                type="text"
                value={item}
                onChange={(e) => handleDeliverableChange(idx, e.target.value)}
                placeholder={`e.g., 1 Instagram Post${idx > 0 ? '' : ' (required)'}`}
                required // Mark each deliverable as required
              />
            </Col>
            <Col xs="auto">
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeDeliverable(idx)}
                disabled={formData.deliverables.length === 1 && item.trim() === ""} // Disable if only one and empty
                title="Remove Deliverable"
              >
                <i className="bi bi-x-lg"></i> {/* Bootstrap Icon for remove */}
              </Button>
            </Col>
          </Row>
        ))}
        <Button
          variant="secondary"
          size="sm"
          onClick={addDeliverable}
          className="mt-2"
          title="Add New Deliverable"
        >
          <i className="bi bi-plus-lg me-1"></i> Add Deliverable
        </Button>
      </Form.Group>

      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>End Date <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Sending...
            </>
          ) : (
            "Submit Proposal"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default ProposalForm;