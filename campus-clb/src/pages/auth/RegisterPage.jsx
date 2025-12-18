import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import "./RegisterPage.css";
import { authApiService } from "../../services/authApiService";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Student",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    }
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Vui lòng đồng ý điều khoản sử dụng";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);

    const submitData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      role: formData.role,
    };

    try {
      const response = await authApiService.register(submitData);

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Đăng ký thành công!",
          text: "Bạn sẽ được chuyển đến trang đăng nhập.",
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Đăng ký thất bại",
          text: response.message || "Vui lòng thử lại.",
        });

        if (response.errors) {
          setErrors(response.errors);
        }
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi hệ thống",
        text: err.message || "Không thể xử lý yêu cầu.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-form-section">
            <div className="register-header">
              <div className="register-badge">CÂU LẠC BỘ</div>
              <h1 className="register-title">Đăng ký tài khoản</h1>
              <p className="register-description">
                Tạo tài khoản để tham gia và quản lý các câu lạc bộ trong
                campus.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="register-form" noValidate>
              {/* Họ và tên */}
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`form-input ${errors.fullName ? "error" : ""}`}
                  placeholder="Nhập họ và tên"
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? "error" : ""}`}
                  placeholder="Nhập email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              {/* Số điện thoại */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? "error" : ""}`}
                  placeholder="Nhập số điện thoại"
                  disabled={isLoading}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              {/* Mật khẩu */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Mật khẩu
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder="Nhập mật khẩu"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Xác nhận mật khẩu
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${
                      errors.confirmPassword ? "error" : ""
                    }`}
                    placeholder="Nhập lại mật khẩu"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Điều khoản */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="checkbox-input"
                    disabled={isLoading}
                  />
                  <span className="checkbox-text">
                    Tôi đồng ý với điều khoản sử dụng
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <span className="error-message">{errors.agreeToTerms}</span>
                )}
              </div>

              <button
                type="submit"
                className="register-button"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đăng ký"}
              </button>

              <div className="register-footer">
                <span className="register-footer-text">Đã có tài khoản?</span>
                <Link to="/login" className="register-footer-link">
                  Đăng nhập ngay →
                </Link>
              </div>
            </form>
          </div>

          <div className="register-info-section">
            <div className="register-info-content">
              <h2 className="register-info-title">
                Quản lý hoạt động câu lạc bộ trong một nền tảng.
              </h2>
              <p className="register-info-description">
                Theo dõi sự kiện, đăng ký CLB, quản lý thành viên và báo cáo thu
                chi dễ dàng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
