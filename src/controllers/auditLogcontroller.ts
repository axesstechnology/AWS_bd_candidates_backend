import { Request, Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { IFieldChange } from '../utils/types';


export class AuditLogController {
  // Create a new audit log entry
  static async createAuditLog(
    entityId: string,
    entityType: string,
    changeType: 'UPDATE' | 'CREATE' | 'DELETE',
    changes: IFieldChange[],
    userId: string
  ): Promise<void> {
    try {
      await AuditLog.create({
        entityId,
        entityType,
        changeType,
        changes,
        updatedBy: userId,
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  }

  // Get audit logs for a specific entity
  static async getEntityAuditLogs(req: Request, res: Response): Promise<void> {
    try {
        const logs = await AuditLog.findOne({ entityId: req.params.id })
        .populate('updatedBy', 'name email')
  
        res.status(200).json({
          success: true,
          data: logs,
        });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching audit logs",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  } 
  
  static async getUserAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.id) {
        res.status(400).json({
          success: false,
          message: "User ID is required"
        });
        return;
      }

      // Fetch all audit logs for the user, sorted by newest first
      const logs = await AuditLog.find({ 
        entityId: req.params.id,
        entityType: "Candidate" 
      })
      .populate('updatedBy', 'name email')
      .sort({ updatedAt: -1 }); // Sort by update time, newest first

      if (!logs || logs.length === 0) {
        res.status(404).json({
          success: false,
          message: "No audit logs found for this user"
        });
        return;
      }

      // Process logs to only include changed fields
      const processedLogs = logs.map(log => ({
        _id: log._id,
        entityId: log.entityId,
        changeType: log.changeType,
        updatedAt: log.updatedAt,
        updatedBy: log.updatedBy,
        // Only include changes that have actual modifications
        changes: log.changes.filter(change => 
          // Include if newValue exists or if oldValue exists and isn't empty
          (change.newValue !== undefined && change.newValue !== null) || 
          (change.oldValue !== undefined && change.oldValue !== null && 
           change.oldValue !== '' && 
           (!Array.isArray(change.oldValue) || change.oldValue.length > 0))
        )
      }));

      res.status(200).json({
        success: true,
        data: processedLogs
      });
      
    } catch (error) {
      console.error('Error in getUserAuditLogs:', error);
      res.status(500).json({
        success: false,
        message: "Error fetching user audit logs",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  }
  

  static trackChanges(oldDoc: any, newDoc: any): IFieldChange[] {
    const changes: IFieldChange[] = [];
    
    // Function to remove _id from nested objects and handle circular references
    const removeIds = (obj: any, visited: Set<any> = new Set()): any => {
      if (obj && typeof obj === 'object') {
        if (visited.has(obj)) {
          return; // Return undefined if a circular reference is found
        }
        visited.add(obj);
        
        if (Array.isArray(obj)) {
          return obj.map(item => removeIds(item, visited));
        }
  
        const newObj: any = { ...obj };
        delete newObj._id;  // Remove the _id field
        Object.keys(newObj).forEach(key => {
          newObj[key] = removeIds(newObj[key], visited);
        });
        return newObj;
      }
      return obj;
    };
    
    const oldDocCleaned = removeIds(oldDoc._doc || oldDoc);
    const newDocCleaned = removeIds(newDoc);
    
    const allKeys = new Set([...Object.keys(oldDocCleaned), ...Object.keys(newDocCleaned)]);
    
    for (const key of allKeys) {
      // Skip internal Mongoose fields and timestamps
      if (['_id', '__v', 'updatedAt', 'createdAt', 'updatedBy'].includes(key)) {
        continue;
      }
      
      const oldValue = oldDocCleaned[key];
      const newValue = newDocCleaned[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue
        });
      }
    }
    
    return changes;
  }
  
  // static trackChanges(oldDoc: any, newDoc: any): IFieldChange[] {
  //   const changes: IFieldChange[] = [];
  //   const allKeys = new Set([...Object.keys(oldDoc._doc || {}), ...Object.keys(newDoc)]);
    
  //   for (const key of allKeys) {
  //     // Skip internal Mongoose fields and timestamps
  //     if (['_id', '__v', 'updatedAt', 'createdAt', 'updatedBy',].includes(key)) {
  //       continue;
  //     }
      
  //     const oldValue = oldDoc._doc ? oldDoc._doc[key] : oldDoc[key];
  //     const newValue = newDoc[key];
      
  //     if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
  //       changes.push({
  //         field: key,
  //         oldValue,
  //         newValue
  //       });
  //     }
  //   }
    
  //   return changes;
  // }

}


