import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LogOut, FileText } from 'lucide-react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import NotificationPopup from '../components/NotificationPopup';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/expenses', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/expenses', expenseData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setExpenses([data, ...expenses]);
    } catch (error) {
      console.error('Failed to add expense', error);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setExpenses(expenses.filter(e => e._id !== id));
    } catch (error) {
      console.error('Failed to delete expense', error);
    }
  };

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    logout();
    navigate('/login');
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="container">
      <nav className="nav-bar glass-panel" style={{ marginBottom: '2rem' }}>
        <h1 className="heading" style={{ margin: 0 }}>ExpenseTracker</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Hello, {user.username}</span>
          <NotificationPopup />
          <button onClick={handleLogout} className="btn" style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.5rem' }}>
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem 2rem', borderLeft: '4px solid var(--primary)', flex: '1 1 300px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Total Expenses (All Time)</h3>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>₹{totalExpenses.toFixed(2)}</p>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <Link to="/reports" className="btn btn-primary" style={{ textDecoration: 'none', padding: '1rem 2rem' }}>
              <FileText size={20} /> View Reports
            </Link>
          </div>
        </div>

        <ExpenseForm onAddExpense={handleAddExpense} />
        
        <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
      </motion.div>
    </div>
  );
};

export default Dashboard;
