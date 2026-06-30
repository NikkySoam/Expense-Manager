const express = require('express');
const { getExpenses, addExpense, deleteExpense, checkMonthEndAlerts } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getExpenses).post(protect, addExpense);
router.route('/:id').delete(protect, deleteExpense);
router.post('/check-alerts', protect, checkMonthEndAlerts);

module.exports = router;
