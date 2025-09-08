import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const Settings: React.FC = () => {
  const { state, updateSettings } = useApp();
  const { state: authState, logout } = useAuth();

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    updateSettings({ fontSize: size });
  };

  const handleHighContrastToggle = () => {
    updateSettings({ highContrast: !state.settings.highContrast });
  };

  const handleLanguageChange = (language: string) => {
    updateSettings({ language });
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>設定</h1>
        <p>個人化您的使用體驗</p>
      </div>

      <div className="settings-content">
        {/* 使用者資訊與登出 */}
        {authState.user && (
          <section className="setting-section">
            <h2>帳戶</h2>
            <p className="setting-description">管理您的登入狀態與個人資訊</p>
            <div className="setting-actions">
              <div className="action-content">
                <div className="action-title">歡迎，{authState.user.full_name || authState.user.username}</div>
                <div className="action-description">電子郵件：{authState.user.email}</div>
              </div>
              <button className="logout-btn" onClick={logout} aria-label="登出">登出</button>
            </div>
          </section>
        )}
        {/* 字體大小設定 */}
        <section className="setting-section">
          <h2>字體大小</h2>
          <p className="setting-description">調整應用程式的字體大小</p>
          <div className="setting-options">
            <button
              onClick={() => handleFontSizeChange('small')}
              className={`option-btn ${state.settings.fontSize === 'small' ? 'active' : ''}`}
            >
              <div className="option-icon">A</div>
              <div className="option-label">小</div>
            </button>
            <button
              onClick={() => handleFontSizeChange('medium')}
              className={`option-btn ${state.settings.fontSize === 'medium' ? 'active' : ''}`}
            >
              <div className="option-icon">A</div>
              <div className="option-label">中</div>
            </button>
            <button
              onClick={() => handleFontSizeChange('large')}
              className={`option-btn ${state.settings.fontSize === 'large' ? 'active' : ''}`}
            >
              <div className="option-icon">A</div>
              <div className="option-label">大</div>
            </button>
          </div>
        </section>

        {/* 高對比度模式 */}
        <section className="setting-section">
          <h2>高對比度模式</h2>
          <p className="setting-description">提高文字與背景的對比度，改善可讀性</p>
          <div className="setting-toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={state.settings.highContrast}
                onChange={handleHighContrastToggle}
                aria-label="切換高對比度模式"
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              {state.settings.highContrast ? '開啟' : '關閉'}
            </span>
          </div>
        </section>

        {/* 語言設定 */}
        <section className="setting-section">
          <h2>語言設定</h2>
          <p className="setting-description">選擇您偏好的語言</p>
          <div className="setting-select">
            <select
              value={state.settings.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              aria-label="選擇語言"
            >
              <option value="zh-TW">繁體中文</option>
              <option value="zh-CN">簡體中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
        </section>

        {/* 資料管理 */}
        <section className="setting-section">
          <h2>資料管理</h2>
          <p className="setting-description">管理您的個人資料和應用程式資料</p>
          <div className="setting-actions">
            <button className="action-btn export-btn">
              <div className="action-icon">📤</div>
              <div className="action-content">
                <div className="action-title">匯出資料</div>
                <div className="action-description">下載您的健康資料</div>
              </div>
            </button>
            
            <button className="action-btn import-btn">
              <div className="action-icon">📥</div>
              <div className="action-content">
                <div className="action-title">匯入資料</div>
                <div className="action-description">從檔案匯入健康資料</div>
              </div>
            </button>
            
            <button className="action-btn clear-btn">
              <div className="action-icon">🗑️</div>
              <div className="action-content">
                <div className="action-title">清除資料</div>
                <div className="action-description">清除所有本地資料</div>
              </div>
            </button>
          </div>
        </section>

        {/* 關於 */}
        <section className="setting-section">
          <h2>關於</h2>
          <div className="about-info">
            <div className="app-info">
              <div className="app-icon">🏥</div>
              <div className="app-details">
                <div className="app-name">長期照護平台</div>
                <div className="app-version">版本 1.0.0</div>
              </div>
            </div>
            
            <div className="about-links">
              <button className="about-link" onClick={() => alert('使用條款功能開發中')}>使用條款</button>
              <button className="about-link" onClick={() => alert('隱私政策功能開發中')}>隱私政策</button>
              <button className="about-link" onClick={() => alert('幫助中心功能開發中')}>幫助中心</button>
              <button className="about-link" onClick={() => alert('聯絡我們功能開發中')}>聯絡我們</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;

