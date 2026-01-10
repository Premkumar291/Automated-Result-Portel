import 'dotenv/config';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import path from 'path';
import crypto from 'crypto';

import { Readable } from 'stream';

// GridFS variables
let gfs;
let gridFSBucket;

// Initialize GridFS connection
export const initGridFS = (connection) => {
  gridFSBucket = new GridFSBucket(connection.db, {
    bucketName: 'pdfs'
  });
  gfs = gridFSBucket;
  return { gfs, gridFSBucket };
};

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/acadex-db',
  options: {
    maxPoolSize: 1, // Reduced for serverless
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
  },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // Generate a unique filename
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'pdfs',
          metadata: {
            originalName: file.originalname,
            uploadDate: new Date()
          }
        };
        resolve(fileInfo);
      });
    });
  }
});

// Multer upload configuration
export const upload = multer({ storage });

// Get GridFS bucket
export const getGridFSBucket = () => gridFSBucket;

// Get all files
export const getFiles = async () => {
  try {
    const files = await gridFSBucket.find().toArray();
    return files;
  } catch (error) {
    throw error;
  }
};

// Get a file by filename
export const getFileByFilename = async (filename) => {
  try {
    const file = await gridFSBucket.find({ filename }).toArray();
    return file[0];
  } catch (error) {
    throw error;
  }
};

// Get a file by ID
export const getFileById = async (id) => {
  try {
    const file = await gridFSBucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();
    return file[0];
  } catch (error) {
    throw error;
  }
};

// Delete a file by ID
export const deleteFileById = async (id) => {
  try {
    await gridFSBucket.delete(new mongoose.Types.ObjectId(id));
    return true;
  } catch (error) {
    throw error;
  }
};

// Delete files by metadata
export const deleteFilesByMetadata = async (metadata) => {
  try {
    const files = await gridFSBucket.find({ 'metadata.originalName': metadata.originalName }).toArray();
    for (const file of files) {
      await gridFSBucket.delete(file._id);
    }
    return true;
  } catch (error) {
    throw error;
  }
};

// Save a buffer to GridFS
// Used for generated reports that don't go through Multer
export const saveBufferToGridFS = (buffer, filename, metadata) => {
  return new Promise((resolve, reject) => {
    if (!gridFSBucket) {
      return reject(new Error('GridFS bucket not initialized'));
    }

    // Create a readable stream from the buffer
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const uploadStream = gridFSBucket.openUploadStream(filename, {
      metadata
    });

    // Store the file ID before piping
    const fileId = uploadStream.id;

    readableStream.pipe(uploadStream)
      .on('error', (error) => {
        reject(error);
      })
      .on('finish', () => {
        resolve({
          _id: fileId,
          filename: filename,
          metadata: metadata
        });
      });
  });
};