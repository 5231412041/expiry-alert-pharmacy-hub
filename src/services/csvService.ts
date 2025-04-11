
import Papa from 'papaparse';

interface CSVMedicineData {
  name: string;
  batch: string;
  quantity: string;
  manufacturer: string;
  manufactureDate: string;
  expiryDate: string;
}

interface ProcessedMedicineData {
  name: string;
  batch: string;
  quantity: number;
  manufacturer: string;
  manufactureDate: Date;
  expiryDate: Date;
  addedBy: string;
}

export class CSVParseError extends Error {
  row: number;
  field: string;

  constructor(message: string, row: number, field: string) {
    super(message);
    this.name = 'CSVParseError';
    this.row = row;
    this.field = field;
  }
}

export function parseCSV(file: File): Promise<ProcessedMedicineData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVMedicineData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, errors } = results;
        
        if (errors.length > 0) {
          return reject(new Error(`CSV parsing error: ${errors[0].message}`));
        }
        
        try {
          const processedData: ProcessedMedicineData[] = [];
          const userEmail = JSON.parse(localStorage.getItem('pharmacy-user') || '{}').email || 'unknown';
          
          data.forEach((row, index) => {
            // Validate required fields
            if (!row.name) {
              throw new CSVParseError('Medicine name is required', index + 1, 'name');
            }
            if (!row.batch) {
              throw new CSVParseError('Batch number is required', index + 1, 'batch');
            }
            if (!row.expiryDate) {
              throw new CSVParseError('Expiry date is required', index + 1, 'expiryDate');
            }
            
            // Parse dates
            const manufactureDate = row.manufactureDate ? new Date(row.manufactureDate) : new Date();
            const expiryDate = new Date(row.expiryDate);
            
            if (isNaN(expiryDate.getTime())) {
              throw new CSVParseError('Invalid expiry date format', index + 1, 'expiryDate');
            }
            
            // Parse quantity
            const quantity = row.quantity ? parseInt(row.quantity, 10) : 0;
            if (isNaN(quantity)) {
              throw new CSVParseError('Quantity must be a number', index + 1, 'quantity');
            }
            
            processedData.push({
              name: row.name,
              batch: row.batch,
              quantity,
              manufacturer: row.manufacturer || '',
              manufactureDate,
              expiryDate,
              addedBy: userEmail
            });
          });
          
          resolve(processedData);
        } catch (error) {
          if (error instanceof CSVParseError) {
            reject(error);
          } else {
            reject(new Error(`Error processing CSV data: ${(error as Error).message}`));
          }
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}
