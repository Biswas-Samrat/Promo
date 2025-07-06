// src/components/ProfileDialog.jsx (or wherever you prefer to place it)
import React from 'react';
import './ProfileDialog.css'; // Import the CSS for styling the dialog

function ProfileDialog({ userProfile, onClose }) {
  // If userProfile is not provided or is null, don't render anything
  if (!userProfile) {
    return null;
  }

  // Helper to format date if it's available
  const formatJoinedDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A'; // Or handle error gracefully
    }
  };

  return (
    // The overlay covers the entire screen, making it clickable to close the dialog
    <div className="profile-dialog-overlay " onClick={onClose}>
      {/* The dialog content itself, preventing clicks from bubbling up to the overlay */}
      <div className="profile-dialog-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="close-button" onClick={onClose}>
          &times; {/* HTML entity for a multiplication sign (X) */}
        </button>

        <h2>{userProfile.name}'s Profile</h2>

        <div className="profile-details mt-5">
          {/* Profile Picture */}
          <img
            src={userProfile.profilePictureUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
            alt={`${userProfile.name}'s Profile`}
            className="profile-dialog-picture"
          />

          {/* Common Profile Details */}
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>Role:</strong> {userProfile.role}</p>
          <p><strong>Bio:</strong> {userProfile.bio || "No bio provided."}</p>
          <p><strong>Joined:</strong> {formatJoinedDate(userProfile.createdAt)}</p>

          {/* Role-Specific Details */}
          {userProfile.role === 'business' && userProfile.companyName && (
            <p><strong>Company:</strong> {userProfile.companyName}</p>
          )}

          {userProfile.role === 'influencer' && userProfile.socialMedia && userProfile.socialMedia.length > 0 && (
            <div className="social-media-links">
              <strong>Social Media:</strong>
              <ul>
                {userProfile.socialMedia.map((social, index) => (
                  <li key={index}>
                    <a href={social.url} target="_blank" rel="noopener noreferrer">
                      {social.platform}
                    </a>
                    {social.niche && social.niche.length > 0 && ` (${social.niche.join(', ')})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* You can add more details here based on what your userProfile object contains */}
          {/* For example, if you want to show favorites or connections: */}
          {/* {userProfile.favorites && userProfile.favorites.length > 0 && (
            <p><strong>Favorites:</strong> {userProfile.favorites.length} users</p>
          )}
          {userProfile.connections && userProfile.connections.length > 0 && (
            <p><strong>Connections:</strong> {userProfile.connections.length} users</p>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default ProfileDialog;