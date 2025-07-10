import { PDFDocument } from 'pdf-lib';
import SemesterPDF from '../models/semesterPDF.model.js';
import pdfParse from 'pdf-parse';

// Helper to extract text from each page using pdf-parse
async function extractPageTexts(pdfBuffer) {
  const data = await pdfParse(pdfBuffer, { pagerender: (pageData) => pageData.getTextContent() });
  // pdf-parse returns all text, but we want per-page text
  // We'll use pdf-lib to get per-page buffers, then parse each
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pageTexts = [];
  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(copiedPage);
    const pageBytes = await newPdf.save();
    const pageText = (await pdfParse(pageBytes)).text;
    pageTexts.push(pageText);
  }
  return pageTexts;
}

// Upload and split PDF by 'Anna University' header
export const uploadAndSplitPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF uploaded' });
    const pdfBuffer = req.file.buffer;
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageTexts = await extractPageTexts(pdfBuffer);
    // Group pages by 'Anna University' header
    const groups = [];
    let currentGroup = [];
    for (let i = 0; i < pageTexts.length; i++) {
      if (pageTexts[i].includes('Anna University')) {
        if (currentGroup.length > 0) groups.push(currentGroup);
        currentGroup = [i];
      } else {
        currentGroup.push(i);
      }
    }
    if (currentGroup.length > 0) groups.push(currentGroup);
    // Save each group as a semester PDF
    const semesterPDFs = [];
    for (let i = 0; i < groups.length; i++) {
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdfDoc, groups[i]);
      pages.forEach((p) => newPdf.addPage(p));
      const pdfBytes = await newPdf.save();
      const semesterDoc = await SemesterPDF.create({
        uploadName: req.file.originalname,
        semester: i + 1,
        pdf: Buffer.from(pdfBytes)
      });
      semesterPDFs.push(semesterDoc);
    }
    res.status(201).json({ message: 'PDF split and saved', uploadName: req.file.originalname, ids: semesterPDFs.map(doc => doc._id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to split PDF', error: err.message });
  }
};

// List semester PDFs for an upload
export const getSemesterPDFs = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const pdfs = await SemesterPDF.find({ uploadName: uploadId });
    res.json(pdfs.map(pdf => ({ id: pdf._id, semester: pdf.semester })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch PDFs' });
  }
};

// Download a specific semester PDF
export const downloadSemesterPDF = async (req, res) => {
  try {
    const { uploadId, semester } = req.params;
    const pdfDoc = await SemesterPDF.findOne({ uploadName: uploadId, semester: Number(semester) });
    if (!pdfDoc) return res.status(404).json({ message: 'PDF not found' });
    res.set('Content-Type', 'application/pdf');
    res.send(pdfDoc.pdf);
  } catch (err) {
    res.status(500).json({ message: 'Failed to download PDF' });
  }
};

// Delete all semester PDFs for an upload
export const deleteSemesterPDFs = async (req, res) => {
  try {
    const { uploadId } = req.params;
    await SemesterPDF.deleteMany({ uploadName: uploadId });
    res.json({ message: 'All semester PDFs deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete PDFs' });
  }
};
