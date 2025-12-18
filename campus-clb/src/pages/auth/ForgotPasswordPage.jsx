import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { authApiService } from "../../services/authApiService";
import "./ForgotPasswordPage.css"; 

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApiService.forgotPassword({
        email: email.trim(),
      });

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Đã gửi OTP!",
          text: "Mã OTP đã được gửi đến email của bạn.",
          timer: 2000,
          showConfirmButton: false,
        });

        // Chuyển sang trang verify OTP
        navigate(
          `/reset-password/verify?email=${encodeURIComponent(email.trim())}`
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Gửi thất bại",
          text: response.message || "Không thể gửi yêu cầu. Vui lòng thử lại.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi hệ thống",
        text: "Không thể kết nối đến máy chủ.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-content">
            <div className="forgot-password-badge">CÂU LẠC BỘ</div>
            <h1 className="forgot-password-title">Quên mật khẩu</h1>
            <p className="forgot-password-description">
              Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
            </p>

            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={`form-input ${error ? "error" : ""}`}
                  placeholder="Nhập email của bạn"
                  disabled={isLoading}
                />
                {error && <span className="error-message">{error}</span>}
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            </form>

            <div className="forgot-password-footer">
              <Link to="/login" className="back-link">
                ← Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
