import React, { useState, useRef, useEffect } from "react";
import { uploadAPI } from "../utils/api.js";

export default function ProfileScreen({ user, onUpdate, onLogout }) {
  const [form, setForm] = useState({
    name: user.name ?? "",
    college: user.college ?? "",
    year: user.year ?? "",
    skills: (user.skills ?? []).join(", "),
    imageUrl: user.imageUrl ?? "",
    note: user.note ?? ""
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Update form when user changes (e.g., switching accounts)
  useEffect(() => {
    setForm({
      name: user.name ?? "",
      college: user.college ?? "",
      year: user.year ?? "",
      skills: (user.skills ?? []).join(", "),
      imageUrl: user.imageUrl ?? "",
      note: user.note ?? ""
    });
    setSaved(false);
  }, [user.id, user.imageUrl, user.note]);

  const handleChange = (field) => (event) => {
    let value = event.target.value;

    // For skills, enforce max 3 entries by allowing at most 2 commas
    if (field === "skills") {
      const parts = value.split(",");
      if (parts.length > 3) {
        value = parts.slice(0, 3).join(",");
      }
    }

    // For note, enforce max 40 characters
    if (field === "note") {
      value = value.slice(0, 40);
    }

    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert('Image size is too large. Please choose an image smaller than 5MB.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Upload file to server
    setUploading(true);
    try {
      const result = await uploadAPI.uploadProfileImage(file);
      // Construct full URL - in development, use localhost:3001, in production use relative path
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const imageUrl = baseUrl + result.imageUrl;
      console.log('✅ Image uploaded successfully:', imageUrl);
      setForm((prev) => ({ ...prev, imageUrl: imageUrl }));
      setSaved(false);
    } catch (error) {
      console.error('❌ Image upload error:', error);
      alert(error.message || 'Failed to upload image. Please try again.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const skillList = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    const next = {
      ...user,
      name: form.name.trim(),
      college: form.college.trim(),
      year: form.year,
      skills: skillList,
      imageUrl: form.imageUrl || '',
      note: (form.note || '').trim()
    };
    
    if (!next.id && !next._id) {
      console.error('Cannot update profile: missing user ID');
      return;
    }
    
    onUpdate?.(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className="profile-edit-card profile-scrollable"
      style={{ margin: '10px', width: 'calc(100% - 20px)' }}
    >
      <div className="profile-edit-header">
        <div className="profile-edit-avatar">
          {user.name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div className="profile-edit-summary">
          <div className="profile-edit-title">Edit profile</div>
          <div className="profile-edit-subtitle">
            This is how other students see you.
          </div>
        </div>
      </div>

      <form className="profile-edit-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Name</span>
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            className="field-input"
          />
        </label>

        <div className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            value={user.email || ''}
            readOnly
            className="field-input"
            style={{ 
              backgroundColor: '#1a1a1a', 
              color: '#999', 
              cursor: 'not-allowed',
              opacity: 0.7
            }}
          />
        </div>

        <label className="field">
          <span className="field-label">College</span>
          <input
            type="text"
            value={form.college}
            readOnly
            className="field-input"
            style={{ 
              backgroundColor: '#1a1a1a', 
              color: '#999', 
              cursor: 'not-allowed',
              opacity: 0.7
            }}
          />
        </label>

        <label className="field">
          <span className="field-label">Year</span>
          <select
            value={form.year}
            disabled
            className="field-input field-select"
            style={{ 
              backgroundColor: '#1a1a1a', 
              color: '#999', 
              cursor: 'not-allowed',
              opacity: 0.7
            }}
          >
            <option value="">Select year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
            <option value="5th Year">5th Year</option>
          </select>
        </label>

        <label className="field">
          <span className="field-label">Tags / skills</span>
          <input
            type="text"
            value={form.skills}
            onChange={handleChange("skills")}
            className="field-input"
            placeholder="Comma separated, e.g. Finance, Design"
          />
        </label>

        <div className="field">
          <span className="field-label">Profile image</span>
          <div className="image-upload-area" onClick={() => !uploading && fileInputRef.current?.click()}>
            {uploading ? (
              <div className="upload-placeholder">
                <span className="upload-icon">⏳</span>
                <span className="upload-text">Uploading...</span>
              </div>
            ) : form.imageUrl ? (
              <img src={form.imageUrl} alt="Preview" className="image-preview" />
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">📷</span>
                <span className="upload-text">Click to upload photo</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input-hidden"
              disabled={uploading}
            />
          </div>
        </div>

        <label className="field">
          <span className="field-label">Note (max 40 characters)</span>
          <input
            type="text"
            value={form.note}
            onChange={handleChange("note")}
            className="field-input"
            placeholder="Write a short line about yourself..."
            maxLength={40}
          />
          <p className="field-hint" style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            {form.note.length}/40 characters
          </p>
        </label>

        <button type="submit" className={`primary-button ${saved ? 'saved' : ''}`}>
          {saved ? '✓ Saved!' : 'Save changes'}
        </button>
      </form>

      <div className="profile-actions">
        <button className="logout-btn" onClick={onLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}


