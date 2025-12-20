import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { authApiService } from "../../services/authApiService";
import "./ActivateAccountPage.css";

const ActivateAccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      setStatus("invalid");
      setMessage(
        "Liên kết kích hoạt không hợp lệ. Vui lòng kiểm tra email của bạn."
      );
      return;
    }

    const activateAccount = async () => {
      try {
        const response = await authApiService.activate(email, token);

        if (response.success) {
          setStatus("success");
          setMessage("Tài khoản của bạn đã được kích hoạt thành công!");

          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(response.message || "Kích hoạt tài khoản thất bại.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại.");
      }
    };

    activateAccount();
  }, [email, token, navigate]);

  const handleResendActivation = async () => {
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Không tìm thấy email để gửi lại.",
      });
      return;
    }

    setIsResending(true);

    try {
      const response = await authApiService.resendActivation({ email });

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Đã gửi lại!",
          text: "Email kích hoạt đã được gửi lại đến hộp thư của bạn.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gửi lại thất bại",
          text: response.message || "Không thể gửi lại email kích hoạt.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi hệ thống",
        text: "Không thể gửi yêu cầu. Vui lòng thử lại sau.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="activate-page">
      <div className="activate-container">
        <div className="activate-card">
          <div className="activate-content">
            <div className="activate-badge">CÂU LẠC BỘ</div>
            <h1 className="activate-title">Kích hoạt tài khoản</h1>

            {status === "loading" && (
              <div className="activate-status loading">
                <div className="spinner"></div>
                <p>Đang kích hoạt tài khoản của bạn...</p>
              </div>
            )}

            {status === "success" && (
              <div className="activate-status success">
                <div className="icon">✅</div>
                <h2>Kích hoạt thành công!</h2>
                <p>{message}</p>
                <p className="redirect-text">
                  Đang chuyển đến trang đăng nhập...
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="activate-status error">
                <div className="icon">❌</div>
                <h2>Kích hoạt thất bại</h2>
                <p>{message}</p>
                <button
                  onClick={handleResendActivation}
                  className="resend-button"
                  disabled={isResending}
                >
                  {isResending ? "Đang gửi..." : "Gửi lại email kích hoạt"}
                </button>
              </div>
            )}

            {status === "invalid" && (
              <div className="activate-status error">
                <div className="icon">⚠️</div>
                <h2>Liên kết không hợp lệ</h2>
                <p>{message}</p>
                <div className="back-to-login">
                  <Link to="/login" className="login-link">
                    Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            )}

            <div className="activate-footer">
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

export default ActivateAccountPage;
