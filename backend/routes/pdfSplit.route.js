import express from 'express';
import { validConfidenceLevels, mapConfidenceThreshold } from '../controller/pdfSplit.controller.js';

const router = express.Router();

// Route to get valid confidence levels
router.get('/confidence-levels', (req, res) => {
  res.json({ validConfidenceLevels });
});

// Route to map a numeric threshold to a confidence level
router.get('/map-confidence/:threshold', (req, res) => {
  const { threshold } = req.params;
  const mappedLevel = mapConfidenceThreshold(threshold);
  res.json({ threshold, mappedLevel });
});

export default router;