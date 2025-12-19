import React, { useState, useRef, useEffect } from "react";

export default function ProfileScreen({ user, onUpdate, onLogout }) {
  const [form, setForm] = useState({
    name: user.name ?? "",
    gender: user.gender ?? "",
    age: user.age ?? "",
    college: user.college ?? "",
    year: user.year ?? "",
    skills: (user.skills ?? []).join(", "),
    imageUrl: user.imageUrl ?? ""
  });
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  // Update form when user changes (e.g., switching accounts)
  useEffect(() => {
    setForm({
      name: user.name ?? "",
      gender: user.gender ?? "",
      age: user.age ?? "",
      college: user.college ?? "",
      year: user.year ?? "",
      skills: (user.skills ?? []).join(", "),
      imageUrl: user.imageUrl ?? ""
    });
    setSaved(false);
  }, [user.id]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setSaved(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setForm((prev) => ({ ...prev, imageUrl: e.target.result }));
        setSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = {
      ...user,
      name: form.name.trim() || user.name,
      gender: form.gender || user.gender,
      age: form.age ? parseInt(form.age) : user.age,
      college: form.college.trim() || user.college,
      year: form.year || user.year,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      imageUrl: form.imageUrl || user.imageUrl
    };
    onUpdate?.(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="profile-edit-card profile-scrollable">
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

        <label className="field">
          <span className="field-label">Gender</span>
          <div className="gender-options">
            <button
              type="button"
              className={`gender-btn ${form.gender === "male" ? "active" : ""}`}
              onClick={() => {
                setForm(prev => ({ ...prev, gender: "male" }));
                setSaved(false);
              }}
            >
              Male
            </button>
            <button
              type="button"
              className={`gender-btn ${form.gender === "female" ? "active" : ""}`}
              onClick={() => {
                setForm(prev => ({ ...prev, gender: "female" }));
                setSaved(false);
              }}
            >
              Female
            </button>
          </div>
        </label>

        <label className="field">
          <span className="field-label">Age</span>
          <input
            type="number"
            value={form.age}
            onChange={handleChange("age")}
            className="field-input"
            min="16"
            max="100"
            placeholder="Enter your age"
          />
        </label>

        <label className="field">
          <span className="field-label">College</span>
          <input
            type="text"
            value={form.college}
            onChange={handleChange("college")}
            className="field-input"
          />
        </label>

        <label className="field">
          <span className="field-label">Year</span>
          <select
            value={form.year}
            onChange={handleChange("year")}
            className="field-input field-select"
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
          <div className="image-upload-area" onClick={() => fileInputRef.current?.click()}>
            {form.imageUrl ? (
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
            />
          </div>
        </div>

        <button type="submit" className={`primary-button ${saved ? 'saved' : ''}`}>
          {saved ? '✓ Saved!' : 'Save changes'}
        </button>
      </form>

      <div className="profile-actions">
        <button className="logout-btn" onClick={onLogout}>
          <span className="logout-icon">🚪</span>
          Log out
        </button>
      </div>
    </div>
  );
}


