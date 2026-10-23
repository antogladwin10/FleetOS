import Alert from '../models/Alert.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAlerts = async (req, res, next) => {
  try {
    const { severity, unreadOnly, limit = 50 } = req.query;
    const filter = req.user.role === 'super_admin' ? {} : { organizationId: req.organizationId };

    if (severity) filter.severity = severity;
    if (unreadOnly === 'true') filter.isRead = false;

    const [alerts, unreadCount] = await Promise.all([
      Alert.find(filter).sort({ createdAt: -1 }).limit(Number(limit)),
      Alert.countDocuments({ ...filter, isRead: false }),
    ]);

    return sendSuccess(res, { alerts, unreadCount });
  } catch (err) {
    next(err);
  }
};

export const markAlertRead = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return sendError(res, 'Alert not found', 404);

    alert.isRead = true;
    await alert.save();

    return sendSuccess(res, alert, 'Alert marked as read');
  } catch (err) {
    next(err);
  }
};

export const markAllAlertsRead = async (req, res, next) => {
  try {
    const filter = req.user.role === 'super_admin' ? {} : { organizationId: req.organizationId };
    await Alert.updateMany({ ...filter, isRead: false }, { isRead: true });
    return sendSuccess(res, null, 'All alerts marked as read');
  } catch (err) {
    next(err);
  }
};
