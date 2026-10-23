import Expense from '../models/Expense.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getExpenses = async (req, res, next) => {
  try {
    const { category, vehicleId, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role !== 'super_admin') {
      filter.organizationId = req.organizationId;
    }

    if (category) filter.category = category;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('vehicleId', 'registrationNumber make model')
        .populate('driverId', 'name phone')
        .populate('tripId', 'tripNumber')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Expense.countDocuments(filter),
    ]);

    // Aggregate category distribution
    const categoryAgg = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalSpend = categoryAgg.reduce((acc, c) => acc + c.totalAmount, 0);

    return sendSuccess(res, { expenses, total, page: Number(page), pages: Math.ceil(total / limit), categoryAgg, totalSpend });
  } catch (err) {
    next(err);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'super_admin' ? (req.body.organizationId || req.organizationId) : req.organizationId;
    if (!orgId) return sendError(res, 'Organization ID is required', 400);

    const expense = await Expense.create({
      ...req.body,
      organizationId: orgId,
    });

    return sendSuccess(res, expense, 'Expense recorded', 201);
  } catch (err) {
    next(err);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return sendError(res, 'Expense not found', 404);

    if (req.user.role !== 'super_admin' && expense.organizationId.toString() !== req.organizationId.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    await Expense.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Expense deleted');
  } catch (err) {
    next(err);
  }
};
