import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import { authApiService } from "../../services/authApiService";

const VerifyOtpPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email")
    ? decodeURIComponent(searchParams.get("email"))
    : "";
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      Swal.fire(
        "Lỗi",
        "Không tìm thấy email. Vui lòng thử lại từ đầu.",
        "error"
      );
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Mã OTP phải có đúng 6 chữ số");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authApiService.verifyOtp({ email, otp });

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Xác thực thành công!",
          text: "Bạn có thể đặt lại mật khẩu mới.",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(
          `/reset-password/new?email=${encodeURIComponent(email)}&otp=${otp}`
        );
      } else {
        setError(response.message || "Mã OTP không đúng");
      }
    } catch (err) {
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await authApiService.resendOtp({ email });

      if (response.success) {
        Swal.fire(
          "Đã gửi lại!",
          "Mã OTP mới đã được gửi đến email của bạn.",
          "success"
        );
      } else {
        Swal.fire(
          "Thất bại",
          response.message || "Không thể gửi lại OTP.",
          "error"
        );
      }
    } catch (err) {
      Swal.fire("Lỗi", "Không thể gửi lại OTP.", "error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-otp-page">
      <div className="verify-otp-container">
        <div className="verify-otp-card">
          <div className="verify-otp-content">
            <div className="verify-otp-badge">CÂU LẠC BỘ</div>
            <h1 className="verify-otp-title">Nhập mã OTP</h1>
            <p className="verify-otp-description">
              Mã OTP đã được gửi đến <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerify} className="verify-otp-form">
              <div className="form-group">
                <label htmlFor="otp" className="form-label">
                  Mã OTP (6 chữ số)
                </label>
                <input
                  type="text"
                  id="otp"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className={`form-input otp-input ${error ? "error" : ""}`}
                  placeholder="------"
                  disabled={isLoading}
                />
                {error && <span className="error-message">{error}</span>}
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Đang xác thực..." : "Xác thực"}
              </button>
            </form>

            <div className="resend-section">
              <span>Không nhận được mã?</span>
              <button
                onClick={handleResendOtp}
                className="resend-link"
                disabled={isResending}
              >
                {isResending ? "Đang gửi..." : "Gửi lại OTP"}
              </button>
            </div>

            <div className="verify-otp-footer">
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

export default VerifyOtpPage;
