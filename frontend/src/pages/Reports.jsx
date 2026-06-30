import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LogOut, Download, Home, ArrowLeft } from 'lucide-react';
import ExpenseList from '../components/ExpenseList';
import AnalyticsCharts from '../components/AnalyticsCharts';
import NotificationPopup from '../components/NotificationPopup';
import { generatePDFDataUri } from '../utils/pdfExport';
import { X } from 'lucide-react';

const Reports = () => {
  const { user, logout } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('All Time');
  const [pdfPreviewUri, setPdfPreviewUri] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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

  const handlePreviewPDF = async () => {
    setIsGeneratingPDF(true);
    const uri = await generatePDFDataUri('pdf-report-content');
    setPdfPreviewUri(uri);
    setIsGeneratingPDF(false);
  };

  const handleDownloadPDF = () => {
    if (!pdfPreviewUri) return;
    const link = document.createElement('a');
    link.href = pdfPreviewUri;
    const reportMonth = selectedMonth.replace(' ', '_');
    link.download = `Expenses_Report_${reportMonth}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const availableMonths = ['All Time', ...Array.from(new Set(expenses.map(e => {
    const d = new Date(e.date);
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  })))];

  const filteredExpenses = selectedMonth === 'All Time'
    ? expenses
    : expenses.filter(e => {
        const d = new Date(e.date);
        return d.toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth;
      });

  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="container">
      <nav className="nav-bar glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={20} style={{ marginRight: '5px' }}/> Back
          </Link>
          <h1 className="heading" style={{ margin: 0 }}>Reports</h1>
        </div>
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
        <div id="pdf-report-content" style={{ padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Monthly Report</h2>
            <select
              className="input-field"
              style={{ width: 'auto', marginBottom: 0, cursor: 'pointer' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem 2rem', borderLeft: '4px solid var(--primary)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Total Expenses ({selectedMonth})</h3>
              <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>₹{totalExpenses.toFixed(2)}</p>
            </div>
            
            <button data-html2canvas-ignore="true" onClick={handlePreviewPDF} className="btn btn-primary" disabled={isGeneratingPDF}>
              <Download size={20} /> {isGeneratingPDF ? 'Generating...' : 'Preview Report'}
            </button>
          </div>

          {filteredExpenses.length > 0 ? (
            <>
              <AnalyticsCharts expenses={filteredExpenses} />
              <ExpenseList expenses={filteredExpenses} onDelete={handleDeleteExpense} />
            </>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '3rem 0' }}>No expenses found for this month.</p>
          )}
        </div>
      </motion.div>

      {/* PDF Preview Modal */}
      {pdfPreviewUri && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{ width: '90%', maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column', padding: '1rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Report Preview</h3>
              <button onClick={() => setPdfPreviewUri(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <iframe 
              src={pdfPreviewUri} 
              style={{ width: '100%', flex: 1, border: 'none', borderRadius: '8px', backgroundColor: 'white' }} 
              title="PDF Preview"
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setPdfPreviewUri(null)} className="btn">Cancel</button>
              <button onClick={handleDownloadPDF} className="btn btn-primary">Download PDF</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Reports;
