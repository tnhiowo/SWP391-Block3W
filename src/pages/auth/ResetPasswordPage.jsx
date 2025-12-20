import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import { authApiService } from "../../services/authApiService";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email")
    ? decodeURIComponent(searchParams.get("email"))
    : "";
  const otp = searchParams.get("otp") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email || !otp) {
      Swal.fire(
        "Lỗi",
        "Thông tin không hợp lệ. Vui lòng thực hiện lại.",
        "error"
      );
      navigate("/forgot-password");
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApiService.resetPassword({
        email,
        otp,
        newPassword,
      });

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Đặt lại mật khẩu thành công!",
          text: "Bạn có thể đăng nhập với mật khẩu mới.",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/login");
      } else {
        setError(response.message || "Không thể đặt lại mật khẩu.");
      }
    } catch (err) {
      setError("Lỗi hệ thống. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-content">
            <div className="reset-password-badge">CÂU LẠC BỘ</div>
            <h1 className="reset-password-title">Đặt lại mật khẩu</h1>
            <p className="reset-password-description">
              Nhập mật khẩu mới cho tài khoản <strong>{email}</strong>
            </p>

            <form onSubmit={handleSubmit} className="reset-password-form">
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Nhập mật khẩu mới"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`form-input ${error ? "error" : ""}`}
                    placeholder="Nhập lại mật khẩu"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {error && <span className="error-message">{error}</span>}
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>
            </form>

            <div className="reset-password-footer">
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

export default ResetPasswordPage;
