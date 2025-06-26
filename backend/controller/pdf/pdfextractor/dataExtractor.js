// Main data extraction functionality
import { detectStructuredContent } from './contentDetector.js';

export const extractStructuredData = (pdfData) => {
  try {
    const pages = pdfData.Pages || [];
    const extractedData = {
      metadata: {
        title: pdfData.Meta?.Title || 'Untitled Document',
        author: pdfData.Meta?.Author || 'Unknown',
        subject: pdfData.Meta?.Subject || '',
        creator: pdfData.Meta?.Creator || '',
        producer: pdfData.Meta?.Producer || '',
        creationDate: pdfData.Meta?.CreationDate || '',
        modificationDate: pdfData.Meta?.ModDate || '',
        pageCount: pages.length
      },
      pages: [],
      fullText: '',
      tables: [],
      forms: []
    };

    pages.forEach((page, pageIndex) => {
      const pageData = {
        pageNumber: pageIndex + 1,
        width: page.Width,
        height: page.Height,
        texts: [],
        rawTexts: [],
        structuredContent: {}
      };

      // Extract text content
      if (page.Texts && page.Texts.length > 0) {
        page.Texts.forEach(text => {
          if (text.R && text.R.length > 0) {
            text.R.forEach(run => {
              if (run.T) {
                const decodedText = decodeURIComponent(run.T);
                pageData.texts.push({
                  text: decodedText,
                  x: text.x,
                  y: text.y,
                  width: text.w,
                  height: text.h,
                  fontSize: run.TS ? run.TS[1] : 12,
                  fontFamily: run.TS ? run.TS[0] : 'default',
                  color: run.TS ? run.TS[2] : '#000000'
                });
                pageData.rawTexts.push(decodedText);
                
                // Add space or newline for better text formatting
                if (extractedData.fullText.length > 0 && 
                    !extractedData.fullText.endsWith(' ') && 
                    !extractedData.fullText.endsWith('\n')) {
                  extractedData.fullText += ' ';
                }
                extractedData.fullText += decodedText;
              }
            });
          }
        });
        
        // Sort texts by Y position (top to bottom) then X position (left to right)
        pageData.texts.sort((a, b) => {
          if (Math.abs(a.y - b.y) < 1) { // Same line (within 1 unit)
            return a.x - b.x;
          }
          return a.y - b.y;
        });
        
        // Create better formatted text from sorted texts
        let formattedText = '';
        let lastY = -1;
        pageData.texts.forEach(text => {
          if (lastY !== -1 && Math.abs(text.y - lastY) > 1) {
            formattedText += '\n'; // New line for different Y positions
          } else if (formattedText.length > 0 && !formattedText.endsWith(' ')) {
            formattedText += ' '; // Space between texts on same line
          }
          formattedText += text.text;
          lastY = text.y;
        });
        
        // Update page raw texts with formatted version
        if (formattedText.trim()) {
          pageData.formattedText = formattedText;
        }
      }

      // Detect tables and structured content
      pageData.structuredContent = detectStructuredContent(pageData.texts);
      
      // Extract any detected tables
      if (pageData.structuredContent.tables) {
        extractedData.tables.push(...pageData.structuredContent.tables);
      }

      extractedData.pages.push(pageData);
    });

    // Create better formatted full text from all pages
    let betterFullText = '';
    extractedData.pages.forEach((page, index) => {
      if (index > 0) {
        betterFullText += '\n\n--- Page ' + page.pageNumber + ' ---\n\n';
      }
      if (page.formattedText) {
        betterFullText += page.formattedText;
      } else if (page.rawTexts && page.rawTexts.length > 0) {
        betterFullText += page.rawTexts.join(' ');
      }
    });
    
    // Use the better formatted text if available
    if (betterFullText.trim()) {
      extractedData.fullText = betterFullText;
    }

    // Extract form fields if any
    if (pdfData.formImage && pdfData.formImage.Pages) {
      pdfData.formImage.Pages.forEach(page => {
        if (page.Fields) {
          page.Fields.forEach(field => {
            extractedData.forms.push({
              name: field.id?.Id || 'unnamed',
              type: field.AM || 'text',
              value: field.V || '',
              x: field.id?.x || 0,
              y: field.id?.y || 0
            });
          });
        }
      });
    }

    return extractedData;
  } catch (error) {
    console.error('Error extracting structured data:', error);
    return {
      error: 'Failed to extract structured data',
      rawData: pdfData
    };
  }
};
