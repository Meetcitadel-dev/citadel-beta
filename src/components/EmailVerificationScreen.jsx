import React, { useState, useEffect } from "react";
import { authAPI } from "../utils/api.js";

export default function EmailVerificationScreen({ onVerificationSuccess }) {
  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      // Get token from URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }

      try {
        await authAPI.verifyEmail(token);
        setStatus("success");
        setMessage("Email verified successfully! You can now use all features of Citadel.");
        
        // Call success callback if provided
        if (onVerificationSuccess) {
          setTimeout(() => {
            onVerificationSuccess();
          }, 2000);
        }
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Failed to verify email. The link may have expired.");
      }
    };

    verifyEmail();
  }, [searchParams, onVerificationSuccess]);

  const handleResendVerification = async () => {
    try {
      await authAPI.resendVerification();
      setMessage("Verification email sent! Please check your inbox.");
    } catch (error) {
      setMessage(error.message || "Failed to resend verification email.");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <img src="/logo.svg" alt="Citadel" className="auth-logo-img" />
          <h1 className="auth-title">Email Verification</h1>
        </div>

        <div className="auth-form" style={{ textAlign: "center" }}>
          {status === "verifying" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>⏳</div>
              <p>{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>✅</div>
              <p style={{ color: "var(--accent)", fontSize: "1.1rem", marginBottom: "20px" }}>
                {message}
              </p>
              <button
                className="auth-btn primary"
                onClick={() => window.location.href = "/"}
              >
                Continue to App
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>❌</div>
              <p style={{ color: "#f87171", marginBottom: "20px" }}>{message}</p>
              <button
                className="auth-btn primary"
                onClick={handleResendVerification}
              >
                Resend Verification Email
              </button>
              <button
                className="auth-btn secondary"
                onClick={() => window.location.href = "/"}
                style={{ marginTop: "10px" }}
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

