const AuditLog = require('../models/AuditLog');

const logSecurityEvent = async ({ userId, action, details, ip, userAgent, severity = 'low' }) => {
    try {
        await AuditLog.create({
            userId,
            action,
            details,
            ip,
            userAgent,
            severity
        });
    } catch (err) {
        console.error('Audit Log Error:', err.message);
    }
};

module.exports = logSecurityEvent;
