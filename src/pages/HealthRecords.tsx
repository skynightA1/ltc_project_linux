import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import './HealthRecords.css';

const HealthRecords: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<string>('blood_pressure');

  // 假資料 - 健康紀錄
  const healthData = {
    blood_pressure: {
      label: '血壓',
      unit: 'mmHg',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 29 - i), 'MM/dd', { locale: zhTW }),
        systolic: 120 + Math.floor(Math.random() * 30),
        diastolic: 80 + Math.floor(Math.random() * 20),
      })),
      recent: [
        { id: '1', value: '125/85', status: 'normal', timestamp: '2024-01-15 08:30' },
        { id: '2', value: '130/88', status: 'warning', timestamp: '2024-01-14 08:30' },
        { id: '3', value: '118/82', status: 'normal', timestamp: '2024-01-13 08:30' },
      ]
    },
    blood_sugar: {
      label: '血糖',
      unit: 'mg/dL',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 29 - i), 'MM/dd', { locale: zhTW }),
        value: 100 + Math.floor(Math.random() * 40),
      })),
      recent: [
        { id: '1', value: '110', status: 'normal', timestamp: '2024-01-15 07:00' },
        { id: '2', value: '125', status: 'warning', timestamp: '2024-01-14 07:00' },
        { id: '3', value: '95', status: 'normal', timestamp: '2024-01-13 07:00' },
      ]
    },
    weight: {
      label: '體重',
      unit: 'kg',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 29 - i), 'MM/dd', { locale: zhTW }),
        value: 65 + Math.floor(Math.random() * 6),
      })),
      recent: [
        { id: '1', value: '65.2', status: 'normal', timestamp: '2024-01-15 06:00' },
        { id: '2', value: '65.8', status: 'normal', timestamp: '2024-01-14 06:00' },
        { id: '3', value: '64.9', status: 'normal', timestamp: '2024-01-13 06:00' },
      ]
    },
    temperature: {
      label: '體溫',
      unit: '°C',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 29 - i), 'MM/dd', { locale: zhTW }),
        value: 36.5 + Math.random() * 0.8,
      })),
      recent: [
        { id: '1', value: '36.8', status: 'normal', timestamp: '2024-01-15 09:00' },
        { id: '2', value: '37.2', status: 'warning', timestamp: '2024-01-14 09:00' },
        { id: '3', value: '36.6', status: 'normal', timestamp: '2024-01-13 09:00' },
      ]
    },
    heart_rate: {
      label: '心率',
      unit: 'bpm',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(new Date(), 29 - i), 'MM/dd', { locale: zhTW }),
        value: 70 + Math.floor(Math.random() * 20),
      })),
      recent: [
        { id: '1', value: '75', status: 'normal', timestamp: '2024-01-15 08:00' },
        { id: '2', value: '82', status: 'normal', timestamp: '2024-01-14 08:00' },
        { id: '3', value: '68', status: 'normal', timestamp: '2024-01-13 08:00' },
      ]
    }
  };

  const currentMetric = healthData[selectedMetric as keyof typeof healthData];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'danger': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return '正常';
      case 'warning': return '偏高';
      case 'danger': return '異常';
      default: return '未知';
    }
  };

  const calculateStats = () => {
    const values = currentMetric.data.map(d => {
      if (selectedMetric === 'blood_pressure' && 'systolic' in d) {
        return d.systolic;
      } else if ('value' in d) {
        return d.value;
      }
      return 0;
    });
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    return { avg: avg.toFixed(1), max, min };
  };

  const stats = calculateStats();

  return (
    <div className="health-records">
      <div className="health-records-header">
        <h1>健康紀錄</h1>
        <p>追蹤您的健康數據趨勢</p>
      </div>

      {/* 指標選擇器 */}
      <section className="metric-selector">
        <h2>選擇健康指標</h2>
        <div className="metric-grid">
          {Object.entries(healthData).map(([key, metric]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`metric-btn ${selectedMetric === key ? 'active' : ''}`}
            >
              <div className="metric-icon">
                {key === 'blood_pressure' && '❤️'}
                {key === 'blood_sugar' && '🩸'}
                {key === 'weight' && '⚖️'}
                {key === 'temperature' && '🌡️'}
                {key === 'heart_rate' && '💓'}
              </div>
              <div className="metric-label">{metric.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 統計摘要 */}
      <section className="statistics">
        <h2>統計摘要</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">平均值</div>
            <div className="stat-value">{stats.avg}</div>
            <div className="stat-unit">{currentMetric.unit}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">最高值</div>
            <div className="stat-value">{stats.max}</div>
            <div className="stat-unit">{currentMetric.unit}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">最低值</div>
            <div className="stat-value">{stats.min}</div>
            <div className="stat-unit">{currentMetric.unit}</div>
          </div>
        </div>
      </section>

      {/* 趨勢圖表 */}
      <section className="trend-chart">
        <h2>趨勢圖表</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentMetric.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              {selectedMetric === 'blood_pressure' ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="systolic" 
                    stroke="#e74c3c" 
                    strokeWidth={2}
                    name="收縮壓"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="diastolic" 
                    stroke="#3498db" 
                    strokeWidth={2}
                    name="舒張壓"
                  />
                </>
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1976d2" 
                  strokeWidth={2}
                  name={currentMetric.label}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 最近記錄 */}
      <section className="recent-records">
        <h2>最近記錄</h2>
        <div className="records-list">
          {currentMetric.recent.map((record) => (
            <div key={record.id} className="record-item">
              <div className="record-icon">
                {selectedMetric === 'blood_pressure' && '❤️'}
                {selectedMetric === 'blood_sugar' && '🩸'}
                {selectedMetric === 'weight' && '⚖️'}
                {selectedMetric === 'temperature' && '🌡️'}
                {selectedMetric === 'heart_rate' && '💓'}
              </div>
              <div className="record-content">
                <div className="record-value">{record.value}</div>
                <div className="record-unit">{currentMetric.unit}</div>
                <div className="record-time">{record.timestamp}</div>
              </div>
              <div 
                className="record-status"
                style={{ color: getStatusColor(record.status) }}
              >
                {getStatusText(record.status)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HealthRecords;
