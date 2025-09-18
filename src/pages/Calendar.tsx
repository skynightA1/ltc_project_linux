import React, { useEffect, useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import './Calendar.css';
import { useAuth } from '../context/AuthContext';

const Calendar: React.FC = () => {
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { state: authState } = useAuth();

  type CalendarEvent = {
    id: number;
    title: string;
    content?: string | null;
    start_time: string; // ISO
    end_time: string;   // ISO
    author_user_id: number;
    color?: string | null;
  };

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDate, setNewDate] = useState<string>(''); // yyyy-MM-dd
  const [newStart, setNewStart] = useState<string>('09:00'); // HH:mm
  const [newEnd, setNewEnd] = useState<string>('09:30'); // HH:mm
  const [newColor, setNewColor] = useState<string>('#4caf50');
  const API_BASE = 'http://localhost:3001';

  // 已移除未使用的 getEventTypeColor / getEventTypeIcon

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(ev => isSameDay(parseISO(ev.start_time), date));
  };

  const getEventsForList = () => {
    return [...events]
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  };

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);

  const buildAuthHeaders = (): HeadersInit => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authState.token) headers['Authorization'] = `Bearer ${authState.token}`;
    return headers;
  };

  const loadEvents = async () => {
    if (!authState.token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({ start: weekStart.toISOString(), end: weekEnd.toISOString() });
      const res = await fetch(`${API_BASE}/api/family/calendar?${params.toString()}`, {
        headers: buildAuthHeaders()
      });
      if (!res.ok) throw new Error('載入行事曆失敗');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.token, weekStart.getTime(), weekEnd.getTime()]);

  const createEvent = async () => {
    if (!authState.token || !newTitle || !newDate || !newStart || !newEnd) return;
    try {
      setCreating(true);
      const startIso = new Date(`${newDate}T${newStart}:00`).toISOString();
      const endIso = new Date(`${newDate}T${newEnd}:00`).toISOString();
      const res = await fetch(`${API_BASE}/api/family/calendar`, {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ title: newTitle, content: newContent || undefined, start_time: startIso, end_time: endIso, color: newColor })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '新增事件失敗');
      setNewTitle('');
      setNewContent('');
      setNewDate('');
      setNewStart('09:00');
      setNewEnd('09:30');
      await loadEvents();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : '新增事件失敗');
    } finally {
      setCreating(false);
    }
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

        {/* 新增事件簡易表單 */}
        <div className="add-event-inline" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" placeholder="標題" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ padding: 6 }} />
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ padding: 6 }} />
          <input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} style={{ padding: 6 }} />
          <span>至</span>
          <input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} style={{ padding: 6 }} />
          <input type="text" placeholder="內容（可選）" value={newContent} onChange={(e) => setNewContent(e.target.value)} style={{ padding: 6, minWidth: 200 }} />
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} title="顏色" />
          <button className="action-btn" onClick={createEvent} disabled={creating || !newTitle || !newDate}>新增</button>
          {loading && <span>載入中...</span>}
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
                      className={`event-item`}
                      style={{
                        top: `${(parseISO(event.start_time).getHours() * 60 + parseISO(event.start_time).getMinutes()) * (100 / 1440)}%`,
                        height: `${(parseISO(event.end_time).getTime() - parseISO(event.start_time).getTime()) / (1000 * 60) * (100 / 1440)}%`,
                        backgroundColor: event.color || '#4caf50'
                      }}
                    >
                      <div className="event-icon">📅</div>
                      <div className="event-content">
                        <div className="event-title">{event.title}</div>
                        <div className="event-time">
                          {format(parseISO(event.start_time), 'HH:mm', { locale: zhTW })} - {format(parseISO(event.end_time), 'HH:mm', { locale: zhTW })}
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
                className={`list-event-item`}
              >
                <div 
                  className="event-type-indicator"
                  style={{ backgroundColor: event.color || '#4caf50' }}
                >
                  📅
                </div>
                
                <div className="event-details">
                  <div className="event-header">
                    <div className="event-title">{event.title}</div>
                  </div>
                  
                  {event.content && <div className="event-description">{event.content}</div>}
                  
                  <div className="event-time">
                    {format(parseISO(event.start_time), 'yyyy年MM月dd日 EEE HH:mm', { locale: zhTW })} - {format(parseISO(event.end_time), 'HH:mm', { locale: zhTW })}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button className="action-btn" onClick={async () => {
                      const title = prompt('修改標題', event.title) || event.title;
                      const color = prompt('修改顏色（Hex）', event.color || '#4caf50') || event.color || '#4caf50';
                      const res = await fetch(`${API_BASE}/api/family/calendar/${event.id}`, {
                        method: 'PATCH',
                        headers: buildAuthHeaders(),
                        body: JSON.stringify({ title, color })
                      });
                      const data = await res.json();
                      if (!res.ok) return alert(data.error || '更新失敗');
                      await loadEvents();
                    }}>編輯</button>
                    <button className="action-btn" onClick={async () => {
                      if (!window.confirm('確定刪除？')) return;
                      const res = await fetch(`${API_BASE}/api/family/calendar/${event.id}`, { method: 'DELETE', headers: buildAuthHeaders() });
                      const data = await res.json();
                      if (!res.ok) return alert(data.error || '刪除失敗');
                      await loadEvents();
                    }}>刪除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 新增事件按鈕（保留樣式容器，實際功能移到上方表單） */}
      <div className="add-event-btn" />
    </div>
  );
};

export default Calendar;
