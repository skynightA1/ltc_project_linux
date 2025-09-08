import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  // 假資料 - 健康趨勢
  const healthData = Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), 'MM/dd', { locale: zhTW }),
    bloodPressure: 120 + Math.floor(Math.random() * 20),
    heartRate: 70 + Math.floor(Math.random() * 20),
    bloodSugar: 100 + Math.floor(Math.random() * 30),
  }));

  // 假資料 - 今日提醒
  const todayReminders = [
    {
      id: '1',
      title: '血壓測量',
      time: '09:00',
      type: 'health',
      completed: false
    },
    {
      id: '2',
      title: '服用降血壓藥',
      time: '12:00',
      type: 'medication',
      completed: false
    },
    {
      id: '3',
      title: '散步運動',
      time: '16:00',
      type: 'exercise',
      completed: false
    },
    {
      id: '4',
      title: '醫師回診',
      time: '14:30',
      type: 'appointment',
      completed: true
    }
  ];

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'health': return '#4caf50';
      case 'medication': return '#ff9800';
      case 'exercise': return '#2196f3';
      case 'appointment': return '#9c27b0';
      default: return '#666';
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'health': return '💊';
      case 'medication': return '💊';
      case 'exercise': return '🏃';
      case 'appointment': return '👨‍⚕️';
      default: return '📋';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>健康儀表板</h1>
        <p>歡迎回來！以下是您今天的健康概覽</p>
      </div>

      {/* 快速操作 */}
      <section className="quick-actions">
        <h2>快速操作</h2>
        <div className="action-grid">
          <Link to="/ai-assistant" className="action-card">
            <div className="action-icon">🤖</div>
            <div className="action-title">AI 助理</div>
            <div className="action-description">智能健康諮詢</div>
          </Link>
          
          <Link to="/health-records" className="action-card">
            <div className="action-icon">📊</div>
            <div className="action-title">健康紀錄</div>
            <div className="action-description">查看健康數據</div>
          </Link>
          
          <Link to="/calendar" className="action-card">
            <div className="action-icon">📅</div>
            <div className="action-title">行事曆</div>
            <div className="action-description">管理提醒事項</div>
          </Link>
          
          <Link to="/emergency" className="action-card emergency">
            <div className="action-icon">🆘</div>
            <div className="action-title">緊急協助</div>
            <div className="action-description">緊急聯絡功能</div>
          </Link>
        </div>
      </section>

      {/* 健康概覽 */}
      <section className="health-overview">
        <h2>健康概覽</h2>
        <div className="overview-grid">
          <div className="overview-card">
            <div className="overview-icon">❤️</div>
            <div className="overview-content">
              <div className="overview-title">血壓</div>
              <div className="overview-value">120/80</div>
              <div className="overview-status normal">正常</div>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="overview-icon">💓</div>
            <div className="overview-content">
              <div className="overview-title">心率</div>
              <div className="overview-value">75 bpm</div>
              <div className="overview-status normal">正常</div>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="overview-icon">🩸</div>
            <div className="overview-content">
              <div className="overview-title">血糖</div>
              <div className="overview-value">110 mg/dL</div>
              <div className="overview-status normal">正常</div>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="overview-icon">⚖️</div>
            <div className="overview-content">
              <div className="overview-title">體重</div>
              <div className="overview-value">65 kg</div>
              <div className="overview-status normal">正常</div>
            </div>
          </div>
        </div>
      </section>

      {/* 健康趨勢圖表 */}
      <section className="health-trends">
        <h2>健康趨勢</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="bloodPressure" 
                stroke="#e74c3c" 
                strokeWidth={2}
                name="血壓"
              />
              <Line 
                type="monotone" 
                dataKey="heartRate" 
                stroke="#3498db" 
                strokeWidth={2}
                name="心率"
              />
              <Line 
                type="monotone" 
                dataKey="bloodSugar" 
                stroke="#f39c12" 
                strokeWidth={2}
                name="血糖"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 今日提醒 */}
      <section className="today-reminders">
        <h2>今日提醒</h2>
        <div className="reminders-list">
          {todayReminders.map((reminder) => (
            <div 
              key={reminder.id} 
              className={`reminder-item ${reminder.completed ? 'completed' : ''}`}
            >
              <div 
                className="reminder-icon"
                style={{ color: getStatusColor(reminder.type) }}
              >
                {getStatusIcon(reminder.type)}
              </div>
              <div className="reminder-content">
                <div className="reminder-title">{reminder.title}</div>
                <div className="reminder-time">{reminder.time}</div>
              </div>
              <div className="reminder-status">
                {reminder.completed ? '✓' : '⏰'}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
