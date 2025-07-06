
import React from 'react';
import './ProfileDialog.css'; 

function ProfileDialog({ userProfile, onClose }) {
  if (!userProfile) {
    return null;
  }


  const formatJoinedDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'N/A'; 
    }
  };

  return (
    <div className="profile-dialog-overlay" onClick={onClose}>
      <div className="profile-dialog-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times; 
        </button>

        <h2>Your Profile</h2>

        <div className="profile-details">

          <img
            src={userProfile.profilePictureUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
            alt={`${userProfile.name}'s Profile`}
            className="profile-dialog-picture"
          />


          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>Role:</strong> {userProfile.role}</p>
          <p><strong>Bio:</strong> {userProfile.bio || "No bio provided."}</p>
         
          <p><strong>Joined:</strong> {formatJoinedDate(userProfile.createdAt)}</p>

        
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

     
          {userProfile.role === 'influencer' && userProfile.favorites && userProfile.favorites.length > 0 && (
            <p><strong>Favorites:</strong> {userProfile.favorites.length} Business(es)</p>
          )}
          {userProfile.role === 'business' && userProfile.connections && userProfile.connections.length > 0 && (
            <p><strong>Connections:</strong> {userProfile.connections.length} Influencer(s)</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileDialog;