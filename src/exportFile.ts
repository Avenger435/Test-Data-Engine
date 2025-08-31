import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const exportToFile = (data: any[], filename: string, exportType: string) => {
  let blob: Blob;
  if (exportType === 'CSV') {
    const csvContent = convertToCSV(data);
    blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    filename = filename.replace('.json', '.csv');
  } else if (exportType === 'SQL') {
    const sqlContent = convertToSQL(data);
    blob = new Blob([sqlContent], { type: 'text/plain;charset=utf-8;' });
    filename = filename.replace('.json', '.sql');
  } else if (exportType === 'XML') {
    const xmlContent = convertToXML(data);
    blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8;' });
    filename = filename.replace('.json', '.xml');
  } else if (exportType === 'Excel') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    filename = filename.replace('.json', '.xlsx');
  } else {
    blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }
  saveAs(blob, filename);
};

// Batch export utility function
export const exportBatchToFiles = async (
  data: any[],
  exports: Array<{ format: string; filename: string; recordCount: number }>,
  onProgress?: (progress: number) => void
) => {
  const totalExports = exports.length;

  for (let i = 0; i < totalExports; i++) {
    const exportConfig = exports[i];

    // Slice data to match record count for this export
    const exportData = data.slice(0, exportConfig.recordCount);

    // Export this batch
    const filename = `${exportConfig.filename}_${exportConfig.recordCount}records`;
    exportToFile(exportData, `${filename}.json`, exportConfig.format);

    // Update progress
    if (onProgress) {
      const progress = Math.round(((i + 1) / totalExports) * 100);
      onProgress(progress);
    }

    // Small delay to prevent browser from being overwhelmed
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
  return `${headers}\n${rows}`;
};

const convertToSQL = (data: any[], tableName: string = 'generated_data'): string => {
  if (data.length === 0) return '';
  
  const columns = Object.keys(data[0]);
  const columnNames = columns.join(', ');
  
  const insertStatements = data.map(row => {
    const values = columns.map(col => {
      const value = row[col];
      if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
      }
      return value;
    }).join(', ');
    return `INSERT INTO ${tableName} (${columnNames}) VALUES (${values});`;
  });
  
  return insertStatements.join('\n');
};

const convertToXML = (data: any[], rootName: string = 'data'): string => {
  if (data.length === 0) return `<${rootName}></${rootName}>`;
  
  const columns = Object.keys(data[0]);
  const xmlItems = data.map(row => {
    const itemElements = columns.map(col => {
      const value = row[col];
      const safeValue = typeof value === 'string' ? value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : value;
      return `    <${col}>${safeValue}</${col}>`;
    }).join('\n');
    return `  <item>\n${itemElements}\n  </item>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${xmlItems}\n</${rootName}>`;
};
