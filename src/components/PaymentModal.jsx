import React, { useState } from "react";

export default function PaymentModal({ isOpen, onClose, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    upiId: ""
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number";
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
          <h2 className="payment-title">Unlock Premium</h2>
          <p className="payment-subtitle">
            Congratulations - you&apos;ve unlocked your first month free as one of our
            first 1,000 users
          </p>
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
          <div className="payment-feature">
            <span className="feature-icon">✓</span>
            <span>Unlimited vibes</span>
          </div>
          <div className="payment-feature">
            <span className="feature-icon">✓</span>
            <span>See who texted you</span>
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
              placeholder="UPI ID (e.g. name@paytm)"
              value={formData.upiId}
              onChange={handleChange("upiId")}
              className={`payment-input ${errors.upiId ? "error" : ""}`}
            />
            {errors.upiId && <span className="field-error">{errors.upiId}</span>}
          </div>

          <div className="payment-field">
            <input
              type="text"
              placeholder="Phone number (10 digits)"
              value={formData.phone}
              onChange={handleChange("phone")}
              className={`payment-input ${errors.phone ? "error" : ""}`}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
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
          <span className="secure-badge">Secure Payment</span>
        </div>
      </div>
    </div>
  );
}
