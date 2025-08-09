import React, { useState, useEffect } from 'react';
import './ExcelPreviewEditor.css';

/**
 * Excel Preview and Editor Component
 * Allows viewing and editing Excel reports before download
 */
const ExcelPreviewEditor = ({ reportData, onUpdate, onDownload, onClose }) => {
  const [previewData, setPreviewData] = useState(reportData?.previewData || {});
  const [activeSheet, setActiveSheet] = useState('');
  const [editableData, setEditableData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState({});

  useEffect(() => {
    if (reportData?.previewData) {
      setPreviewData(reportData.previewData);
      const firstSheet = Object.keys(reportData.previewData)[0];
      setActiveSheet(firstSheet);
      initializeEditableData(reportData.previewData);
    }
  }, [reportData]);

  const initializeEditableData = (data) => {
    const editable = {};
    Object.keys(data).forEach(sheetName => {
      editable[sheetName] = data[sheetName].map(row => 
        row.map(cell => ({ ...cell, isEdited: false }))
      );
    });
    setEditableData(editable);
  };

  const handleCellEdit = (sheetName, rowIndex, colIndex, newValue) => {
    const updatedData = { ...editableData };
    
    if (updatedData[sheetName] && 
        updatedData[sheetName][rowIndex] && 
        updatedData[sheetName][rowIndex][colIndex]) {
      
      const cell = updatedData[sheetName][rowIndex][colIndex];
      const oldValue = cell.value;
      
      // Update cell value and mark as edited
      updatedData[sheetName][rowIndex][colIndex] = {
        ...cell,
        value: newValue,
        isEdited: oldValue !== newValue
      };
      
      setEditableData(updatedData);
      
      // Track changes for API call
      const changeKey = `${sheetName}_${rowIndex}_${colIndex}`;
      const newChanges = { ...changes };
      
      if (oldValue !== newValue) {
        newChanges[changeKey] = {
          sheetName,
          row: rowIndex,
          col: colIndex,
          oldValue,
          newValue
        };
      } else {
        delete newChanges[changeKey];
      }
      
      setChanges(newChanges);
      setIsEditing(Object.keys(newChanges).length > 0);
    }
  };

  const handleSaveChanges = async () => {
    if (!onUpdate || Object.keys(changes).length === 0) return;
    
    setLoading(true);
    
    try {
      // Convert changes to API format
      const updateData = {};
      Object.values(changes).forEach(change => {
        if (!updateData[change.sheetName]) {
          updateData[change.sheetName] = [];
        }
        updateData[change.sheetName].push({
          row: change.row + 1, // API expects 1-based indexing
          col: change.col + 1,
          value: change.newValue
        });
      });
      
      const result = await onUpdate(updateData);
      
      if (result.success) {
        // Update preview data with saved changes
        setPreviewData(result.data.previewData);
        initializeEditableData(result.data.previewData);
        setChanges({});
        setIsEditing(false);
        
        // Show success message
        showNotification('Changes saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      showNotification('Failed to save changes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetChanges = () => {
    initializeEditableData(previewData);
    setChanges({});
    setIsEditing(false);
  };

  const renderCell = (cell, sheetName, rowIndex, colIndex) => {
    const isEditableCell = sheetName === 'Editable Grades' && colIndex >= 3;
    const cellData = editableData[sheetName]?.[rowIndex]?.[colIndex] || cell;
    
    if (isEditableCell) {
      return (
        <EditableCell
          key={`${rowIndex}-${colIndex}`}
          value={cellData.value || ''}
          style={cellData.style}
          isEdited={cellData.isEdited}
          onChange={(value) => handleCellEdit(sheetName, rowIndex, colIndex, value)}
        />
      );
    }
    
    return (
      <div 
        className="excel-cell"
        style={getCellStyle(cellData.style)}
      >
        {formatCellValue(cellData.value)}
      </div>
    );
  };

  const renderSheet = (sheetName, sheetData) => {
    const data = editableData[sheetName] || sheetData;
    
    return (
      <div className="excel-sheet" key={sheetName}>
        <div className="sheet-content">
          {data.map((row, rowIndex) => (
            <div key={rowIndex} className="excel-row">
              {row.map((cell, colIndex) => (
                <div 
                  key={colIndex} 
                  className="excel-cell-wrapper"
                  style={{ 
                    minWidth: getColumnWidth(colIndex),
                    maxWidth: getColumnWidth(colIndex)
                  }}
                >
                  {renderCell(cell, sheetName, rowIndex, colIndex)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getCellStyle = (style) => {
    if (!style) return {};
    
    return {
      backgroundColor: style.fill?.fgColor?.argb ? `#${style.fill.fgColor.argb.slice(2)}` : 'transparent',
      color: style.font?.color?.argb ? `#${style.font.color.argb.slice(2)}` : '#000',
      fontWeight: style.font?.bold ? 'bold' : 'normal',
      fontSize: style.font?.size ? `${style.font.size}px` : '12px',
      textAlign: style.alignment?.horizontal || 'left',
      border: style.border ? '1px solid #ccc' : 'none',
      padding: '4px 8px',
      minHeight: '20px',
      display: 'flex',
      alignItems: 'center'
    };
  };

  const getColumnWidth = (colIndex) => {
    // Define column widths based on content type
    const widthMap = {
      0: '60px',   // S.No
      1: '120px',  // Reg No
      2: '200px',  // Name
    };
    
    return widthMap[colIndex] || '100px';
  };

  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return value.toString();
  };

  const showNotification = (message, type) => {
    // You can implement toast notifications here
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  if (!reportData) {
    return (
      <div className="excel-preview-loading">
        <div className="loading-spinner"></div>
        <p>Loading Excel preview...</p>
      </div>
    );
  }

  const sheetNames = Object.keys(previewData);

  return (
    <div className="excel-preview-container">
      <div className="excel-preview-header">
        <div className="header-left">
          <h2>Excel Report Preview & Editor</h2>
          <div className="report-info">
            <span>{reportData.reportInfo?.facultyName}</span>
            <span>{reportData.reportInfo?.department}</span>
            <span>Sem {reportData.reportInfo?.semester}</span>
            <span>{reportData.reportInfo?.academicYear}</span>
          </div>
        </div>
        
        <div className="header-actions">
          {isEditing && (
            <div className="edit-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleResetChanges}
                disabled={loading}
              >
                Reset Changes
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveChanges}
                disabled={loading}
              >
                {loading ? 'Saving...' : `Save Changes (${Object.keys(changes).length})`}
              </button>
            </div>
          )}
          
          <button 
            className="btn btn-success"
            onClick={() => onDownload(reportData.reportId)}
            disabled={isEditing}
            title={isEditing ? 'Save changes before downloading' : 'Download Excel file'}
          >
            Download Excel
          </button>
          
          <button 
            className="btn btn-outline"
            onClick={onClose}
          >
            Close Preview
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="changes-banner">
          <span>⚠️ You have unsaved changes ({Object.keys(changes).length} cells modified)</span>
        </div>
      )}

      <div className="excel-preview-content">
        <div className="sheet-tabs">
          {sheetNames.map(sheetName => (
            <button
              key={sheetName}
              className={`sheet-tab ${activeSheet === sheetName ? 'active' : ''}`}
              onClick={() => setActiveSheet(sheetName)}
            >
              {sheetName}
              {sheetName === 'Editable Grades' && <span className="edit-indicator">✎</span>}
            </button>
          ))}
        </div>

        <div className="sheet-container">
          {activeSheet && previewData[activeSheet] && renderSheet(activeSheet, previewData[activeSheet])}
        </div>
      </div>

      {activeSheet === 'Editable Grades' && (
        <div className="editing-instructions">
          <h4>Editing Instructions:</h4>
          <ul>
            <li>Green cells (grades) are editable - click to modify</li>
            <li>Use dropdown or type valid grades: O, A+, A, B+, B, C, P, U, F, -</li>
            <li>Gray cells (student info) are protected</li>
            <li>Changes are highlighted and must be saved before download</li>
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Editable Cell Component for grade editing
 */
const EditableCell = ({ value, style, isEdited, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [cellValue, setCellValue] = useState(value || '');

  const validGrades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'U', 'F', '-'];

  const handleClick = () => {
    setEditing(true);
    setCellValue(value || '');
  };

  const handleChange = (e) => {
    setCellValue(e.target.value.toUpperCase());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCellValue(value || '');
      setEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleSave = () => {
    const newValue = cellValue.trim().toUpperCase();
    if (newValue === '' || validGrades.includes(newValue)) {
      onChange(newValue);
      setEditing(false);
    } else {
      // Invalid grade, reset to original
      setCellValue(value || '');
      setEditing(false);
    }
  };

  const cellStyle = {
    ...getCellStyle(style),
    backgroundColor: isEdited ? '#e3f2fd' : '#f0fdf4',
    border: '2px solid #10b981',
    cursor: 'pointer',
    minWidth: '80px',
    position: 'relative'
  };

  if (editing) {
    return (
      <div style={cellStyle}>
        <select
          value={cellValue}
          onChange={(e) => {
            setCellValue(e.target.value);
            onChange(e.target.value);
            setEditing(false);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            border: 'none',
            background: 'transparent',
            width: '100%',
            outline: 'none'
          }}
        >
          <option value="">Select Grade</option>
          {validGrades.map(grade => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div 
      style={cellStyle}
      onClick={handleClick}
      title="Click to edit grade"
    >
      {value || ''}
      {isEdited && <span className="edit-indicator">*</span>}
    </div>
  );
};

const getCellStyle = (style) => {
  if (!style) return {};
  
  return {
    backgroundColor: style.fill?.fgColor?.argb ? `#${style.fill.fgColor.argb.slice(2)}` : 'transparent',
    color: style.font?.color?.argb ? `#${style.font.color.argb.slice(2)}` : '#000',
    fontWeight: style.font?.bold ? 'bold' : 'normal',
    fontSize: style.font?.size ? `${style.font.size}px` : '12px',
    textAlign: style.alignment?.horizontal || 'center',
    padding: '4px 8px',
    minHeight: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
};

export default ExcelPreviewEditor;
