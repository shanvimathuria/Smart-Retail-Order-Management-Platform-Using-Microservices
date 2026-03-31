import React, { useState } from 'react';
import { FiEdit, FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      showToast('Profile updated successfully!');
    } catch {
      showToast('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      country: user?.country || ''
    });
    setIsEditing(false);
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.[0] ?? '';
    const last = user.lastName?.[0] ?? '';
    return (first + last).toUpperCase() || (user.email[0]?.toUpperCase() ?? 'U');
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            {getUserInitials()}
          </div>
          <div className="profile-title">
            <h1>My Profile</h1>
            <p>Manage your account information</p>
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <FiEdit /> Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="save-btn"
                  onClick={handleSave}
                >
                  <FiSave /> Save
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  <FiX /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>Personal Information</h2>
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FiUser /> First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FiUser /> Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FiMail /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label>
                  <FiPhone /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Address Information</h2>
            <div className="profile-form">
              <div className="form-group">
                <label>
                  <FiMapPin /> Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter street address"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FiMapPin /> City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter city"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FiMapPin /> Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;