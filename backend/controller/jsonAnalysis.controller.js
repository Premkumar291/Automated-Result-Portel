// Controller for handling JSON-based analysis of extracted PDF content
import { parseFromStartIndex } from '../services/pdfAnalysisService.js';
import { getGridFSBucket } from '../utils/gridfsConfig.js';
import GridFSSemesterPDF from '../models/gridFSSemesterPDF.model.js';
import mongoose from 'mongoose';
import { ApiError, asyncHandler } from '../utils/errorHandler.js';
import { extractTextPreview } from '../services/pdfAnalysisService.js';

// POST /api/analyze/upload/:id/parse-json
export const analyzeJsonFromSelection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page, startRegNo, startName } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError('Invalid PDF ID format', 400, { providedId: id });
  }
  const pdfMetadata = await GridFSSemesterPDF.findById(id);
  if (!pdfMetadata) {
    throw new ApiError(`PDF not found`, 404, { pdfId: id });
  }
  const gridFSBucket = getGridFSBucket();
  const downloadStream = gridFSBucket.openDownloadStream(pdfMetadata.fileId);
  const chunks = [];
  for await (const chunk of downloadStream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  const pageNum = page ? parseInt(page, 10) : undefined;
  const { lines } = await extractTextPreview(buffer, pageNum);
  const result = parseFromStartIndex(lines, startRegNo, startName);
  res.json(result);
});
