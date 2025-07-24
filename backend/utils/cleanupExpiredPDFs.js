import GridFSSemesterPDF from '../models/gridFSSemesterPDF.model.js';
import { getGridFSBucket } from './gridfsConfig.js';

/**
 * Cleanup function to delete expired PDFs from GridFS
 * This should be called periodically (e.g., via a cron job or on server startup)
 */

export const cleanupExpiredPDFs = async () => {
  try {
    const now = new Date();
    
    // Find all expired PDF metadata records
    const expiredPDFs = await GridFSSemesterPDF.find({
      deleteAt: { $lt: now }
    });
    
    if (expiredPDFs.length === 0) {
      console.log('No expired PDFs to clean up');
      return { deleted: 0 };
    }
    
    console.log(`Found ${expiredPDFs.length} expired PDFs to clean up`);
    
    // Delete each file from GridFS
    const gridFSBucket = getGridFSBucket();
    let deletedCount = 0;
    
    for (const pdf of expiredPDFs) {
      try {
        await gridFSBucket.delete(pdf.fileId);
        deletedCount++;
      } catch (err) {
        console.error(`Error deleting file ${pdf.fileId} from GridFS:`, err);
        // Continue with other deletions even if one fails
      }
    }
    
    // Delete all metadata records for expired PDFs
    const result = await GridFSSemesterPDF.deleteMany({
      deleteAt: { $lt: now }
    });
    
    console.log(`Cleaned up ${deletedCount} expired PDFs from GridFS`);
    console.log(`Deleted ${result.deletedCount} expired PDF metadata records`);
    
    return {
      deleted: deletedCount,
      metadataDeleted: result.deletedCount
    };
  } catch (err) {
    console.error('Error cleaning up expired PDFs:', err);
    throw err;
  }
};

/**
 * Schedule cleanup to run at regular intervals
 * @param {number} intervalMinutes - Interval in minutes between cleanup runs
 */
export const scheduleCleanup = (intervalMinutes = 60) => {
  console.log(`Scheduling PDF cleanup to run every ${intervalMinutes} minutes`);
  
  // Run cleanup immediately on startup
  cleanupExpiredPDFs().catch(err => {
    console.error('Initial cleanup failed:', err);
  });
  
  // Schedule periodic cleanup
  setInterval(() => {
    cleanupExpiredPDFs().catch(err => {
      console.error('Scheduled cleanup failed:', err);
    });
  }, intervalMinutes * 60 * 1000);
};