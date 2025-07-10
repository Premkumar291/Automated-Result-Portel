import mongoose from 'mongoose';

const semesterPDFSchema = new mongoose.Schema({
  uploadName: { type: String, required: true },
  semester: { type: Number, required: true },
  pdf: { type: Buffer, required: true }
});

export default mongoose.model('SemesterPDF', semesterPDFSchema);
