import { PDFDocument } from 'pdf-lib';
import PDFParser from "pdf2json";
import pdfParseWrapper from '../utils/pdfParseWrapper.js';
import { ApiError } from '../utils/errorHandler.js';
import { performanceConfig, pdfParseConfig, textExtractionConfig } from '../config/pdfConfig.js';

/**
 * Extracts structured lines from pdf2json output for further analysis.
 * @param {Object} pdfData
 * @returns {{ lines: string[], pageCount: number }}
 */
function extractLinesFromPdf2Json(pdfData) {
  const pages = pdfData?.formImage?.Pages || [];
  const texts = pages.flatMap(page => page.Texts || []);
  const decode = s => decodeURIComponent(s || '');
  const lines = [];
  let currentLineY = null;
  let currentLine = [];
  texts.forEach(t => {
    const y = t.y;
    const text = t.R?.map(r => decode(r.T)).join('') || '';
    if (currentLineY === null || Math.abs(currentLineY - y) > 0.5) {
      if (currentLine.length > 0) lines.push(currentLine.join(' '));
      currentLine = [text];
      currentLineY = y;
    } else {
      currentLine.push(text);
    }
  });
  if (currentLine.length > 0) lines.push(currentLine.join(' '));
  return { lines, pageCount: pages.length };
}

/**
 * Extracts raw text lines from a specific page or the whole PDF using pdf2json.
 * @param {Buffer} pdfBuffer
 * @param {number} [pageNum]
 * @returns {Promise<{ lines: string[], pageCount: number }>}
 */
export async function extractTextPreview(pdfBuffer, pageNum) {
  // Use pdf-parse for previews and splitting
  const pageData = await pdfParseWrapper(pdfBuffer);
  const lines = pageData.text.split('\n').filter(line => line.trim() !== '');
  const pageCount = pageData.numpages || 1;
  return { lines, pageCount };
}

/**
 * Parses the lines into JSON format starting from the selected regno/name.
 * @param {string[]} lines
 * @param {string} startRegNo
 * @param {string} startName
 * @returns {Object} Parsed student/subject data
 */
export function parseFromStartIndex(lines, startRegNo, startName) {
  // Find the start index
  const startIdx = lines.findIndex(line =>
    line.includes(startRegNo) && line.includes(startName)
  );
  if (startIdx === -1) {
    throw new ApiError('Start registration number and name not found in text', 400);
  }
  // Only parse from the selected index onward
  const relevantLines = lines.slice(startIdx);
  // Reuse the extraction logic from analyzeResults.controller.js if available
  // For now, return as a stub
  return {
    students: [],
    subjectCodes: [],
    raw: relevantLines
  };
}
