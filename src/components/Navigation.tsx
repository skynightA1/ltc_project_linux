import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { NavItem } from '../types';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const navItems: NavItem[] = [
  { id: 'dashboard', label: '首頁', icon: '🏠', path: '/' },
  { id: 'ai-assistant', label: 'AI 助理', icon: '🤖', path: '/ai-assistant' },
  { id: 'health-records', label: '健康紀錄', icon: '📊', path: '/health-records' },
  { id: 'calendar', label: '提醒', icon: '📅', path: '/calendar' },
  { id: 'emergency', label: '緊急協助', icon: '🆘', path: '/emergency' },
  { id: 'settings', label: '設定', icon: '⚙️', path: '/settings' }
];

const Navigation: React.FC = () => {
  const location = useLocation();
  const { state: authState, logout } = useAuth();

  return (
    <>
      {/* 桌機導覽列 */}
      <nav className="navbar desktop-nav" role="navigation" aria-label="主要導覽">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h1 className="navbar-title">長期照護平台</h1>
          </div>
          
          <ul className="navbar-menu">
            {navItems.map((item) => (
              <li key={item.id} className="navbar-item">
                <Link
                  to={item.path}
                  className={`navbar-link ${location.pathname === item.path ? 'active' : ''}`}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  <span className="navbar-icon" aria-hidden="true">{item.icon}</span>
                  <span className="navbar-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* 麵包屑 */}
          <div className="breadcrumb" aria-label="麵包屑導覽">
            <span className="breadcrumb-item">首頁</span>
            {location.pathname !== '/' && (
              <>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-item">
                  {navItems.find(item => item.path === location.pathname)?.label}
                </span>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 手機底部導覽列 */}
      <nav className="tabbar mobile-nav" role="navigation" aria-label="主要導覽">
        <ul className="tabbar-menu">
          {navItems.map((item) => (
            <li key={item.id} className="tabbar-item">
              <Link
                to={item.path}
                className={`tabbar-link ${location.pathname === item.path ? 'active' : ''}`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <span className="tabbar-icon" aria-hidden="true">{item.icon}</span>
                <span className="tabbar-label">{item.label}</span>
              </Link>
            </li>
          ))}
          
        </ul>
      </nav>
    </>
  );
};

export default Navigation;
