import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證必填欄位
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('請填寫所有必填欄位');
      return;
    }

    // 驗證密碼確認
    if (formData.password !== formData.confirmPassword) {
      toast.error('密碼確認不一致');
      return;
    }

    // 驗證密碼長度
    if (formData.password.length < 6) {
      toast.error('密碼至少需要 6 個字元');
      return;
    }

    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('請輸入有效的電子郵件地址');
      return;
    }

    setIsLoading(true);
    
    try {
      await register(
        formData.username, 
        formData.email, 
        formData.password, 
        formData.full_name || undefined
      );
      toast.success('註冊成功！');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '註冊失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>註冊</h1>
          <p>建立您的長期照護平台帳號</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">使用者名稱 *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="請輸入使用者名稱"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">電子郵件 *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="請輸入電子郵件"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="full_name">姓名</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="請輸入您的姓名（選填）"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼 *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="請輸入密碼（至少 6 個字元）"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">確認密碼 *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="請再次輸入密碼"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="register-btn"
            disabled={isLoading}
          >
            {isLoading ? '註冊中...' : '註冊'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            已經有帳號了？{' '}
            <Link to="/login" className="login-link">
              立即登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

