import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import './Calendar.css';

const Calendar: React.FC = () => {
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // 假資料 - 行事曆事件
  const events = [
    {
      id: '1',
      title: '血壓測量',
      description: '每日血壓監測',
      startTime: new Date(2024, 0, 15, 9, 0),
      endTime: new Date(2024, 0, 15, 9, 30),
      type: 'health',
      isCompleted: false
    },
    {
      id: '2',
      title: '服用降血壓藥',
      description: '飯後服用',
      startTime: new Date(2024, 0, 15, 12, 0),
      endTime: new Date(2024, 0, 15, 12, 15),
      type: 'medication',
      isCompleted: false
    },
    {
      id: '3',
      title: '醫師回診',
      description: '心臟科門診',
      startTime: new Date(2024, 0, 16, 14, 30),
      endTime: new Date(2024, 0, 16, 15, 30),
      type: 'appointment',
      isCompleted: false
    },
    {
      id: '4',
      title: '散步運動',
      description: '戶外散步30分鐘',
      startTime: new Date(2024, 0, 15, 16, 0),
      endTime: new Date(2024, 0, 15, 16, 30),
      type: 'exercise',
      isCompleted: true
    },
    {
      id: '5',
      title: '血糖測量',
      description: '空腹血糖檢測',
      startTime: new Date(2024, 0, 16, 7, 0),
      endTime: new Date(2024, 0, 16, 7, 15),
      type: 'health',
      isCompleted: false
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'health': return '#4caf50';
      case 'medication': return '#ff9800';
      case 'appointment': return '#9c27b0';
      case 'exercise': return '#2196f3';
      default: return '#666';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'health': return '💊';
      case 'medication': return '💊';
      case 'appointment': return '👨‍⚕️';
      case 'exercise': return '🏃';
      default: return '📋';
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.startTime, date));
  };

  const getEventsForList = () => {
    return events
      .filter(event => event.startTime >= new Date())
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const weekDays = getWeekDays();
  const listEvents = getEventsForList();

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h1>行事曆</h1>
        <p>管理您的健康提醒和預約</p>
      </div>

      {/* 控制列 */}
      <section className="calendar-controls">
        <div className="view-toggle">
          <button
            onClick={() => setViewMode('week')}
            className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
          >
            週視圖
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            清單視圖
          </button>
        </div>
        
        <div className="date-navigation">
          <button 
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
            className="nav-btn"
          >
            ←
          </button>
          <span className="current-week">
            {format(weekDays[0], 'yyyy年MM月dd日', { locale: zhTW })} - {format(weekDays[6], 'MM月dd日', { locale: zhTW })}
          </span>
          <button 
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="nav-btn"
          >
            →
          </button>
        </div>
      </section>

      {/* 週視圖 */}
      {viewMode === 'week' && (
        <section className="week-view">
          <div className="week-grid">
            <div className="time-column">
              <div className="time-header">時間</div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="time-slot">
                  {i.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
            
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="day-column">
                <div className="day-header">
                  <div className="day-name">
                    {format(day, 'EEE', { locale: zhTW })}
                  </div>
                  <div className="day-date">
                    {format(day, 'dd', { locale: zhTW })}
                  </div>
                </div>
                
                <div className="day-events">
                  {getEventsForDay(day).map((event) => (
                    <div
                      key={event.id}
                      className={`event-item ${event.type} ${event.isCompleted ? 'completed' : ''}`}
                      style={{
                        top: `${(event.startTime.getHours() * 60 + event.startTime.getMinutes()) * (100 / 1440)}%`,
                        height: `${(event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60) * (100 / 1440)}%`,
                        backgroundColor: getEventTypeColor(event.type)
                      }}
                    >
                      <div className="event-icon">
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div className="event-content">
                        <div className="event-title">{event.title}</div>
                        <div className="event-time">
                          {format(event.startTime, 'HH:mm', { locale: zhTW })} - {format(event.endTime, 'HH:mm', { locale: zhTW })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 清單視圖 */}
      {viewMode === 'list' && (
        <section className="list-view">
          <div className="events-list">
            {listEvents.map((event) => (
              <div 
                key={event.id} 
                className={`list-event-item ${event.type} ${event.isCompleted ? 'completed' : ''}`}
              >
                <div 
                  className="event-type-indicator"
                  style={{ backgroundColor: getEventTypeColor(event.type) }}
                >
                  {getEventTypeIcon(event.type)}
                </div>
                
                <div className="event-details">
                  <div className="event-header">
                    <div className="event-title">{event.title}</div>
                    <div className="event-status">
                      {event.isCompleted ? '✓' : '⏰'}
                    </div>
                  </div>
                  
                  <div className="event-description">{event.description}</div>
                  
                  <div className="event-time">
                    {format(event.startTime, 'yyyy年MM月dd日 EEE HH:mm', { locale: zhTW })} - {format(event.endTime, 'HH:mm', { locale: zhTW })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 新增事件按鈕 */}
      <div className="add-event-btn">
        <button className="add-btn">
          <span className="add-icon">+</span>
          <span className="add-text">新增事件</span>
        </button>
      </div>
    </div>
  );
};

export default Calendar;
