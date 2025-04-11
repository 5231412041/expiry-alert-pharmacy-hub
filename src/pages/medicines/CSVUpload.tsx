
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from '@/components/ui/progress';
import { 
  FileSpreadsheet, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  FileX,
  FilePlus
} from 'lucide-react';
import { parseCSV, CSVParseError } from '../../services/csvService';
import { importMedicinesFromCSV } from '../../services/medicineService';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const CSVUpload = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setProgress(10);
    setError(null);
    
    try {
      // Parse CSV file
      setProgress(30);
      const parsedData = await parseCSV(selectedFile);
      
      // Import medicines to database
      setProgress(60);
      const importedMedicines = await importMedicinesFromCSV(parsedData);
      setSuccessCount(importedMedicines.length);
      
      setProgress(100);
      toast({
        title: "Upload Successful",
        description: `Successfully imported ${importedMedicines.length} medicines.`
      });
      
      // Reset after short delay
      setTimeout(() => {
        setSelectedFile(null);
        setProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('CSV upload error:', error);
      
      if (error instanceof CSVParseError) {
        setError(`Error in row ${error.row}: ${error.message} (${error.field})`);
      } else {
        setError((error as Error).message || 'Failed to process CSV file');
      }
      
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">CSV Upload</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Bulk import medicines using a CSV file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircle className="mx-auto h-12 w-12 text-pharmacy-green" />
                  <p className="font-medium">File selected:</p>
                  <p className="text-sm text-gray-500">{selectedFile.name}</p>
                  
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => setSelectedFile(null)}
                    disabled={isLoading}
                  >
                    <FileX className="mr-2 h-4 w-4" />
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FilePlus className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">Drag and drop your CSV file here, or click to browse</p>
                  
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Browse File
                  </Button>
                </div>
              )}
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
            
            {successCount > 0 && (
              <Alert className="bg-green-50 border-pharmacy-green">
                <CheckCircle className="h-4 w-4 text-pharmacy-green" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Successfully imported {successCount} medicines from CSV
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => navigate('/medicines')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>CSV Format Instructions</CardTitle>
            <CardDescription>
              Your CSV file should follow this format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              The CSV file should include the following columns:
            </p>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="py-2 px-3 text-left">Column Name</th>
                    <th className="py-2 px-3 text-left">Required</th>
                    <th className="py-2 px-3 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 px-3 font-medium">name</td>
                    <td className="py-2 px-3 text-pharmacy-green">Yes</td>
                    <td className="py-2 px-3">Medicine name</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">batch</td>
                    <td className="py-2 px-3 text-pharmacy-green">Yes</td>
                    <td className="py-2 px-3">Batch number</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">quantity</td>
                    <td className="py-2 px-3">No</td>
                    <td className="py-2 px-3">Quantity (number)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">manufacturer</td>
                    <td className="py-2 px-3">No</td>
                    <td className="py-2 px-3">Manufacturer name</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">manufactureDate</td>
                    <td className="py-2 px-3">No</td>
                    <td className="py-2 px-3">Date of manufacture (YYYY-MM-DD)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">expiryDate</td>
                    <td className="py-2 px-3 text-pharmacy-green">Yes</td>
                    <td className="py-2 px-3">Expiry date (YYYY-MM-DD)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="text-sm text-gray-500">
              <p className="font-medium">Example CSV content:</p>
              <pre className="mt-1 p-2 bg-gray-50 rounded-md overflow-x-auto text-xs">
                name,batch,quantity,manufacturer,manufactureDate,expiryDate<br />
                Paracetamol,B12345,100,ABC Pharma,2023-01-15,2025-01-15<br />
                Amoxicillin,A98765,50,XYZ Meds,2023-03-20,2024-03-20<br />
                Ibuprofen,C55555,200,Medi Corp,2023-05-10,2025-05-10
              </pre>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                Make sure your CSV file uses commas as delimiters and includes the header row with column names.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center">
              <Button variant="outline" size="sm">
                <a href="/sample.csv" download className="flex items-center">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Download Sample CSV
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CSVUpload;
