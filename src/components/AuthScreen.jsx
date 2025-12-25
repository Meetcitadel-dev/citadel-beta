import React, { useState } from "react";
import { authAPI } from "../utils/api.js";
import { isValidUniversityEmail, extractUniversityFromEmail } from "../utils/emailValidation.js";

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState("signup"); // 'signup' or 'login'
  const [step, setStep] = useState("email"); // 'email', 'otp', 'signup'
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    gender: "",
    college: "",
    year: "",
    age: "",
    skills: ""
  });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Validate email format
    if (!isValidUniversityEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('📧 Requesting OTP for:', email.trim().toLowerCase());
      const response = await authAPI.requestOTP(email.trim().toLowerCase(), null);
      console.log('✅ OTP Response:', response);
      
      if (response.otp) {
        alert(`Development Mode: Your OTP is ${response.otp}`);
      }
      const universityName = extractUniversityFromEmail(email);
      if (universityName && !signupData.college) {
        setSignupData(prev => ({ ...prev, college: universityName }));
      }

      setIsNewUser(mode === "signup");
      setStep("otp");
    } catch (err) {
      console.error('Signup error:', err);
      if (err.message.includes("Unable to connect") || err.message.includes("Failed to fetch")) {
        setError("Cannot connect to server. Please make sure the backend server is running (npm run server:dev)");
      } else if (err.message.includes("not found") || err.message.includes("404")) {
        if (mode === "login") {
          setError("No account found with this email. Please sign up first.");
        } else {
          setError("Server error: API endpoint not found. Please check the console for details.");
        }
      } else if (err.message.includes("already exists")) {
        setError("Account already exists with this email. Please login instead.");
      } else {
        setError(err.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await authAPI.verifyOTP(email.trim().toLowerCase(), null, otp);
      
      if (data.isNewUser || isNewUser) {
        setStep("signup");
      } else {
        onAuthSuccess(data.user, false);
      }
    } catch (err) {
      if (err.message.includes("Unable to connect") || err.message.includes("Failed to fetch")) {
        setError("Cannot connect to server. Please make sure the backend server is running (npm run server:dev)");
      } else {
        setError(err.message || "Invalid OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
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
    if (!signupData.age || signupData.age < 16 || signupData.age > 100) {
      setError("Please enter a valid age (16-100)");
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
    
    const skills = signupData.skills
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    setIsLoading(true);
    try {
      const userData = {
        email: email.trim().toLowerCase(),
      name: signupData.name.trim(),
      gender: signupData.gender,
      age: parseInt(signupData.age),
      college: signupData.college.trim(),
      year: signupData.year,
      skills,
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    
      const data = await authAPI.register(userData);
      alert("Account created! Please check your email to verify your account.");
      onAuthSuccess(data.user, true);
    } catch (err) {
      if (err.message.includes("Unable to connect") || err.message.includes("Failed to fetch")) {
        setError("Cannot connect to server. Please make sure the backend server is running (npm run server:dev)");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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
            {step === "email" && (mode === "login" ? "Welcome back! Enter your email" : "Enter your email to get started")}
            {step === "otp" && "Enter the 6-digit OTP sent to your email"}
            {step === "signup" && "Complete your profile"}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Email Input Step */}
        {step === "email" && (
          <form className="auth-form" onSubmit={handleEmailSubmit}>
            <div className="auth-mode-toggle">
              <button
                type="button"
                className={`mode-btn ${mode === "signup" ? "active" : ""}`}
                onClick={() => { setMode("signup"); setError(""); }}
              >
                Sign Up
              </button>
              <button
                type="button"
                className={`mode-btn ${mode === "login" ? "active" : ""}`}
                onClick={() => { setMode("login"); setError(""); }}
              >
                Login
              </button>
            </div>
            <div className="auth-field">
              <label className="auth-label">Email</label>
                <input
                type="email"
                value={email}
                  onChange={(e) => {
                  setEmail(e.target.value.trim());
                    setError("");
                  }}
                placeholder="your.email@example.com"
                className="auth-input"
                  autoFocus
                autoComplete="email"
                />
            </div>
            <button 
              type="submit" 
              className="auth-btn primary"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : (mode === "login" ? "Login" : "Continue")}
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
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                placeholder="6-digit OTP"
                className="auth-input otp-input"
                maxLength={6}
                autoFocus
              />
              <p className="auth-hint">Check your email for the 6-digit code</p>
            </div>
            <button 
              type="submit" 
              className="auth-btn primary"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              className="auth-btn secondary"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError("");
              }}
              disabled={isLoading}
            >
              Change Email
            </button>
            <button
              type="button"
              className="auth-btn secondary"
              onClick={async () => {
                setIsLoading(true);
                try {
                  await authAPI.requestOTP(email.trim().toLowerCase(), null);
                  setError("");
                  alert("OTP resent to your email!");
                } catch (err) {
                  if (err.message.includes("Unable to connect") || err.message.includes("Failed to fetch")) {
                    setError("Cannot connect to server. Please make sure the backend server is running (npm run server:dev)");
                  } else {
                    setError(err.message || "Failed to resend OTP");
                  }
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            >
              Resend OTP
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
                <button
                  type="button"
                  className={`gender-btn ${signupData.gender === "other" ? "active" : ""}`}
                  onClick={() => setSignupData(prev => ({ ...prev, gender: "other" }))}
                >
                  🏳️ Other
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Age</label>
              <input
                type="number"
                value={signupData.age}
                onChange={handleSignupChange("age")}
                placeholder="Enter your age"
                className="auth-input"
                min="16"
                max="100"
              />
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

            <button 
              type="submit" 
              className="auth-btn primary"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
            <button
              type="button"
              className="auth-btn secondary"
              onClick={() => {
                setStep("email");
                setOtp("");
                setSignupData({ name: "", gender: "", college: "", year: "", age: "", skills: "" });
                setError("");
              }}
              disabled={isLoading}
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
