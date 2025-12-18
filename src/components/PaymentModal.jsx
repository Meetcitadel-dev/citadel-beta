import React, { useState } from "react";

export default function PaymentModal({ isOpen, onClose, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    upiId: ""
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.upiId.trim()) {
      newErrors.upiId = "UPI ID is required";
    } else if (!/^[\w.-]+@[\w]+$/.test(formData.upiId)) {
      newErrors.upiId = "Invalid UPI ID (e.g. name@upi)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirmation(true);
  };

  const confirmPayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirmation(false);
      onSuccess?.();
      onClose?.();
    }, 1500);
  };

  const cancelPayment = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="payment-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="payment-header">
          <div className="payment-icon">👑</div>
          <h2 className="payment-title">Unlock Premium</h2>
          <p className="payment-subtitle">See who&apos;s vibing with you</p>
        </div>

        <div className="payment-features">
          <div className="payment-feature">
            <span className="feature-icon">✓</span>
            <span>See who liked you</span>
          </div>
          <div className="payment-feature">
            <span className="feature-icon">✓</span>
            <span>View match profiles</span>
          </div>
          <div className="payment-feature">
            <span className="feature-icon">✓</span>
            <span>Unlimited matches</span>
          </div>
        </div>

        <div className="payment-price">
          <span className="price-amount">₹99</span>
          <span className="price-period">/month</span>
        </div>

        <form className="payment-form" onSubmit={handleSubmit}>
          <div className="payment-field">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange("name")}
              className={`payment-input ${errors.name ? "error" : ""}`}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="payment-field">
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange("email")}
              className={`payment-input ${errors.email ? "error" : ""}`}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="payment-field">
            <input
              type="text"
              placeholder="UPI ID (e.g. name@paytm)"
              value={formData.upiId}
              onChange={handleChange("upiId")}
              className={`payment-input ${errors.upiId ? "error" : ""}`}
            />
            {errors.upiId && <span className="field-error">{errors.upiId}</span>}
          </div>

          <div className="test-mode-notice">
            <span className="notice-icon">🧪</span>
            <span>Test Mode - No real payment will be processed</span>
          </div>

          {/* Payment Confirmation */}
          {showConfirmation ? (
            <div className="test-confirmation">
              <div className="confirmation-icon">🔐</div>
              <div className="confirmation-text">
                <strong>Confirm Payment</strong>
                <span>₹99 will be debited from {formData.upiId}</span>
              </div>
              <div className="confirmation-buttons">
                <button
                  type="button"
                  className="confirm-btn success"
                  onClick={confirmPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    "✓ Confirm & Pay"
                  )}
                </button>
                <button
                  type="button"
                  className="confirm-btn cancel"
                  onClick={cancelPayment}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className="payment-submit-btn"
            >
              Pay ₹99 & Unlock
            </button>
          )}
        </form>

        <div className="payment-footer">
          <span className="secure-badge">🔒 Secure Payment</span>
        </div>
      </div>
    </div>
  );
}
