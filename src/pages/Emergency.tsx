import React, { useState } from 'react';
import './Emergency.css';

const Emergency: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);

  // 假資料 - 緊急聯絡人
  const emergencyContacts = [
    {
      id: '1',
      name: '緊急救援',
      number: '119',
      description: '消防救護',
      icon: '🚒',
      color: '#d32f2f'
    },
    {
      id: '2',
      name: '警察局',
      number: '110',
      description: '緊急報案',
      icon: '👮',
      color: '#1976d2'
    },
    {
      id: '3',
      name: '家人',
      number: '0912-345-678',
      description: '主要聯絡人',
      icon: '👨‍👩‍👧‍👦',
      color: '#4caf50'
    },
    {
      id: '4',
      name: '主治醫師',
      number: '02-2345-6789',
      description: '心臟科醫師',
      icon: '👨‍⚕️',
      color: '#9c27b0'
    }
  ];

  const handleSOSClick = () => {
    setSelectedContact(emergencyContacts[0]);
    setShowModal(true);
  };

  const handleContactClick = (contact: any) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleConfirmCall = () => {
    // TODO: 實作撥打電話邏輯
    console.log('撥打電話:', selectedContact?.number);
    setShowModal(false);
  };

  const handleCancelCall = () => {
    setShowModal(false);
  };

  return (
    <div className="emergency">
      <div className="emergency-header">
        <h1>緊急協助</h1>
        <p>緊急時刻，快速聯絡救援</p>
      </div>

      <div className="emergency-content">
        {/* 主要緊急按鈕 */}
        <section className="main-emergency">
          <h2>緊急救援</h2>
          <div className="emergency-main-btn">
            <button 
              onClick={handleSOSClick}
              className="sos-btn"
              aria-label="緊急救援按鈕"
            >
              <div className="sos-icon">🆘</div>
              <div className="sos-text">
                <div className="sos-title">緊急救援</div>
                <div className="sos-number">119</div>
              </div>
            </button>
          </div>
        </section>

        {/* 聯絡人清單 */}
        <section className="contacts-list">
          <h2>緊急聯絡人</h2>
          <div className="contacts-grid">
            {emergencyContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleContactClick(contact)}
                className="contact-card"
                style={{ '--contact-color': contact.color } as React.CSSProperties}
                aria-label={`聯絡 ${contact.name}`}
              >
                <div className="contact-icon">{contact.icon}</div>
                <div className="contact-info">
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-description">{contact.description}</div>
                  <div className="contact-number">{contact.number}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 緊急資訊 */}
        <section className="emergency-info">
          <h2>緊急資訊</h2>
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <h3>目前位置</h3>
                <p>台北市信義區信義路五段7號</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">💊</div>
              <div className="info-content">
                <h3>過敏藥物</h3>
                <p>青黴素、磺胺類藥物</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">🩸</div>
              <div className="info-content">
                <h3>血型</h3>
                <p>O型 Rh陽性</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">💊</div>
              <div className="info-content">
                <h3>目前用藥</h3>
                <p>降血壓藥、心臟病藥物</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 確認 Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCancelCall}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>確認撥打電話</h3>
            </div>
            
            <div className="modal-body">
              <div className="modal-contact">
                <div className="contact-icon">{selectedContact?.icon}</div>
                <div className="modal-contact-info">
                  <div className="modal-contact-name">{selectedContact?.name}</div>
                  <div className="modal-contact-number">{selectedContact?.number}</div>
                </div>
              </div>
              
              <p>確定要撥打緊急電話嗎？</p>
            </div>
            
            <div className="modal-actions">
              <button onClick={handleCancelCall} className="cancel-btn">
                取消
              </button>
              <button onClick={handleConfirmCall} className="confirm-btn">
                撥打電話
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emergency;
