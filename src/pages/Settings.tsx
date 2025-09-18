import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const Settings: React.FC = () => {
  const { state, updateSettings } = useApp();
  const { state: authState, logout } = useAuth();

  // 家庭功能狀態
  const [inviteeUsername, setInviteeUsername] = useState<string>('');
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [invitations, setInvitations] = useState<Array<{ id: number; family_id: number; inviter_id: number; inviter_username: string; status: string; created_at: string }>>([]);
  const [members, setMembers] = useState<Array<{ id: number; username: string; email: string; full_name?: string }>>([]);
  const [familyId, setFamilyId] = useState<number | null>(null);
  const [loadingInvites, setLoadingInvites] = useState<boolean>(false);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const API_BASE = 'http://localhost:3001';

  const buildAuthHeaders = (): HeadersInit => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authState.token) {
      headers['Authorization'] = `Bearer ${authState.token}`;
    }
    return headers;
  };

  const loadInvitations = async () => {
    if (!authState.token) return;
    try {
      setLoadingInvites(true);
      const res = await fetch(`${API_BASE}/api/family/invitations`, {
        headers: buildAuthHeaders()
      });
      if (!res.ok) throw new Error('取得邀請清單失敗');
      const data = await res.json();
      setInvitations(data.invitations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInvites(false);
    }
  };

  const loadMembers = async () => {
    if (!authState.token) return;
    try {
      setLoadingMembers(true);
      const res = await fetch(`${API_BASE}/api/family/members`, {
        headers: buildAuthHeaders()
      });
      if (!res.ok) throw new Error('取得家庭成員失敗');
      const data = await res.json();
      setFamilyId(data.familyId ?? null);
      setMembers(data.members || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadInvitations();
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.token]);

  const sendInvite = async () => {
    if (!inviteeUsername || !authState.token) return;
    try {
      setIsInviting(true);
      const res = await fetch(`${API_BASE}/api/family/invite`, {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ inviteeUsername: inviteeUsername.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '邀請失敗');
      setInviteeUsername('');
      await loadInvitations();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : '邀請失敗');
    } finally {
      setIsInviting(false);
    }
  };

  const acceptInvite = async (invitationId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/family/accept`, {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ invitationId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '接受邀請失敗');
      await Promise.all([loadInvitations(), loadMembers()]);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : '接受邀請失敗');
    }
  };

  const declineInvite = async (invitationId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/family/decline`, {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ invitationId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '拒絕邀請失敗');
      await loadInvitations();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : '拒絕邀請失敗');
    }
  };

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

        {/* 家庭功能 */}
        {authState.user && (
          <section className="setting-section">
            <h2>家庭</h2>
            <p className="setting-description">邀請其他用戶加入家庭並管理家庭成員</p>

            <div className="setting-actions" style={{ gap: '12px', alignItems: 'flex-end' }}>
              <div className="action-content" style={{ flex: 1 }}>
                <div className="action-title">邀請用戶加入家庭</div>
                <div className="action-description">輸入對方的用戶名稱</div>
                <input
                  type="text"
                  value={inviteeUsername}
                  onChange={(e) => setInviteeUsername(e.target.value)}
                  placeholder="用戶名稱"
                  aria-label="用戶名稱"
                  style={{ width: '100%', padding: '8px', marginTop: '8px' }}
                />
              </div>
              <button className="action-btn" onClick={sendInvite} disabled={isInviting || !inviteeUsername}>
                <div className="action-icon">👪</div>
                <div className="action-content">
                  <div className="action-title">送出邀請</div>
                  <div className="action-description">將此用戶加入你的家庭</div>
                </div>
              </button>
            </div>

            <div className="setting-subsection" style={{ marginTop: '16px' }}>
              <h3>我的邀請</h3>
              {loadingInvites ? (
                <div>載入中...</div>
              ) : invitations.length === 0 ? (
                <div>目前沒有待處理的邀請</div>
              ) : (
                <ul>
                  {invitations.map((inv) => (
                    <li key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                      <span>來自 {inv.inviter_username}（邀請 ID: {inv.id}）</span>
                      <button onClick={() => acceptInvite(inv.id)} className="action-btn">接受</button>
                      <button onClick={() => declineInvite(inv.id)} className="action-btn">拒絕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="setting-subsection" style={{ marginTop: '16px' }}>
              <h3>家庭成員 {familyId ? `(ID: ${familyId})` : ''}</h3>
              {loadingMembers ? (
                <div>載入中...</div>
              ) : members.length === 0 ? (
                <div>尚未加入任何家庭</div>
              ) : (
                <ul>
                  {members.map((m) => (
                    <li key={m.id} style={{ padding: '6px 0' }}>
                      {m.full_name || m.username}（{m.email}）
                    </li>
                  ))}
                </ul>
              )}
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

