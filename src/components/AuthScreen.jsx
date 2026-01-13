import React, { useState } from "react";
import { authAPI, testBackendConnection } from "../utils/api.js";
import { isValidUniversityEmail, extractUniversityFromEmail } from "../utils/emailValidation.js";

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState("signup"); // 'signup' or 'login'
  const [step, setStep] = useState("email"); // 'email', 'otp', 'signup'
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [backendTestResult, setBackendTestResult] = useState(null);
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    gender: "",
    college: "",
    year: "",
    age: "",
    skills: "",
    note: ""
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
      
      // Check if user exists - if response indicates user exists, switch to login mode
      if (response.userExists === true && mode === "signup") {
        setError("An account with this email already exists. Please login instead.");
        setMode("login");
        setIsLoading(false);
        return;
      }
      
      const universityName = extractUniversityFromEmail(email);
      if (universityName && !signupData.college) {
        setSignupData(prev => ({ ...prev, college: universityName }));
      }

      setIsNewUser(mode === "signup");
      setStep("otp");
    } catch (err) {
      console.error('Signup error:', err);
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      if (err.message.includes("Cannot connect") || err.message.includes("Unable to connect") || err.message.includes("Failed to fetch")) {
        setError(err.message || "Cannot connect to backend. Please check backend URL and CORS settings.");
      } else if (err.message.includes("not found") || err.message.includes("404")) {
        if (mode === "login") {
          setError("No account found with this email. Please sign up first.");
        } else {
          setError("Server error: API endpoint not found. Please check the console for details.");
      }
      } else if (err.message.includes("already exists")) {
        if (mode === "signup") {
          setError("An account with this email already exists. Please login instead.");
          setMode("login");
        } else {
          setError("Account already exists with this email. Please login instead.");
        }
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
        // Existing user logging in - pass all user data
        onAuthSuccess(data.user, false);
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      if (err.message.includes("Cannot connect") || err.message.includes("Unable to connect") || err.message.includes("Failed to fetch")) {
        setError(err.message || "Cannot connect to backend. Please check backend URL and CORS settings.");
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
        note: (signupData.note || '').trim(),
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
    
      const data = await authAPI.register(userData);
      alert("Account created! Please check your email to verify your account.");
      onAuthSuccess(data.user, true);
    } catch (err) {
      console.error('Signup submit error:', err);
      if (err.message.includes("Cannot connect") || err.message.includes("Unable to connect") || err.message.includes("Failed to fetch")) {
        setError(err.message || "Cannot connect to backend. Please check backend URL and CORS settings.");
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

  const handleTestBackend = async () => {
    setIsTestingBackend(true);
    setError("");
    setBackendTestResult(null);
    
    try {
      const result = await testBackendConnection();
      setBackendTestResult(result);
      
      if (result.success) {
        setError("✅ Backend is accessible! You can proceed with signup.");
      } else {
        setError(`❌ Backend test failed: ${result.error}. Check console for details.`);
      }
    } catch (err) {
      setBackendTestResult({ success: false, error: err.message });
      setError(`❌ Backend test error: ${err.message}`);
    } finally {
      setIsTestingBackend(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Citadel</h1>
          <p className="auth-subtitle">
            {step === "email" && (mode === "login" ? "Welcome back! Enter your email" : "Enter university email ID to get started")}
            {step === "otp" && "Enter the 6-digit OTP sent to your email"}
            {step === "signup" && "Complete your profile"}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Backend Test Result */}
        {backendTestResult && (
          <div style={{
            background: backendTestResult.success ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 0, 0, 0.1)',
            border: `1px solid ${backendTestResult.success ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 0, 0, 0.3)'}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              {backendTestResult.success ? '✅ Backend Test: Success' : '❌ Backend Test: Failed'}
            </div>
            {backendTestResult.details && (
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px', lineHeight: '1.6' }}>
                <strong>Test URL:</strong> {backendTestResult.details.attemptedUrl}<br/>
                <strong>Base URL:</strong> {backendTestResult.details.baseUrl || 'N/A'}<br/>
                <strong>Raw VITE_API_URL:</strong> {backendTestResult.details.viteApiUrl || 'not set'}<br/>
                <strong>Error:</strong> {backendTestResult.error}<br/>
                <strong>Status:</strong> {backendTestResult.status || 'N/A'}
              </div>
            )}
            {!backendTestResult.success && (
              <div style={{ fontSize: '11px', color: '#ff6b6b', marginTop: '8px', padding: '8px', background: 'rgba(255, 0, 0, 0.1)', borderRadius: '4px' }}>
                <strong>💡 Troubleshooting:</strong><br/>
                1. Check if backend is accessible: <a href={backendTestResult.details?.attemptedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff88' }}>Test URL</a><br/>
                2. Verify VITE_API_URL includes /api: Should be `https://citadel-backend.vercel.app/api`<br/>
                3. Check browser console (F12) for detailed logs<br/>
                4. Make sure frontend was redeployed after updating env var
              </div>
            )}
          </div>
        )}

        {/* Backend Test Button - always show on email step */}
        {step === "email" && (
          <button
            type="button"
            onClick={handleTestBackend}
            disabled={isTestingBackend}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '15px',
              background: 'rgba(0, 255, 136, 0.15)',
              border: '2px solid rgba(0, 255, 136, 0.4)',
              borderRadius: '8px',
              color: '#00ff88',
              cursor: isTestingBackend ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s',
              opacity: isTestingBackend ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isTestingBackend) {
                e.target.style.background = 'rgba(0, 255, 136, 0.25)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isTestingBackend) {
                e.target.style.background = 'rgba(0, 255, 136, 0.15)';
              }
            }}
          >
            {isTestingBackend ? '⏳ Testing Backend...' : '🔍 Test Backend Connection'}
          </button>
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

            <div className="auth-field">
              <label className="auth-label">Note (optional, max 40 characters)</label>
              <input
                type="text"
                value={signupData.note}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 40);
                  setSignupData(prev => ({ ...prev, note: value }));
                  setError("");
                }}
                placeholder="Write a short line about yourself..."
                className="auth-input"
                maxLength={40}
              />
              <p className="auth-hint">{signupData.note.length}/40 characters</p>
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
                setSignupData({ name: "", gender: "", college: "", year: "", age: "", skills: "", note: "" });
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
