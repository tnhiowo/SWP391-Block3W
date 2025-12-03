import { useState } from 'react';
import { Link } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentCode: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setSubmitSuccess(false);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.studentCode.trim()) {
      newErrors.studentCode = 'Vui lòng nhập mã sinh viên';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Vui lòng đồng ý với điều khoản sử dụng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitSuccess(false);

    if (validateForm()) {
      const submitData = {
        fullName: formData.fullName,
        email: formData.email,
        studentCode: formData.studentCode,
        role: formData.role,
        password: formData.password,
      };

      console.log('Register data:', submitData);
      // TODO: call register API
      setSubmitSuccess(true);
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
                Tạo tài khoản để tham gia và quản lý các câu lạc bộ trong campus.
              </p>
            </div>

            {submitSuccess && (
              <div className="success-message">
                Đăng ký demo thành công (chưa gọi API)
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form" noValidate>
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
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  placeholder="Nhập họ và tên"
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

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
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Nhập email"
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="studentCode" className="form-label">
                  Mã sinh viên
                </label>
                <input
                  type="text"
                  id="studentCode"
                  name="studentCode"
                  value={formData.studentCode}
                  onChange={handleChange}
                  className={`form-input ${errors.studentCode ? 'error' : ''}`}
                  placeholder="Nhập mã sinh viên"
                />
                {errors.studentCode && (
                  <span className="error-message">{errors.studentCode}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Mật khẩu
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Xác nhận mật khẩu
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  Vai trò đăng ký
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Student">Sinh viên</option>
                  <option value="Club Leader">Chủ nhiệm CLB</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    Tôi đồng ý với điều khoản sử dụng
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <span className="error-message">{errors.agreeToTerms}</span>
                )}
              </div>

              <button type="submit" className="register-button">
                Đăng ký
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
                Theo dõi sự kiện, đăng ký tham gia CLB, quản lý thành viên và báo cáo thu chi
                một cách trực quan, tập trung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

