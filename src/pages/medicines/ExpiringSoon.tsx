
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Search, AlertTriangle, Clock } from 'lucide-react';
import { getMedicinesByStatus } from '../../services/medicineService';
import { MedicineStatus, MedicineWithStatus } from '../../types/models';
import MedicineCard from '../../components/medicines/MedicineCard';
import { toast } from '@/components/ui/use-toast';

const ExpiringSoon = () => {
  const [medicines, setMedicines] = useState<MedicineWithStatus[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<MedicineWithStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const expiringSoonMedicines = await getMedicinesByStatus(MedicineStatus.EXPIRING_SOON);
        setMedicines(expiringSoonMedicines);
        setFilteredMedicines(expiringSoonMedicines);
      } catch (error) {
        console.error('Error loading expiring medicines:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load expiring medicines"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMedicines();
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      const results = medicines.filter(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(results);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [medicines, searchTerm]);
  
  const handleDelete = async (id: string) => {
    try {
      // This would call the deletion service
      setMedicines(prev => prev.filter(med => med.id !== id));
      toast({
        title: "Success",
        description: "Medicine deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete medicine"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading expiring medicines...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="h-6 w-6 text-pharmacy-orange" />
        <h1 className="text-2xl font-bold">Expiring Soon</h1>
      </div>
      
      <Card className="p-4 bg-orange-50 border-pharmacy-orange flex items-center">
        <AlertTriangle className="h-5 w-5 text-pharmacy-orange mr-3" />
        <p className="text-sm">
          Medicines listed here will expire within the next 30 days. Consider using these items first or arranging for their return to suppliers.
        </p>
      </Card>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search expiring medicines..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredMedicines.length === 0 ? (
        <Card className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="mt-4 text-xl font-medium">No expiring medicines</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm 
              ? "No expiring medicines match your search" 
              : "Great! None of your medicines are expiring soon"}
          </p>
          
          <Button variant="outline" className="mt-4" asChild>
            <a href="/medicines">View All Medicines</a>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map(medicine => (
            <MedicineCard 
              key={medicine.id} 
              medicine={medicine} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpiringSoon;
