import React from 'react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ textAlign: 'center' }}>
        <h1>歡迎使用長期照護平台</h1>
        <p>祝您有個順心的一天！</p>
      </div>
    </div>
  );
};

export default Dashboard;
