import type { ParsedCsv } from '../types';

// Extend the Window interface to include Papa and XLSX for type safety
declare global {
  interface Window {
    Papa: any;
    XLSX: any;
  }
}

export const parseCsvFiles = (files: File[]): Promise<ParsedCsv[]> => {
  const promises = files.map(file => {
    return new Promise<ParsedCsv>((resolve, reject) => {
      window.Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: "ISO-8859-1", // Fix for character encoding issues like 'Descri��o'
        complete: (results: any) => {
          if (results.errors.length > 0) {
            console.error(`Errors parsing ${file.name}:`, results.errors);
            reject(new Error(`Não foi possível analisar ${file.name}. Por favor, verifique o formato do arquivo.`));
          }
          const headers = results.meta.fields || [];
          const rows = results.data;
          resolve({
            fileName: file.name,
            headers: headers,
            rows: rows,
            sampleRows: rows.slice(0, 5),
          });
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  });

  return Promise.all(promises);
};

const downloadBlob = (blob: Blob, fileName: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

export const exportData = (parsedData: ParsedCsv[], format: 'json' | 'xlsx') => {
    if(parsedData.length === 0) return;

    if (format === 'json') {
        const dataToExport = parsedData.map(({ fileName, rows }) => ({ fileName, data: rows }));
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        downloadBlob(blob, 'data_export.json');
    } else if (format === 'xlsx') {
        const wb = window.XLSX.utils.book_new();
        parsedData.forEach(fileData => {
            const ws = window.XLSX.utils.json_to_sheet(fileData.rows);
            // Truncate sheet name if too long
            const sheetName = fileData.fileName.length > 31 ? fileData.fileName.substring(0, 31) : fileData.fileName;
            window.XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });
        const wbout = window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        downloadBlob(blob, 'data_export.xlsx');
    }
};