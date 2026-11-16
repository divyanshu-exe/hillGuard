const { AuditLog } = require('../models');

class AuditService {
  async log({ user, action, targetEntity, targetId, details = {}, ipAddress = '127.0.0.1' }) {
    try {
      const record = await AuditLog.create({
        user: user._id || user.id,
        userName: user.name || 'System User',
        userRole: user.role || 'official',
        action,
        targetEntity,
        targetId: String(targetId),
        details,
        ipAddress
      });
      return record;
    } catch (err) {
      console.error('[Audit Log Error]', err.message);
      return null;
    }
  }
}

module.exports = new AuditService();
