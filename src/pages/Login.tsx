import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Login.css';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('請填寫所有欄位');
      return;
    }

    setIsLoading(true);
    
    try {
      await login(formData.username, formData.password);
      toast.success('登入成功！');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '登入失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>登入</h1>
          <p>歡迎回到長期照護平台</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">使用者名稱或電子郵件</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="請輸入使用者名稱或電子郵件"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="請輸入密碼"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? '登入中...' : '登入'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            還沒有帳號？{' '}
            <Link to="/register" className="register-link">
              立即註冊
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

