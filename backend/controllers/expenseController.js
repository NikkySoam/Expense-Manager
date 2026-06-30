const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const expense = await Expense.create({
      user: req.user._id,
      amount,
      category,
      description,
      date: date || Date.now(),
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkMonthEndAlerts = async (req, res) => {
  // Logic to generate an alert if a new month has started
  // Since this is a simple implementation, the frontend will call this endpoint
  // on load to check if the last month's summary notification exists.
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthString = lastMonth.toLocaleString('default', { month: 'long' });
    const yearString = lastMonth.getFullYear().toString();

    // Check if notification already exists for last month
    const existingNotification = await Notification.findOne({
      user: req.user._id,
      type: 'summary',
      month: monthString,
      year: yearString,
    });

    if (existingNotification) {
      return res.json({ message: 'Alerts already generated' });
    }

    // Calculate last month's expenses
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    if (total > 0) {
      await Notification.create({
        user: req.user._id,
        message: `Your total expenses for ${monthString} ${yearString} were ₹${total.toFixed(2)}.`,
        type: 'summary',
        month: monthString,
        year: yearString,
      });
      return res.json({ message: 'New month alert generated' });
    }

    res.json({ message: 'No expenses last month' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExpenses, addExpense, deleteExpense, checkMonthEndAlerts };
