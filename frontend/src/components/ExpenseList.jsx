import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const ExpenseList = ({ expenses, onDelete }) => {
  return (
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Recent Expenses</h3>
      {expenses.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No expenses recorded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {expenses.map((expense) => (
              <motion.div
                key={expense._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(15, 23, 42, 0.4)',
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--primary)'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0' }}>{expense.category}</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {new Date(expense.date).toLocaleDateString()} - {expense.description || 'No description'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                    ₹{expense.amount.toFixed(2)}
                  </span>
                  <button 
                    data-html2canvas-ignore="true"
                    onClick={() => onDelete(expense._id)}
                    className="btn btn-danger"
                    style={{ padding: '0.5rem' }}
                    title="Delete Expense"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
