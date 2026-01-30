from fastapi import FastAPI, UploadFile, File, HTTPException
import pdfplumber
import io
import re
import uvicorn

app = FastAPI()

@app.get("/")
async def root():
    return {"status": "Python PDF Service Running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    content = await file.read()
    pdf_file = io.BytesIO(content)
    
    try:
        subject_codes = []
        students = []
        
        with pdfplumber.open(pdf_file) as pdf:
            # We will extract text line by line from all pages
            all_lines = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    lines = text.split('\n')
                    all_lines.extend([line.strip() for line in lines if line.strip()])
            
            # --- Parsing Logic (Ported from JS) ---
            pass 
                
        # --- Switching to Table Extraction Strategy ---
        results = []
        final_subject_codes = []
        
        with pdfplumber.open(pdf_file) as pdf:
            tables = []
            for page in pdf.pages:
                page_tables = page.extract_tables()
                for table in page_tables:
                    tables.extend(table)
            
            if not tables:
                 raise HTTPException(status_code=400, detail="No tabular data found in PDF")

            # Strategy: Find the header row (contains "Subject Code")
            header_row_index = -1
            subject_codes_start_col = -1
            
            for i, row in enumerate(tables):
                # Critical check: A valid header row for subjects must have multiple columns
                if len(row) < 3:
                     continue

                # Convert row to string to search for "Subject Code"
                # Based on logs: Row 2 has ['', 'Subject Code - >', ...]
                for col_idx, cell in enumerate(row):
                    if cell and "Subject Code" in str(cell):
                        header_row_index = i
                        # The codes usually start in the NEXT column or this one?
                        # Log says: ['', 'Subject Code - >', 'CCS3\n39', ...]
                        # So 'Subject Code' is at col 1. Codes start at col 2.
                        subject_codes_start_col = col_idx + 1
                        print(f"DEBUG: Found Header Row at {i}, Codes start at col {subject_codes_start_col}")
                        break
                if header_row_index != -1:
                    break
            
            if header_row_index == -1:
                 # Fallback: look for row with Reg Number
                 print("DEBUG: checking for 'Reg. Number' row as fallback")
                 pass

            # Extract Subject Codes
            final_subject_codes = []
            if header_row_index != -1:
                raw_codes_row = tables[header_row_index]
                # Slice from the detected start column
                raw_codes = raw_codes_row[subject_codes_start_col:]
                
                for code in raw_codes:
                    if code:
                        # Clean up newlines which pdfplumber might insert (e.g. CCS3\n39)
                        # We'll replace newline with empty string to concatenate, or space?
                        # Usually course codes are like CCS339, or maybe CCS3-39. 
                        # Let's just remove whitespace for now to get a clean code.
                        # formatting: 'CCS3\n39' -> 'CCS339'
                        # But wait, looking at Row 1 text: 'CCS3 39'. 
                        # Let's try to keep it simple: Replace \n with nothing.
                        cleaned = str(code).replace('\n', '').replace(' ', '').strip()
                        if cleaned:
                           final_subject_codes.append(cleaned)
            
            print(f"DEBUG: Extracted Subject Codes: {final_subject_codes}")

            # Process Students
            # Look for student rows based on Reg No in Column 0
            for i, row in enumerate(tables):
                # Optimization: Skip rows before the header
                if header_row_index != -1 and i <= header_row_index:
                    continue
                
                # Check Column 0 for 12-digit Reg No
                if len(row) > 0 and row[0]:
                     clean_reg = str(row[0]).strip()
                     if re.match(r'^\d{12}$', clean_reg):
                        # Found a student!
                        reg_no = clean_reg
                        name = str(row[1]).strip() if len(row) > 1 and row[1] else "Unknown"
                        
                        # Grades start at the same column as subject codes
                        grades_raw = row[subject_codes_start_col:]
                        
                        subject_grades = {}
                        for idx, code in enumerate(final_subject_codes):
                            if idx < len(grades_raw):
                                grade_val = grades_raw[idx]
                                # Clean up grade (sometimes they have newlines too, e.g. "Grad\ne" header or actual grades?)
                                # Grades are usually 'A', 'A+', 'UA'.
                                grade = str(grade_val).strip() if grade_val else ""
                            else:
                                grade = ""
                            
                            subject_grades[code] = grade
                        
                        results.append({
                            "regNo": reg_no,
                            "name": name,
                            "grades": subject_grades
                        })

            if not results:
                 print("DEBUG: No students found after parsing.")
                 # It's possible the regex is too strict or column index is wrong.
                 # Let's try a fallback: Checking Column 1? (Previous logic)
                 # But logs showed Col 0 is the one.
                 raise HTTPException(status_code=400, detail="Could not find any student records (Reg No not found in Col 0)")

        return {
            "students": results,
            "subjectCodes": final_subject_codes
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Parsing Failed: {str(e)}")

# This block allows "python main.py" to work
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
