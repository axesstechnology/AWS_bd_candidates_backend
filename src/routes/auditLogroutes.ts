import express from 'express';
import { AuditLogController } from '../controllers/auditLogcontroller';
import { authenticateJWT } from '../middleware/authenticate';

const router = express.Router();

// Get audit logs for a specific entity
router.get(
  '/entity/:id',
  AuditLogController.getEntityAuditLogs
);

// Get audit logs for a specific user
router.get(
  '/audit-logs/:id',
  AuditLogController.getUserAuditLogs
);

export default router;
