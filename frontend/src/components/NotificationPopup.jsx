import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Trash2 } from 'lucide-react';

const NotificationPopup = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showPopupAlert, setShowPopupAlert] = useState(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      checkMonthEndAlert();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(data);
      
      // If there are unread summary alerts, show the popup only once per session
      const unreadAlert = data.find(n => !n.read && n.type === 'summary');
      if (unreadAlert) {
        const hasSeen = sessionStorage.getItem(`seen_alert_${unreadAlert._id}`);
        if (!hasSeen) {
          setShowPopupAlert(unreadAlert);
          sessionStorage.setItem(`seen_alert_${unreadAlert._id}`, 'true');
        }
      }
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  };

  const checkMonthEndAlert = async () => {
    try {
      await axios.post('http://localhost:5000/api/expenses/check-alerts', {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Fetch again in case a new alert was created
      fetchNotifications();
    } catch (error) {
      console.error('Error checking alerts', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(notifications.filter(n => n._id !== id));
      if (showPopupAlert && showPopupAlert._id === id) {
        setShowPopupAlert(null);
      }
    } catch (error) {
      console.error('Error deleting notification', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      if (showPopupAlert && showPopupAlert._id === id) {
        setShowPopupAlert(null);
      }
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  return (
    <>
      {/* Top right notification bell */}
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="btn" 
          style={{ background: 'transparent', padding: '0.5rem', position: 'relative' }}
        >
          <Bell size={24} color="var(--text-main)" />
          {notifications.length > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0, background: 'var(--danger)', 
              color: 'white', borderRadius: '50%', width: '20px', height: '20px', 
              fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {notifications.length}
            </span>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 100,
                padding: '1rem'
              }}
            >
              <h4 style={{ marginTop: 0, borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Notifications</h4>
              {notifications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No new notifications.</p>
              ) : (
                notifications.map(n => (
                  <div key={n._id} style={{ 
                    padding: '0.75rem', 
                    borderBottom: '1px solid var(--surface-border)',
                    background: n.read ? 'transparent' : 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                    position: 'relative'
                  }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', paddingRight: '20px' }}>{n.message}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!n.read && (
                        <button onClick={() => markAsRead(n._id)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Mark Read</button>
                      )}
                      <button onClick={() => handleDelete(n._id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Popup Alert for Month End */}
      <AnimatePresence>
        {showPopupAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
              width: '90%',
              maxWidth: '400px'
            }}
            className="glass-panel"
          >
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => markAsRead(showPopupAlert._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <h2 className="heading" style={{ fontSize: '1.5rem' }}>Month End Summary</h2>
              <p style={{ fontSize: '1.125rem', margin: '1.5rem 0' }}>{showPopupAlert.message}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button onClick={() => markAsRead(showPopupAlert._id)} className="btn btn-primary">Acknowledge</button>
                <button onClick={() => handleDelete(showPopupAlert._id)} className="btn btn-danger">Delete</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showPopupAlert && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 90
        }} />
      )}
    </>
  );
};

export default NotificationPopup;
