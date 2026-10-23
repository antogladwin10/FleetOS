import Document from '../models/Document.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getDocuments = async (req, res, next) => {
  try {
    const { type, entityType, page = 1, limit = 50 } = req.query;
    const filter = req.user.role === 'super_admin' ? {} : { organizationId: req.organizationId };

    if (type) filter.type = type;
    if (entityType) filter.entityType = entityType;

    const skip = (Number(page) - 1) * Number(limit);
    const [documents, total] = await Promise.all([
      Document.find(filter).sort({ expiryDate: 1 }).skip(skip).limit(Number(limit)),
      Document.countDocuments(filter),
    ]);

    // Recalculate expiry status dynamically
    const now = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 86400000);

    const enriched = documents.map((doc) => {
      const d = doc.toObject();
      if (d.expiryDate) {
        const exp = new Date(d.expiryDate);
        if (exp < now) d.status = 'EXPIRED';
        else if (exp <= thirtyDaysFromNow) d.status = 'EXPIRING_SOON';
        else d.status = 'VALID';
      }
      return d;
    });

    return sendSuccess(res, { documents: enriched, total });
  } catch (err) {
    next(err);
  }
};

export const createDocument = async (req, res, next) => {
  try {
    const orgId = req.user.role === 'super_admin' ? (req.body.organizationId || req.organizationId) : req.organizationId;
    if (!orgId) return sendError(res, 'Organization ID is required', 400);

    const doc = await Document.create({
      ...req.body,
      organizationId: orgId,
    });

    return sendSuccess(res, doc, 'Document uploaded/registered', 201);
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return sendError(res, 'Document not found', 404);

    if (req.user.role !== 'super_admin' && doc.organizationId.toString() !== req.organizationId.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    await Document.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Document deleted');
  } catch (err) {
    next(err);
  }
};
