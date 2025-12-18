import React, { useState } from "react";

const DEMO_OTP = "1234";

export default function AuthScreen({ onAuthSuccess, existingUsers }) {
  const [step, setStep] = useState("phone"); // 'phone', 'otp', 'signup'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    gender: "",
    college: "",
    year: "",
    skills: ""
  });

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    
    // Check if user exists
    const existingUser = existingUsers.find(u => u.phone === phone);
    setIsNewUser(!existingUser);
    setStep("otp");
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (otp !== DEMO_OTP) {
      setError("Invalid OTP. Demo OTP is 1234");
      return;
    }
    
    if (isNewUser) {
      setStep("signup");
    } else {
      // Login existing user
      const existingUser = existingUsers.find(u => u.phone === phone);
      onAuthSuccess(existingUser, false);
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (!signupData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!signupData.gender) {
      setError("Please select your gender");
      return;
    }
    if (!signupData.college.trim()) {
      setError("Please enter your college");
      return;
    }
    if (!signupData.year) {
      setError("Please select your year");
      return;
    }
    
    const newUser = {
      phone,
      name: signupData.name.trim(),
      gender: signupData.gender,
      college: signupData.college.trim(),
      year: signupData.year,
      skills: signupData.skills.split(",").map(s => s.trim()).filter(Boolean),
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`
    };
    
    onAuthSuccess(newUser, true);
  };

  const handleSignupChange = (field) => (e) => {
    setSignupData(prev => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <img src="/logo.svg" alt="Citadel" className="auth-logo-img" />
          <h1 className="auth-title">Citadel</h1>
          <p className="auth-subtitle">
            {step === "phone" && "Enter your phone to get started"}
            {step === "otp" && "Enter the OTP sent to your phone"}
            {step === "signup" && "Complete your profile"}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Phone Input Step */}
        {step === "phone" && (
          <form className="auth-form" onSubmit={handlePhoneSubmit}>
            <div className="auth-field">
              <label className="auth-label">Phone Number</label>
              <div className="phone-input-wrapper">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                    setError("");
                  }}
                  placeholder="Enter 10-digit number"
                  className="auth-input phone-input"
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" className="auth-btn primary">
              Continue
            </button>
          </form>
        )}

        {/* OTP Verification Step */}
        {step === "otp" && (
          <form className="auth-form" onSubmit={handleOtpSubmit}>
            <div className="auth-field">
              <label className="auth-label">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 4));
                  setError("");
                }}
                placeholder="4-digit OTP"
                className="auth-input otp-input"
                maxLength={4}
                autoFocus
              />
              <p className="auth-hint">Demo OTP: <strong>1234</strong></p>
            </div>
            <button type="submit" className="auth-btn primary">
              Verify OTP
            </button>
            <button
              type="button"
              className="auth-btn secondary"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
            >
              Change Number
            </button>
          </form>
        )}

        {/* Signup Form Step */}
        {step === "signup" && (
          <form className="auth-form signup-form" onSubmit={handleSignupSubmit}>
            <div className="auth-field">
              <label className="auth-label">Your Name</label>
              <input
                type="text"
                value={signupData.name}
                onChange={handleSignupChange("name")}
                placeholder="Enter your name"
                className="auth-input"
                autoFocus
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Gender</label>
              <div className="gender-options">
                <button
                  type="button"
                  className={`gender-btn ${signupData.gender === "male" ? "active" : ""}`}
                  onClick={() => setSignupData(prev => ({ ...prev, gender: "male" }))}
                >
                  👨 Male
                </button>
                <button
                  type="button"
                  className={`gender-btn ${signupData.gender === "female" ? "active" : ""}`}
                  onClick={() => setSignupData(prev => ({ ...prev, gender: "female" }))}
                >
                  👩 Female
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">College</label>
              <input
                type="text"
                value={signupData.college}
                onChange={handleSignupChange("college")}
                placeholder="e.g. Stanford University"
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Year</label>
              <select
                value={signupData.year}
                onChange={handleSignupChange("year")}
                className="auth-input auth-select"
              >
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year</option>
              </select>
            </div>

            <div className="auth-field">
              <label className="auth-label">Interests (optional)</label>
              <input
                type="text"
                value={signupData.skills}
                onChange={handleSignupChange("skills")}
                placeholder="e.g. Music, Design, Sports"
                className="auth-input"
              />
              <p className="auth-hint">Comma separated</p>
            </div>

            <button type="submit" className="auth-btn primary">
              Create Account
            </button>
            <button
              type="button"
              className="auth-btn secondary"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setSignupData({ name: "", gender: "", college: "", year: "", skills: "" });
                setError("");
              }}
            >
              Start Over
            </button>
          </form>
        )}

        <p className="auth-footer">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}

