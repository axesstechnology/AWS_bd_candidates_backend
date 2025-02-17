import mongoose, { Schema } from 'mongoose';
import { IAuditLog } from '../utils/types';

const auditLogSchema = new Schema({
  entityId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    index: true 
  },
  entityType: { 
    type: String, 
    required: true,
    index: true
  },
  changeType: { 
    type: String, 
    enum: ['UPDATE', 'CREATE', 'DELETE'], 
    required: true 
  },
  changes: [{
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed }
  }],
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add compound index for common queries
auditLogSchema.index({ entityId: 1, updatedAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);