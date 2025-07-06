// src/components/MessageModal.js
import React from 'react';

const MessageModal = ({ show, message, type, onClose }) => {
  if (!show) return null;

  const modalClass = `modal d-block fade show ${type === 'success' ? 'text-success' : 'text-danger'}`;
  const backdropClass = 'modal-backdrop fade show';

  return (
    <>
      <div className={modalClass} tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{type === 'success' ? 'Success!' : 'Error!'}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p className={type === 'success' ? 'text-success' : 'text-danger'}>{message}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={backdropClass}></div>
    </>
  );
};

export default MessageModal;